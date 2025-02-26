import { PermissionFlagsBits, SlashCommandBuilder } from 'npm:discord.js';
import { Command } from '../command.ts';
import { ConfigHelper } from '../utils.ts';

import { XMLParser } from 'fast-xml-parser';
import { Logger } from '../logger.ts';
import { channelList, config, handleYoutubeRefresh } from '../index.ts';
import { refreshChannel } from '../refreshEngine.ts';
export const command: Command = {
    commandBuilder: new SlashCommandBuilder()
        .setName('users')
        .setDescription('Manager Users')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommandGroup(s => s
            .setName('youtube')
            .setDescription('Manage Youtube Users')
            .addSubcommand(c => c
                .setName('add')
                .setDescription('Add Youtube user to refresh list.')
                .addStringOption(o => o
                    .setDescription('User to add.')
                    .setName('user')
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c
                .setName('remove')
                .setDescription('Remove Youtube user to refresh list.')
                .addStringOption(o => o
                    .setDescription('User to remove.')
                    .setName('user')
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c 
                .setName('list')
                .setDescription('Lists all channels')
            )
        )

    ,

    runnable: async function (interaction) {
        await interaction.deferReply();
        const group = await interaction.options.getSubcommandGroup();
        const command = await interaction.options.getSubcommand();
        const user = await interaction.options.getString('user');
        if (interaction.guildId == null) return; // If this happens were all fucked anyways so don't bother with a error
        const settings = new ConfigHelper('./settings.json');
        const settingsJson = settings.getFull();
        let guildConfig = settingsJson[interaction.guildId];
        // Error Handleing
        if (typeof guildConfig !== 'object'){ 
            Logger.log(`[${interaction.guild?.name}] guildConfig isn't a object. Remaking...`);
            guildConfig = {};
        }


        switch(group) {
            case 'youtube': {
                if (typeof guildConfig.YtUsers !== 'object'){
                    guildConfig.YtUsers = [];
                }
                switch(command) {
                    case 'add': {
                        if (!user) return; //This should be impossible since this is required in discord.
                        await interaction.followUp(`Adding ${user} to refresh list.`);
                        guildConfig.YtUsers.push(user);
                        settingsJson[interaction.guildId] = guildConfig;
                        settings.setFull(settingsJson);
                        channelList[user] = new refreshChannel(user,config.apiKey);
                        channelList[user].on('newVideo',(updatedEntry) => {
                            handleYoutubeRefresh(updatedEntry,guildConfig);
                        });
                        
                        await interaction.followUp(`Started watching ${user}'s channel.`);
                        break;
                    }
                    case 'remove': {
                        if (!user) return; //This should be impossible since this is required in discord.
                        if (!guildConfig.YtUsers.includes(user)) {
                            interaction.followUp(`${user} not found in list.`);
                            return;
                        }
                        interaction.followUp(`Removing ${user} from refresh list.`);
                        guildConfig.YtUsers = guildConfig.YtUsers.filter((u:string) => u !== user);
                        settingsJson[interaction.guildId] = guildConfig;
                        settings.setFull(settingsJson);
                        channelList[user].destory();
                        channelList[user].removeAllListeners();
                        await interaction.followUp(`Stopped watching ${user}'s channel.`);
                        break;
                    }
                    case 'list': {
                        let res = '# Channels:\n';
                        const users = guildConfig.YtUsers;
                        for (const user in users){
                            const result = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${users[user]}&reqInID=${crypto.randomUUID()}`)).text();
                            const jsonResult = new XMLParser().parse(result);
                            res += `* ${users[user]} <-> ${jsonResult.feed.author.name}\n`;
                        }
                        // guildConfig.YtUsers.forEach(async (u: string) => {
                        //     const result = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${u}&reqInID=${crypto.randomUUID()}`)).text();
                        //     const jsonResult = new XMLParser().parse(result);
                        //     res += `* ${u} <-> ${jsonResult.feed.author.name}\n`;
                        // });
                        interaction.followUp(res);
                        break;

                    }
                }
                break;
            }
            case 'tiktok': {
                interaction.followUp('This feature is not implemented currently, Please check back later.');
                break;
            }
        }
        // interaction.followUp(group ?? '');
    }
};