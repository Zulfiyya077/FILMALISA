const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa';

// Helper function to show toast notifications
function showToast(message, type = 'error') {
  const backgroundColor = type === 'success' ? '#27ae60' : '#e74c3c';
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: backgroundColor,
    stopOnFocus: true
  }).showToast();
}

// Security validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  // Password should be at least 6 characters
  return password && password.length >= 6;
}

function validateFullName(name) {
  // Name should be at least 2 characters and contain only letters and spaces
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name.trim());
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

// Client Login Handler
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector('.login-form');
  
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const emailInput = document.getElementById('loginEmail');
      const passwordInput = document.getElementById('loginPassword');
      
      if (!emailInput || !passwordInput) {
        showToast("Form elementləri tapılmadı", 'error');
        return;
      }

      let email = sanitizeInput(emailInput.value);
      const password = passwordInput.value;

      // Security validations
      if (!email || !password) {
        showToast("Zəhmət olmasa bütün sahələri doldurun", 'error');
        return;
      }

      if (!validateEmail(email)) {
        showToast("Zəhmət olmasa düzgün email ünvanı daxil edin", 'error');
        emailInput.focus();
        return;
      }

      if (!validatePassword(password)) {
        showToast("Şifrə ən azı 6 simvol olmalıdır", 'error');
        passwordInput.focus();
        return;
      }

      const requestBody = {
        email: email,
        password: password,
      };

      // Disable form during submission
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Giriş edilir...";

      try {
        const response = await fetch(
          `${API_URL}/auth/client/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();

        if (response.ok && data.result === true) {
          // Store token and user data if provided
          if (data.data && data.data.access_token) {
            sessionStorage.setItem('access_token', data.data.access_token);
            sessionStorage.setItem('user_type', 'client');
            
            if (data.data.user) {
              sessionStorage.setItem('user_data', JSON.stringify(data.data.user));
            }
          }

          showToast("Giriş uğurludur!", 'success');
          
          // Redirect to home page after short delay
          setTimeout(() => {
            window.location.href = "../client/home.html";
          }, 1000);
        } else {
          const errorMessage = data.message || "Giriş uğursuzdur";
          showToast("Xəta: " + errorMessage, 'error');
          passwordInput.value = '';
          passwordInput.focus();
        }
      } catch (error) {
        console.error("🚨 Serverə sorğu zamanı xəta baş verdi:", error);
        showToast("Serverə qoşulmaq mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.", 'error');
      } finally {
        // Re-enable form
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }

  // Client Register Handler
  const registerForm = document.querySelector('form');
  const registerNameInput = document.getElementById('registerName');
  const registerEmailInput = document.getElementById('registerEmail');
  const registerPasswordInput = document.getElementById('registerPassword');

  // Check if this is the register page
  if (registerForm && registerNameInput && registerEmailInput && registerPasswordInput) {
    // Pre-fill email from URL hash if present
    const hash = window.location.hash;
    if (hash && hash.includes('email=')) {
      const emailParam = decodeURIComponent(hash.split('email=')[1]);
      if (validateEmail(emailParam)) {
        registerEmailInput.value = emailParam;
      }
    }

    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      let fullName = sanitizeInput(registerNameInput.value);
      let email = sanitizeInput(registerEmailInput.value);
      const password = registerPasswordInput.value;

      // Security validations
      if (!fullName || !email || !password) {
        showToast("Zəhmət olmasa bütün sahələri doldurun", 'error');
        return;
      }

      if (!validateFullName(fullName)) {
        showToast("Ad soyad ən azı 2 simvol olmalıdır və yalnız hərflərdən ibarət olmalıdır", 'error');
        registerNameInput.focus();
        return;
      }

      if (!validateEmail(email)) {
        showToast("Zəhmət olmasa düzgün email ünvanı daxil edin", 'error');
        registerEmailInput.focus();
        return;
      }

      if (!validatePassword(password)) {
        showToast("Şifrə ən azı 6 simvol olmalıdır", 'error');
        registerPasswordInput.focus();
        return;
      }

      const requestBody = {
        full_name: fullName,
        email: email,
        password: password,
      };

      // Disable form during submission
      const submitButton = registerForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Qeydiyyatdan keçilir...";

      try {
        const response = await fetch(
          `${API_URL}/auth/client/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();

        if (response.ok && data.result === true) {
          showToast("Qeydiyyat uğurludur! Giriş səhifəsinə yönləndirilirsiniz...", 'success');
          
          // Redirect to login page after short delay
          setTimeout(() => {
            window.location.href = "Clientlogin.html";
          }, 2000);
        } else {
          const errorMessage = data.message || "Qeydiyyat uğursuzdur";
          showToast("Xəta: " + errorMessage, 'error');
          
          // Clear password field on error
          registerPasswordInput.value = '';
          registerPasswordInput.focus();
        }
      } catch (error) {
        console.error("🚨 Serverə sorğu zamanı xəta baş verdi:", error);
        showToast("Serverə qoşulmaq mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.", 'error');
      } finally {
        // Re-enable form
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }
});

