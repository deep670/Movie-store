/* ============================================
   🎬 MovieStore — Core App Utilities
   ============================================ */

const API_BASE = '/api';

// ── API Helper ──
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('auth')) {
          showToast('Session expired. Please login again.', 'warning');
          setTimeout(() => window.location.href = '/auth', 1500);
        }
      }
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// ── Auth State ──
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function isAdmin() {
  const user = getUser();
  return user && user.role === 'admin';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Logged out successfully', 'success');
  setTimeout(() => window.location.href = '/', 800);
}

// ── Toast Notification System ──
function showToast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-size:1.2rem">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300)">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Modal System ──
function openModal(contentHTML, options = {}) {
  // Remove existing modal
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'app-modal';

  overlay.innerHTML = `
    <div class="modal" style="${options.maxWidth ? 'max-width:' + options.maxWidth : ''}">
      <div class="modal-header">
        <h3 class="modal-title">${options.title || ''}</h3>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        ${contentHTML}
      </div>
    </div>
  `;

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Trigger animation
  requestAnimationFrame(() => overlay.classList.add('active'));
}

function closeModal() {
  const modal = document.getElementById('app-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => modal.remove(), 300);
  }
}

// ── Navbar ──
function renderNavbar() {
  const user = getUser();
  const currentPage = window.location.pathname;

  const navHTML = `
    <nav class="navbar" id="main-navbar">
      <a href="/" class="nav-logo">
        <lord-icon src="https://cdn.lordicon.com/kthelypq.json" trigger="loop" delay="2000"
          colors="primary:#f093fb,secondary:#667eea" style="width:40px;height:40px"></lord-icon>
        <span class="gradient-text">MovieStore</span>
      </a>
      
      <ul class="nav-links" id="nav-links">
        <li><a href="/" class="${currentPage === '/' ? 'active' : ''}">
          <lord-icon src="https://cdn.lordicon.com/wmwqvixz.json" trigger="hover"
            colors="primary:#e0e0e0" style="width:22px;height:22px"></lord-icon>
          Home
        </a></li>
        <li><a href="/movies" class="${currentPage === '/movies' ? 'active' : ''}">
          <lord-icon src="https://cdn.lordicon.com/aklfruoc.json" trigger="hover"
            colors="primary:#e0e0e0" style="width:22px;height:22px"></lord-icon>
          Movies
        </a></li>
        ${user ? `
          <li><a href="/cart" class="cart-badge ${currentPage === '/cart' ? 'active' : ''}">
            <lord-icon src="https://cdn.lordicon.com/pbrgppbb.json" trigger="hover"
              colors="primary:#e0e0e0" style="width:22px;height:22px"></lord-icon>
            Cart
            <span class="cart-count" id="nav-cart-count" style="display:none">0</span>
          </a></li>
        ` : ''}
        ${user && user.role === 'admin' ? `
          <li><a href="/admin" class="${currentPage === '/admin' ? 'active' : ''}">
            <lord-icon src="https://cdn.lordicon.com/lecprnjb.json" trigger="hover"
              colors="primary:#e0e0e0" style="width:22px;height:22px"></lord-icon>
            Admin
          </a></li>
        ` : ''}
      </ul>

      <div class="nav-right">
        ${user ? `
          <span style="color:var(--text-secondary);font-size:0.85rem;display:flex;align-items:center;gap:6px;">
            <lord-icon src="https://cdn.lordicon.com/kthelypq.json" trigger="hover"
              colors="primary:#f093fb" style="width:20px;height:20px"></lord-icon>
            ${user.name}
          </span>
          <button class="btn btn-secondary btn-sm" onclick="logout()">Logout</button>
        ` : `
          <a href="/auth" class="btn btn-primary btn-sm">
            <lord-icon src="https://cdn.lordicon.com/hrjifpbq.json" trigger="hover"
              colors="primary:#ffffff" style="width:18px;height:18px"></lord-icon>
            Login
          </a>
        `}
        <button class="mobile-menu-btn" onclick="toggleMobileMenu()">☰</button>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', navHTML);

  // Update cart count
  if (user) updateCartCount();

  // Scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  });
}

function toggleMobileMenu() {
  const navLinks = document.getElementById('nav-links');
  if (navLinks) navLinks.classList.toggle('active');
}

async function updateCartCount() {
  try {
    if (!isLoggedIn()) return;
    const data = await fetchAPI('/cart');
    const badge = document.getElementById('nav-cart-count');
    if (badge && data.cart) {
      const count = data.cart.reduce((sum, item) => sum + item.quantity, 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  } catch (e) {
    // silently fail
  }
}

// ── Format Currency ──
function formatPrice(price) {
  return '₹' + Number(price).toLocaleString('en-IN');
}

// ── Star Rating Display ──
function renderStars(rating) {
  const full = Math.floor(rating / 2);
  const half = rating % 2 >= 1 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
