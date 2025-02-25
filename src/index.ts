import { REST } from 'npm:@discordjs/rest';
import { Routes } from 'npm:discord-api-types/v9';
import { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, Message, TextChannel, messageLink, Utils, AuditLogEvent, Guild, ChannelType, VoiceChannel, Invite } from 'npm:discord.js';
import * as fs from 'node:fs';
import chalk from 'npm:chalk';
import { Logger } from './logger.ts';
import { Command } from './command.ts';
import { ConfigHelper } from './utils.ts';
import { getEntryType, refreshChannel } from './refreshEngine.ts';

// Variables \\

/**@deprecated */
const __dirname = import.meta.dirname;

const config = loadConfig('./config.json');
const rest = new REST({ version: '9' }).setToken(config.token); // For slash commands
const commands: Command[] = [];

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        // GatewayIntentBits.GuildBans,
        // GatewayIntentBits.GuildEmojisAndStickers,
        // GatewayIntentBits.GuildIntegrations,
        // GatewayIntentBits.GuildWebhooks,
        // GatewayIntentBits.GuildInvites,
        // GatewayIntentBits.GuildVoiceStates,
        // GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        // GatewayIntentBits.GuildMessageReactions,
        // GatewayIntentBits.GuildMessageTyping,
        // GatewayIntentBits.DirectMessages,
        // GatewayIntentBits.DirectMessageReactions,
        // GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        // GatewayIntentBits.GuildScheduledEvents,
        // GatewayIntentBits.AutoModerationConfiguration,
        // GatewayIntentBits.AutoModerationExecution
    ]
});

// Functions \\

/**
 * @param file location of the config file
 */
function loadConfig(file: string) {
    if(!fs.existsSync(file)) {
        const json = {
            'token': 'BOT TOKEN',
            'clientID': 'CLIENT ID'
        };
        fs.writeFileSync(file,JSON.stringify(json,null,4));
        throw new Error(chalk.redBright('\nConfig File Not Found, Creating...\nPlease add your bot token and clientID to the config.'));
    }
    const json = JSON.parse(fs.readFileSync('./config.json').toString());
    if(json.clientID === 'CLIENT ID' || json.token === 'BOT TOKEN') throw new Error(chalk.redBright('\nPlaceholder Token And ClientID Still Inplace\nPlease add your bot token and clientID to the config.'));
    Logger.log('Config OK');
    return JSON.parse(fs.readFileSync('./config.json').toString());
}

async function loadCommands() {
    const files = fs.readdirSync('./src/commands',{'withFileTypes': true});
    for(const file of files) {
        if (!file.isFile() || !file.name.endsWith('ts')) continue;
        const command: Command = (await import(`./commands/${file.name}`)).command;
        if (command == undefined) { Logger.error('Error loading command file "' + file.name + '.js"!'); return; }
        commands.push(command);
    }
}

async function initializeCommands() {
    await loadCommands();
    try {
        
        Logger.log('Started refreshing application (/) commands.');
        Logger.log('Commands:');
        for (let i = 0; i < commands.length; i++) {
            try {
                Logger.log(` - ${chalk.white(commands[i].commandBuilder.name)} : ${chalk.gray(commands[i].commandBuilder.description)}`);
            } catch (e) {
                Logger.error('An unknown error occured!');
                Logger.error('-------------------------');
                Logger.error(e);
            }
        }

        const timeStarted = Date.now();

        const t = [];

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].commandBuilder.name !== undefined) {
                t.push(commands[i].commandBuilder);
            }
        }

        await rest.put(

            Routes.applicationGuildCommands(config.clientID,'1330003358614028378'),
            { body: t },
        );
        const timeEnded = Date.now();
        Logger.log('Successfully reloaded application (/) commands in ' + (chalk.blue(timeEnded - timeStarted)) + 'ms.');
    } catch (error) {
        console.error(error);
    }
}

// Events \\

