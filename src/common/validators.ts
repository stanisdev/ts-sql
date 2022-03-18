import { Utils } from './utils';
import {
    FieldDetailedOptions,
    DefaultValidationResult,
    DataTypeOptionsParams,
    InitialField,
    CompactedField,
} from './types';

const validators = {
    /**
     * Describe me
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
        }
    },
    /**
     * Describe me
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
                    throw new Error('You should wrap the default value of a string to single quotes');
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
     * Describe me
     */
    fieldOptions: {
        /**
         * Describe me
         */
        ['auto_increment'](params: DataTypeOptionsParams) {
            params.finalOptions.push({
                auto_increment: true,
            });
        },
        /**
         * Describe me
         */
        not(params: DataTypeOptionsParams) {
            const nextValue = params.fieldOptions.shift();
            if (nextValue !== 'null') {
                throw new Error(`You specified the 'NOT NULL' option incorrectly`);
            }
            params.finalOptions.push({
                notNull: true,
            });
        },
        /**
         * Describe me
         */
        default(params: DataTypeOptionsParams) {
            const value = params.fieldOptions.shift();
            try {
                if (typeof value != 'string') {
                    throw new Error('Prevent runtime');
                }
                const result = validators.dataTypes[
                    params.dataType as 'string' | 'integer' | 'boolean'
                ].default(value);
                if (!result.isValid) {
                    throw new Error('Prevent runtime');
                }
            } catch {
                throw new Error(`The default value '${value}' for the ` +
                    `'${params.dataType}' data type is incorrect`);
            }
            params.finalOptions.push({
                default: value,
            });
        },
    },
};

export class FieldValidator {
    private fields: {
        initial: InitialField[],
        compacted: CompactedField[],
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
            throw new Error('No any fields to define a table');
        }
        /**
         * Iterate through the table fields
         */
        for (const field of fields) {
            const finalOptions: FieldDetailedOptions[] = [];
            this.validateFieldName(field.name);

            if (field.options.length < 1) {
                throw new Error(`The field '${field.name}' has no options`);
            }
            /**
             * Determine field's options
             */
            let [dataType, ...fieldOptions] = field.options;
            if (dataType.includes('(')) {
                const from = dataType.indexOf('(');
                const maxSize = +dataType.slice(from + 1, -1);
                
                if (Number.isNaN(maxSize)) {
                    throw new Error(`The max size parameter for the field ` +
                        `'${field.name}' is specified incorrectly`);
                }
                finalOptions.push({
                    size: {
                        max: maxSize,
                    }
                });
                dataType = dataType.slice(0, from);
            }
            if (!validators.dataTypes.hasOwnProperty(dataType)) {
                throw new Error(`The data type '${dataType}' is incorrect`);
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
    private validateInitialOptions(params: DataTypeOptionsParams): void | never {
        while (true) {
            const nextOption = params.fieldOptions.shift();
            if (typeof nextOption != 'string') {
                break;
            }
            if (!validators.fieldOptions.hasOwnProperty(nextOption)) {
                throw new Error(`The option '${nextOption}' is incorrect`);
            }
            validators.fieldOptions[
                nextOption as 'auto_increment' | 'not' | 'default'
            ](params);
        }
    }

    /**
     * Check whether the given field's name is correct
     */
    private validateFieldName(fieldName: string): void | never {
        const validator = validators.table.field.name;

        if (!validator.characters.test(fieldName)) {
            throw new Error(`The name of the field '${fieldName}' is incorrect`);
        }
        if (validator.size.min > fieldName.length) {
            throw new Error(`The name of the field '${fieldName}' is too short`);
        }
        if (validator.size.max < fieldName.length) {
            throw new Error(`The name of the field '${fieldName}' is too long`);
        }
    }
}
