export class Utils {
    /**
     * Retrieve the first and the last symbol from a string
     * and the remaining string between them
     */
    static getEdgeSymbols(data: string): {
        modifiedString: string;
        symbols: {
            first: string;
            last: string;
        };
    } {
        const symbols = {
            first: data.substring(0, 1),
            last: data.slice(-1),
        };
        return {
            modifiedString: data.slice(1, -1).trim(),
            symbols,
        };
    }

    /**
     * Capitalize only the first letter of the given string
     */
    static pureCapitalize(value: string): string {
        if (value.length < 1) {
            return value;
        }
        return value.slice(0, 1).toUpperCase() + value.slice(1);
    }

    /**
     * Convert the given string from 'snake_case' to 'camelCase'
     */
    static snakeCaseToCamelCase(value: string): string {
        let result = '';
        let firstStep = true;

        while (true) {
            const underscoreIndex = value.indexOf('_');
            if (underscoreIndex < 0) {
                if (firstStep) {
                    return value;
                } else {
                    return result + this.pureCapitalize(value);
                }
            }
            let chunk = value.slice(0, underscoreIndex);
            if (!firstStep) {
                chunk = this.pureCapitalize(chunk);
            }
            result += chunk;
            value = value.slice(underscoreIndex + 1);
            firstStep = false;
        }
    }
}
