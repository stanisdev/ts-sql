import { ValidationResult, DefaultValidationResult } from '../common/types';

export interface AnalyzeUnit {
    parse(): Promise<void>;
    execute(): Promise<void>;
}

export interface Validator {
    validate(): ValidationResult;
    default(): DefaultValidationResult;
}
