import { General } from '../general';
import { Utils } from '../common/utils';
import { FieldValidator } from '../common/validators';
import { InitialField, CompactedField } from '../common/types';

export class TableEntity extends General {
    private name: string;

    /**
     * Constructor of the class
     */
    constructor(
        protected query: string,
        private params: {
            command: string
        },
    ) {
        super();
    }

    /**
     * Start processing the given command and
     * the remaining query
     */
    execute(): void {
        const command = this.params.command as 'create';
        if (typeof this[command] != 'function') {
            throw new Error(`The command '${command}' for a table cannot be applied`);
        }
        this[command]();
    }

    /**
     * Process the command to create a new table
     */
    private create(): void {
        let tableName = this.retrieveNearestPhrase();
        if (tableName.length < 3) {
            throw new Error(`The table name is specified incorrectly`);
        }
        let { symbols, modifiedString } = Utils.getEdgeSymbols(tableName);
        if (symbols.first !== '"' || symbols.last !== '"') {
            throw new Error('You should use double quotes to specify the name of a table');
        }
        this.name = modifiedString;

        let data = Utils.getEdgeSymbols(this.query);
        if (data.symbols.first !== '(' || data.symbols.last !== ')') {
            throw new Error('You should wrap the fields of a table in brackets');
        }
        this.query = data.modifiedString;
        this.parseFields();
    }

    /**
     * Define the initial representation of 
     * the given fields
     */
    private parseFields(): void {
        const fields: InitialField[] = [];

        while (true) {
            const fieldName = this.retrieveNearestPhrase();
            if (fieldName.length < 1) {
                break;
            }
            const options: string[] = [];

            while (true) {
                let fieldOption = this.retrieveNearestPhrase({
                    toLowerCase: true,
                });
                if (fieldOption.length < 1) {
                    options.push(this.query);
                    break;
                }
                if (fieldOption.slice(-1) == ',') {
                    options.push(
                        fieldOption.slice(0, -1)
                    );
                    break;
                }
                options.push(fieldOption);
            }
            fields.push({
                name: fieldName,
                options,
            });
        }
        const fieldValidator = new FieldValidator(fields);
        fieldValidator.execute();
        this.stringifyFields(
            fieldValidator.getCompactedFields()
        );
    }

    /**
     * Compile the prepared list of fields to a string
     */
    private stringifyFields(fields: CompactedField[]) {
        let result = `${this.name}|`;
        for (const field of fields) {
            result += `${field.name}[${field.type}](`;

            for (const option of field.options) {
                const [[key, value]] = Object.entries(option);
                if (key == 'size') {
                    let sizeParams = Object
                        .entries(value)
                        .reduce((prev, curr) => {
                            return prev + `${curr[0]}:${curr[1]},`;
                        }, '');
                    sizeParams = sizeParams.slice(0, -1);
                    result += `${key}:{${sizeParams}},`;
                } else {
                    result += `${key}:${value},`;
                }
            }
            result = result.slice(0, -1);
            result += ')|';
        }
        result = result.slice(0, -1);
    }
}
