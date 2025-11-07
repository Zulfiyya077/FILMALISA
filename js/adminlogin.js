window.addEventListener("load", () => {
  const accessToken = sessionStorage.getItem("access_token");
  if (accessToken) {
    window.location.href = "../admin/dashboard.html";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa';
  
  const passwordInput = document.getElementById('adminPassword');
  const togglePasswordIcon = passwordInput?.nextElementSibling;
  
  if (togglePasswordIcon && togglePasswordIcon.tagName === 'IMG') {
    togglePasswordIcon.addEventListener('click', () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
    });
  }

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

  function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    
    if (!usernameInput || !passwordInput) {
      showToast("Form elements not found", 'error');
      return;
    }

    let username = sanitizeInput(usernameInput.value);
    const password = passwordInput.value;

    // Security validations
    if (!username || !password) {
      showToast("Please fill in all fields", 'error');
      return;
    }

    if (!validateEmail(username)) {
      showToast("Please enter a valid email address", 'error');
      usernameInput.focus();
      return;
    }

    if (!validatePassword(password)) {
      showToast("Password must contain at least 6 characters", 'error');
      passwordInput.focus();
      return;
    }

    const requestBody = {
      email: username,
      password: password,
    };

    // Disable form during submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";

    try {
      const response = await fetch(
        `${API_URL}/auth/admin/login`,
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
        if (data.data && data.data.tokens && data.data.tokens.access_token) {
          sessionStorage.setItem('access_token', data.data.tokens.access_token);
          sessionStorage.setItem('user_type', 'admin');
          if (data.data.profile) {
            sessionStorage.setItem('user_data', JSON.stringify(data.data.profile));
          }
        } else if (data.data && data.data.access_token) {
          sessionStorage.setItem('access_token', data.data.access_token);
          sessionStorage.setItem('user_type', 'admin');
          if (data.data.profile) {
            sessionStorage.setItem('user_data', JSON.stringify(data.data.profile));
          }
        }

        showToast("Signed in successfully", 'success');
        
        setTimeout(() => {
          window.location.href = "../admin/dashboard.html";
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
});
