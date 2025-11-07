const MENU_DEFAULTS = {
  defaultAvatar: '/assets/images/1651258516656 1.png',
  menuPath: '/includes/menu.html',
  footerPath: '/includes/footer.html'
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

function resolveAvatarUrl(url) {
  if (!url || typeof url !== 'string') {
    return MENU_DEFAULTS.defaultAvatar;
  }
  const trimmed = url.trim();
  return trimmed.length ? trimmed : MENU_DEFAULTS.defaultAvatar;
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

function applyAvatar(container, avatarUrl) {
  const avatarImg = container.querySelector('[data-role="sidebar-avatar"]');
  if (!avatarImg) return;
  const resolved = resolveAvatarUrl(avatarUrl);
  avatarImg.src = resolved;
  avatarImg.onerror = function () {
    avatarImg.onerror = null;
    avatarImg.src = MENU_DEFAULTS.defaultAvatar;
  };
  window.updateSidebarAvatar = function (newUrl) {
    const finalUrl = resolveAvatarUrl(newUrl);
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
      applyAvatar(container, storedUser?.img_url);
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
