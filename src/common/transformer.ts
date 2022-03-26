import { FieldDetailedOption } from '../common/types';

export const TableFieldTransformer = {
    autoIncrement(option: FieldDetailedOption): FieldDetailedOption {
        if (option.autoIncrement?.toString() == 'true') {
            return {
                autoIncrement: true,
            };
        } else {
            return {
                autoIncrement: false,
            };
        }
    },
    notNull(option: FieldDetailedOption): FieldDetailedOption {
        if (option.notNull?.toString() == 'true') {
            return {
                notNull: true,
            };
        } else {
            return {
                notNull: false,
            };
        }
    },
    default(option: FieldDetailedOption): FieldDetailedOption {
        let value = option.default;
        if (value?.startsWith(`'`)) {
            value = value.slice(1, -1);
        }
        return {
            default: value,
        };
    },
    size(option: FieldDetailedOption): FieldDetailedOption {
        const value: {
            min?: number;
            max?: number;
        } = {};
        if (option.size?.hasOwnProperty('min')) {
            value.min = Number(option.size.min);
        }
        if (option.size?.hasOwnProperty('max')) {
            value.max = Number(option.size.max);
        }
        return {
            size: value,
        };
    },
};
