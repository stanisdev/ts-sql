export enum TableCommand {
    Create = 'create',
}

export enum CreateEntity {
    Table = 'table',
}

export enum PrimaryCommand {
    Create = 'create',
    Insert = 'insert',
}

export enum TableFieldOption {
    PrimaryKey = 'primaryKey',
    AutoIncrement = 'autoIncrement',
    NotNull = 'notNull',
    Default = 'default',
    Size = 'size',
}

export enum DataType {
    String = 'string',
    Integer = 'integer',
    Boolean = 'boolean',
}

export enum QueryFieldOption {
    Primary = 'primary',
    AutoIncrement = 'autoIncrement',
    Not = 'not',
    Default = 'default',
}
