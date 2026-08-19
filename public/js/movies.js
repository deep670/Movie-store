/* ============================================
   🎬 MovieStore — Movies Catalog
   ============================================ */

let allMovies = [];
let currentGenre = 'All';
let currentSort = 'default';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  loadMovies();
  setupFilters();
});

async function loadMovies() {
  const grid = document.getElementById('movies-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="loader" style="grid-column: 1/-1">
      <div class="spinner"></div>
    </div>
  `;

  try {
    let endpoint = '/movies?';
    if (searchQuery) endpoint += `search=${encodeURIComponent(searchQuery)}&`;
    if (currentGenre !== 'All') endpoint += `genre=${encodeURIComponent(currentGenre)}&`;
    if (currentSort !== 'default') endpoint += `sort=${currentSort}&`;

    const data = await fetchAPI(endpoint);
    allMovies = data.movies;
    renderMovies(allMovies);
    updateMovieCount(allMovies.length);
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <lord-icon src="https://cdn.lordicon.com/tdrtiskw.json" trigger="loop"
          colors="primary:#f093fb,secondary:#667eea" style="width:100px;height:100px"></lord-icon>
        <h3>Unable to load movies</h3>
        <p>${error.message}</p>
        <button class="btn btn-primary mt-2" onclick="loadMovies()">Try Again</button>
      </div>
    `;
  }
}

function renderMovies(movies) {
  const grid = document.getElementById('movies-grid');
  if (!grid) return;

  if (movies.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <lord-icon src="https://cdn.lordicon.com/wkppeqfv.json" trigger="loop"
          colors="primary:#f093fb,secondary:#667eea" style="width:100px;height:100px"></lord-icon>
        <h3>No movies found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = movies.map(movie => `
    <div class="movie-card" onclick="showMovieDetail('${movie._id}')">
      <div class="movie-poster">
        <img src="${movie.posterUrl || 'https://via.placeholder.com/300x450/1a1a2e/667eea?text=No+Poster'}" 
             alt="${movie.title}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x450/1a1a2e/667eea?text=${encodeURIComponent(movie.title)}'">
        <div class="overlay">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCart('${movie._id}')">
            <lord-icon src="https://cdn.lordicon.com/pbrgppbb.json" trigger="hover"
              colors="primary:#ffffff" style="width:18px;height:18px"></lord-icon>
            Add to Cart
          </button>
        </div>
      </div>
      <div class="movie-info">
        <div class="movie-genre">${movie.genre}</div>
        <div class="movie-title">${movie.title}</div>
        <div class="movie-meta">
          <span class="movie-rating">★ ${movie.rating.toFixed(1)}</span>
          <span class="movie-price">${formatPrice(movie.price)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function updateMovieCount(count) {
  const el = document.getElementById('movie-count');
  if (el) el.textContent = `${count} movie${count !== 1 ? 's' : ''}`;
}

function setupFilters() {
  // Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value;
        loadMovies();
      }, 400);
    });
  }

  // Genre chips
  document.querySelectorAll('.chip[data-genre]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip[data-genre]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentGenre = chip.dataset.genre;
      loadMovies();
    });
  });

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      loadMovies();
    });
  }
}

async function showMovieDetail(id) {
  try {
    const data = await fetchAPI(`/movies/${id}`);
    const movie = data.movie;

    const content = `
      <div class="movie-detail">
        <div class="movie-detail-poster">
          <img src="${movie.posterUrl || 'https://via.placeholder.com/300x450/1a1a2e/667eea?text=No+Poster'}" 
               alt="${movie.title}"
               onerror="this.src='https://via.placeholder.com/300x450/1a1a2e/667eea?text=${encodeURIComponent(movie.title)}'">
        </div>
        <div class="movie-detail-info">
          <div class="movie-genre mb-1">${movie.genre}</div>
          <h2>${movie.title}</h2>
          <div class="movie-detail-meta">
            <span>★ ${movie.rating.toFixed(1)}/10</span>
            <span>📅 ${movie.year}</span>
            ${movie.duration ? `<span>⏱ ${movie.duration}</span>` : ''}
            ${movie.director ? `<span>🎬 ${movie.director}</span>` : ''}
          </div>
          <p class="movie-detail-desc">${movie.description}</p>
          <div class="movie-detail-price">${formatPrice(movie.price)}</div>
          <button class="btn btn-primary btn-lg w-full" onclick="addToCart('${movie._id}'); closeModal();">
            <lord-icon src="https://cdn.lordicon.com/pbrgppbb.json" trigger="hover"
              colors="primary:#ffffff" style="width:22px;height:22px"></lord-icon>
            Add to Cart
          </button>
        </div>
      </div>
    `;

    openModal(content, { title: '', maxWidth: '700px' });
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function addToCart(movieId) {
  if (!isLoggedIn()) {
    showToast('Please login to add items to cart', 'warning');
    setTimeout(() => window.location.href = '/auth', 1000);
    return;
  }

  try {
    const data = await fetchAPI('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ movieId })
    });

    showToast(data.message || 'Added to cart!', 'success');
    updateCartCount();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
