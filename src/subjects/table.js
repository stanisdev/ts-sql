'use strict';

import { General } from '../general.js';
import { FieldValidator } from '../common/validators.js';
import { FileSystem } from '../common/fileSystem.js';
import { Utils } from '../common/utils.js';

export class Table extends General {
    #fields = [];
    #name;
    #command

    constructor(params) {
        super();
        this.#command = params.command;
    }

    execute() {
        if (typeof this[this.#command] !== 'function') {
            throw new Error(`The command '${this.#command}' for a table cannot be applied`);
        }
        this[this.#command]();
    }

    create() {
        let tableName = this.retrieveNearestPhrase();
        if (tableName.length < 3) {
            throw new Error(`The table name is specified incorrectly`);
        }
        let { symbols, modifiedString } = Utils.getEdgeSymbols(tableName);
        if (symbols.first !== '"' || symbols.last !== '"') {
            throw new Error('You should use double quotes to specify the name of a table');
        }
        this.#name = modifiedString;

        let data = Utils.getEdgeSymbols(this.query);
        if (data.symbols.first !== '(' || data.symbols.last !== ')') {
            throw new Error('You should wrap the fields of a table in brackets');
        }
        this.query = data.modifiedString;
        this.#parseFields();
    }

    #parseFields() {
        while (true) {
            const fieldName = this.retrieveNearestPhrase();
            if (typeof fieldName !== 'string' || fieldName.length < 1) {
                break;
            }
            const options = [];
            while (true) {
                let fieldOption = this.retrieveNearestPhrase({
                    toLowerCase: true,
                });
                if (fieldOption == ',' || typeof fieldOption != 'string') {
                    break;
                }
                if (fieldOption.slice(-1) == ',') {
                    fieldOption = fieldOption.slice(0, -1);
                    options.push(fieldOption);
                    break;
                }
                options.push(fieldOption);
            }
            this.#fields.push({
                name: fieldName,
                options,
            });
        }
        const fieldValidator = new FieldValidator(this.#fields);
        fieldValidator.execute();
        this.#stringifyFields(
            fieldValidator.getCompactedFields()
        );
    }

    #stringifyFields(fields) {
        let result = `${this.#name}|`;
        for (let a = 0; a < fields.length; a++) {
            const field = fields[a];
            result += `${field.name}[${field.type}](`;
            
            const { options } = field;
            for (let b = 0; b < options.length; b++) {
                const option = options[b];
                const [[key, value]] = Object.entries(option);
                result += `${key}:${value},`; // @todo: check if value if an object
            }
            result = result.slice(0, -1);

            result += ') | ';
        }
        result = result.slice(0, -1);
    }
}
