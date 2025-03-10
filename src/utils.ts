import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Logger } from './logger.ts';
import { Routes } from 'discord.js';
import { config, rest } from './index.ts';

export function roundDec(float: string | number,places: number){
    return +parseFloat(float.toString()).toFixed(places);
}

export class ConfigHelper {
    configFile: string;
    constructor(configFile: string) {
        this.configFile = configFile;
        if (!existsSync(this.configFile)){
            const json = {};
            writeFileSync(this.configFile,JSON.stringify(json,null,4));
            Logger.error(`Config file ${configFile} does not exist, Creating Empty File...`);
        }
    }

    getFull(): Record<string, unknown> {
        return JSON.parse(readFileSync(this.configFile, 'utf-8'));
    }

    get(key: string): unknown {
        if (this.getFull()[key] !== null) {
            return this.getFull()[key];
        } else {
            this.set(key,{});
            return this.getFull()[key];

            // return 'ERROR';
        }
    }

    set(key: string, value: unknown): string {
        if (this.getFull()[key] !== null) {
            const full = this.getFull();
            full[key] = value;
            writeFileSync(
                path.join(this.configFile),
                JSON.stringify(full, null, 4),
            );
            return 'OK';
        } else {
            return 'ERROR';
        }
    }
    setFull(json: object){
        writeFileSync(
            path.join(this.configFile),
            JSON.stringify(json, null, 4),
        );
    }
}

export async function deleteGuildSlashCommands(guildId: string){
    await rest.put(Routes.applicationGuildCommands(config.clientID, guildId), { body: [] })
        .then(() => console.log('Successfully deleted all guild commands.'))
        .catch(console.error);
}

export async function deleteGlobalSlashCommands(){
    await rest.put(Routes.applicationCommands(config.clientID), { body: [] })
        .then(() => console.log('Successfully deleted all application commands.'))
        .catch(console.error);
}

