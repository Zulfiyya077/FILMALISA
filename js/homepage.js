const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInN1YiI6MTAzLCJpYXQiOjE3NjA1MTQ4ODMsImV4cCI6MTc5MTYxODg4M30.9wtCEnAhwQ8f_LH9osr4KMeHu31QXRwJgcmSqfrJxNA';

let moviesCache = [];
let categoriesCache = [];
let heroMovies = [];
let currentHeroIndex = 0;

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
    };
}

async function loadMovies() {
    try {
        const response = await fetch(`${API_URL}/admin/movies`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.data) {
            moviesCache = data.data;
        }
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/admin/categories`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.data) {
            categoriesCache = data.data;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function getCategoryName(categoryId) {
    const category = categoriesCache.find(c => c.id == categoryId);
    return category ? category.name : 'Unknown';
}

function createCategorySection(categoryId, categoryName) {
    const categorySection = document.createElement('div');
    categorySection.className = 'category-section';
    const containerId = categoryName.toLowerCase().replace(/\s+/g, '-') + '-movies';
    
    categorySection.innerHTML = `
        <div class="category-header">
            <h2 class="category-title">${categoryName}</h2>
            <span class="view-more">></span>
        </div>
        <div class="movies-container">
            <button class="scroll-button scroll-left" onclick="scrollLeft('${containerId}')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
            </button>
            <div class="movies-scroll" id="${containerId}">
            </div>
            <button class="scroll-button scroll-right" onclick="scrollRight('${containerId}')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                </svg>
            </button>
        </div>
    `;
    
    const actionSection = document.getElementById('action-movies').closest('.category-section');
    actionSection.parentNode.insertBefore(categorySection, actionSection.nextSibling);
}

function displayMoviesByCategory(categoryId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const categoryMovies = moviesCache.filter(movie => movie.category?.id == categoryId);
    
    if (categoryMovies.length === 0) {
        container.innerHTML = '<p style="color: #666; padding: 20px;">No movies found in this category</p>';
        return;
    }

    const cardSize = '292px';
    const posterHeight = '440px';

    container.innerHTML = categoryMovies.map(movie => `
        <div class="movie-card" onclick="openMovieDetails(${movie.id})">
            <img src="${movie.cover_url || 'https://via.placeholder.com/292x440/333333/FFFFFF?text=No+Image'}" 
                 alt="${movie.title}" class="movie-poster" style="height: ${posterHeight};">
            <div class="movie-genre">Epic Adventure</div>
            <div class="movie-title">${movie.title}</div>
        </div>
    `).join('');
}

function openMovieDetails(movieId) {
    window.location.href = `movie-detail.html?id=${movieId}`;
}

function displayHeroSection() {
    if (moviesCache.length === 0) return;
    
    heroMovies = moviesCache.filter(m => m.imdb >= 7.0).slice(0, 3);
    
    if (heroMovies.length === 0) {
        heroMovies = moviesCache.slice(0, 3);
    }
    
    if (heroMovies.length > 0) {
        updateHeroContent(heroMovies[0]);
        
        if (heroMovies.length > 1) {
            setInterval(() => {
                currentHeroIndex = (currentHeroIndex + 1) % heroMovies.length;
                updateHeroContent(heroMovies[currentHeroIndex]);
                updateIndicators();
            }, 5000);
        }
    }
}

function updateHeroContent(movie) {
    const heroImage = document.querySelector('.hero-image');
    const genreTag = document.querySelector('.genre-tag');
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const watchButton = document.querySelector('.watch-now-button');
    
    if (heroImage) heroImage.src = movie.cover_url || '../images/heroimg.jpg';
    if (genreTag) genreTag.textContent = movie.category?.name || 'Science Fiction';
    if (heroTitle) heroTitle.textContent = movie.title || 'Movie Title';
    if (heroDescription) heroDescription.textContent = movie.overview || 'No description available.';
    if (watchButton) {
        watchButton.onclick = () => {
            if (movie.id) {
                window.location.href = `movie-detail.html?id=${movie.id}`;
            }
        };
    }
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        if (index === currentHeroIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

async function initializeHomepage() {
    await loadCategories();
    await loadMovies();
    
    displayHeroSection();
    
    const categoriesWithMovies = {};
    
    moviesCache.forEach(movie => {
        if (movie.category) {
            const categoryId = movie.category.id;
            const categoryName = movie.category.name;
            
            if (!categoriesWithMovies[categoryId]) {
                categoriesWithMovies[categoryId] = {
                    name: categoryName,
                    movies: []
                };
            }
            categoriesWithMovies[categoryId].movies.push(movie);
        }
    });

    Object.keys(categoriesWithMovies).forEach(categoryId => {
        const category = categoriesWithMovies[categoryId];
        const containerId = category.name.toLowerCase().replace(/\s+/g, '-') + '-movies';
        
        if (containerId === 'action-movies') {
            displayMoviesByCategory(categoryId, containerId);
        } else {
            createCategorySection(categoryId, category.name);
            displayMoviesByCategory(categoryId, containerId);
        }
    });

}

function scrollLeft(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    }
}

function scrollRight(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    }
}

function scrollContainer(container, direction) {
    container.scrollBy({
        left: direction,
        behavior: 'smooth'
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeHomepage();
});