import { PermissionFlagsBits, SlashCommandBuilder } from 'npm:discord.js';
import { Command, GuildsStorage } from '../types.d.ts';
import { ConfigHelper } from '../utils.ts';
export const command: Command = {
    commandBuilder: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Set Default Values')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
        if (!interaction.guildId) return;
        const channel = interaction.options.get('channel')?.channel;
        const guildId = interaction.guildId.toString();
        const guildStorageManager = new ConfigHelper('./settings.json');
        const gsStorage = guildStorageManager.getFull() as GuildsStorage;
        if (typeof gsStorage[guildId] !== 'object') gsStorage[guildId] = {};

        switch(interaction.options.getSubcommand()){
            case 'set-fallback-channel': {
                gsStorage[guildId].fallbackChannel = channel?.id;
                guildStorageManager.setFull(gsStorage);
                await interaction.reply(`Setting fallback channel to: <#${channel?.id}>`);
                break;
            }
            case 'set-videos-channel': {
                gsStorage[guildId].videosChannel = channel?.id;
                guildStorageManager.setFull(gsStorage);
                await interaction.reply(`Setting videos channel to: <#${channel?.id}>`);
                break;
            }
            case 'set-shorts-channel': {
                gsStorage[guildId].shortsChannel = channel?.id;
                guildStorageManager.setFull(gsStorage);
                await interaction.reply(`Setting shorts channel to: <#${channel?.id}>`);
                break;
            }
            case 'set-mention': {
                const role = interaction.options.get('role')?.role;
                gsStorage[guildId].role = role?.id;
                guildStorageManager.setFull(gsStorage);
                await interaction.reply({'allowedMentions': {},'content': `Setting default mention to: <@&${role?.id}>`});
                break;
            }
        }
        // interaction.reply(`Pong! ${Math.round(interaction.client.ws.ping)}`);

    }
};