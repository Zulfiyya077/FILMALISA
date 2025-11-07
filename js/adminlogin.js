(() => {
  window.addEventListener('load', () => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      window.location.replace('../admin/dashboard.html');
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    if (!form) {
      return;
    }

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailGroup = emailInput?.closest('.input-group');
    const passwordGroup = passwordInput?.closest('.input-group');
    const togglePassword = document.getElementById('toggle-password');
    const submitButton = form.querySelector('button[type="submit"]');
    const validEmailSuffixes = ['.com', '.ru', '.org', '.net', '.edu', '.gov', '.int'];
    const apiUrl = 'https://api.sarkhanrahimli.dev/api/filmalisa/auth/admin/login';

    if (togglePassword && passwordInput) {
      togglePassword.addEventListener('click', () => {
        const currentType = passwordInput.getAttribute('type');
        passwordInput.setAttribute('type', currentType === 'password' ? 'text' : 'password');
      });
    }

    function showToast(message, type = 'error') {
      Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: { background: type === 'success' ? '#27ae60' : '#e74c3c' },
        stopOnFocus: true
      }).showToast();
    }

    function resetBorders() {
      if (emailGroup) {
        emailGroup.style.border = '1px solid #ccc';
      }
      if (passwordGroup) {
        passwordGroup.style.border = '1px solid #ccc';
      }
    }

    function isValidEmail(value) {
      if (!value || !value.includes('@')) {
        return false;
      }
      const suffix = value.substring(value.lastIndexOf('.'));
      return validEmailSuffixes.includes(suffix.toLowerCase());
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = emailInput?.value.trim() || '';
      const password = passwordInput?.value.trim() || '';

      resetBorders();

      let hasError = false;
      if (!isValidEmail(email)) {
        if (emailGroup) {
          emailGroup.style.border = '1px solid #e74c3c';
        }
        hasError = true;
      }

      if (!password) {
        if (passwordGroup) {
          passwordGroup.style.border = '1px solid #e74c3c';
        }
        hasError = true;
      }

      if (hasError) {
        showToast('Please provide valid credentials', 'error');
        setTimeout(resetBorders, 3000);
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Signing in...';
      }

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        let data = null;
        try {
          data = await response.json();
        } catch (_) {
          data = null;
        }

        const isSuccessfulPayload = data && data.result === true && data.data;

        if ((response.ok || response.status === 500) && isSuccessfulPayload) {
          const accessToken = data.data.tokens?.access_token || data.data.access_token;
          if (accessToken) {
            sessionStorage.setItem('access_token', accessToken);
          }
          const profileEmail = (data.data.profile?.email || email || '').toLowerCase();
          if (profileEmail) {
            sessionStorage.setItem('user_email', profileEmail);
          }
          if (data.data.profile) {
            sessionStorage.setItem('user_data', JSON.stringify(data.data.profile));
          }

          if (emailInput) {
            emailInput.value = '';
          }
          if (passwordInput) {
            passwordInput.value = '';
          }

          showToast('Signed in successfully', 'success');
          setTimeout(() => {
            window.location.replace('../admin/dashboard.html');
          }, 600);
        } else {
          if (emailGroup) {
            emailGroup.style.border = '2px solid #e74c3c';
          }
          if (passwordGroup) {
            passwordGroup.style.border = '2px solid #e74c3c';
          }
          const errorMessage = data?.message || `Unable to sign in (status ${response.status})`;
          showToast(errorMessage, 'error');
          setTimeout(resetBorders, 3000);
        }
      } catch (_) {
        if (emailGroup) {
          emailGroup.style.border = '2px solid #e74c3c';
        }
        if (passwordGroup) {
          passwordGroup.style.border = '2px solid #e74c3c';
        }
        showToast('Unable to reach the server. Please try again.', 'error');
        setTimeout(resetBorders, 3000);
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'login';
        }
      }
    });
  });
})();
