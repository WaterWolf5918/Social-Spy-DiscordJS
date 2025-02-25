import { SlashCommandBuilder } from 'npm:discord.js';
import { Command } from '../command.ts';
export const command: Command = {
    commandBuilder: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the ping of the device, and whether the bot can respond to questions'),
    runnable: async function (interaction) {
        interaction.reply(`Pong! ${Math.round(interaction.client.ws.ping)}`);
    }
};