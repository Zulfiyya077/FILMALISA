(function() {
    const validPages = [
        'index.html',
        '',
        'auth/Clientlogin.html',
        'auth/clientregister.html',
        'auth/adminlogin.html',
        'auth/Clientnotfound.html',
        'client/home.html',
        'client/favorites.html',
        'client/search.html',
        'client/profile.html',
        'client/clientaccount.html',
        'client/movie-detail.html',
        'admin/dashboard.html',
        'admin/users.html',
        'admin/movies.html',
        'admin/comments.html',
        'admin/actors.html',
        'admin/categories.html',
        'admin/contact.html'
    ];

    function getCurrentPage() {
        const path = window.location.pathname;
        let fullPath = path.substring(1);
        
        if (fullPath === '' || fullPath === 'index.html' || fullPath.endsWith('/')) {
            return 'index.html';
        }
        
        if (fullPath.includes('?')) {
            fullPath = fullPath.split('?')[0];
        }
        
        if (fullPath.includes('#')) {
            fullPath = fullPath.split('#')[0];
        }
        
        return fullPath;
    }

    function checkPageExists() {
        const currentPage = getCurrentPage();
        
        if (validPages.includes(currentPage)) {
            return true;
        }

        const pageParts = currentPage.split('/');
        if (pageParts.length > 0) {
            const lastPart = pageParts[pageParts.length - 1];
            if (validPages.includes(lastPart)) {
                return true;
            }
        }

        return false;
    }

    function redirectToNotFound() {
        if (window.location.pathname.includes('Clientnotfound.html')) {
            return;
        }
        
        const basePath = window.location.pathname.includes('/auth/') ? '' : 'auth/';
        window.location.href = basePath + 'Clientnotfound.html';
    }

    function init404Handler() {
        if (!checkPageExists()) {
            redirectToNotFound();
            return;
        }

        fetch(window.location.href, { method: 'HEAD', cache: 'no-cache' })
            .then(function(response) {
                if (response.status === 404) {
                    redirectToNotFound();
                }
            })
            .catch(function() {
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init404Handler);
    } else {
        init404Handler();
    }
})();

