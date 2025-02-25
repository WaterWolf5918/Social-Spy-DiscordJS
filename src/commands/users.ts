import { SlashCommandBuilder } from 'npm:discord.js';
import { Command } from '../command.ts';
import { ConfigHelper } from '../utils.ts';

import { XMLParser } from 'fast-xml-parser';
export const command: Command = {
    commandBuilder: new SlashCommandBuilder()
        .setName('users')
        .setDescription('Manager Users')
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
        // .addSubcommandGroup(s => s
        //     .setName('tiktok')
        //     .setDescription('Manage Tiktok Users')
        //     .addSubcommand(c => c
        //         .setName('add')
        //         .setDescription('Add Tiktok user to refresh list.')
        //         .addStringOption(o => o
        //             .setDescription('User to add.')
        //             .setName('user')
        //             .setRequired(true)
        //         )
        //     )
        //     .addSubcommand(c => c
        //         .setName('remove')
        //         .setDescription('Remove Tiktok user to refresh list.')
        //         .addStringOption(o => o
        //             .setDescription('User to remove.')
        //             .setName('user')
        //             .setRequired(true)
        //         )
        //     )
        // )
    ,

    runnable: async function (interaction) {
        const group = await interaction.options.getSubcommandGroup();
        const command = await interaction.options.getSubcommand();
        const user = await interaction.options.getString('user');
        switch(group) {
            case 'youtube': {
                switch(command) {
                    case 'add': {
                        interaction.reply(`Adding ${user} to refresh list.`);
                        break;
                    }
                    case 'remove': {
                        interaction.reply(`Removing ${user} to refresh list.`);
                        break;
                    }
                    case 'list': {
                        if (interaction.guildId == null) return;
                        let res = '# Channels:\n';
                        const settings = new ConfigHelper('./settings.json');
                        const json = settings.getFull();
                        const guildConfig = json[interaction.guildId];
                        if (typeof guildConfig !== 'object'){ 
                            interaction.reply('No channels');
                            return; 
                        }
                        console.log(guildConfig.YtUsers);
                        const users = guildConfig.YtUsers;
                        for (const user in users){
                            const result = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${users[user]}&reqInID=${crypto.randomUUID()}`)).text();
                            console.log(result);
                            const jsonResult = new XMLParser().parse(result);
                            res += `* ${users[user]} <-> ${jsonResult.feed.author.name}\n`;
                        }
                        // guildConfig.YtUsers.forEach(async (u: string) => {
                        //     const result = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${u}&reqInID=${crypto.randomUUID()}`)).text();
                        //     const jsonResult = new XMLParser().parse(result);
                        //     res += `* ${u} <-> ${jsonResult.feed.author.name}\n`;
                        // });
                        interaction.reply(res);
                        break;

                    }
                }
                break;
            }
            case 'tiktok': {
                interaction.reply('This feature is not implemented currently, Please check back later.');
                break;
            }
        }
        // interaction.reply(group ?? '');
    }
};