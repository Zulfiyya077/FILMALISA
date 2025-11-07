(function() {
  const ADMIN_LOGIN_PATH = '../auth/adminlogin.html';
  const ADMIN_DASHBOARD_PATH = '../admin/dashboard.html';

  function hasAdminSession() {
    return Boolean(sessionStorage.getItem('access_token'));
  }

  function ensureAdminAuthenticated() {
    if (!hasAdminSession()) {
      window.location.replace(ADMIN_LOGIN_PATH);
    }
  }

  function redirectIfAdminAuthenticated() {
    if (hasAdminSession()) {
      window.location.replace(ADMIN_DASHBOARD_PATH);
    }
  }

  function setupAdminLogout() {
    const logoutElement = document.querySelector('[data-role="admin-logout"]');
    if (!logoutElement) return;

    logoutElement.addEventListener('click', (event) => {
      event.preventDefault();
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user_email');
      sessionStorage.removeItem('user_data');
      window.location.replace(ADMIN_LOGIN_PATH);
    });
  }

  window.ensureAdminAuthenticated = ensureAdminAuthenticated;
  window.redirectIfAdminAuthenticated = redirectIfAdminAuthenticated;
  window.setupAdminLogout = setupAdminLogout;
})();
