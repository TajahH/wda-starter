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
    watchlistIds: new Set(),

    init() {
      this.loadMovies();
      // load saved ids
      try {
        const ids = JSON.parse(localStorage.getItem('watchlist_ids') || '[]');
        this.watchlistIds = new Set(ids);
      } catch { }
    },

    async loadMovies() {
      const MovieHelperClass = await loadMovieHelper();
      const api = new MovieHelperClass();
      this.movies = await api.getMovies({ year: this.filter_year || undefined });
    },

    saveWatchlist() {
      localStorage.setItem('watchlist_ids', JSON.stringify([...this.watchlistIds]));
    },
    isInWatchlist(movie) {
      return !!movie && this.watchlistIds.has(movie.id);
    },
    toggleWatchlist(movie) {
      if (!movie || !movie.id) return;
      if (this.watchlistIds.has(movie.id)) this.watchlistIds.delete(movie.id);
      else this.watchlistIds.add(movie.id);
      this.saveWatchlist();
    },

    isInWatchlist(movie) {
      return !!movie && this.watchlistIds.has(movie.id);
    },
    get watchlistCount() {
      return this.watchlistIds.size;
    },

    async doSearch() {
      const query = (this.searchText || '').trim();
      const year = this.filter_year || undefined;

      const MovieHelperClass = await loadMovieHelper();
      const api = new MovieHelperClass();

      this.error = null;
      try {
        if (query) {
          this.movies = await api.searchMovies(query, { year });
          this.appliedQuery = query.toLowerCase(); // optional: keep for UI display
        } else {
          // Empty search → fall back to discover list
          this.movies = await api.getMovies({ year });
          this.appliedQuery = '';
        }
      } catch (e) {
        this.error = e.message || 'Search failed.';
      }
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
        const matchesYear = y ? (m.release_date || '').slice(0, 4) === y : true;
        return matchesQuery && matchesYear;
      });
    }
  };
};

let movieComponent = {
  movie: null,
  cast: [],
  error: null,
  init() {
    const movie_id = getUrlParam('movie_id');
    console.log('movie_id param:', movie_id);
    if (movie_id) this.loadMovie(movie_id);
  },
  async loadMovie(movie_id) {
    try {
      const MovieHelperClass = await loadMovieHelper();
      const api = new MovieHelperClass();
      const data = await api.getMovieDetails(movie_id);
      this.movie = data;
      this.cast = (data.credits && Array.isArray(data.credits.cast)) ? data.credits.cast : [];
    } catch (e) {
      this.error = e.message || 'Failed to load movie.';
    }
  }
};

window.movieComponent = movieComponent;