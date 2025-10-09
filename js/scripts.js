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
    years: [],
    genres: [],
    genreMap: {},
    filter_genre: '',
    runtimeMin: null,
    runtimeMax: null,
    searchText: '',
    appliedQuery: '',
    error: null,
    watchlistIds: new Set(),

    async init() {
      this.api = new MovieHelper();
      await this.loadMovies()
      const start = new Date().getFullYear();
      const end = 1980;
      this.years = Array.from({ length: start - end + 1 }, (_, i) => String(start - i));

      this.genreMap = await this.api.getGenres();
      this.genres = Object.entries(this.genreMap)
        .map(([id, name]) => ({ id: Number(id), name }))
        .sort((a, b) => a.name.localeCompare(b.name));
      try {
        this.watchlistIds = new Set(getWatchlistIds());
      } catch { }
    },

    async loadMovies() {
      const year = this.filter_year || undefined;
      const runtimeMin = Number.isFinite(this.runtimeMin) ? this.runtimeMin : undefined;
      const runtimeMax = Number.isFinite(this.runtimeMax) ? this.runtimeMax : undefined;
      let base = await this.api.getMovies({ year, runtimeMin, runtimeMax });

      if (Number.isFinite(this.runtimeMin) || Number.isFinite(this.runtimeMax)) {
        const details = await Promise.all(base.map(m => this.api.getMovieDetails(m.id)));
        base = details.filter(d => {
          const rt = Number(d.runtime) || 0;
          const minOk = Number.isFinite(this.runtimeMin) ? rt >= this.runtimeMin : true;
          const maxOk = Number.isFinite(this.runtimeMax) ? rt <= this.runtimeMax : true;
          return minOk && maxOk;
        });
      }

      this.movies = base;
    },

    applyRuntimeFilter() {
      this.loadMovies();
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

    get filteredMovies() {
      const q = (this.appliedQuery || '').toLowerCase();
      const y = (this.filter_year || '').trim();
      const genreId = Number.isFinite(this.filter_genre) ? this.filter_genre : null;

      return this.movies.filter(m => {
        const matchesQuery = q ? (m.title || '').toLowerCase().includes(q) : true;
        const matchesYear = y ? (m.release_date || '').slice(0, 4) === y : true;
        const matchesGenre = genreId ? (m.genre_ids || []).includes(genreId) : true;
        return matchesQuery && matchesYear && matchesGenre;
      });
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

    async clearSearch() {
      this.searchText = '';
      this.appliedQuery = '';
      this.filter_year = '';
      this.error = null;
      this.movies = await this.api.getMovies();
    },
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
