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

let contactsCache = [];
let currentContactId = null;
let currentPage = 1;
let totalPages = 1;

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
    };
}

async function loadContacts() {
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
            contactsCache = data.data;
            totalPages = Math.ceil(contactsCache.length / 8);
            displayContacts();
            updatePagination();
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

function displayContacts() {
    const tbody = document.getElementById('contactsTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * 8;
    const endIndex = startIndex + 8;
    const pageContacts = contactsCache.slice(startIndex, endIndex);

    if (pageContacts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No contacts found</td></tr>';
        return;
    }

    tbody.innerHTML = pageContacts.map(contact => `
        <tr>
            <td>${contact.id}</td>
            <td class="contact-name">${contact.full_name}</td>
            <td class="email-text">${contact.email}</td>
            <td class="message-text">${contact.reason}</td>
            <td class="actions">
                <button class="delete-button" onclick="openDeleteModal(${contact.id})">
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
    const paginationContainer = document.getElementById('contactsPagination');
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
    displayContacts();
    updatePagination();
}

async function deleteContact(contactId) {
    try {
        const response = await fetch(`${API_URL}/admin/contact/${contactId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result || data.message === 'Successfully removed') {
            contactsCache = contactsCache.filter(contact => contact.id !== contactId);
            totalPages = Math.ceil(contactsCache.length / 8);
            
            if (currentPage > totalPages && totalPages > 0) {
                currentPage = totalPages;
            }
            
            displayContacts();
            updatePagination();
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error deleting contact:', error);
        return false;
    }
}

function openDeleteModal(contactId) {
    currentContactId = contactId;
    
    const contact = contactsCache.find(c => c.id === contactId);
    if (contact) {
        const nameElement = document.getElementById('contact-preview-name');
        const reasonElement = document.getElementById('subject-preview-text');
        
        if (nameElement) nameElement.textContent = contact.full_name;
        if (reasonElement) reasonElement.textContent = contact.reason;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('deleteContactModal'));
    modal.show();
}

async function confirmDelete() {
    if (!currentContactId) return;
    
    const success = await deleteContact(currentContactId);
    
    if (success) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteContactModal'));
        if (modal) modal.hide();
        showToast('Contact deleted successfully!', 'success');
    } else {
        showToast('Error deleting contact. Please try again.', 'error');
    }
    
    currentContactId = null;
}

function logout() {
    localStorage.removeItem('access_token');
    window.location.href = '../auth/login.html';
}

async function initializeContacts() {
    await loadContacts();
    
    const confirmDeleteBtn = document.getElementById('confirm-delete-contact');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
}

document.addEventListener('DOMContentLoaded', initializeContacts);