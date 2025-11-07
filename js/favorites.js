const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInN1YiI6MTAzLCJpYXQiOjE3NjA1MTQ4ODMsImV4cCI6MTc5MTYxODg4M30.9wtCEnAhwQ8f_LH9osr4KMeHu31QXRwJgcmSqfrJxNA';

function getHeaders() {
    const userToken = sessionStorage.getItem('user_token');
    const token = userToken || ACCESS_TOKEN;
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

window.addEventListener('load', () => {
    const container = document.querySelector('#contentContainer');

    if (!container) {
        console.error('Element #contentContainer not found!');
        return;
    }

    let isDown = false;
    let startX;
    let scrollLeft;
    let isDrag = false;
    let clickTimeout;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        isDrag = false;
        container.classList.add('active');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;

        clickTimeout = setTimeout(() => {
            isDrag = true;
            container.querySelectorAll('.content-card').forEach((card) => {
                card.style.pointerEvents = 'none';
            });
        }, 150);
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        clearTimeout(clickTimeout);
        container.classList.remove('active');

        container.querySelectorAll('.content-card').forEach((card) => {
            card.style.pointerEvents = 'auto';
        });
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        clearTimeout(clickTimeout);
        container.classList.remove('active');

        container.querySelectorAll('.content-card').forEach((card) => {
            card.style.pointerEvents = 'auto';
        });
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        isDrag = true;

        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
    });

    container.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    document.querySelectorAll('.content-card img').forEach((img) => {
        img.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    });

    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    getFavoriteMovies();
});

window.addEventListener('load', () => {
    const mainToken = sessionStorage.getItem('user_token');

    if (!mainToken) {
        window.location.href = '../auth/Clientlogin.html';
    }
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
        console.log(data);
        displayFavoriteMovies(data);
    } catch (error) {
        console.error('Unexpected error happened:', error);
    }
}

function displayFavoriteMovies(element) {
    const container = document.querySelector('#contentContainer');

    if (!container) {
        console.error('Container element not found!');
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
            const movieId = e.currentTarget.getAttribute('data-id');
            window.location.href = `movie-detail.html?id=${movieId}`;
        });
    });
}

function applyStarRatings() {
    document.querySelectorAll('.movie-rating').forEach((ratingContainer) => {
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
