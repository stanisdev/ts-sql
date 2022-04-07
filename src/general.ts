import { QueryParams } from './common/types';
import { capitalize } from 'lodash';
import * as i18next from 'i18next';

export class General {
    protected query: QueryParams;

    /**
     * Extract the nearest phrase from the query
     */
    protected retrieveNearestPhrase(options?: {
        toLowerCase?: boolean;
        capitalize?: boolean;
    }): string {
        const { initialValue } = this.query;

        const spaceIndex = initialValue.indexOf(' ');
        if (spaceIndex < 0) {
            return '';
        }
        const phrase = initialValue.substring(0, spaceIndex);
        this.query.initialValue = initialValue.substring(spaceIndex + 1);

        if (options?.toLowerCase) {
            return phrase.toLowerCase();
        } else if (options?.capitalize) {
            return capitalize(phrase);
        }
        return phrase;
    }

    /**
     * Find and get the nearest parenthesized substring
     */
    extractParenthesizedSubstring(): string {
        const { initialValue } = this.query;
        const closingBracketIndex = initialValue.indexOf(')');
        const substring = initialValue.slice(1, closingBracketIndex);

        const symbol = initialValue.slice(0, 1);
        if (symbol !== '(') {
            throw new Error(i18next.t('no-proper-braces', { initialValue }));
        }
        this.query.initialValue = initialValue
            .slice(closingBracketIndex + 1)
            .trimStart();
        return substring;
    }
}
