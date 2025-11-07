(function() {
  const ADMIN_LOGIN_PATH = '../auth/adminlogin.html';
  const ADMIN_DASHBOARD_PATH = '../admin/dashboard.html';
  const ADMIN_EMAILS = ['admin@admin.com'];

  function isAdminSession() {
    const token = sessionStorage.getItem('access_token');
    const email = (sessionStorage.getItem('user_email') || '').toLowerCase();
    return Boolean(token && ADMIN_EMAILS.includes(email));
  }

  function ensureAdminAuthenticated() {
    if (!isAdminSession()) {
      window.location.replace(ADMIN_LOGIN_PATH);
    }
  }

  function redirectIfAdminAuthenticated() {
    if (isAdminSession()) {
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
