import MovieHelper from './MovieHelper.js';

function getWatchlistIds() {
  try {
    return JSON.parse(localStorage.getItem('watchlist_ids') || '[]');
  } catch {
    return [];
  }
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
      this.api = new MovieHelper();
      this.loadMovies()
      // load saved ids
      try {
        this.watchlistIds = new Set(getWatchlistIds());
      } catch { }
    },

    async loadMovies() {
      this.movies = await this.api.getMovies({ year: this.filter_year || undefined });
    },

    saveWatchlist() {
      localStorage.setItem('watchlist_ids', JSON.stringify([...this.watchlistIds]));
    },
    isInWatchlist(movie) {
      return !!movie && this.watchlistIds.has(movie.id);
    },
    toggleWatchlist(movie) {
      if (!movie || !movie.id) return;
      const ids = new Set(this.watchlistIds);
      if (ids.has(movie.id)) ids.delete(movie.id);
      else ids.add(movie.id);

      this.watchlistIds = ids;
      this.saveWatchlist();
    },
    get watchlistCount() {
      return this.watchlistIds.size;
    },


    async doSearch() {
      const query = (this.searchText || '').trim();
      const year = this.filter_year || undefined;

      this.error = null;
      try {
        if (query) {
          this.movies = await this.api.searchMovies(query, { year });
          this.appliedQuery = query.toLowerCase(); // optional: keep for UI display
        } else {
          this.movies = await this.api.getMovies({ year });
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

window.watchlistComponent = function () {
  return {
    watchlistIds: new Set(),
    api: null,
    movies: [],
    error: null,

    init() {
      const ids = getWatchlistIds();
      this.watchlistIds = new Set(ids);
      if (!ids.length) return;

      this.api = new MovieHelper();
      this.load(ids);
    },

    async load(ids) {
      try {
        this.movies = await this.api.getMoviesByIds(ids);
      } catch (e) {
        this.error = e.message || 'Failed to load watchlist.';
      }
    },
    saveWatchlist() {
      localStorage.setItem('watchlist_ids', JSON.stringify([...this.watchlistIds]));
    },


    removeFromWatchlist(id) {
      if (!id) return;
      const next = new Set(this.watchlistIds);
      if (next.delete(id)) {
        this.watchlistIds = next;                      
        this.movies = this.movies.filter(m => m.id !== id);  
        this.saveWatchlist();                          
      }
    }
  };
};

document.addEventListener('alpine:init', () => {
  Alpine.data('movieComponent', () => ({
    movie: null,
    cast: [],
    error: null,

    init() {
      const movie_id = getUrlParam('movie_id');
      console.log('movie_id param:', movie_id); // debug: should log e.g. "1311031"
      if (movie_id) this.loadMovie(movie_id);
    },
    async loadMovie(movie_id) {
      try {
        this.api ??= new MovieHelper();
        const api = this.api;
        const data = await api.getMovieDetails(movie_id);
        this.movie = data;
        this.cast = Array.isArray(data?.credits?.cast) ? data.credits.cast : [];
      } catch (e) {
        console.error(e);
        this.error = e.message || 'Failed to load movie.';
      }
    }
  }));
});