client.on('ready', async () => {

    Logger.log(`Logged in as ${client.user?.tag}!`);
    Logger.log('Scanning guilds for youtube users');
    const settings = new ConfigHelper('./settings.json');
    const json = settings.getFull();
    client.guilds.cache.forEach(async (guild) => {
        // Logger.log(` - ${guild.name}`);
        const guildConfig = json[guild.id.toString()];
        if (typeof guildConfig !== 'object') { Logger.log(` - ${guild.name} : ${chalk.gray('Config Not Found')}`); return; }
        Logger.log(` - ${guild.name} : ${chalk.gray('Config Found')}`);
        if (!guildConfig.role && ! guildConfig.fallbackChannel){
            Logger.error('No Default Channel and or Role');
            return;
        }
        const fallbackChannel = (await client.channels.cache.get(guildConfig.fallbackChannel) as TextChannel);
        const YtUsers = guildConfig.YtUsers;
        if (!YtUsers || YtUsers.length < 1) return;

        YtUsers.forEach(async (user: string) => {
            const ytChannel = new refreshChannel(user,config.apiKey);

            fallbackChannel.send(`Listening to ${user}`);
            ytChannel.on('newVideo',async (updatedEntry) => {
                handleYoutubeRefresh(updatedEntry,guildConfig,fallbackChannel,client);
            });
        });
    });
    

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleYoutubeRefresh(updatedEntry: any,guildConfig: Record<string,string | number>,fallbackChannel: TextChannel,client: Client){
        getEntryType(updatedEntry,config.apiKey)
            .then(async type => {
                switch (type) {
                    case 'video': {
                        if (typeof guildConfig.videosChannel == 'string'){
                            const textChannel = (await client.channels.cache.get(guildConfig.videosChannel) as TextChannel);
                            textChannel.send(`Hey <@&${guildConfig.role}> ${updatedEntry.author.name} Just uploaded a video!\n https://www.youtube.com/watch?v=${updatedEntry['yt:videoId']}\n-# I am a bot, and this action was performed automatically. I am not perfect if you notice a issue please contact a server admin.`);
                        } else {
                            fallbackChannel.send(`Hey <@&${guildConfig.role}> ${updatedEntry.author.name} Just uploaded content!\n https://www.youtube.com/watch?v=${updatedEntry['yt:videoId']}\n-# ${client.user?.tag} Was unable to find a dedicated textChannel.\n-# I am a bot, and this action was performed automatically. I am not perfect if you notice a issue please contact a server admin.`);
                        }
                        break;  
                    }
                    case 'short': {
                        if (typeof guildConfig.shortsChannel == 'string'){
                            const textChannel = (await client.channels.cache.get(guildConfig.shortsChannel) as TextChannel);
                            textChannel.send(`Hey <@&${guildConfig.role}> ${updatedEntry.author.name} Just uploaded a short!\n https://www.youtube.com/watch?v=${updatedEntry['yt:videoId']}\n-# I am a bot, and this action was performed automatically. I am not perfect if you notice a issue please contact a server admin.`);
                        } else {
                            fallbackChannel.send(`Hey <@&${guildConfig.role}> ${updatedEntry.author.name} Just uploaded content!\n https://www.youtube.com/watch?v=${updatedEntry['yt:videoId']}\n-# ${client.user?.tag} Was unable to find a dedicated textChannel.\n-# I am a bot, and this action was performed automatically. I am not perfect if you notice a issue please contact a server admin.`);
                        }
                        break;  
                    }
                }
            }).catch(e => {
                fallbackChannel.send(`Hey <@&${guildConfig.role}> ${updatedEntry.author.name} Just uploaded content!\n https://www.youtube.com/watch?v=${updatedEntry['yt:videoId']}\n-# ${client.user?.tag} Was unable to detect what media type this upload was.\n-# I am a bot, and this action was performed automatically. I am not perfect if you notice a issue please contact a server admin.`);
            });
    }
    // if (!json.get('channel') && !guildConfig.role) {
    //     Logger.error('No Default Channel and or Role');
    //     return;
    // }
    // const channel = await client.channels.cache.get(json.get('channel'));
    // if (!channel.isTextBased() && !channel.isSendable()) return;
    // const textChannel = channel as TextChannel;
    // const users = json.get('users');
    // if (!users || users.length < 1) {
    //     textChannel.send('No Users');
    // }
    // users.forEach(async user => {
    //     const ytChannel = new refreshChannel(user,config.apiKey);

    //     textChannel.send(`Listening to ${user}`);
    //     ytChannel.on('newVideo',async (updatedEntry) => {
    //         textChannel.send(`# Type: ${await ytChannel.getEntryType(updatedEntry)}`);
    //         textChannel.send(`Hey <@&${guildConfig.role}> ${updatedEntry.author.name} Just uploaded a video!\n https://www.youtube.com/watch?v=${updatedEntry['yt:videoId']}`);

    //         // console.log('Latest Video Changed, Adding To Playlist... (Coming Soon)');
    //         console.log('New Latest Video Info:');
    //         console.log(`    Channel Name: ${updatedEntry.author.name}`);
    //         console.log(`    Video Name: ${updatedEntry.title}`);
    //         console.log(`    Video Type: ${await ytChannel.getEntryType(updatedEntry)}`);
    //     });

        
    // });
});



// client.on('messageCreate', async (message) => {
//     const tokens = message.content.toLowerCase().split(' ');
//     const messageString: string = message.content;
//     // console.log(message.content.length);
//     // if (message.content.length < 2)
//     try{
//         songConvert(message);
//     } catch(error) {
//         message.reply(`<@877743969503682612>\n[Internal Error] songConvert Failed\nError:\n${error}`);
//     }

// });


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!interaction.isChatInputCommand()) return;
    for (let i = 0; i < commands.length; i++) {
        if (interaction.commandName == commands[i].commandBuilder.name) {
            commands[i].runnable(interaction);
            return;
        }
    }
});


// Init \\

initializeCommands();
client.login(config.token);