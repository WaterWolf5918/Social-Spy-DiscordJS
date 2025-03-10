import { SlashCommandBuilder } from 'npm:discord.js';

import pack from '../../package.json' with { type: 'json'};
import { Command } from '../types.d.ts';

export const command: Command = {
    commandBuilder: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Gives some basic info on the bot.'),
    runnable: async function (interaction) {
        await interaction.reply(
            `
# About
This bot monitors youtube channels for new videos and shorts, and pings users in channels accordingly.
## Open Source Info
Created by WaterWolf5918 under the MIT License
Source code is available at <https://github.com/WaterWolf5918/Social-Spy-DiscordJS>
## Version Info
Version: ${pack.version}
            `);
        // READ BEFORE CHANGEING 
        //If you wish to change this please make sure to keep my copyright notice. 
        //It doesn't have to stay formatted like this, but just make sure to include that it uses the mit license and a link to either your modified source code or the original (You don't even have to use github :) ).
        //Here is a tenplate on how you can change this to also give yourself credit if you edit the bot, or just if you want to. I won't judge :3
        //Created by WaterWolf5918 -> Created by WaterWolf5918 and modified by Username under the MIT License
    }
};