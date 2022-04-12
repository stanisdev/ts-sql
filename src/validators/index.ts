import { StringValidator } from './stringValidator';
import { IntegerValidator } from './integerValidator';
import { BooleanValidator } from './booleanValidator';
import { FieldValidator } from './fieldValidator';

export { StringValidator, IntegerValidator, BooleanValidator, FieldValidator };

export const dataTypeValidators = {
    string: StringValidator,
    integer: IntegerValidator,
    boolean: BooleanValidator,
};
