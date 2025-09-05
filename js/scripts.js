let MovieHelper;

// Function to load the MovieHelper module
async function loadMovieHelper() {
    if (!MovieHelper) {
        const module = await import('./MovieHelper.js')
        MovieHelper = module.default
    }
    return MovieHelper
}

// Helper function to get parameter from URL
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

let movieListComponent = {
  movies: [],
  filter_year: '',
  error: null,
  init() {
    this.loadMovies()
  },
  async loadMovies() {

    // Load MovieHelper class
    const MovieHelper = await loadMovieHelper()

    // Get movies from API, using await because getMovies is an async function
    // If filter_year is set, change what movies we load from the API
    // You could do this by calling a different method, or passing arguments into getMovies()
    this.movies = await MovieHelper.getMovies()
  }
}

let movieComponent = {
  movie: null,
  init() {
    // Get movie parameter from URL that looks like this
    //     movie.html?movie_id=456
    // Add links to your index.html to point to movie.html?movie_id={your_movie_id}
    const movie_id = getUrlParam('movie_id')

    if (movie_id) {
      this.loadMovie(movie_id)
    }
  },
  async loadMovie(movie_id) {
    // Load actual movie data from API using movie_id
    this.movie = movie_id
  }
}