const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa';

// Helper function to show toast notifications
function showToast(message, type = 'error') {
  const backgroundColor = type === 'success' ? '#27ae60' : '#e74c3c';
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: backgroundColor
    },
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

window.addEventListener("load", () => {
  const accessToken = sessionStorage.getItem("access_token");
  if (accessToken) {
    window.location.href = "../client/home.html";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector('.login-form');
  
  const passwordInput = document.getElementById('loginPassword');
  const togglePasswordIcon = passwordInput?.nextElementSibling;
  
  if (togglePasswordIcon && togglePasswordIcon.tagName === 'IMG') {
    togglePasswordIcon.addEventListener('click', () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
    });
  }
  
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const emailInput = document.getElementById('loginEmail');
      const passwordInput = document.getElementById('loginPassword');
      
      if (!emailInput || !passwordInput) {
        showToast("Form elements not found", 'error');
        return;
      }

      let email = sanitizeInput(emailInput.value);
      const password = passwordInput.value;

      // Security validations
      if (!email || !password) {
        showToast("Please fill in all fields", 'error');
        return;
      }

      if (!validateEmail(email)) {
        showToast("Please enter a valid email address", 'error');
        emailInput.focus();
        return;
      }

      if (!validatePassword(password)) {
        showToast("Password must contain at least 6 characters", 'error');
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
      submitButton.textContent = "Signing in...";

      try {
        const response = await fetch(
          `${API_URL}/auth/login`,
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
          const profileEmail = (data.data?.profile?.email || email || '').toLowerCase();

          if (data.data && data.data.tokens && data.data.tokens.access_token) {
            sessionStorage.setItem('access_token', data.data.tokens.access_token);
            if (data.data.profile) {
              sessionStorage.setItem('user_data', JSON.stringify(data.data.profile));
            }
          } else if (data.data && data.data.access_token) {
            sessionStorage.setItem('access_token', data.data.access_token);
            if (data.data.profile) {
              sessionStorage.setItem('user_data', JSON.stringify(data.data.profile));
            }
          }

          if (profileEmail) {
            sessionStorage.setItem('user_email', profileEmail);
          }

          showToast("Signed in successfully", 'success');
          
          setTimeout(() => {
            window.location.href = "../client/home.html";
          }, 1000);
        } else {
          const errorMessage = data.message || "Sign in failed";
          showToast("Error: " + errorMessage, 'error');
          passwordInput.value = '';
          passwordInput.focus();
        }
      } catch (error) {
        showToast("Unable to reach the server. Please try again.", 'error');
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

  if (registerForm && registerNameInput && registerEmailInput && registerPasswordInput) {
    const hash = window.location.hash;
    if (hash && hash.includes('email=')) {
      const emailParam = decodeURIComponent(hash.split('email=')[1]);
      if (validateEmail(emailParam)) {
        registerEmailInput.value = emailParam;
      }
    }
    
    const savedEmail = sessionStorage.getItem("userRegistered");
    if (savedEmail && !registerEmailInput.value) {
      registerEmailInput.value = savedEmail.replace(/^"|"$/g, "");
    }
    
    const passwordInput = document.getElementById('registerPassword');
    const togglePasswordIcon = passwordInput?.nextElementSibling;
    
    if (togglePasswordIcon && togglePasswordIcon.tagName === 'IMG') {
      togglePasswordIcon.addEventListener('click', () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
      });
    }

    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      let fullName = sanitizeInput(registerNameInput.value);
      let email = sanitizeInput(registerEmailInput.value);
      const password = registerPasswordInput.value;

      // Security validations
      if (!fullName || !email || !password) {
        showToast("Please fill in all fields", 'error');
        return;
      }

      if (!validateFullName(fullName)) {
        showToast("Full name must contain at least 2 letters", 'error');
        registerNameInput.focus();
        return;
      }

      if (!validateEmail(email)) {
        showToast("Please enter a valid email address", 'error');
        registerEmailInput.focus();
        return;
      }

      if (!validatePassword(password)) {
        showToast("Password must contain at least 6 characters", 'error');
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
      submitButton.textContent = "Creating account...";

      try {
        const response = await fetch(
          `${API_URL}/auth/signup`,
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
          sessionStorage.setItem("userRegistered", JSON.stringify(requestBody.email));
          showToast("Registration successful. Redirecting to sign in...", 'success');
          
          setTimeout(() => {
            window.location.href = "Clientlogin.html";
          }, 1000);
        } else {
          const errorMessage = data.message || "Registration failed";
          if (errorMessage.includes("already registered") || errorMessage.includes("already in use")) {
            showToast("This email is already registered. Please sign in.", 'error');
            setTimeout(() => {
              window.location.href = "Clientlogin.html";
            }, 2000);
          } else {
            showToast("Error: " + errorMessage, 'error');
          }
          
          registerPasswordInput.value = '';
          registerPasswordInput.focus();
        }
      } catch (error) {
        showToast("Unable to reach the server. Please try again.", 'error');
      } finally {
        // Re-enable form
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }
});

