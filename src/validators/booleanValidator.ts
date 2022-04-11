import { Validator } from '../common/interfaces';
import {
    DefaultValidationResult,
    FieldDetailedOption,
    ValidationResult,
} from '../common/types';

export class BooleanValidator implements Validator {
    constructor(
        private value: string,
        private options?: FieldDetailedOption[],
    ) {}

    /**
     * Execute the main validation
     */
    validate(): ValidationResult {
        const isValid = this.value == 'true' || this.value == 'false';
        let message = '';
        if (!isValid) {
            message = 'not-boolean';
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
