'use strict';

import { CreateCommand } from './commands/create.js';
import { InsertCommand } from './commands/insert.js';
import { General } from './general.js';

export class QueryParser extends General {
    #commands = {   
        create: CreateCommand,
        insert: InsertCommand,
    };

    constructor(query) {
        super();
        this.query = query;
        if (typeof query != 'string') {
            throw new Error('Please, specify a query');
        }
    }

    parse() {
        this.#compactQuery();

        const command = this.retrieveNearestPhrase({
            toLowerCase: true,
        });
        if (!this.#commands.hasOwnProperty(command)) {
            throw new Error(`The command '${command}' is not available`);
        }
        const commandClass = this.#commands[command];
        new commandClass().execute();
    }

    #compactQuery() {
        this.query = this.query
            .replace(/\n\t\r/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }
}
