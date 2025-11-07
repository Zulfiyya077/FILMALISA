document.addEventListener("DOMContentLoaded", function () {
  const goHomeButton = document.querySelector('.btn');
  const container = document.querySelector('.container');
  
  let countdown = 10;
  let countdownInterval;
  
  const countdownElement = document.createElement('p');
  countdownElement.id = 'countdown';
  countdownElement.style.cssText = 'color: #9a9a9a; margin-top: 20px; font-size: 14px;';
  countdownElement.textContent = `You will be redirected to the homepage in ${countdown} seconds...`;
  
  const descriptionP = container.querySelector('p');
  if (descriptionP && goHomeButton) {
    descriptionP.insertAdjacentElement('afterend', countdownElement);
  }
  
  countdownInterval = setInterval(function() {
    countdown--;
    if (countdownElement) {
      countdownElement.textContent = `You will be redirected to the homepage in ${countdown} seconds...`;
    }
    
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      redirectToHome();
    }
  }, 1000);
  
  function redirectToHome() {
    const accessToken = sessionStorage.getItem('access_token');
    if (accessToken) {
      window.location.href = 'client/home.html';
    } else {
      window.location.href = 'index.html';
    }
  }
  
  if (goHomeButton) {
    goHomeButton.addEventListener('click', function(e) {
      e.preventDefault();
      clearInterval(countdownInterval);
      if (countdownElement) {
        countdownElement.textContent = 'Redirecting...';
      }
      redirectToHome();
    });
  }
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      clearInterval(countdownInterval);
      redirectToHome();
    }
  });
  
  if (container) {
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.5s ease-in';
    setTimeout(() => {
      container.style.opacity = '1';
    }, 100);
  }
});

