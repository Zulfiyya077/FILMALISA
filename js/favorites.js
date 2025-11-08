const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInN1YiI6MTAzLCJpYXQiOjE3NjA1MTQ4ODMsImV4cCI6MTc5MTYxODg4M30.9wtCEnAhwQ8f_LH9osr4KMeHu31QXRwJgcmSqfrJxNA';

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
    const token = sessionStorage.getItem('access_token') || ACCESS_TOKEN;
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
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
            const movieId = removeButton.getAttribute('data-id');
            await removeFavorite(movieId, card);
            return;
        }

        if (card) {
            const movieId = card.getAttribute('data-id');
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
});

async function getFavoriteMovies() {
    try {
        const response = await fetch(
            `${API_URL}/movies/favorites`,
            {
                method: 'GET',
                headers: getHeaders()
            }
        );

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
            return `
                <div class="content-card" data-id="${el.id}">
                    <button class="favorite-remove" type="button" aria-label="Remove from favorites" data-id="${el.id}">
                        &times;
                    </button>
                    <img
                        src="${el.cover_url}"
                        alt="${el.title}"
                        class="content-image"
                    />
                    <div class="content-info">
                        <span class="content-category">${el.category.name}</span>
                        <div class="movie-rating" data-rating="${el.imdb}"></div>
                        <p class="content-title">${el.title}</p>
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
            const movieId = e.currentTarget.getAttribute('data-id');
            window.location.href = `movie-detail.html?id=${movieId}`;
        });
    });

    container.querySelectorAll('.favorite-remove').forEach((button) => {
        button.addEventListener('click', async (event) => {
            event.stopPropagation();
            const movieId = button.getAttribute('data-id');
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
        const response = await fetch(`${API_URL}/movie/${movieId}/favorite`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        let payload = null;
        try {
            payload = await response.json();
        } catch (_) {
            payload = null;
        }

        const isBackendSuccess = payload?.result === true || payload?.message === 'Successfully removed favorites';

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
