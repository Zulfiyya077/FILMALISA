document.addEventListener("DOMContentLoaded", function () {
  const goHomeButton = document.querySelector('.btn');
  const container = document.querySelector('.container');
  
  // Auto-redirect countdown functionality
  let countdown = 10; // seconds
  let countdownInterval;
  
  // Create countdown display element
  const countdownElement = document.createElement('p');
  countdownElement.id = 'countdown';
  countdownElement.style.cssText = 'color: #9a9a9a; margin-top: 20px; font-size: 14px;';
  countdownElement.textContent = `Avtomatik olaraq ana səhifəyə ${countdown} saniyə sonra yönləndiriləcəksiniz...`;
  
  // Insert countdown after the description paragraph
  const descriptionP = container.querySelector('p');
  if (descriptionP && goHomeButton) {
    descriptionP.insertAdjacentElement('afterend', countdownElement);
  }
  
  // Update countdown every second
  countdownInterval = setInterval(function() {
    countdown--;
    if (countdownElement) {
      countdownElement.textContent = `Avtomatik olaraq ana səhifəyə ${countdown} saniyə sonra yönləndiriləcəksiniz...`;
    }
    
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      redirectToHome();
    }
  }, 1000);
  
  // Redirect function
  function redirectToHome() {
    // Check if user is logged in (has access token)
    const accessToken = sessionStorage.getItem('access_token');
    const userType = sessionStorage.getItem('user_type');
    
    if (accessToken && userType === 'client') {
      // Redirect to client home if logged in as client
      window.location.href = '../client/home.html';
    } else if (accessToken && userType === 'admin') {
      // Redirect to admin dashboard if logged in as admin
      window.location.href = '../admin/dashboard.html';
    } else {
      // Redirect to main landing page if not logged in
      window.location.href = '../index.html';
    }
  }
  
  // Go Home button click handler
  if (goHomeButton) {
    goHomeButton.addEventListener('click', function(e) {
      e.preventDefault();
      clearInterval(countdownInterval);
      if (countdownElement) {
        countdownElement.textContent = 'Yönləndirilir...';
      }
      redirectToHome();
    });
  }
  
  // Keyboard shortcut - Enter key to go home
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      clearInterval(countdownInterval);
      redirectToHome();
    }
  });
  
  // Add smooth fade-in animation
  if (container) {
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.5s ease-in';
    setTimeout(() => {
      container.style.opacity = '1';
    }, 100);
  }
});

