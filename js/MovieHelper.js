// All of our API logic can go in here
// We can interact with our API via this class
export default class MovieHelper {

    constructor() {
        // Define our API root URL, we can then add specific paths onto the end for different queries
        this.api_root = "https://api.themoviedb.org/3"
        // Define our API key here
        this.api_key = "YOUR_API_KEY"
    }

    // Use the API endpoint documented on this page: https://developer.themoviedb.org/reference/discover-movie
    static async getMovies() {
        // Replace this with actual movie results from an API call using fetch()
        return ['KPop Demon Hunters', 'I Know What You Did Last Summer', 'The Matrix']
    }

}