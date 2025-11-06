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

let categoriesCache = [];
let currentCategoryId = null;
let currentPage = 1;
let totalPages = 1;

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
    };
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
            totalPages = Math.ceil(categoriesCache.length / 8);
            displayCategories();
            updatePagination();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function displayCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * 8;
    const endIndex = startIndex + 8;
    const pageCategories = categoriesCache.slice(startIndex, endIndex);

    if (pageCategories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="text-align: center; padding: 40px; background: white;">No categories found</td></tr>';
        return;
    }

    tbody.innerHTML = pageCategories.map(category => `
        <tr>
            <td class="category-id">${category.id}</td>
            <td class="category-name">${category.name}</td>
            <td style="text-align: center;">
                <button class="edit-button" onclick="openEditModal(${category.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L6.5 12.5a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .146-.354L12.146.146zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                    </svg>
                </button>
            </td>
            <td style="text-align: center;">
                <button class="delete-button" onclick="openDeleteModal(${category.id})">
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
    const paginationContainer = document.getElementById('categoriesPagination');
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
    displayCategories();
    updatePagination();
}

async function createCategory() {
    const categoryName = document.getElementById('categoryName').value.trim();
    
    if (!categoryName) {
        showToast('Please enter category name', 'error');
        return;
    }
    
    const formData = {
        name: categoryName
    };

    console.log('Creating category:', formData);

    try {
        const response = await fetch(`${API_URL}/admin/category`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log('Error response:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Success response:', result);
        
        if (result.result === true || result.data) {
            showToast('Category created successfully!', 'success');
            closeCategoryModal();
            clearCategoryForm();
            loadCategories();
        } else {
            showToast('Error creating category: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error creating category:', error);
        showToast('Error creating category: ' + error.message, 'error');
    }
}

async function updateCategory() {
    const categoryName = document.getElementById('categoryName').value.trim();
    
    if (!categoryName) {
        showToast('Please enter category name', 'error');
        return;
    }
    
    const formData = {
        name: categoryName
    };

    try {
        const response = await fetch(`${API_URL}/admin/category/${currentCategoryId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.result === true || result.data) {
            showToast('Category updated successfully!', 'success');
            closeCategoryModal();
            clearCategoryForm();
            loadCategories();
        } else {
            showToast('Error updating category: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error updating category:', error);
        showToast('Error updating category: ' + error.message, 'error');
    }
}

async function deleteCategory() {
    try {
        const response = await fetch(`${API_URL}/admin/category/${currentCategoryId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.result === true || result.message === 'Ok') {
            showToast('Category deleted successfully!', 'success');
            closeDeleteModal();
            loadCategories();
        } else {
            showToast('Error deleting category: ' + (result.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Error deleting category: ' + error.message, 'error');
    }
}

function openCreateModal() {
    currentCategoryId = null;
    clearCategoryForm();
    document.getElementById('categoryModalLabel').textContent = 'Create New Category';
    const modal = document.getElementById('categoryModal');
    modal.classList.add('show');
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
}

async function openEditModal(categoryId) {
    currentCategoryId = categoryId;
    const category = categoriesCache.find(c => c.id == categoryId);
    
    if (category) {
        document.getElementById('categoryName').value = category.name || '';
        
        document.getElementById('categoryModalLabel').textContent = 'Edit Category';
        const modal = document.getElementById('categoryModal');
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    } else {
        showToast('Error loading category data', 'error');
    }
}

function openDeleteModal(categoryId) {
    currentCategoryId = categoryId;
    const modal = document.getElementById('deleteModal');
    modal.classList.add('show');
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function clearCategoryForm() {
    document.getElementById('categoryName').value = '';
}

function submitCategory() {
    if (currentCategoryId) {
        updateCategory();
    } else {
        createCategory();
    }
}

function confirmDelete() {
    deleteCategory();
}

function logout() {
    localStorage.removeItem('access_token');
    window.location.href = '../auth/adminlogin.html';
}

async function initializeCategories() {
    await loadCategories();
    
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitCategory();
        });
    }
    
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
}

document.addEventListener('DOMContentLoaded', initializeCategories);