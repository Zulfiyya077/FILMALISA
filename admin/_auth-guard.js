const ADMIN_LOGIN_PATH = '../auth/adminlogin.html';
const ADMIN_DASHBOARD_PATH = '../admin/dashboard.html';

function ensureAdminAuthenticated() {
  const token = sessionStorage.getItem('access_token');
  const userType = sessionStorage.getItem('user_type');

  if (!token || userType !== 'admin') {
    window.location.replace(ADMIN_LOGIN_PATH);
  }
}

function redirectIfAdminAuthenticated() {
  const token = sessionStorage.getItem('access_token');
  const userType = sessionStorage.getItem('user_type');

  if (token && userType === 'admin') {
    window.location.replace(ADMIN_DASHBOARD_PATH);
  }
}

function setupAdminLogout() {
  const logoutElement = document.querySelector('[data-role="admin-logout"]');
  if (!logoutElement) return;

  logoutElement.addEventListener('click', (event) => {
    event.preventDefault();
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_type');
    sessionStorage.removeItem('user_data');
    window.location.replace(ADMIN_LOGIN_PATH);
  });
}

window.ensureAdminAuthenticated = ensureAdminAuthenticated;
window.redirectIfAdminAuthenticated = redirectIfAdminAuthenticated;
window.setupAdminLogout = setupAdminLogout;
