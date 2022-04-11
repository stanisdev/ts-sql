import { StringValidator } from './stringValidator';
import { IntegerValidator } from './integerValidator';
import { BooleanValidator } from './booleanValidator';

export default {
    StringValidator,
    IntegerValidator,
    BooleanValidator,
};

export const dataTypeValidators = {
    string: StringValidator,
    integer: IntegerValidator,
    boolean: BooleanValidator,
};
