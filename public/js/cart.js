/* ============================================
   🛒 MovieStore — Cart Management
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!isLoggedIn()) {
    window.location.href = '/auth';
    return;
  }
  loadCart();
});

async function loadCart() {
  const cartList = document.getElementById('cart-items');
  const cartSummary = document.getElementById('cart-summary');
  const emptyState = document.getElementById('cart-empty');

  if (!cartList) return;

  cartList.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;

  try {
    const data = await fetchAPI('/cart');
    const { cart, total } = data;

    if (!cart || cart.length === 0) {
      cartList.innerHTML = '';
      if (cartSummary) cartSummary.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';

    cartList.innerHTML = cart.map(item => `
      <div class="cart-item" id="cart-item-${item.movieId}">
        <div class="cart-item-poster">
          <img src="${item.posterUrl || 'https://via.placeholder.com/80x120/1a1a2e/667eea?text=Movie'}" 
               alt="${item.title}"
               onerror="this.src='https://via.placeholder.com/80x120/1a1a2e/667eea?text=Movie'">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-genre">${item.genre}</div>
        </div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.movieId}')">
          <lord-icon src="https://cdn.lordicon.com/skkahier.json" trigger="hover"
            colors="primary:#ffffff" style="width:18px;height:18px"></lord-icon>
          Remove
        </button>
      </div>
    `).join('');

    // Update summary
    const tax = total * 0.18;
    const grandTotal = total + tax;

    document.getElementById('cart-subtotal').textContent = formatPrice(total);
    document.getElementById('cart-tax').textContent = formatPrice(tax);
    document.getElementById('cart-total').textContent = formatPrice(grandTotal);

    // Store for payment
    window.cartData = { items: cart, total: grandTotal };

  } catch (error) {
    cartList.innerHTML = `
      <div class="empty-state">
        <h3>Error loading cart</h3>
        <p>${error.message}</p>
        <button class="btn btn-primary mt-2" onclick="loadCart()">Try Again</button>
      </div>
    `;
  }
}

async function removeFromCart(movieId) {
  try {
    await fetchAPI(`/cart/remove/${movieId}`, { method: 'DELETE' });
    showToast('Removed from cart', 'info');
    
    // Animate removal
    const item = document.getElementById(`cart-item-${movieId}`);
    if (item) {
      item.style.transition = 'all 0.3s ease';
      item.style.transform = 'translateX(100%)';
      item.style.opacity = '0';
      setTimeout(() => loadCart(), 300);
    } else {
      loadCart();
    }
    
    updateCartCount();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function clearCart() {
  try {
    await fetchAPI('/cart/clear', { method: 'DELETE' });
    showToast('Cart cleared', 'info');
    loadCart();
    updateCartCount();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
