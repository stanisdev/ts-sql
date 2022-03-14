'use strict';

export const validators = {
    table: {
        field: {
            name: {
                characters: /^[a-zA-Z0-9_]{1,}$/,
                size: {
                    min: 1,
                    max: 50,
                },
            },
        }
    },
    dataTypes: {
        integer: {},
        string: {},
        boolean: {},
    },
};
