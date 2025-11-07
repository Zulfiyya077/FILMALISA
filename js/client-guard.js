(() => {
  const LOGIN_PATH = '/auth/Clientlogin.html';
  const token = sessionStorage.getItem('access_token');

  if (!token) {
    window.location.replace(LOGIN_PATH);
  }
})();
