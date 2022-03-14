'use strict';

export class General {
    static #query;

    get query() {
        return General.#query;
    }

    set query(value) {
        General.#query = value;
    }

    retrieveNearestPhrase(options = {}) {
        let query = General.#query;
        if (typeof query != 'string') {
            return;
        }
        const spaceIndex = query.indexOf(' ');
        if (spaceIndex < 0) {
            General.#query = undefined;
            return query;
        }
        let phrase = query.substring(0, spaceIndex);
        General.#query = query.substring(spaceIndex + 1);
        
        if (options.toLowerCase) {
            phrase = phrase.toLowerCase();
        }
        return phrase;
    }

    getEdgeSymbols(string) {
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
