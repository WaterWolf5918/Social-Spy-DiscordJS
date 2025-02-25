import { SlashCommandBuilder, CommandInteraction, CacheType, SlashCommandSubcommandsOnlyBuilder, SlashCommandSubcommandBuilder, SlashCommandOptionsOnlyBuilder, CommandInteractionOption, ChatInputCommandInteraction } from 'discord.js';



export type Command = { commandBuilder: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup' > | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder, runnable: CommandRunnable};
export type CommandRunnable = (interaction: ChatInputCommandInteraction<CacheType>) => void;