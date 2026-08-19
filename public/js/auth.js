/* ============================================
   🔐 MovieStore — Authentication
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (isLoggedIn()) {
    window.location.href = '/movies';
    return;
  }

  setupAuthTabs();
  setupForms();
});

function setupAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(`${target}-form`).classList.add('active');

      // Update header
      const header = document.querySelector('.auth-header h2');
      const subtext = document.querySelector('.auth-header p');
      if (target === 'login') {
        header.textContent = 'Welcome Back';
        subtext.textContent = 'Sign in to access your movie collection';
      } else {
        header.textContent = 'Create Account';
        subtext.textContent = 'Join MovieStore and start your collection';
      }
    });
  });
}

function setupForms() {
  // Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      
      try {
        btn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px"></span> Logging in...';
        btn.disabled = true;

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
          showToast('Please fill in all fields', 'warning');
          return;
        }

        const data = await fetchAPI('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showToast(`Welcome back, ${data.user.name}!`, 'success');

        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/movies';
          }
        }, 800);
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });
  }

  // Signup Form
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = signupForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;

      try {
        btn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px"></span> Creating account...';
        btn.disabled = true;

        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;

        if (!name || !email || !password) {
          showToast('Please fill in all fields', 'warning');
          return;
        }

        if (password.length < 6) {
          showToast('Password must be at least 6 characters', 'warning');
          return;
        }

        if (password !== confirmPassword) {
          showToast('Passwords do not match', 'error');
          return;
        }

        const data = await fetchAPI('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showToast(`Welcome, ${data.user.name}! Your account is ready.`, 'success');

        setTimeout(() => {
          window.location.href = '/movies';
        }, 1000);
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });
  }
}
