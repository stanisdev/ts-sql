import { QueryParams } from './common/types';

export class General {
    protected query: QueryParams;

    /**
     * Extract the nearest phrase from the query
     */
    protected retrieveNearestPhrase(options?: { toLowerCase: boolean }): string {
        const { initialValue } = this.query;

        const spaceIndex = initialValue.indexOf(' ');
        if (spaceIndex < 0) {
            return '';
        }
        let phrase = initialValue.substring(0, spaceIndex);
        this.query.initialValue = initialValue.substring(spaceIndex + 1);

        if (options?.toLowerCase) {
            phrase = phrase.toLowerCase();
        }
        return phrase;
    }
}
