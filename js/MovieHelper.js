// All of our API logic can go in here
// We can interact with our API via this class
export default class MovieHelper {

    constructor() {
        // Define our API root URL, we can then add specific paths onto the end for different queries
        this.api_root = "https://api.themoviedb.org/3"
        // Define our API key here
        this.api_key = "ed48f7dc083b0fe8b91c340f05e330a4"
    }

    // Use the API endpoint documented on this page: https://developer.themoviedb.org/reference/discover-movie
    async getMovies({ year } = {}) {
        const url = new URL(`${this.api_root}/discover/movie`);
        url.searchParams.set('api_key', this.api_key);
        url.searchParams.set('include_adult', 'false');
        url.searchParams.set('language', 'en-GB');
        if (year) url.searchParams.set('primary_release_year', String(year));
        // Replace this with actual movie results from an API call using fetch()
        try {
            const response = await fetch(url.toString())
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            let titles = []
            const data = await response.json()
            return Array.isArray(data.results) ? data.results : [] // need to pass these into a div/list in the index.html
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


}

