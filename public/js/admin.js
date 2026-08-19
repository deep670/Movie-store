/* ============================================
   ⚙️ MovieStore — Admin Dashboard
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Protect admin page
  if (!isLoggedIn() || !isAdmin()) {
    showToast('Admin access only', 'error');
    setTimeout(() => window.location.href = '/', 1000);
    return;
  }

  loadStats();
  loadAdminMovies();
  setupAdminTabs();
});

function setupAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const panel = document.getElementById(tab.dataset.panel);
      if (panel) panel.classList.add('active');

      // Load data for panel
      if (tab.dataset.panel === 'orders-panel') loadAdminOrders();
      if (tab.dataset.panel === 'users-panel') loadAdminUsers();
    });
  });
}

async function loadStats() {
  try {
    const data = await fetchAPI('/admin/stats');
    const { stats } = data;

    document.getElementById('stat-movies').textContent = stats.totalMovies;
    document.getElementById('stat-users').textContent = stats.totalUsers;
    document.getElementById('stat-orders').textContent = stats.totalOrders;
    document.getElementById('stat-revenue').textContent = formatPrice(stats.totalRevenue);
  } catch (error) {
    showToast('Failed to load stats: ' + error.message, 'error');
  }
}

async function loadAdminMovies() {
  const tbody = document.getElementById('movies-tbody');
  if (!tbody) return;

  try {
    const data = await fetchAPI('/movies');
    const movies = data.movies;

    tbody.innerHTML = movies.map(movie => `
      <tr>
        <td><img src="${movie.posterUrl || 'https://via.placeholder.com/40x60/1a1a2e/667eea?text=M'}" class="poster-thumb" alt="${movie.title}"
            onerror="this.src='https://via.placeholder.com/40x60/1a1a2e/667eea?text=M'"></td>
        <td><strong>${movie.title}</strong></td>
        <td><span class="chip active" style="cursor:default">${movie.genre}</span></td>
        <td><strong style="color:var(--success)">${formatPrice(movie.price)}</strong></td>
        <td><span style="color:var(--warning)">★ ${movie.rating.toFixed(1)}</span></td>
        <td>${movie.year}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary btn-sm" onclick='editMovie(${JSON.stringify(movie).replace(/'/g, "\\'")})'>
              ✏️ Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteMovie('${movie._id}', '${movie.title}')">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:40px">Error loading movies</td></tr>`;
  }
}

async function loadAdminOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  try {
    const data = await fetchAPI('/admin/orders');
    const orders = data.orders;

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:40px;color:var(--text-muted)">No orders yet</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(order => `
      <tr>
        <td style="font-size:0.8rem;color:var(--text-muted)">${order._id.slice(-8)}</td>
        <td>
          <div><strong>${order.userName}</strong></div>
          <div style="font-size:0.8rem;color:var(--text-muted)">${order.userEmail}</div>
        </td>
        <td>${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
        <td><strong style="color:var(--success)">${formatPrice(order.totalAmount)}</strong></td>
        <td><span class="status-badge ${order.status}">${order.status}</span></td>
        <td style="font-size:0.85rem;color:var(--text-muted)">${new Date(order.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:40px">Error loading orders</td></tr>`;
  }
}

async function loadAdminUsers() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  try {
    const data = await fetchAPI('/admin/users');
    const users = data.users;

    tbody.innerHTML = users.map(user => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div><strong>${user.name}</strong></div>
              <div style="font-size:0.8rem;color:var(--text-muted)">${user.email}</div>
            </div>
          </div>
        </td>
        <td><span class="status-badge ${user.role === 'admin' ? 'paid' : 'pending'}">${user.role}</span></td>
        <td style="font-size:0.85rem;color:var(--text-muted)">${new Date(user.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
      </tr>
    `).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center" style="padding:40px">Error loading users</td></tr>`;
  }
}

function showAddMovieModal() {
  const content = `
    <form id="addMovieForm" onsubmit="submitAddMovie(event)">
      <div class="form-group">
        <label class="form-label">Title *</label>
        <input type="text" class="form-input" id="movie-title" required placeholder="Enter movie title">
      </div>
      <div class="form-group">
        <label class="form-label">Description *</label>
        <textarea class="form-input" id="movie-desc" required placeholder="Movie description..."></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-group">
          <label class="form-label">Genre *</label>
          <select class="form-input" id="movie-genre" required>
            <option value="">Select genre</option>
            <option value="Action">Action</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Horror">Horror</option>
            <option value="Thriller">Thriller</option>
            <option value="Romance">Romance</option>
            <option value="Animation">Animation</option>
            <option value="Adventure">Adventure</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Price (₹) *</label>
          <input type="number" class="form-input" id="movie-price" required min="0" placeholder="299">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-group">
          <label class="form-label">Rating (0-10)</label>
          <input type="number" class="form-input" id="movie-rating" min="0" max="10" step="0.1" placeholder="8.5">
        </div>
        <div class="form-group">
          <label class="form-label">Year *</label>
          <input type="number" class="form-input" id="movie-year" required placeholder="2024">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-group">
          <label class="form-label">Duration</label>
          <input type="text" class="form-input" id="movie-duration" placeholder="2h 30min">
        </div>
        <div class="form-group">
          <label class="form-label">Director</label>
          <input type="text" class="form-input" id="movie-director" placeholder="Director name">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Poster URL</label>
        <input type="url" class="form-input" id="movie-poster" placeholder="https://...">
      </div>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="movie-featured">
          <span class="form-label" style="margin:0">Featured Movie</span>
        </label>
      </div>
      <button type="submit" class="btn btn-primary w-full btn-lg">
        Add Movie
      </button>
    </form>
  `;

  openModal(content, { title: '🎬 Add New Movie', maxWidth: '550px' });
}

async function submitAddMovie(e) {
  e.preventDefault();

  const movieData = {
    title: document.getElementById('movie-title').value,
    description: document.getElementById('movie-desc').value,
    genre: document.getElementById('movie-genre').value,
    price: Number(document.getElementById('movie-price').value),
    rating: Number(document.getElementById('movie-rating').value) || 0,
    year: Number(document.getElementById('movie-year').value),
    duration: document.getElementById('movie-duration').value || '',
    director: document.getElementById('movie-director').value || '',
    posterUrl: document.getElementById('movie-poster').value || '',
    featured: document.getElementById('movie-featured').checked
  };

  try {
    await fetchAPI('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData)
    });

    showToast('Movie added successfully!', 'success');
    closeModal();
    loadAdminMovies();
    loadStats();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function editMovie(movie) {
  const content = `
    <form id="editMovieForm" onsubmit="submitEditMovie(event, '${movie._id}')">
      <div class="form-group">
        <label class="form-label">Title *</label>
        <input type="text" class="form-input" id="edit-title" required value="${movie.title}">
      </div>
      <div class="form-group">
        <label class="form-label">Description *</label>
        <textarea class="form-input" id="edit-desc" required>${movie.description}</textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-group">
          <label class="form-label">Genre *</label>
          <select class="form-input" id="edit-genre" required>
            ${['Action','Comedy','Drama','Sci-Fi','Horror','Thriller','Romance','Animation','Adventure']
              .map(g => `<option value="${g}" ${movie.genre === g ? 'selected' : ''}>${g}</option>`)
              .join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Price (₹) *</label>
          <input type="number" class="form-input" id="edit-price" required min="0" value="${movie.price}">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-group">
          <label class="form-label">Rating (0-10)</label>
          <input type="number" class="form-input" id="edit-rating" min="0" max="10" step="0.1" value="${movie.rating}">
        </div>
        <div class="form-group">
          <label class="form-label">Year *</label>
          <input type="number" class="form-input" id="edit-year" required value="${movie.year}">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-group">
          <label class="form-label">Duration</label>
          <input type="text" class="form-input" id="edit-duration" value="${movie.duration || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Director</label>
          <input type="text" class="form-input" id="edit-director" value="${movie.director || ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Poster URL</label>
        <input type="url" class="form-input" id="edit-poster" value="${movie.posterUrl || ''}">
      </div>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="edit-featured" ${movie.featured ? 'checked' : ''}>
          <span class="form-label" style="margin:0">Featured Movie</span>
        </label>
      </div>
      <button type="submit" class="btn btn-primary w-full btn-lg">
        Save Changes
      </button>
    </form>
  `;

  openModal(content, { title: '✏️ Edit Movie', maxWidth: '550px' });
}

async function submitEditMovie(e, movieId) {
  e.preventDefault();

  const movieData = {
    title: document.getElementById('edit-title').value,
    description: document.getElementById('edit-desc').value,
    genre: document.getElementById('edit-genre').value,
    price: Number(document.getElementById('edit-price').value),
    rating: Number(document.getElementById('edit-rating').value) || 0,
    year: Number(document.getElementById('edit-year').value),
    duration: document.getElementById('edit-duration').value || '',
    director: document.getElementById('edit-director').value || '',
    posterUrl: document.getElementById('edit-poster').value || '',
    featured: document.getElementById('edit-featured').checked
  };

  try {
    await fetchAPI(`/movies/${movieId}`, {
      method: 'PUT',
      body: JSON.stringify(movieData)
    });

    showToast('Movie updated successfully!', 'success');
    closeModal();
    loadAdminMovies();
    loadStats();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function deleteMovie(movieId, title) {
  const content = `
    <div class="text-center" style="padding: 20px 0;">
      <lord-icon src="https://cdn.lordicon.com/skkahier.json" trigger="loop" delay="0"
        colors="primary:#ff5252,secondary:#ffd740" style="width:80px;height:80px"></lord-icon>
      <h3 style="margin: 16px 0 8px;">Delete "${title}"?</h3>
      <p style="color: var(--text-secondary); margin-bottom: 24px;">This action cannot be undone.</p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="confirmDeleteMovie('${movieId}')">Delete</button>
      </div>
    </div>
  `;

  openModal(content, { title: '', maxWidth: '400px' });
}

async function confirmDeleteMovie(movieId) {
  try {
    await fetchAPI(`/movies/${movieId}`, { method: 'DELETE' });
    showToast('Movie deleted', 'success');
    closeModal();
    loadAdminMovies();
    loadStats();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
