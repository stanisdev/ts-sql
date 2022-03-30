import { General } from '../general';
import { QueryParams } from '../common/types';
import { AnalyzeUnit } from '../common/interfaces';
import { TableEntity } from '../entities/table';
import * as i18next from 'i18next';

export class InsertCommand extends General implements AnalyzeUnit {
    private tableName: string;
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
        this.tableName = TableEntity.getTableName(this.retrieveNearestPhrase());
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
        const tableSchema = await TableEntity.getTableSchema(this.tableName);
    }

    /**
     * Validate fields of the query that are supposed
     * to match with a schema of a table
     */
    private validateFields() {}

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
