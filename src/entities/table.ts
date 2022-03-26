import { General } from '../general';
import { Utils } from '../common/utils';
import { FieldValidator } from '../common/validators';
import { InitialField, CompactedField } from '../common/types';
import { FileSystem } from '../common/fileSystem';
import { AnalyzeUnit } from '../common/interfaces';
import { Main } from '../main';
import { TableCommand, TableFieldOption } from '../common/enums';
import { QueryParams, Config, FieldDetailedOption } from '../common/types';
import { TableFieldTransformer } from '../common/transformer';
import { TableField, TableSchema as TableSchemaType } from '../common/types';

/**
 * The class is to serve queries related to tables as well as
 * get various kinds of info about them
 */
export class TableEntity extends General implements AnalyzeUnit {
    /**
     * Constructor of the class
     */
    constructor(
        protected query: QueryParams,
        private params: {
            command: TableCommand;
        },
    ) {
        super();
    }

    /**
     * Start processing the given command and
     * the remaining query
     */
    async parse(): Promise<void> {
        const parses = new Parser(this.query);
        await parses[this.params.command]();
    }

    /**
     * Execute the previously analyzed command
     */
    async execute(): Promise<void> {
        const executor = new Executor(this.query);
        await executor[this.params.command]();
    }

    /**
     * Find, validate and get table name from the query
     */
    static getTableName(phrase: string): string {
        if (phrase.length < 3) {
            throw new Error(`The table name is specified incorrectly`);
        }
        let { symbols, modifiedString } = Utils.getEdgeSymbols(phrase);
        if (symbols.first !== '"' || symbols.last !== '"') {
            throw new Error(
                'You should use double quotes to specify the name of a table',
            );
        }
        return modifiedString;
    }

    /**
     * Get the parsed schema of a table that
     * was explicitly created before
     */
    static async getTableSchema(tableName: string): Promise<TableSchemaType> {
        const ts = new TableSchema(tableName);
        await ts.findRawInfo();
        ts.getChunks();
        ts.parseFields();
        const fields = ts.getFields();

        const schema: TableSchemaType = {};
        for (const { name, dataType, options } of fields) {
            schema[name] = {
                dataType,
                options,
            };
        }
        return schema;
    }
}

/**
 * The class is intended to parse stringified
 * info about a table
 */
class TableSchema {
    private line: string;
    private chunks: string[] = [];
    private fields: TableField[] = [];

    /**
     * Constructor of the class
     */
    constructor(private tableName: string) {}

    /**
     * Retrieve a plain string about a table
     * from the file 'tables'
     */
    async findRawInfo(): Promise<void> {
        const fs = new FileSystem();
        const config = Main.getInstance().getConfig(); // @todo: fix this
        await fs.readFileByLines(config.storage.files.tables);
        const lines = fs.getLines();

        const line = lines.find(line => line.startsWith(`${this.tableName}|`));
        if (typeof line != 'string') {
            throw new Error(`Table '${this.tableName}' does not exist`);
        }
        this.line = line;
    }

    /**
     * Split raw info about fields of a table
     * into separated chunks
     */
    getChunks() {
        let line = this.line.slice(this.tableName.length + 1);
        while (true) {
            const indexDelimiter = line.indexOf('|');
            if (indexDelimiter < 0) {
                this.chunks.push(line);
                break;
            }
            this.chunks.push(line.slice(0, indexDelimiter));
            line = line.slice(indexDelimiter + 1);
        }
    }

    /**
     * The final method to complete the
     * parsing process
     */
    parseFields() {
        for (let chunk of this.chunks) {
            const fieldName = chunk.slice(0, chunk.indexOf('['));
            chunk = chunk.slice(fieldName.length);

            const dataType = chunk.slice(1, chunk.indexOf(']'));
            chunk = chunk.slice(dataType.length + 2).slice(1, -1);
            const options = this.parseAndGetOptions(chunk);

            const field = {
                name: fieldName,
                dataType,
                options,
            };
            this.fields.push(field);
        }
    }

    /**
     * Get an array of the having parsed fields
     */
    getFields(): TableField[] {
        return this.fields;
    }

