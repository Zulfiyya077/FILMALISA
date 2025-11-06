document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
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

  function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    
    if (!usernameInput || !passwordInput) {
      showToast("Form elementləri tapılmadı", 'error');
      return;
    }

    let username = sanitizeInput(usernameInput.value);
    const password = passwordInput.value;

    // Security validations
    if (!username || !password) {
      showToast("Zəhmət olmasa bütün sahələri doldurun", 'error');
      return;
    }

    if (!validateEmail(username)) {
      showToast("Zəhmət olmasa düzgün email ünvanı daxil edin", 'error');
      usernameInput.focus();
      return;
    }

    if (!validatePassword(password)) {
      showToast("Şifrə ən azı 6 simvol olmalıdır", 'error');
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
    submitButton.textContent = "Giriş edilir...";

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
        // Store token if provided
        if (data.data && data.data.access_token) {
          sessionStorage.setItem('access_token', data.data.access_token);
          sessionStorage.setItem('user_type', 'admin');
        }

        showToast("Giriş uğurludur!", 'success');
        
        // Redirect to admin dashboard after short delay
        setTimeout(() => {
          window.location.href = "../admin/dashboard.html";
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
});
