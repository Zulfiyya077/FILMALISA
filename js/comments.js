const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInN1YiI6MTAzLCJpYXQiOjE3NjA1MTQ4ODMsImV4cCI6MTc5MTYxODg4M30.9wtCEnAhwQ8f_LH9osr4KMeHu31QXRwJgcmSqfrJxNA';

function showToast(message, type = 'success') {
    const backgroundColor = type === 'success' ? '#27ae60' : '#e74c3c';
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: backgroundColor,
        stopOnFocus: true
    }).showToast();
}

let commentsCache = [];
let moviesCache = [];
let currentCommentId = null;
let currentMovieId = null;
let currentPage = 1;
let totalPages = 1;

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
    };
}

async function loadComments() {
    try {
        const response = await fetch(`${API_URL}/admin/comments`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.data) {
            commentsCache = data.data;
            totalPages = Math.ceil(commentsCache.length / 8);
            displayComments();
            updatePagination();
        }
    } catch (error) {
        console.error('Error loading comments:', error);
    }
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

function getMovieTitle(movieId) {
    const movie = moviesCache.find(m => m.id == movieId);
    return movie ? movie.title : 'Unknown Movie';
}

function displayComments() {
    const tbody = document.getElementById('commentsTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * 8;
    const endIndex = startIndex + 8;
    const pageComments = commentsCache.slice(startIndex, endIndex);

    if (pageComments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No comments found</td></tr>';
        return;
    }

    tbody.innerHTML = pageComments.map(comment => `
        <tr>
            <td class="comment-id">${comment.id}</td>
            <td class="user-name">${comment.user?.full_name || 'Unknown User'}</td>
            <td class="user-email">${comment.user?.email || 'N/A'}</td>
            <td class="movie-title">${comment.movie?.title || 'Unknown Movie'}</td>
            <td class="comment-text">${comment.comment}</td>
            <td class="view-action">
                <button class="view-button" onclick="viewComment(${comment.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                    </svg>
                </button>
            </td>
            <td class="remove-action">
                <button class="delete-button" onclick="openDeleteModal(${comment.id}, ${comment.movie?.id || 0})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
}

function updatePagination() {
    const paginationContainer = document.getElementById('commentsPagination');
    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayComments();
    updatePagination();
}

async function deleteComment(commentId, movieId) {
    try {
        const response = await fetch(`${API_URL}/admin/movies/${movieId}/comment/${commentId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        commentsCache = commentsCache.filter(comment => comment.id !== commentId);
        totalPages = Math.ceil(commentsCache.length / 8);
        
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        displayComments();
        updatePagination();
        
        return true;
    } catch (error) {
        console.error('Error deleting comment:', error);
        return false;
    }
}

function viewComment(commentId) {
    const comment = commentsCache.find(c => c.id == commentId);
    if (comment) {
        const viewCommentText = document.getElementById('viewCommentText');
        if (viewCommentText) {
            viewCommentText.textContent = comment.comment;
        }
        
        const modalElement = document.getElementById('viewModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }
}

function openDeleteModal(commentId, movieId) {
    currentCommentId = commentId;
    currentMovieId = movieId;
    
    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

async function confirmDelete() {
    if (!currentCommentId || !currentMovieId) return;
    
    const success = await deleteComment(currentCommentId, currentMovieId);
    
    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
    
    if (success) {
        showToast('Comment deleted successfully!', 'success');
    } else {
        showToast('Error deleting comment. Please try again.', 'error');
    }
}

function logout() {
    localStorage.removeItem('access_token');
    window.location.href = '../auth/login.html';
}

async function initializeComments() {
    await loadMovies();
    await loadComments();
    
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
}

document.addEventListener('DOMContentLoaded', initializeComments);
