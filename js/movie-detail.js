const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa';
const ADMIN_FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInN1YiI6MTAzLCJpYXQiOjE3NjA1MTQ4ODMsImV4cCI6MTc5MTYxODg4M30.9wtCEnAhwQ8f_LH9osr4KMeHu31QXRwJgcmSqfrJxNA';

function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
            background: type === 'success' ? '#27ae60' : '#e74c3c'
        },
        stopOnFocus: true
    }).showToast();
}

let currentMovie = null;
let currentMovieId = null;
let isFavorite = false;
let favoriteId = null;

function getAdminHeaders() {
    const token = sessionStorage.getItem('access_token') || ADMIN_FALLBACK_TOKEN;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function getClientHeaders() {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function requireClientSession() {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        showToast('Please sign in to continue.', 'error');
        setTimeout(() => {
            window.location.href = '../auth/Clientlogin.html';
        }, 800);
        return false;
    }
    return true;
}

function getMovieIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function loadMovieDetails(movieId) {
    try {
        const response = await fetch(`${API_URL}/admin/movies`, {
            method: 'GET',
            headers: getAdminHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.data) {
            const movie = data.data.find(m => m.id == movieId);
            if (movie) {
                currentMovie = movie;
                currentMovieId = movieId;
                await displayMovieDetails(movie);
                await loadSimilarMovies(movie.category?.id);
            } else {
                showToast('Movie not found', 'error');
            }
        } else {
            showToast('Error loading movie details', 'error');
        }
    } catch (error) {
        showToast('Error loading movie details: ' + error.message, 'error');
    }
}

async function displayMovieDetails(movie) {
    document.getElementById('heroTitle').textContent = movie.title;
    document.getElementById('heroImage').src = movie.cover_url || '';
    document.getElementById('heroImage').alt = movie.title;

    document.getElementById('moviePoster').src = movie.cover_url || '';
    document.getElementById('moviePoster').alt = movie.title;

    document.getElementById('movieTitle').textContent = movie.title;
    document.getElementById('movieSynopsis').textContent = movie.overview || 'No synopsis available.';
    document.getElementById('movieRuntime').textContent = `${movie.run_time_min || movie.runtime || 0} min`;
    document.getElementById('movieGenres').textContent = movie.category?.name || 'Unknown';
    document.getElementById('movieRating').querySelector('.rating-number').textContent = movie.imdb || 'N/A';

    displayCast(movie.actors || []);

    if (movie.category?.id) {
        loadSimilarMovies(movie.category.id);
    }

    await loadComments(movie.id);
    await checkFavoriteStatus();

    document.getElementById('moviePoster').addEventListener('click', () => {
        openTrailerModal(movie);
    });
}

function displayCast(actors) {
    const castList = document.getElementById('castList');
    if (!castList) return;

    if (!actors || actors.length === 0) {
        castList.innerHTML = '<p style="color: #666;">No cast information available</p>';
        return;
    }

    castList.innerHTML = actors.map((actor, index) => `
        <div class="cast-item">
            <img src="${actor.img_url || 'https://placehold.co/80x80/333333/FFFFFF?text=' + (actor.name ? actor.name.charAt(0) : 'A')}" 
                 alt="${actor.name} ${actor.surname}" class="cast-avatar">
            <div class="cast-name">${actor.name} ${actor.surname}</div>
            <div class="cast-role">${actor.name ? actor.name.toLowerCase() : 'actor'}</div>
        </div>
    `).join('');
}

async function loadSimilarMovies(categoryId) {
    try {
        const response = await fetch(`${API_URL}/admin/movies`, {
            method: 'GET',
            headers: getAdminHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.data) {
            const similarMovies = data.data.filter(movie => 
                movie.category?.id === categoryId && movie.id != currentMovieId
            ).slice(0, 3);
            
            displaySimilarMovies(similarMovies);
        }
    } catch (error) {
        showToast('Similar movies could not be loaded.', 'error');
    }
}

function displaySimilarMovies(movies) {
    const similarMoviesContainer = document.getElementById('similarMovies');
    if (!similarMoviesContainer) return;

    if (!movies || movies.length === 0) {
        similarMoviesContainer.innerHTML = '<p style="color: #666;">No similar movies found</p>';
        return;
    }

    similarMoviesContainer.innerHTML = movies.map(movie => `
        <div class="similar-movie-card" onclick="goToMovieDetail(${movie.id})">
            <img src="${movie.cover_url || 'https://via.placeholder.com/200x300/2D2D2D/FFFFFF?text=No+Image'}" 
                 alt="${movie.title}" class="similar-movie-poster">
            <div class="similar-movie-genre">${movie.category?.name || 'Epic Adventure'}</div>
            <div class="similar-movie-rating">
                <div class="similar-movie-stars">
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                    <span class="star">★</span>
                </div>
            </div>
            <div class="similar-movie-title">${movie.title}</div>
        </div>
    `).join('');
}

function openTrailerModal(movie) {
    const modalElement = document.getElementById('trailerModal');
    const iframe = document.getElementById('trailerIframe');
    const modalTitle = document.getElementById('trailerModalTitle');
    
    if (!modalElement || !iframe || !modalTitle) {
        return;
    }
    
    modalTitle.textContent = `${movie.title} - Trailer`;
    
    let embedUrl = '';
    if (movie.fragman || movie.trailer_url) {
        let trailerUrl = movie.fragman || movie.trailer_url;
        
        // Fix broken URLs (ttps:// → https://)
        if (trailerUrl.startsWith('ttps://')) {
            trailerUrl = 'h' + trailerUrl;
        } else if (trailerUrl.startsWith('ttp://')) {
            trailerUrl = 'h' + trailerUrl;
        } else if (!trailerUrl.startsWith('http://') && !trailerUrl.startsWith('https://')) {
            trailerUrl = 'https://' + trailerUrl;
        }
        
        // Extract YouTube video ID from various formats
        let videoId = null;
        
        // Format: youtube.com/watch?v=VIDEO_ID
        if (trailerUrl.includes('youtube.com/watch?v=')) {
            videoId = trailerUrl.split('v=')[1]?.split('&')[0]?.split('?')[0];
        }
        // Format: youtu.be/VIDEO_ID
        else if (trailerUrl.includes('youtu.be/')) {
            videoId = trailerUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
        }
        // Format: youtube.com/embed/VIDEO_ID
        else if (trailerUrl.includes('youtube.com/embed/')) {
            videoId = trailerUrl.split('embed/')[1]?.split('?')[0]?.split('&')[0];
        }
        // Format: m.youtube.com/watch?v=VIDEO_ID (mobile)
        else if (trailerUrl.includes('m.youtube.com/watch?v=')) {
            videoId = trailerUrl.split('v=')[1]?.split('&')[0]?.split('?')[0];
        }
        
        // If we found a video ID, create proper embed URL
        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else {
            // Fallback: use original URL (for non-YouTube videos)
            embedUrl = trailerUrl;
        }
    }
    
    iframe.src = '';
    
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true,
        focus: true
    });
    
    modal.show();
    
    setTimeout(() => {
        iframe.src = embedUrl;
    }, 300);
    
    modalElement.addEventListener('hidden.bs.modal', function () {
        iframe.src = '';
    }, { once: true });
}

function handleWatchLink() {
    if (currentMovie && currentMovie.watch_url) {
        window.open(currentMovie.watch_url, '_blank');
    } else {
        showToast('Watch link not available for this movie.', 'error');
    }
}

function goToMovieDetail(movieId) {
    window.location.href = `movie-detail.html?id=${movieId}`;
}

async function loadComments(movieId) {
    try {
        const response = await fetch(`${API_URL}/admin/comments`, {
            method: 'GET',
            headers: getAdminHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.data) {
            const movieComments = data.data.filter(comment => 
                comment.movie?.id == movieId
            );
            
            displayComments(movieComments);
        }
    } catch (error) {
        showToast('Comments could not be loaded.', 'error');
    }
}

function displayComments(comments) {
    const commentsContainer = document.getElementById('existingComments');
    if (!commentsContainer) return;

    if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = '<p style="color: #666; padding: 20px;">No comments yet. Be the first to comment!</p>';
        return;
    }

    commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-avatar">
                <img src="https://placehold.co/40x40/333333/FFFFFF?text=U" alt="User">
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">Anonymous User</span>
                    <span class="comment-time">${new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <div class="comment-text">${comment.comment}</div>
            </div>
        </div>
    `).join('');
}

async function submitComment() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();

    if (!commentText) {
        showToast('Please enter a comment', 'error');
        return;
    }

    if (!currentMovieId) {
        showToast('Movie ID not found', 'error');
        return;
    }

    try {
        const requestBody = {
            movie_id: currentMovieId,
            comment: commentText
        };
        
        const headers = getClientHeaders();
        if (!headers) {
            requireClientSession();
            return;
        }

        const response = await fetch(`${API_URL}/movies/${currentMovieId}/comment`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        commentInput.value = '';
        await loadComments(currentMovieId);
        showToast('Comment added successfully!', 'success');
    } catch (error) {
        showToast('Error adding comment: ' + error.message, 'error');
    }
}

async function toggleFavorite() {
    if (isFavorite) {
        await removeFromFavorites();
    } else {
        await addToFavorites();
    }
}

function handleIframeClick() {
    if (currentMovie && currentMovie.watch_url) {
        window.open(currentMovie.watch_url, '_blank');
    } else {
        showToast('Watch link not available for this movie.', 'error');
    }
}

async function initializePage() {
    const movieId = getMovieIdFromURL();
    
    if (!movieId) {
        showToast('Movie ID not provided in URL', 'error');
        return;
    }
    
    await loadMovieDetails(movieId);
    
    const watchLinkBtn = document.getElementById('watchLinkBtn');
    if (watchLinkBtn) {
        watchLinkBtn.addEventListener('click', handleWatchLink);
    }
    
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavorite);
    }
    
    const commentSubmitBtn = document.getElementById('commentSubmitBtn');
    if (commentSubmitBtn) {
        commentSubmitBtn.addEventListener('click', submitComment);
    }
    
    const iframe = document.getElementById('trailerIframe');
    if (iframe) {
        iframe.addEventListener('click', handleIframeClick);
    }
    
    const commentInput = document.getElementById('commentInput');
    if (commentInput) {
        commentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitComment();
            }
        });
    }
}

async function addToFavorites() {
    if (!currentMovieId) return;

    if (!requireClientSession()) {
        return;
    }

    const headers = getClientHeaders();
    if (!headers) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/movie/${currentMovieId}/favorite`, {
            method: 'POST',
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.result || data.message === 'Successfully added favorites') {
            isFavorite = true;
            favoriteId = currentMovieId;
            updateFavoriteButton();
            showToast('Added to favorites!', 'success');
        }
    } catch (error) {
        showToast('Error adding to favorites', 'error');
    }
}

async function removeFromFavorites() {
    if (!currentMovieId) return;

    if (!requireClientSession()) {
        return;
    }

    const headers = getClientHeaders();
    if (!headers) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/movie/${currentMovieId}/favorite`, {
            method: 'DELETE',
            headers
        });

        if (response.status === 404) {
            const errorData = await response.json().catch(() => ({}));
            isFavorite = false;
            favoriteId = null;
            updateFavoriteButton();
            showToast('Movie is not in favorites or already removed', 'error');
            return;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result || data.message === 'Successfully removed favorites') {
            isFavorite = false;
            favoriteId = null;
            updateFavoriteButton();
            showToast('Removed from favorites', 'success');
        }
    } catch (error) {
        showToast('Error removing from favorites', 'error');
    }
}

function updateFavoriteButton() {
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (!favoriteBtn) return;

    if (isFavorite) {
        favoriteBtn.innerHTML = '✓';
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.innerHTML = '+';
        favoriteBtn.classList.remove('active');
    }
}

async function checkFavoriteStatus() {
    if (!currentMovieId) return;

    const headers = getClientHeaders();
    if (!headers) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/movies/favorites`, {
            method: 'GET',
            headers
        });

        if (response.ok) {
            const data = await response.json();
            if (data.result && data.data) {
                const favorite = data.data.find(movie => movie.id == currentMovieId);
                if (favorite) {
                    isFavorite = true;
                    favoriteId = currentMovieId;
                    updateFavoriteButton();
                }
            }
        }
    } catch (error) {
        showToast('Favorites could not be loaded.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', initializePage);