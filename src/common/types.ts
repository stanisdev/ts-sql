export type FieldDetailedOption = {
    autoIncrement?: boolean;
    notNull?: boolean;
    default?: string;
    size?: {
        min?: number;
        max?: number;
    };
};

export type DefaultValidationResult = {
    value: string;
    isValid: boolean;
};

export type DataTypeOptionsParams = {
    dataType: string;
    finalOptions: FieldDetailedOption[];
    fieldOptions: string[];
};

export type InitialField = {
    name: string;
    options: string[];
};

export type CompactedField = {
    name: string;
    type: string;
    options: FieldDetailedOption[];
};

export type QueryParams = {
    initialValue: string;
    metaData: string;
};

export type Config = {
    storage: {
        folderName: string;
        files: {
            [key: string]: string;
        };
    };
    dirs: {
        root: string;
        storage: string;
    };
};

export type FSReading = {
    lines: string[];
};

export type TableField = {
    name: string;
    dataType: string;
    options: FieldDetailedOption[];
};

export type TableSchema = {
    [key: string]: {
        dataType: string;
        options: FieldDetailedOption[];
    };
};
