const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInN1YiI6MTAzLCJpYXQiOjE3NjA1MTQ4ODMsImV4cCI6MTc5MTYxODg4M30.9wtCEnAhwQ8f_LH9osr4KMeHu31QXRwJgcmSqfrJxNA';
let searchTimeout;

function getHeaders() {
    const token = sessionStorage.getItem('access_token') || ACCESS_TOKEN;
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

async function getAllMovies() {
    try {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '<div class="loading">Loading movies...</div>';

        const response = await fetch(`${API_URL}/movies`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        displayAllMovies(data);
    } catch (error) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '<div class="no-results">Error loading movies. Please try again.</div>';
    }
}

function displayAllMovies(movie) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    if (!movie.data || movie.data.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No movies found.</div>';
        return;
    }

    resultsContainer.innerHTML = movie.data
        .map((el) => {
            return `
                <div class="movie-card" data-id="${el.id}">
                    <div class="movie-poster">
                        <img src="${el.cover_url}" alt="${el.title}" onerror="this.src='../images/default-poster.jpg'">
                        <div class="movie-category">${el.category.name}</div>
                    </div>
                    <h3 class="movie-title">${el.title}</h3>
                </div>
            `;
        })
        .join('');

    resultsContainer.addEventListener('click', (e) => {
        const movieCard = e.target.closest('.movie-card');
        if (movieCard) {
            const movieId = movieCard.getAttribute('data-id');
            window.location.href = `movie-detail.html?id=${movieId}`;
        }
    });
}

async function searchMovies(movieName) {
    try {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '<div class="loading">Searching...</div>';

        const response = await fetch(
            `${API_URL}/movies?search=${encodeURIComponent(movieName)}`,
            {
                method: 'GET',
                headers: getHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        displaySearchResult(data);
    } catch (error) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = '<div class="no-results">Error searching movies. Please try again.</div>';
    }
}

function displaySearchResult(result) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    if (!result.data || result.data.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No movies found matching your search.</div>';
        return;
    }

    resultsContainer.innerHTML = result.data
        .map((el) => {
            return `
                <div class="movie-card" data-id="${el.id}">
                    <div class="movie-poster">
                        <img src="${el.cover_url}" alt="${el.title}" onerror="this.src='../images/default-poster.jpg'">
                        <div class="movie-category">${el.category.name}</div>
                    </div>
                    <h3 class="movie-title">${el.title}</h3>
                </div>
            `;
        })
        .join('');

    resultsContainer.addEventListener('click', (e) => {
        const movieCard = e.target.closest('.movie-card');
        if (movieCard) {
            const movieId = movieCard.getAttribute('data-id');
            window.location.href = `movie-detail.html?id=${movieId}`;
        }
    });
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('searchResults');

    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const searchTerm = e.target.value.trim();
        
        if (searchTerm.length > 0) {
            searchTimeout = setTimeout(() => {
                searchMovies(searchTerm);
            }, 500);
        } else {
            getAllMovies();
        }
    });

    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length > 0) {
            searchMovies(searchTerm);
        } else {
            getAllMovies();
        }
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.trim();
            if (searchTerm.length > 0) {
                searchMovies(searchTerm);
            } else {
                getAllMovies();
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.loadMenuAndFooter === 'function') {
        window.loadMenuAndFooter({ activePage: 'search', includeFooter: true });
    }
    initSearch();
    getAllMovies();
});
