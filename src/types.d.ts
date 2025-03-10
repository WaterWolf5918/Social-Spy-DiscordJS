import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, SlashCommandOptionsOnlyBuilder, ChatInputCommandInteraction, CacheType } from "discord.js";

interface GuildConfig {
    "fallbackChannel"?: string,
    "role"?: string,
    "videosChannel"?: string,
    "shortsChannel"?: string,
    "YtUsers"?: string[]
}

type GuildsStorage = Record<string,GuildConfig> 

type Command = { commandBuilder: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup' > | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder, runnable: CommandRunnable};
type CommandRunnable = (interaction: ChatInputCommandInteraction<CacheType>) => void;