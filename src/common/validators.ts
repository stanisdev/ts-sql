import * as i18next from 'i18next';
import { Utils } from './utils';
import {
    FieldDetailedOption,
    DefaultValidationResult,
    DataTypeOptionsParams,
    InitialField,
    CompactedField,
} from './types';

const validators = {
    /**
     * Table validators
     */
    table: {
        field: {
            name: {
                characters: /^[a-zA-Z0-9_]{1,}$/,
                size: {
                    min: 1,
                    max: 50,
                },
            },
        },
    },
    /**
     * Validators of the data types
     */
    dataTypes: {
        integer: {
            default(value: string): DefaultValidationResult {
                return {
                    value,
                    isValid: Number.isInteger(+value),
                };
            },
        },
        string: {
            default(value: string): DefaultValidationResult | never {
                if (typeof value != 'string') {
                    return {
                        isValid: false,
                        value,
                    };
                }
                const { symbols, modifiedString } = Utils.getEdgeSymbols(value);
                if (symbols.first != "'" || symbols.last != "'") {
                    throw new Error(
                        i18next.t('no-single-quotes-around-default-value'),
                    );
                }
                return {
                    value: modifiedString,
                    isValid: modifiedString.length > 0,
                };
            },
        },
        boolean: {
            default(value: string): DefaultValidationResult {
                return {
                    value,
                    isValid: value == 'true' || value == 'false',
                };
            },
        },
    },
    /**
     * Field's options validators
     */
    fieldOptions: {
        /**
         * The options of digit's auto incrementation
         */
        ['autoIncrement'](params: DataTypeOptionsParams) {
            params.finalOptions.push({
                autoIncrement: true,
            });
        },
        /**
         * The negation option
         */
        not(params: DataTypeOptionsParams) {
            const nextValue = params.fieldOptions.shift();
            if (nextValue !== 'null') {
                throw new Error(i18next.t('wrong-not-null-option'));
            }
            params.finalOptions.push({
                notNull: true,
            });
        },
        /**
         * The default option
         */
        default(params: DataTypeOptionsParams) {
            const value = params.fieldOptions.shift();
            const { dataType } = params;
            try {
                if (typeof value != 'string') {
                    throw new Error(i18next.t('crucial-error'));
                }
                const result =
                    validators.dataTypes[
                        dataType as 'string' | 'integer' | 'boolean'
                    ].default(value);
                if (!result.isValid) {
                    throw new Error(i18next.t('crucial-error'));
                }
            } catch {
                throw new Error(
                    i18next.t('wrong-default-value', { value, dataType }),
                );
            }
            params.finalOptions.push({
                default: value,
            });
        },
    },
};

export class FieldValidator {
    private fields: {
        initial: InitialField[];
        compacted: CompactedField[];
    } = {
        initial: [],
        compacted: [],
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
            if (!validators.dataTypes.hasOwnProperty(dataType)) {
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
            // @todo: fix this: use a method to transform
            // the 'snake case' to the 'camel case'
            if (nextOption == 'auto_increment') {
                nextOption = 'autoIncrement';
            }
            if (!validators.fieldOptions.hasOwnProperty(nextOption)) {
                throw new Error(
                    i18next.t('wrong-option', { name: nextOption }),
                );
            }
            validators.fieldOptions[
                nextOption as 'autoIncrement' | 'not' | 'default'
            ](params);
        }
    }

    /**
     * Check whether the given field's name is correct
     */
    private validateFieldName(fieldName: string): void | never {
        const validator = validators.table.field.name;

        if (!validator.characters.test(fieldName)) {
            throw new Error(
                i18next.t('incorrect-field-name', { name: fieldName }),
            );
        }
        if (validator.size.min > fieldName.length) {
            throw new Error(
                i18next.t('field-name-too-short', { name: fieldName }),
            );
        }
        if (validator.size.max < fieldName.length) {
            throw new Error(
                i18next.t('field-name-too-long', { name: fieldName }),
            );
        }
    }
}
