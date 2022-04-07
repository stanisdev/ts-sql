import { General } from '../general';
import { AnalyzeUnit } from '../common/interfaces';
import { TableEntity } from '../entities/table';
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
        this.table.records = this.getFieldsAndRecords();
        this.validateFields();
    }

    /**
     * Parse and compact raw string-representation
     * of fields and related records
     */
    private getFieldsAndRecords(): InsertRecords {
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
        const result: InsertRecords = {};
        fields.forEach((field, index) => {
            if (result.hasOwnProperty(field)) {
                throw new Error(i18next.t('field-duplicate', { name: field }));
            }
            result[field] = records.map(record => record[index]);
        });
        for (const [fieldName, records] of Object.entries(result)) {
            if (records.some(record => typeof record != 'string' || record.length < 1)) {
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
        return result;
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
    private validateValues() {}

    /**
     * Execute the parsed command
     */
    async execute(): Promise<void> {}
}
