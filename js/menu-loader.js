const MENU_DEFAULTS = {
  menuPath: '/includes/menu.html',
  footerPath: '/includes/footer.html',
  avatarBase: 'https://api.dicebear.com/7.x/initials/svg?backgroundColor=58209d,241f36&radius=50&seed=',
  defaultAvatar: 'https://api.dicebear.com/7.x/initials/svg?backgroundColor=58209d,241f36&radius=50&seed=FILMALISA'
};

function getStoredUser() {
  try {
    const raw = sessionStorage.getItem('user_data');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('User data could not be parsed:', error);
    return null;
  }
}

function generateAvatarUrl(seed) {
  const finalSeed = seed && seed.trim ? seed.trim() : 'FILMALISA User';
  return `${MENU_DEFAULTS.avatarBase}${encodeURIComponent(finalSeed)}`;
}

function resolveAvatar(user = {}, overrideUrl) {
  const candidate = overrideUrl && typeof overrideUrl === 'string' ? overrideUrl.trim() : (user.img_url || '');
  if (candidate && candidate.trim()) {
    return candidate.trim();
  }
  const seed = user.full_name || user.email || 'FILMALISA User';
  return generateAvatarUrl(seed);
}

function setActiveSidebarItem(container, activePage) {
  if (!activePage) return;
  const items = container.querySelectorAll('.sidebar-item');
  items.forEach((item) => {
    if (item.dataset && item.dataset.page === activePage) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function applyAvatar(container, storedUser) {
  const avatarImg = container.querySelector('[data-role="sidebar-avatar"]');
  if (!avatarImg) return;
  const resolved = resolveAvatar(storedUser || {});
  avatarImg.src = resolved;
  avatarImg.onerror = function () {
    avatarImg.onerror = null;
    avatarImg.src = MENU_DEFAULTS.defaultAvatar;
  };
  window.updateSidebarAvatar = function (overrideUrl) {
    const latestUser = getStoredUser();
    const finalUrl = resolveAvatar(latestUser || {}, overrideUrl);
    avatarImg.src = finalUrl;
    avatarImg.onerror = function () {
      avatarImg.onerror = null;
      avatarImg.src = MENU_DEFAULTS.defaultAvatar;
    };
  };
}

function loadFooter(container) {
  if (!container) return;
  fetch(MENU_DEFAULTS.footerPath)
    .then((response) => response.text())
    .then((html) => {
      container.innerHTML = html;
    })
    .catch((error) => console.error('Footer failed to load:', error));
}

function loadMenu(container, activePage) {
  if (!container) return;
  fetch(MENU_DEFAULTS.menuPath)
    .then((response) => response.text())
    .then((html) => {
      container.innerHTML = html;
      setActiveSidebarItem(container, activePage);
      const storedUser = getStoredUser();
      applyAvatar(container, storedUser);
    })
    .catch((error) => console.error('Menu failed to load:', error));
}

function loadMenuAndFooter(options = {}) {
  const { activePage = '', includeFooter = true } = options;
  const menuContainer = document.getElementById('menu-container');
  const footerContainer = document.getElementById('footer-container');

  loadMenu(menuContainer, activePage);
  if (includeFooter) {
    loadFooter(footerContainer);
  }
}

window.loadMenuAndFooter = loadMenuAndFooter;