    /**
     * Finalize representation of the fields options
     * by clarifying types of the values
     */
    private parseAndGetOptions(chunk: string): FieldDetailedOption[] {
        const options: FieldDetailedOption[] = [];
        while (true) {
            if (chunk.length < 1) {
                break;
            }
            if (chunk.startsWith(',')) {
                chunk = chunk.slice(1);
            }
            const optionName = chunk.slice(0, chunk.indexOf(':'));
            chunk = chunk.slice(optionName.length + 1);

            let optionValue: string;
            let shift: number;
            /**
             * If the option of a field has a nested
             * object of sub-values
             */
            if (chunk.startsWith('{')) {
                optionValue = chunk.slice(1, chunk.indexOf('}'));
                shift = optionValue.length + 2;

                const subOptions: {
                    [key: string]: string;
                } = {};
                optionValue.split(',').forEach(value => {
                    const [left, right] = value.split(':');
                    subOptions[left] = right;
                });
                options.push({
                    [optionName]: subOptions,
                });
            } else if (chunk.includes(',')) {
            /**
             * If raw info about a field includes at
             * least one more option
             */
                optionValue = chunk.slice(0, chunk.indexOf(','));
                shift = optionValue.length + 1;
                options.push({
                    [optionName]: optionValue,
                });
            } else {
                shift = chunk.length;
                options.push({
                    [optionName]: chunk,
                });
            }
            chunk = chunk.slice(shift);
        }
        return this.getTransformedOptions(options);
    }

    /**
     * Transform values of the fields options according
     * to the expecting type
     */
    private getTransformedOptions(
        options: FieldDetailedOption[],
    ): FieldDetailedOption[] {
        const result = [];

        for (const option of options) {
            let [[key]] = Object.entries(option);
            key = key.slice(0, 1).toUpperCase() + key.slice(1);
            const optionName: TableFieldOption = (<any>TableFieldOption)[key];

            const data = TableFieldTransformer[optionName](option);
            result.push(data);
        }
        return result;
    }
}

/**
 * The class to parse the initial query
 */
class Parser extends General {
    private name: string;
    private config: Config;

    /**
     * Constructor of the class
     */
    constructor(protected query: QueryParams) {
        super();
        this.config = Main.getInstance().getConfig();
    }

    /**
     * Parse the command to create a new table
     */
    private async create(): Promise<void> {
        let phrase = this.retrieveNearestPhrase();
        this.name = TableEntity.getTableName(phrase);

        if (await this.doesTableExist()) {
            throw new Error(`The table '${this.name}' is already exist`);
        }

        let data = Utils.getEdgeSymbols(this.query.initialValue);
        if (data.symbols.first !== '(' || data.symbols.last !== ')') {
            throw new Error(
                'You should wrap the fields of a table in brackets',
            );
        }
        this.query.initialValue = data.modifiedString;
        this.parseFields();
    }

    /**
     * Check whether the given table name is already occupied
     */
    async doesTableExist(): Promise<boolean> {
        const fs = new FileSystem();
        await fs.readFileByLines(this.config.storage.files.tables);

        for (const line of fs.getLines()) {
            const tableName = line.substring(0, line.indexOf('|'));
            if (tableName === this.name) {
                return true;
            }
        }
        return false;
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
                    options.push(this.query.initialValue);
                    break;
                }
                if (fieldOption.slice(-1) == ',') {
                    options.push(fieldOption.slice(0, -1));
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
        this.stringifyFields(fieldValidator.getCompactedFields());
    }

    /**
     * Compile the prepared list of fields to a string
     */
    private stringifyFields(fields: CompactedField[]): void {
        let result = `${this.name}|`;
        for (const field of fields) {
            result += `${field.name}[${field.type}](`;

            for (const option of field.options) {
                const [[key, value]] = Object.entries(option);
                if (key == 'size') {
                    let sizeParams = Object.entries(value).reduce(
                        (prev, curr) => {
                            return prev + `${curr[0]}:${curr[1]},`;
                        },
                        '',
                    );
                    sizeParams = sizeParams.slice(0, -1);
                    result += `${key}:{${sizeParams}},`;
                } else {
                    result += `${key}:${value},`;
                }
            }
            result = result.slice(0, -1);
            result += ')|';
        }
        this.query.metaData = result.slice(0, -1);
    }
}

/**
 * The class to execute the having parsed query
 */
class Executor {
    private config: Config;

    /**
     * Constructor of the class
     */
    constructor(protected query: QueryParams) {
        this.config = Main.getInstance().getConfig();
    }

    /**
     * Execute the 'create' command
     */
    async create(): Promise<void> {
        const fs = new FileSystem();
        await fs.open(this.config.storage.files.tables);
        await fs.append(this.query.metaData);
        await fs.close();
    }
}
