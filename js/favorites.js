const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa';

function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 2500,
        gravity: 'top',
        position: 'right',
        style: {
            background: type === 'success' ? '#27ae60' : '#e74c3c'
        }
    }).showToast();
}

function getHeaders() {
    const token = sessionStorage.getItem('access_token') || sessionStorage.getItem('user_token');
    if (!token) {
        window.location.href = '../auth/Clientlogin.html';
        return null;
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function syncFavoritesIfNeeded() {
    if (sessionStorage.getItem('favoritesNeedsSync') === 'true') {
        sessionStorage.removeItem('favoritesNeedsSync');
        getFavoriteMovies();
    }
}

function initFavoritesPage() {
    const container = document.querySelector('#contentContainer');

    if (!container) {
        showToast('Favorites container not found.', 'error');
        return;
    }

    container.addEventListener('click', async (event) => {
        const removeButton = event.target.closest('.favorite-remove');
        const card = event.target.closest('.content-card');

        if (removeButton && card) {
            event.preventDefault();
            event.stopPropagation();
            const movieId = removeButton.getAttribute('data-movie-id');
            await removeFavorite(movieId, card);
            sessionStorage.setItem('favoritesNeedsSync', 'true');
            return;
        }

        if (card) {
            const movieId = card.getAttribute('data-movie-id');
            if (movieId) {
                window.location.href = `movie-detail.html?id=${movieId}`;
            }
        }
    });

    getFavoriteMovies();
}

window.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        window.location.href = '../auth/Clientlogin.html';
        return;
    }
    initFavoritesPage();
    syncFavoritesIfNeeded();
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        syncFavoritesIfNeeded();
    }
});

window.addEventListener('pageshow', () => {
    syncFavoritesIfNeeded();
});

window.addEventListener('focus', () => {
    syncFavoritesIfNeeded();
});

async function getFavoriteMovies() {
    try {
        const headers = getHeaders();
        if (!headers) {
            return;
        }

        const response = await fetch(`${API_URL}/movies/favorites`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayFavoriteMovies(data);
    } catch (error) {
        showToast('Favorites could not be loaded.', 'error');
    }
}

function displayFavoriteMovies(element) {
    const container = document.querySelector('#contentContainer');

    if (!container) {
        showToast('Favorites container not found.', 'error');
        return;
    }

    if (!element.data || element.data.length === 0) {
        container.innerHTML = '<p class="empty-message">No favorite movies added yet.</p>';
        return;
    }

    container.innerHTML = element.data
        .map((el) => {
            const movieId = el.movie_id || el.movie?.id || el.id;
            const coverUrl = el.cover_url || el.movie?.cover_url || '';
            const title = el.title || el.movie?.title || 'Untitled';
            const categoryName = el.category?.name || el.movie?.category?.name || 'Unknown category';
            const imdb = el.imdb ?? el.movie?.imdb ?? '0';

            return `
                <div class="content-card" data-movie-id="${movieId}" data-id="${movieId}">
                    <button class="favorite-remove" type="button" aria-label="Remove from favorites" data-movie-id="${movieId}" data-id="${movieId}">
                        &times;
                    </button>
                    <img
                        src="${coverUrl}"
                        alt="${title}"
                        class="content-image"
                    />
                    <div class="content-info">
                        <span class="content-category">${categoryName}</span>
                        <div class="movie-rating" data-rating="${imdb}"></div>
                        <p class="content-title">${title}</p>
                    </div>
                </div>
            `;
        })
        .join('');

    applyStarRatings();

    container.querySelectorAll('.content-card').forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-remove')) {
                return;
            }
            const movieId = e.currentTarget.getAttribute('data-movie-id');
            window.location.href = `movie-detail.html?id=${movieId}`;
        });
    });

    container.querySelectorAll('.favorite-remove').forEach((button) => {
        button.addEventListener('click', async (event) => {
            event.stopPropagation();
            const movieId = button.getAttribute('data-movie-id');
            await removeFavorite(movieId, button.closest('.content-card'));
        });
    });
}

function applyStarRatings() {
    document.querySelectorAll('.movie-rating').forEach((ratingContainer) => {
        ratingContainer.innerHTML = '';
        let imdbRating = parseFloat(ratingContainer.getAttribute('data-rating'));
        let starCount = Math.floor(imdbRating / 2);
        let hasHalfStar = (imdbRating / 2) % 1 !== 0;

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star';

            if (i <= starCount) {
                star.classList.add('filled');
            } else if (i === starCount + 1 && hasHalfStar) {
                star.classList.add('half');
            }

            ratingContainer.appendChild(star);
        }
    });
}

async function removeFavorite(movieId, cardElement) {
    if (!movieId) {
        return;
    }

    try {
        const headers = getHeaders();
        if (!headers) {
            return;
        }

        const response = await fetch(`${API_URL}/movie/${movieId}/favorite`, {
            method: 'DELETE',
            headers
        });

        let payload = null;
        let rawText = '';
        try {
            payload = await response.clone().json();
        } catch (_) {
            try {
                rawText = (await response.text()) || '';
            } catch (__) {
                rawText = '';
            }
        }

        const message = payload?.message || rawText || '';
        const normalizedMessage = message.toLowerCase();
        const isBackendSuccess =
            payload?.result === true ||
            normalizedMessage.includes('success') ||
            normalizedMessage.includes('removed') ||
            normalizedMessage.includes('deleted');

        if (!response.ok && !isBackendSuccess) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (cardElement) {
            cardElement.remove();
        }

        showToast('Movie removed from favorites.', 'success');
        updateFavoritesState();
        await getFavoriteMovies();
    } catch (error) {
        showToast('Unable to remove movie.', 'error');
    }
}

function updateFavoritesState() {
    const container = document.querySelector('#contentContainer');
    if (!container) return;

    if (!container.children.length) {
        container.innerHTML = '<p class="empty-message">No favorite movies added yet.</p>';
    }
}
