import { Utils } from '../common/utils';
import { Validator } from '../common/interfaces';
import * as i18next from 'i18next';
import {
    DefaultValidationResult,
    FieldDetailedOption,
    ValidationResult,
} from '../common/types';

export class StringValidator implements Validator {
    constructor(
        private value: string,
        private options?: FieldDetailedOption[],
    ) {}

    /**
     * Execute the main validation
     */
    validate(): ValidationResult {
        const valueLength = this.value.length - 2;
        let isValid = valueLength > 0;
        let message = '';

        if (Array.isArray(this.options)) {
            const sizeOption = this.options.find(option => option.size);
            const maxSize = sizeOption?.size?.max;
            const minSize = sizeOption?.size?.min;

            if (typeof maxSize != 'undefined' && valueLength > maxSize) {
                message = 'too-long-string';
                isValid = false;
            } else if (typeof minSize != 'undefined' && valueLength < minSize) {
                message = 'too-short-string';
                isValid = false;
            }
        }
        return { isValid, message };
    }

    /**
     * Validate and get a default value
     */
    default(): DefaultValidationResult | never {
        if (!this.validate()) {
            return {
                isValid: false,
                value: this.value,
            };
        }
        const { symbols, modifiedString } = Utils.getEdgeSymbols(this.value);
        if (symbols.first != "'" || symbols.last != "'") {
            throw new Error(i18next.t('no-single-quotes-around-default-value'));
        }
        return {
            value: modifiedString,
            isValid: true,
        };
    }
}
