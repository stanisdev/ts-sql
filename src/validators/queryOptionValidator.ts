import * as i18next from 'i18next';
import { dataTypeValidators } from './index';
import { DataType, QueryFieldOption } from '../common/enums';
import { DataTypeOptionsParams } from '../common/types';

export class QueryOptionValidator {
    constructor(
        private option: QueryFieldOption,
        private params: DataTypeOptionsParams,
    ) {}

    /**
     * Execute the validation process
     */
    validate(): void | never {
        this[this.option]();
    }

    /**
     * The option to define a primary key
     */
    private primary(): void | never {
        const nextValue = this.params.fieldOptions.shift();
        if (nextValue !== 'key') {
            throw new Error(i18next.t('wrong-primary-key-option'));
        }
        this.params.finalOptions.push({
            primaryKey: true,
        });
    }

    /**
     * The option of digit's auto incrementation
     */
    private autoIncrement(): void {
        this.params.finalOptions.push({
            autoIncrement: true,
        });
    }

    /**
     * The negation option
     */
    private not(): void | never {
        const nextValue = this.params.fieldOptions.shift();
        if (nextValue !== 'null') {
            throw new Error(i18next.t('wrong-not-null-option'));
        }
        this.params.finalOptions.push({
            notNull: true,
        });
    }

    /**
     * The default option
     */
    private default(): void | never {
        const { params } = this;

        const value = params.fieldOptions.shift();
        const { dataType } = params;
        try {
            if (typeof value != 'string') {
                throw new Error(i18next.t('prevent-runtime'));
            }
            const ValidatorClass = dataTypeValidators[dataType as DataType];
            const validatorInstance = new ValidatorClass(value);

            if (!validatorInstance.default().isValid) {
                throw new Error(i18next.t('prevent-runtime'));
            }
        } catch {
            throw new Error(
                i18next.t('wrong-default-value', { value, dataType }),
            );
        }
        params.finalOptions.push({
            default: value,
        });
    }
}
