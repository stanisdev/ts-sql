import { Validator } from '../common/interfaces';
import {
    DefaultValidationResult,
    FieldDetailedOption,
    ValidationResult,
} from '../common/types';

export class IntegerValidator implements Validator {
    constructor(
        private value: string,
        private options?: FieldDetailedOption[],
    ) {}

    /**
     * Execute the main validation
     */
    validate(): ValidationResult {
        const isValid = Number.isInteger(+this.value);
        let message = '';
        if (!isValid) {
            message = 'not-integer';
        }
        return { isValid, message };
    }

    /**
     * Describe me
     */
    default(): DefaultValidationResult {
        const { isValid } = this.validate();
        return {
            value: this.value,
            isValid,
        };
    }
}
