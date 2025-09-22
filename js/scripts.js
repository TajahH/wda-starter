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

window.movieListComponent = function () {
  return {
    movies: [],
    filter_year: '',
    searchText: '',
    appliedQuery: '',
    error: null,

    init() { this.loadMovies(); },

    async loadMovies() {
      const MovieHelperClass = await loadMovieHelper();
      const api = new MovieHelperClass();
      this.movies = await api.getMovies({ year: this.filter_year || undefined });
    },

    doSearch() {
      this.appliedQuery = (this.searchText || '').trim().toLowerCase();
    },

    clearSearch() {
      this.searchText = '';
      this.appliedQuery = '';
    },

    get filteredMovies() {
      const q = this.appliedQuery;
      const y = (this.filter_year || '').trim();
      return this.movies.filter(m => {
        const matchesQuery = q ? (m.title || '').toLowerCase().includes(q) : true;
        const matchesYear  = y ? (m.release_date || '').slice(0,4) === y : true;
        return matchesQuery && matchesYear;
      });
    }
  };
};

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

window.movieComponent = movieComponent;