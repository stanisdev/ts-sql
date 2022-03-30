import { General } from './general';
import { CreateCommand } from './commands/create';
import { InsertCommand } from './commands/insert';
import { PrimaryCommand } from './common/enums';
import { QueryParams } from './common/types';
import * as i18next from 'i18next';

export class QueryParser extends General {
    private commmands = {
        create: CreateCommand,
        insert: InsertCommand,
    };
    private commandClassInstance: CreateCommand | InsertCommand;

    /**
     * Constructor of the class
     */
    constructor(protected query: QueryParams) {
        super();
    }

    /**
     * Analyze and parse the query
     */
    async analyze(): Promise<void> {
        this.compactQuery();
        const phrase = this.retrieveNearestPhrase({
            capitalize: true,
        });
        const command: PrimaryCommand = (<any>PrimaryCommand)[phrase];
        if (typeof command != 'string') {
            throw new Error(i18next.t('wrong-command', { phrase }));
        }
        const CommandClass = this.commmands[command];
        this.commandClassInstance = new CommandClass(this.query);
        await this.commandClassInstance.parse();
    }

    /**
     * Execute the analized query
     */
    async execute(): Promise<void> {
        await this.commandClassInstance.execute();
    }

    /**
     * Remove excessive spaces as well as similar symbols
     */
    private compactQuery(): void {
        this.query.initialValue = this.query.initialValue
            .replace(/\n\t\r/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }
}
