import { General } from './general';
import { CreateCommand } from './commands/create';

export class QueryParser extends General {
    private commmands = {
        create: CreateCommand,
        insert: class {
            execute() {}
        },
    };

    /**
     * Constructor of the class
     */
    constructor(protected query: string) {
        super();
    }

    /**
     * Parsing the query
     */
    parse(): void {
        this.compactQuery();
        const command = this.retrieveNearestPhrase({
            toLowerCase: true,
        });
        if (!this.commmands.hasOwnProperty(command)) {
            throw new Error(`The command '${command}' is not available`);
        }
        const CommandClass = this.commmands[command as 'create' | 'insert'];
        new CommandClass(this.query).execute();
    }

    /**
     * Remove excessive spaces as well as similar symbols
     */
    private compactQuery(): void {
        this.query = this.query
            .replace(/\n\t\r/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }
}
