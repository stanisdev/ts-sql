export type FieldDetailedOptions = {
    auto_increment?: boolean,
    notNull?: boolean,
    default?: string,
    size?: {
        min?: number,
        max?: number,
    },
};

export type DefaultValidationResult = {
    value: string,
    isValid: boolean,
};

export type DataTypeOptionsParams = {
    dataType: string,
    finalOptions: FieldDetailedOptions[],
    fieldOptions: string[],
};

export type InitialField = {
    name: string,
    options: string[],
};

export type CompactedField = {
    name: string,
    type: string,
    options: FieldDetailedOptions[],
};