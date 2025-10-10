export default class DTDDHelper {
    constructor() {
        this.api_root = "https://www.doesthedogdie.com/dddsearch?q="
        this.api_key = "263a0d0f368673d9f7a690ef779f8440"
    }

    async getTriggerWarnings(title) {
        const url = new URL(this.api_root + encodeURIComponent(title));
        const res = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
                'X-API-KEY': this.api_key
            }

        })
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        return data;
    }

    async getItemByTmdbId({ tmdbId, title, altTitle, year }) {
        let items = await this.getTriggerWarnings(title);
        let match = items.find(i => Number(i.tmdbId) === Number(tmdbId));
        if (!match && altTitle && altTitle !== title) {
            items = await this.getTriggerWarnings(altTitle);
            match = items.find(i => Number(i.tmdbId) === Number(tmdbId));
        }
        if (!match && year) {
            match = items.find(i => String(i.releaseYear) === String(year));
        }
        return { match, items };
    }

}