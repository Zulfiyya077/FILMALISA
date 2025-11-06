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

let usersCache = [];
let currentPage = 1;
let totalPages = 1;

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
    };
}

async function loadUsers() {
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
            usersCache = data.data;
            totalPages = Math.ceil(usersCache.length / 8);
            displayUsers();
            updatePagination();
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * 8;
    const endIndex = startIndex + 8;
    const pageUsers = usersCache.slice(startIndex, endIndex);

    if (pageUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="text-align: center; padding: 40px; background: white;">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = pageUsers.map(user => `
        <tr>
            <td class="user-id">${user.id}</td>
            <td class="user-info">
                <div class="user-details">
                    <img src="${user.img_url || 'https://placehold.co/40x40/333333/FFFFFF?text=' + (user.full_name ? user.full_name.charAt(0) : 'U')}" 
                         alt="${user.full_name}" class="user-avatar">
                    <span class="user-name">${user.full_name}</span>
                </div>
            </td>
            <td class="email-text">${user.email}</td>
        </tr>
    `).join('');
}

function updatePagination() {
    const paginationContainer = document.getElementById('usersPagination');
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
    displayUsers();
    updatePagination();
}


function logout() {
    localStorage.removeItem('access_token');
    window.location.href = '../auth/login.html';
}

async function initializeUsers() {
    await loadUsers();
}

document.addEventListener('DOMContentLoaded', initializeUsers);