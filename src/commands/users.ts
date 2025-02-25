import { SlashCommandBuilder } from 'npm:discord.js';
import { Command } from '../command.ts';
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
        )
        .addSubcommandGroup(s => s
            .setName('tiktok')
            .setDescription('Manage Tiktok Users')
            .addSubcommand(c => c
                .setName('add')
                .setDescription('Add Tiktok user to refresh list.')
                .addStringOption(o => o
                    .setDescription('User to add.')
                    .setName('user')
                    .setRequired(true)
                )
            )
            .addSubcommand(c => c
                .setName('remove')
                .setDescription('Remove Tiktok user to refresh list.')
                .addStringOption(o => o
                    .setDescription('User to remove.')
                    .setName('user')
                    .setRequired(true)
                )
            )
        ),

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