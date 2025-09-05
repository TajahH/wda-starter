import MovieHelper from "./movies.js"

// By default, modules have their own scope, so we need to manually create our own
// loadMovies function on the window object, which can be used to interact with
// MovieHelper from our HTML page
window.loadMovies = async () => {
    // Create an instance of our MovieHelper class, so we can use the functions on it
    const Movies = new MovieHelper();

    // Get movies from API, using await because getMovies is an async function
    return await Movies.getMovies();
}

loadMovies();

