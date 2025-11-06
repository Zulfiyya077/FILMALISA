const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInN1YiI6MTAzLCJpYXQiOjE3NjA1MTQ4ODMsImV4cCI6MTc5MTYxODg4M30.9wtCEnAhwQ8f_LH9osr4KMeHu31QXRwJgcmSqfrJxNA';

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
    };
}

async function loadMoviesCount() {
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
            return data.data.length;
        }
        return 0;
    } catch (error) {
        console.error('Error loading movies count:', error);
        return 0;
    }
}

async function loadCategoriesCount() {
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
            return data.data.length;
        }
        return 0;
    } catch (error) {
        console.error('Error loading categories count:', error);
        return 0;
    }
}

async function loadUsersCount() {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.data) {
            return data.data.length;
        }
        return 0;
    } catch (error) {
        console.error('Error loading users count:', error);
        return 0;
    }
}

async function loadCommentsCount() {
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
            return data.data.length;
        }
        return 0;
    } catch (error) {
        console.error('Error loading comments count:', error);
        return 0;
    }
}

async function loadActorsCount() {
    try {
        const response = await fetch(`${API_URL}/admin/actors`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.data) {
            return data.data.length;
        }
        return 0;
    } catch (error) {
        console.error('Error loading actors count:', error);
        return 0;
    }
}

async function loadContactsCount() {
    try {
        const response = await fetch(`${API_URL}/admin/contacts`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.data) {
            return data.data.length;
        }
        return 0;
    } catch (error) {
        console.error('Error loading contacts count:', error);
        return 0;
    }
}

async function loadFavoritesCount() {
    try {
        const response = await fetch(`${API_URL}/movies/favorites`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result && data.data) {
            return data.data.length;
        }
        return 0;
    } catch (error) {
        console.error('Error loading favorites count:', error);
        return 0;
    }
}

function animateCounter(element, targetValue, duration = 1500) {
    const startValue = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(easeOutQuart * targetValue);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

async function updateDashboardCards() {
    const moviesCount = await loadMoviesCount();
    const categoriesCount = await loadCategoriesCount();
    const usersCount = await loadUsersCount();
    const commentsCount = await loadCommentsCount();
    const actorsCount = await loadActorsCount();
    const contactsCount = await loadContactsCount();
    const favoritesCount = await loadFavoritesCount();

    const cards = [
        { id: 'movies-count', value: moviesCount, delay: 0 },
        { id: 'categories-count', value: categoriesCount, delay: 100 },
        { id: 'users-count', value: usersCount, delay: 200 },
        { id: 'comments-count', value: commentsCount, delay: 300 },
        { id: 'actors-count', value: actorsCount, delay: 400 },
        { id: 'contacts-count', value: contactsCount, delay: 500 },
        { id: 'favorites-count', value: favoritesCount, delay: 600 }
    ];

    cards.forEach(card => {
        const element = document.getElementById(card.id);
        if (element) {
            element.textContent = '0';
            setTimeout(() => {
                animateCounter(element, card.value);
            }, card.delay);
        }
    });
}

function logout() {
    localStorage.removeItem('access_token');
    window.location.href = '../auth/adminlogin.html';
}

async function initializeDashboard() {
    await updateDashboardCards();
    
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
}

document.addEventListener('DOMContentLoaded', initializeDashboard);