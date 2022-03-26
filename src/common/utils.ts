export class Utils {
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
}
