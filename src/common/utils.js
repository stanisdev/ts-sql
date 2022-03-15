'use strict';

export class Utils {
    static getEdgeSymbols(string) {
        const symbols = {
            first: string.substring(0, 1),
            last: string.slice(-1),
        };
        const result = {
            modifiedString: string.slice(1, -1).trim(),
            symbols,
        };
        return result;
    }
}
