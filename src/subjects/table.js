'use strict';

import { General } from '../general.js';
import { validators } from '../common/validators.js';

export class Table extends General {
    #fields = [];
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
        let { symbols, modifiedString } = this.getEdgeSymbols(tableName);
        if (symbols.first !== '"' || symbols.last !== '"') {
            throw new Error('You should use double quotes to specify the name of a table');
        }
        tableName = modifiedString;

        let data = this.getEdgeSymbols(this.query);
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
        this.#validateFields();
    }

    #validateFields() {
        const fields = this.#fields;
        const compactedFieds = [];

        if (fields.length < 1) {
            throw new Error('No any fields to define a table');
        }
        for (let a = 0; a < fields.length; a++) {
            const field = fields[a];
            const validator = validators.table.field;

            if (!validator.name.characters.test(field.name)) {
                throw new Error(`The name of the field '${field.name}' is incorrect`);
            }
            if (validator.name.size.min > field.name.length) {
                throw new Error(`The name of the field '${field.name}' is too short`);
            }
            if (validator.name.size.max < field.name.length) {
                throw new Error(`The name of the field '${field.name}' is too long`);
            }
            if (field.options.length < 1) {
                throw new Error(`The field '${field.name}' has no options`);
            }
            let [dataType, ...otherOptions] = field.options;
            if (dataType.includes('(')) {
                const from = dataType.indexOf('(');
                const maxSize = +dataType.slice(from + 1, -1);
                
                if (Number.isNaN(maxSize)) {
                    throw new Error(`The max size parameter for the field ` +
                        `'${field.name}' is specified incorrectly`);
                }
                dataType = dataType.slice(0, from);
            }
            if (!validators.dataTypes.hasOwnProperty(dataType)) {
                throw new Error(`The data type '${dataType}' is incorrect`);
            }
            
            compactedFieds.push({
                name: field.name,
                type: dataType,
                options: [],
            });
        }
        console.log(compactedFieds);
    }
}
