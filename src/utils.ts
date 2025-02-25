import chalk from 'npm:chalk';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Logger } from './logger.ts';

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


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getFull(): Record<string, any> {
        return JSON.parse(readFileSync(this.configFile, 'utf-8'));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(key: string): any {
        if (this.getFull()[key] !== null) {
            return this.getFull()[key];
        } else {
            this.set(key,{});
            return this.getFull()[key];

            // return 'ERROR';
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set(key: string, value: any): string {
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
