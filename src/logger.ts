import chalk from 'npm:chalk';


export class Logger {
    static getTime(date: Date) {
        return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
    }

    static getDate(date: Date) { return date.getMonth().toString().padStart(2, '0') + '/' + date.getDay().toString().padStart(2, '0') + '/' + date.getFullYear(); }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static log(...args: any[]) {
        const d = new Date();
        const time = Logger.getTime(d);
        const date = Logger.getDate(d);
        console.log(`[${chalk.greenBright('+')}] ${chalk.rgb(140,140,140 )(date + ' ' + time)}:   ` + args);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static error(...args: any[]) {
        const d = new Date();
        const time = Logger.getTime(d);
        const date = Logger.getDate(d);
        console.log(`[${chalk.redBright('-')}] ${chalk.rgb(140,140,140 )(date + ' ' + time)}:   ` + args);
    }
}

