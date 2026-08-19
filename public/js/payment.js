/* ============================================
   💳 MovieStore — Razorpay Payment Integration
   ============================================ */

async function initiatePayment() {
  if (!window.cartData || !window.cartData.items || window.cartData.items.length === 0) {
    showToast('Your cart is empty', 'warning');
    return;
  }

  const payBtn = document.getElementById('pay-btn');
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px"></span> Processing...';
  }

  try {
    const user = getUser();
    const { items, total } = window.cartData;

    // Create order on server
    const orderItems = items.map(item => ({
      movieId: item.movieId,
      title: item.title,
      price: item.price,
      quantity: item.quantity || 1,
      posterUrl: item.posterUrl
    }));

    const orderData = await fetchAPI('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({
        items: orderItems,
        totalAmount: total
      })
    });

    // Open Razorpay Checkout
    const options = {
      key: orderData.key_id,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: 'MovieStore',
      description: `${items.length} movie${items.length > 1 ? 's' : ''} purchase`,
      order_id: orderData.order.id,
      handler: async function (response) {
        await verifyPayment(response, orderData.order.dbOrderId);
      },
      prefill: {
        name: user.name,
        email: user.email
      },
      theme: {
        color: '#667eea',
        backdrop_color: 'rgba(10, 10, 26, 0.85)'
      },
      modal: {
        ondismiss: function () {
          showToast('Payment cancelled', 'warning');
          resetPayBtn();
        }
      },
      config: {
        display: {
          preferences: {
            show_default_blocks: true
          }
        }
      }
    };

    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', function (response) {
      showToast('Payment failed: ' + response.error.description, 'error');
      resetPayBtn();
    });

    rzp.open();
  } catch (error) {
    showToast(error.message || 'Failed to initiate payment', 'error');
    resetPayBtn();
  }
}

async function verifyPayment(response, dbOrderId) {
  try {
    const verifyData = await fetchAPI('/payment/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        dbOrderId: dbOrderId
      })
    });

    if (verifyData.success) {
      showPaymentSuccess(response.razorpay_payment_id);
    } else {
      showToast('Payment verification failed', 'error');
      resetPayBtn();
    }
  } catch (error) {
    showToast('Verification error: ' + error.message, 'error');
    resetPayBtn();
  }
}

function showPaymentSuccess(paymentId) {
  const content = `
    <div class="text-center" style="padding: 20px 0;">
      <lord-icon src="https://cdn.lordicon.com/lupuorrc.json" trigger="loop" delay="0"
        colors="primary:#00e676,secondary:#667eea" style="width:120px;height:120px"></lord-icon>
      <h2 style="margin: 20px 0 8px;">Payment Successful!</h2>
      <p style="color: var(--text-secondary); margin-bottom: 8px;">Your movies have been purchased successfully.</p>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 24px;">
        Payment ID: <strong style="color:var(--accent)">${paymentId}</strong>
      </p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <a href="/movies" class="btn btn-secondary">Continue Shopping</a>
        <button class="btn btn-primary" onclick="closeModal(); loadCart();">View Cart</button>
      </div>
    </div>
  `;

  openModal(content, { title: '🎉 Order Confirmed', maxWidth: '480px' });
  updateCartCount();
  
  // Reload cart to show empty state
  setTimeout(() => loadCart(), 500);
}

function resetPayBtn() {
  const payBtn = document.getElementById('pay-btn');
  if (payBtn) {
    payBtn.disabled = false;
    payBtn.innerHTML = `
      <lord-icon src="https://cdn.lordicon.com/qmksjezq.json" trigger="hover"
        colors="primary:#ffffff" style="width:22px;height:22px"></lord-icon>
      Pay with Razorpay
    `;
  }
}
