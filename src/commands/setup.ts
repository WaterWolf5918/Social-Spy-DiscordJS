import { SlashCommandBuilder } from 'npm:discord.js';
import { Command } from '../command.ts';
import { exec } from 'node:child_process';
import { ConfigHelper } from '../utils.ts';
export const command: Command = {
    commandBuilder: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Set Default Values')
        .addSubcommand(c => c
            .setName('set-fallback-channel')
            .setDescription('Set channel to broadcast in')
            .addChannelOption(o => o
                .setDescription('Channel to Broadcast In')
                .setName('channel')
                .setRequired(true)
            ),
        )
        .addSubcommand(c => c
            .setName('set-videos-channel')
            .setDescription('Set channel to broadcast in')
            .addChannelOption(o => o
                .setDescription('Channel to Broadcast In')
                .setName('channel')
                .setRequired(true)
            ),
        )
        .addSubcommand(c => c
            .setName('set-shorts-channel')
            .setDescription('Set channel to broadcast in')
            .addChannelOption(o => o
                .setDescription('Channel to Broadcast In')
                .setName('channel')
                .setRequired(true)
            ),
        )
        .addSubcommand(c => c
            .setName('set-mention')
            .setDescription('Set default mention to ping')
            .addRoleOption(r => r
                .setName('role')
                .setDescription('Default mention to ping')
                .setRequired(true)
            )
        ),
    runnable: async function (interaction) {
        const settings = new ConfigHelper('./settings.json');
        switch(interaction.options.getSubcommand()){
            case 'set-fallback-channel': {
                const channel = interaction.options.get('channel')?.channel;
                const json = settings.getFull();
                if (!interaction.guildId) return;
                if (typeof json[interaction.guildId.toString()] !== 'object') json[interaction.guildId.toString()] = {};
                json[interaction.guildId.toString()].fallbackChannel = channel?.id;
                settings.setFull(json);
                interaction.reply(`Setting fallback channel to: <#${channel?.id}>`);
                break;
            }
            case 'set-videos-channel': {
                const channel = interaction.options.get('channel')?.channel;
                const json = settings.getFull();
                if (!interaction.guildId) return;
                if (typeof json[interaction.guildId.toString()] !== 'object') json[interaction.guildId.toString()] = {};
                json[interaction.guildId.toString()].videosChannel = channel?.id;
                settings.setFull(json);
                interaction.reply(`Setting videos channel to: <#${channel?.id}>`);
                break;
            }
            case 'set-shorts-channel': {
                const channel = interaction.options.get('channel')?.channel;
                const json = settings.getFull();
                if (!interaction.guildId) return;
                if (typeof json[interaction.guildId.toString()] !== 'object') json[interaction.guildId.toString()] = {};
                json[interaction.guildId.toString()].shortsChannel = channel?.id;
                settings.setFull(json);
                interaction.reply(`Setting shorts channel to: <#${channel?.id}>`);
                break;
            }
            case 'set-mention': {
                const role = interaction.options.get('role')?.role;
                const json = settings.getFull();
                if (!interaction.guildId) return;
                if (typeof json[interaction.guildId.toString()] !== 'object') json[interaction.guildId.toString()] = {};
                json[interaction.guildId.toString()].role = role?.id;
                settings.setFull(json);
                interaction.reply({'allowedMentions': {},'content': `Setting default mention to: <@&${role?.id}>`});
                break;
            }
        }
        // interaction.reply(`Pong! ${Math.round(interaction.client.ws.ping)}`);

    }
};