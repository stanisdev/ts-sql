'use strict';

import { Utils } from './utils.js';

const validators = {
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
    dataTypes: {
        integer: {
            default(value) {
                value = +value;
                return {
                    value,
                    isValid: Number.isInteger(+value),
                };
            },
        },
        string: {
            default(value) {
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
            default(value) {
                return {
                    value,
                    isValid: value == 'true' || value == 'false',
                };
            },
        },
    },
    fieldOptions: {
        ['auto_increment'](dataType, finalOptions) {
            finalOptions.push({
                auto_increment: true,
            });
        },
        not(dataType, finalOptions, fieldOptions) {
            const nextValue = fieldOptions.shift();
            if (nextValue !== 'null') {
                throw new Error(`You specified the 'NOT NULL' option incorrectly`);
            }
            finalOptions.push({
                notNull: true,
            });
        },
        default(dataType, finalOptions, fieldOptions) {
            const value = fieldOptions.shift();
            const result = validators.dataTypes[dataType].default(value);

            if (!result.isValid) {
                throw new Error(`The default value '${value}' for the ` +
                    `'${dataType}' data type is incorrect`);
            }
            finalOptions.push({
                default: result.value,
            });
        },
    },
};

export class FieldValidator {
    #fields = {
        initial: [],
        compacted: [],
    };

    constructor(initialFields) {
        this.#fields.initial = initialFields;
    }

    execute() {
        const fields = this.#fields.initial;
        if (fields.length < 1) {
            throw new Error('No any fields to define a table');
        }
        /**
         * Iterate through the table fields
         */
        for (let a = 0; a < fields.length; a++) {
            const field = fields[a];
            const finalOptions = [];
            this.#validateFieldName(field.name);

            if (field.options.length < 1) {
                throw new Error(`The field '${field.name}' has no options`);
            }
            /**
             * Determine field's options
             */
            let [dataType, ...fieldOptions] = field.options;
            dataType = this.#validateDataType(dataType, finalOptions);

            if (!validators.dataTypes.hasOwnProperty(dataType)) {
                throw new Error(`The data type '${dataType}' is incorrect`);
            }
            this.#validateOtherOptions(dataType, finalOptions, fieldOptions);
            this.#fields.compacted.push({
                name: field.name,
                type: dataType,
                options: finalOptions,
            });
        }
    }

    getCompactedFields() {
        return this.#fields.compacted;
    }

    /**
     * Validate options by name
     */
    #validateOtherOptions(dataType, finalOptions, fieldOptions) {
        while (true) {
            const nextOption = fieldOptions.shift();
            if (!validators.fieldOptions.hasOwnProperty(nextOption)) {
                throw new Error(`The option '${nextOption}' is incorrect`);
            }
            validators.fieldOptions[nextOption](
                dataType, finalOptions, fieldOptions,
            );
            if (fieldOptions.length <= 0) {
                break;
            }
        }
    }

    #validateDataType(dataType, finalOptions) {
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
        return dataType;
    }

    #validateFieldName(fieldName) {
        const fieldNameValidator = validators.table.field.name;

        if (!fieldNameValidator.characters.test(fieldName)) {
            throw new Error(`The name of the field '${fieldName}' is incorrect`);
        }
        if (fieldNameValidator.size.min > fieldName.length) {
            throw new Error(`The name of the field '${fieldName}' is too short`);
        }
        if (fieldNameValidator.size.max < fieldName.length) {
            throw new Error(`The name of the field '${fieldName}' is too long`);
        }
    }
}
