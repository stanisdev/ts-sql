import * as i18next from 'i18next';
import { QueryOptionValidator } from './queryOptionValidator';
import { DataType, QueryFieldOption } from '../common/enums';
import { capitalize } from 'lodash';
import { Utils } from '../common/utils';
import {
    FieldDetailedOption,
    DataTypeOptionsParams,
    InitialField,
    CompactedField,
} from '../common/types';

export class FieldValidator {
    private fields: {
        initial: InitialField[];
        compacted: CompactedField[];
    } = {
        initial: [],
        compacted: [],
    };
    private nameConstraints = {
        characters: /^[a-zA-Z0-9_]{1,}$/,
        size: {
            min: 1,
            max: 50,
        },
    };

    /**
     * Constructor of the class
     */
    constructor(initialFields: InitialField[]) {
        this.fields.initial = initialFields;
    }

    /**
     * Run the validator and parse the field's options
     */
    execute(): void | never {
        const fields = this.fields.initial;
        if (fields.length < 1) {
            throw new Error(i18next.t('no-fields'));
        }
        /**
         * Iterate through the table fields
         */
        for (const field of fields) {
            const finalOptions: FieldDetailedOption[] = [];
            this.validateFieldName(field.name);

            if (field.options.length < 1) {
                throw new Error(
                    i18next.t('no-field-options', { name: field.name }),
                );
            }
            /**
             * Determine field's options
             */
            let [dataType, ...fieldOptions] = field.options;
            if (dataType.includes('(')) {
                const from = dataType.indexOf('(');
                const maxSize = +dataType.slice(from + 1, -1);

                if (Number.isNaN(maxSize)) {
                    throw new Error(
                        i18next.t('wrong-max-size-parameter', {
                            name: field.name,
                        }),
                    );
                }
                finalOptions.push({
                    size: {
                        max: maxSize,
                    },
                });
                dataType = dataType.slice(0, from);
            }
            const checkType: DataType = (<any>DataType)[capitalize(dataType)];
            if (typeof checkType != 'string') {
                throw new Error(i18next.t('wrong-data-type', { dataType }));
            }
            this.validateInitialOptions({
                dataType,
                finalOptions,
                fieldOptions,
            });
            this.fields.compacted.push({
                name: field.name,
                type: dataType,
                options: finalOptions,
            });
        }
    }

    /**
     * Get list of compacted fields
     */
    getCompactedFields(): CompactedField[] {
        return this.fields.compacted;
    }

    /**
     * Validate and determine the initial field's options
     */
    private validateInitialOptions(
        params: DataTypeOptionsParams,
    ): void | never {
        while (true) {
            let nextOption = params.fieldOptions.shift();
            if (typeof nextOption != 'string') {
                break;
            }
            nextOption = Utils.snakeCaseToCamelCase(nextOption);

            const queryOption: QueryFieldOption = (<any>QueryFieldOption)[
                Utils.pureCapitalize(nextOption)
            ];
            if (typeof queryOption != 'string') {
                throw new Error(
                    i18next.t('wrong-option', { name: nextOption }),
                );
            }
            new QueryOptionValidator(queryOption, params).validate();
        }
    }

    /**
     * Check whether the given field's name is correct
     */
    private validateFieldName(fieldName: string): void | never {
        if (!this.nameConstraints.characters.test(fieldName)) {
            throw new Error(
                i18next.t('incorrect-field-name', { name: fieldName }),
            );
        }
        if (this.nameConstraints.size.min > fieldName.length) {
            throw new Error(
                i18next.t('field-name-too-short', { name: fieldName }),
            );
        }
        if (this.nameConstraints.size.max < fieldName.length) {
            throw new Error(
                i18next.t('field-name-too-long', { name: fieldName }),
            );
        }
    }
}
