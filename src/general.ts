export class General {
    protected query: string;

    protected retrieveNearestPhrase(options?: { toLowerCase: boolean }): string {
        const { query } = this;

        const spaceIndex = query.indexOf(' ');
        if (spaceIndex < 0) {
            return '';
        }
        let phrase = query.substring(0, spaceIndex);
        this.query = query.substring(spaceIndex + 1);

        if (options?.toLowerCase) {
            phrase = phrase.toLowerCase();
        }
        return phrase;
    }
}
