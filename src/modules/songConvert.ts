import { Message, EmbedBuilder } from 'npm:discord.js';

export async function songConvert(message:Message){
    const trustedChannels = ['1308817683575472168'];
    const ytMusicRegex = /https:\/\/music\.youtube\.com\S*/gm;
    const spotifyRegex = /https:\/\/open\.spotify\.com\S*/gm;
    const appleMusicRegex = /https:\/\/music\.apple\.com\S*/gm;
    const youtubeRegex = /https:\/\/www.youtube\.com\S*/gm;
    const ytMusic = ytMusicRegex.exec(message.content);
    const spotify = spotifyRegex.exec(message.content);
    const appleMusic = appleMusicRegex.exec(message.content);
    const youtube = youtubeRegex.exec(message.content);
    // console.log(appleMusic);
    


    
    if (ytMusic !== null || spotify !== null || appleMusic !== null){
        if (message.author.id == '1239027203090419796') {message.reply('I have made a severe and continuous lapse in my judgement\nThis bot has now tried to go into a intinty loop, THATS BAD :skull:'); return;}
        // discordController.sendMessage('1278169412217602069','YT')
        await buildSongEmbed(message);
    }

    else if (youtube){
        if (message.author.id == '1239027203090419796') {message.reply('I have made a severe and continuous lapse in my judgement\nThis bot has now tried to go into a intinty loop, THATS BAD :skull:'); return;}
        console.log(message.content);
        if (trustedChannels.includes(message.channel.id)){
            const newURL = message.content.replace('www','music');
            message.content = newURL;
            await buildSongEmbed(message,true);
        }
    }
    // if()
}


export async function buildSongEmbed(message: Message,youtube=false) {
    const json = await songLink(message.content);
    const info = json.info;
    const list = json.list;
    const embed = new EmbedBuilder().setTitle('Universal Music Links');
    let body = '';
    let serviceNumber = 0;
    Object.keys(list).forEach((service,i) => {
        if (Object.values(list)[i] == '404') serviceNumber++;
        body += `* [${service}](<${Object.values(list)[i]}>)\n`;
    });
    embed.setDescription(body);
    embed.setFooter({
        text: 'Powered by Songlink',
    });
    embed.setImage(encodeURI(`https://waterwolf.net/api/musicEmbed?title=${info.title}&artist=${info.artist}&imgSrc=${info.imgSrc}`));
    if (serviceNumber >= 4 && youtube){
        console.log(serviceNumber);
        return;
    }
    message.reply({embeds: [embed]});
}

async function songLink(url: string | number | boolean){
    const info = {
        title: 'Error',
        artist: 'Error',
        imgSrc: 'https://cdn-icons-png.flaticon.com/512/755/755014.png'
    };
    const list = {
        Youtube: '',
        YoutubeMusic: '',
        Spotify: '',
        AppleMusic: '',
        AmazonMusic: '',

        Pandora: '',
        Tidal: '',
        Soundcloud: '',

    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url)}`);
    data = await data.json();
    console.log(data);
    list.Youtube = (data.linksByPlatform.youtube === undefined ? '404' :data.linksByPlatform.youtube.url);
    list.YoutubeMusic = (data.linksByPlatform.youtubeMusic === undefined ? '404' :data.linksByPlatform.youtubeMusic.url);
    list.Spotify = (data.linksByPlatform.spotify === undefined ? '404' :data.linksByPlatform.spotify.url);
    list.AppleMusic = (data.linksByPlatform.appleMusic === undefined ? '404' :data.linksByPlatform.appleMusic.url);
    list.AmazonMusic = (data.linksByPlatform.amazonMusic === undefined ? '404' :data.linksByPlatform.amazonMusic.url);
    list.Pandora = (data.linksByPlatform.pandora === undefined ? '404' :data.linksByPlatform.pandora.url);
    list.Tidal = (data.linksByPlatform.tidal === undefined ? '404' :data.linksByPlatform.tidal.url);
    list.Soundcloud = (data.linksByPlatform.soundcloud === undefined ? '404' :data.linksByPlatform.soundcloud.url);
    if (data.linksByPlatform.spotify){
        info.title = data.entitiesByUniqueId[data.linksByPlatform.spotify.entityUniqueId].title;
        info.artist = data.entitiesByUniqueId[data.linksByPlatform.spotify.entityUniqueId].artistName;
        info.imgSrc = data.entitiesByUniqueId[data.linksByPlatform.spotify.entityUniqueId].thumbnailUrl;
    }

    return {list,info};
}