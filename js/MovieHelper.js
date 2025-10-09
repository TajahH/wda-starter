export default class MovieHelper {

    constructor() {
        this.api_root = "https://api.themoviedb.org/3"
        this.api_key = "ed48f7dc083b0fe8b91c340f05e330a4"
    }

    // Use the API endpoint documented on this page: https://developer.themoviedb.org/reference/discover-movie
    async getMovies({ year, runtimeMin, runtimeMax } = {}) {
        const url = new URL(`${this.api_root}/discover/movie`);
        url.searchParams.set('api_key', this.api_key);
        url.searchParams.set('include_adult', 'false');
        url.searchParams.set('language', 'en-GB');
        url.searchParams.set('sort_by', 'popularity.desc');
        if (year) url.searchParams.set('primary_release_year', String(year));
        if (Number.isFinite(runtimeMin)) url.searchParams.set('with_runtime.gte', String(runtimeMin));
        if (Number.isFinite(runtimeMax)) url.searchParams.set('with_runtime.lte', String(runtimeMax));

        console.log('[discover]', url.toString());
        try {
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            return Array.isArray(data.results) ? data.results : [];
        } catch (err) {
            console.error("Error fetching movies:", err);
            return []
        }
    }

    async getMovieDetails(id) {
        const url = new URL(`${this.api_root}/movie/${id}`);
        url.searchParams.set('api_key', this.api_key);
        url.searchParams.set('language', 'en-GB');
        url.searchParams.set('append_to_response', 'credits');
        console.log('getMovieDetails URL:', url.toString());

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
    }

    async getMoviesByIds(ids = []) {
        const results = await Promise.all(ids.map(id => this.getMovieDetails(id)));
        return results.filter(Boolean);
    }

    async searchMovies(query, { year } = {}) {
        const url = new URL(`${this.api_root}/search/movie`);
        url.searchParams.set('api_key', this.api_key);
        url.searchParams.set('include_adult', 'false');
        url.searchParams.set('language', 'en-GB');
        url.searchParams.set('query', query);
        if (year) url.searchParams.set('primary_release_year', String(year));

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        return Array.isArray(data.results) ? data.results : [];
    }

    async getGenres() {
        if (this._genreMap) return this._genreMap;
        const url = new URL(`${this.api_root}/genre/movie/list`);
        url.searchParams.set('api_key', this.api_key);
        url.searchParams.set('language', 'en-GB');
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json(); // { genres: [{id, name}] }
        this._genreMap = Object.fromEntries((data.genres || []).map(g => [g.id, g.name]));
        return this._genreMap;
    }

}
