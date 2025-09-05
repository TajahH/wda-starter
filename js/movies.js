export default class MovieHelper {

    constructor() {
        // Define our API root URL, we can then add specific paths onto the end for different queries
        this.api_root = "https://api.themoviedb.org/3"
        // Define our API key here
        this.api_key = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZDQ4ZjdkYzA4M2IwZmU4YjkxYzM0MGYwNWUzMzBhNCIsIm5iZiI6MTc1NjgxOTQwMC45NzMsInN1YiI6IjY4YjZlZmM4NjhmN2QzYzUyNTIwMTI2OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ca1B8-WEBTTi3Zzl1HuOmhq3RWHqUJtxPfMSi6fX9zQ"
    }

    // Use this API endpoint: https://developer.themoviedb.org/reference/discover-movie
    async getMovies() {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${this.api_key}`
            }   
        };

        try {
            const response = await fetch(`${this.api_root}/discover/movie?primary_release_year=2002`, options)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            let titles = []
            const data = await response.json()
            for (let movie of data.results){
               console.log("only titles: ", movie.title)
               console.log("poster: ", movie.poster_path) // the end of the poster path
               titles.push(movie.title)
            }
            console.log(titles)
            return titles
            //return data.results.title
            } catch (err) {
            console.error("Error fetching movies:", err);
        }
    }

    async saveToWatchList(movies, isSaved) {
        let savedlist = []
        for (let movie of movies){
            if(isSaved){
                savedlist.push(movie)
            }
            return savedlist
        }
    }
}
