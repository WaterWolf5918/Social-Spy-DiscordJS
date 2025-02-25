import EventEmitter from 'node:events';
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import {XMLParser} from 'npm:fast-xml-parser';

export class refreshChannel extends EventEmitter{
    protected lastEntry = {
        id: null,
        published: null
    };
    protected channelID: string;
    protected apiKey: string;
    private parser: XMLParser;
    constructor(channelID: string, apiKey: string){
        super();
        this.parser = new XMLParser();
        this.apiKey = apiKey;
        this.channelID = channelID;
        this.lastEntry = {
            id: null,
            published: null
        };
        let lastUpdate = Date.now() - 30000;
        let lock = false;
        // console.log(`Listening For New Videos For Channel ${channelID}`);
        setInterval(async () => {
            // console.log(Date.now() - lastUpdate + 'Locked=' + lock);
            if (lock) return;
            if (((Date.now() - lastUpdate) / 1000) >= 30){
                // console.log('Refreshing Feed');
                lock = true;
                await this.refreshFeed();
                lastUpdate = Date.now();
                lock = false;
            }
        },1000);
    }

    private async refreshFeed(){
        const result = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${this.channelID}&reqInID=${crypto.randomUUID()}`)).text();
        const jsonResult = this.parser.parse(result);
        if (!existsSync('./database')) mkdirSync('./database');
        if (!existsSync(`./database/${this.channelID}.json`)) writeFileSync(`./database/${this.channelID}.json`,JSON.stringify([]));
        if (this.lastEntry.id == null){
            this.lastEntry = {
                'id': jsonResult.feed.entry[0].id,
                'published': jsonResult.feed.entry[0].published
            };
            this.emit('noEntry');
            // console.log(jsonResult.feed.entry[0]);
            // console.log(await getEntryType(jsonResult.feed.entry[0]));
        } else if (this.lastEntry.id == jsonResult.feed.entry[0].id){
            this.emit('sameVideo');
        } else {
            const updatedEntry = jsonResult.feed.entry[0];
            const knownIds = JSON.parse(readFileSync(`./database/${updatedEntry['yt:channelId']}.json`,'utf-8'));
            if (knownIds.includes(updatedEntry['yt:videoId'])) return;
            // if (new Date())
            this.emit('newVideo',updatedEntry);
            this.lastEntry = {
                'id': jsonResult.feed.entry[0].id,
                'published': jsonResult.feed.entry[0].published
            };
            knownIds.push(updatedEntry['yt:videoId']);
            writeFileSync(`./database/${updatedEntry['yt:channelId']}.json`,JSON.stringify(knownIds));
        }
    }

}

export async function getEntryType(entry: Record<string,string | number>,apiKey: string): Promise<'video' | 'live' | 'short'>{
    const channelId = (entry['yt:channelId'] as string).split('UC')[1];
    const videoId = entry['yt:videoId'];
    const result = await ((await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&playlistId=UULF${channelId}&fields=items(contentDetails(videoId%2CvideoPublishedAt)%2Csnippet(publishedAt%2Ctitle))&key=${apiKey}`)).json());
    if (result.items.some((e: { contentDetails: { videoId: string; }; }) => e.contentDetails.videoId == videoId)){
        return 'video';
    } else {
        const result = await ((await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&playlistId=UUSH${channelId}&fields=items(contentDetails(videoId%2CvideoPublishedAt)%2Csnippet(publishedAt%2Ctitle))&key=${apiKey}`)).json());
        if (result.items.some((e: { contentDetails: { videoId: string; }; }) => e.contentDetails.videoId == videoId)){
            return 'short';
        } else {
            return 'live'; // I hope this is correct and doesn't fuck me over later
        }
        // check for shorts or live??????
    }
}