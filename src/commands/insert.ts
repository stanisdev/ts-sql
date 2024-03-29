import { General } from '../general';
import { AnalyzeUnit } from '../common/interfaces';
import { TableEntity } from '../entities/table';
import { DataType } from '../common/enums';
import { dataTypeValidators } from '../validators';
import { Sequence } from '../common/sequence';
import * as i18next from 'i18next';
import {
    QueryParams,
    InsertRecords,
    TableSchema,
    PlainHashTable,
} from '../common/types';

export class InsertCommand extends General implements AnalyzeUnit {
    private table: {
        name: string;
        schema: TableSchema;
        records: InsertRecords;
    };
    private initial: {
        fields: string;
        values: string[];
    } = {
        fields: '',
        values: [],
    };

    /**
     * Constructor of the class
     */
    constructor(protected query: QueryParams) {
        super();
    }

    /**
     * Determine which entity to engage
     */
    async parse(): Promise<void> {
        let phrase = this.retrieveNearestPhrase({
            toLowerCase: true,
        });
        if (phrase !== 'into') {
            throw new Error(i18next.t('wrong-insert-query'));
        }
        const tableName = TableEntity.getTableName(
            this.retrieveNearestPhrase(),
        );
        this.initial.fields = this.extractParenthesizedSubstring();
        phrase = this.retrieveNearestPhrase({
            toLowerCase: true,
        });
        if (phrase !== 'values') {
            throw new Error(i18next.t('wrong-insert-query'));
        }
        while (true) {
            const substring = this.extractParenthesizedSubstring();
            this.initial.values.push(substring);
            if (this.query.initialValue.slice(0, 1) !== ',') {
                break;
            }
            this.retrieveNearestPhrase();
        }
        const tableSchema = await TableEntity.getTableSchema(tableName);
        this.table = {
            name: tableName,
            schema: tableSchema,
            records: {},
        };
        await this.prepareRecords();
        this.validateFields();
        this.validateValues();
    }

    /**
     * Parse and compact raw string-representation
     * of fields and related records
     */
    private async prepareRecords(): Promise<void> {
        const fields: string[] = this.initial.fields
            .split(',')
            .map(field => field.trim());

        const records: string[][] = [];
        /**
         * Build the initial straightforward representation
         * of the being inserted records
         */
        for (const substring of this.initial.values) {
            const record: string[] = substring
                .split(',')
                .map(value => value.trim());
            records.push(record);
        }
        const result = this.table.records;
        await this.definePrimaryKeys(records.length);

        fields.forEach((field, index) => {
            if (result.hasOwnProperty(field)) {
                throw new Error(i18next.t('field-duplicate', { name: field }));
            }
            result[field] = records.map(record => record[index]);
        });
        for (const [fieldName, records] of Object.entries(result)) {
            const hasError = records.some(
                record => typeof record != 'string' || record.length < 1,
            );
            if (hasError) {
                throw new Error(
                    i18next.t('no-expecting-values', {
                        name: fieldName,
                    }),
                );
            }
        }
        /**
         * Transform the being inserted records by filling the
         * fields that do not present in the query but have
         * a default value in the table schema
         */
        const defaultFieldsArray = Object.entries(this.table.schema).filter(
            ([, attributes]) => {
                return attributes.options.find(option => {
                    return option.default;
                });
            },
        );
        const defaultFields: PlainHashTable = {};
        defaultFieldsArray.reduce((previous, current) => {
            const fieldName = current[0];
            const { options } = current[1];

            const option = options.find(option => option.default);
            if (typeof option?.default != 'undefined') {
                previous[fieldName] = option.default;
            }
            return previous;
        }, defaultFields);
        const recordsCount = this.initial.values.length;

        for (const [fieldName, defaultValue] of Object.entries(defaultFields)) {
            if (!result.hasOwnProperty(fieldName)) {
                const values = [];
                for (let a = 0; a < recordsCount; a++) {
                    values.push(defaultValue);
                }
                result[fieldName] = values;
            }
        }
    }

    /**
     * Describe me
     */
    private async definePrimaryKeys(recordsCount: number): Promise<void> {
        const field = Object.entries(this.table.schema).filter(element => {
            const [, { options }] = element;
            return options.some(option => option.hasOwnProperty('primaryKey'));
        });
        if (field.length < 1) {
            return;
        }
        const [fieldName, params] = field[0];
        const isAutoIncrement =
            params.options.findIndex(option =>
                option.hasOwnProperty('autoIncrement'),
            ) > -1;

        if (!isAutoIncrement) {
            return;
        }
        const sequence = new Sequence(this.table.name);
        this.table.records[fieldName] = await sequence.getValues(recordsCount);
    }

    /**
     * Validate fields of the query that are supposed
     * to match with a schema of a table
     */
    private validateFields() {
        const { records, schema } = this.table;
        /**
         * Check the presence of all required fields
         * in the query based on the table schema
         */
        for (const [fieldName, attributes] of Object.entries(schema)) {
            const { options } = attributes;
            const isOptionalField =
                options.find(option => option.autoIncrement) instanceof Object;
            if (isOptionalField) {
                continue;
            }
            if (!records.hasOwnProperty(fieldName)) {
                throw new Error(
                    i18next.t('field-is-required', { name: fieldName }),
                );
            }
        }
        for (const fieldName of Object.keys(records)) {
            if (!schema.hasOwnProperty(fieldName)) {
                throw new Error(
                    i18next.t('no-field-in-table', { name: fieldName }),
                );
            }
        }
    }

    /**
     * Check whether the given values of the query satisfy
     * the constraints of a table
     */
    private validateValues() {
        const { records, schema } = this.table;

        for (const [fieldName, values] of Object.entries(records)) {
            const { dataType, options } = schema[fieldName];
            const ValidatorClass = dataTypeValidators[dataType as DataType];

            values.forEach(value => {
                const validatorInstance = new ValidatorClass(value, options);
                const { isValid, message } = validatorInstance.validate();
                if (!isValid) {
                    throw new Error(i18next.t(message, { name: fieldName }));
                }
            });
        }
    }

    /**
     * Execute the parsed command
     */
    async execute(): Promise<void> {
        // console.log(this.table.records);
    }
}
