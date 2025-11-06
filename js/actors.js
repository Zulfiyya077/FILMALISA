// window.addEventListener('load', () => {
//     const accessToken = sessionStorage.getItem('access_token');

//     if (!accessToken) {
//         window.location.href = '../auth/login.html';
//     }
// });

// const logoutDiv = document.querySelector('.logout-div');
// if (logoutDiv) {
//     logoutDiv.addEventListener('click', () => {
//         sessionStorage.removeItem('access_token');
//         window.location.href = '../auth/login.html';
//     });
// } else {
//     console.error('.logout-div element not found');
// }

const API_URL = 'https://api.sarkhanrahimli.dev/api/filmalisa/admin/actors';
const API_URL2 = 'https://api.sarkhanrahimli.dev/api/filmalisa/admin/actor';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInN1YiI6MTAzLCJpYXQiOjE3NjA1MTQ4ODMsImV4cCI6MTc5MTYxODg4M30.9wtCEnAhwQ8f_LH9osr4KMeHu31QXRwJgcmSqfrJxNA';

function getAccessToken() {
    const userToken = sessionStorage.getItem('access_token');
    return userToken || ACCESS_TOKEN;
}

const tbody = document.querySelector('.tbody') || document.getElementById('actorsTableBody');
const paginationContainer = document.getElementById('pagination-container') || document.getElementById('actorsPagination');
const imgURLInput = document.getElementById('imgURL') || document.getElementById('actorImage');
const previewImage = document.getElementById('previewImage') || document.getElementById('actorPreviewImg');
const DEFAULT_IMAGE_URL = '../images/default.jpg';
const rowsPerPage = 7;
let currentPage = 1;
let isEditMode = false;
let editActorId = null;
let allActors = [];

async function fetchActorsWithPagination() {
    try {
        const token = getAccessToken();
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        allActors = result.data || [];

        allActors.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (tbody) {
            displayTableWithPagination(allActors, tbody, rowsPerPage, currentPage);
        }
        if (paginationContainer) {
            setupPagination(allActors, paginationContainer, rowsPerPage);
        }
    } catch (error) {
        console.error('Error fetching actors:', error);
    }
}

const displayTableWithPagination = (items, tableBody, rowsPerPage, page) => {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);

    paginatedItems.forEach((actor, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>
                <img
                    src="${actor.img_url || DEFAULT_IMAGE_URL}"
                    style="width: 29px; height: 39px; object-fit: cover; border-radius: 4px;"
                    alt="Actor Image"
                    class="image-default-1"
                    onerror="this.onerror=null; this.src='${DEFAULT_IMAGE_URL}';"
                />
            </td>
            <td>${actor.name}</td>
            <td>${actor.surname}</td>
            <td class="actions">
                <button class="edit-button" onclick="openEditModal(${actor.id}, '${actor.name.replace(/'/g, "\\'")}', '${actor.surname.replace(/'/g, "\\'")}', '${(actor.img_url || '').replace(/'/g, "\\'")}')" style="background: none; border: none; cursor: pointer; padding: 5px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="color: #58209d;">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L6.5 12.207a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V9.5a.5.5 0 0 1 .146-.354L12.146.146zM2.5 9.5l3 3V12H2.5v-2.5z"/>
                    </svg>
                </button>
                <button class="delete-button" onclick="openRemoveModal(${actor.id})" style="background: none; border: none; cursor: pointer; padding: 5px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="color: #e74c3c;">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchActorsWithPagination);
} else {
    fetchActorsWithPagination();
}

const setupPagination = (items, container, rowsPerPage) => {
    if (!container) return;
    container.innerHTML = '';
    const pageCount = Math.ceil(items.length / rowsPerPage);

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(pageCount, startPage + 2);

    if (endPage - startPage + 1 < 3) {
        startPage = Math.max(1, endPage - 2);
    }

    const buttons = [];
    for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
    }

    while (buttons.length < 3 && buttons.length < pageCount) {
        if (buttons[0] > 1) {
            buttons.unshift(buttons[0] - 1);
        } else if (buttons[buttons.length - 1] < pageCount) {
            buttons.push(buttons[buttons.length - 1] + 1);
        } else {
            break;
        }
    }

    buttons.forEach((i) => {
        const button = document.createElement('button');
        button.classList.add('pagination-btn');
        button.textContent = i;

        if (i > pageCount) {
            button.disabled = true;
            button.classList.add('disabled');
        }

        if (i === currentPage) {
            button.classList.add('active');
        }

        button.addEventListener('click', () => {
            if (!button.disabled) {
                currentPage = i;
                displayTableWithPagination(allActors, tbody, rowsPerPage, currentPage);
                setupPagination(allActors, container, rowsPerPage);
            }
        });

        container.appendChild(button);
    });
};

const createBtn = document.getElementById('create-btn') || document.querySelector('.create-btn');
const modal = document.getElementById('modal') || document.getElementById('actorModal');
const form = document.getElementById('myForm') || document.getElementById('actorForm');

if (createBtn) {
    createBtn.addEventListener('click', function() {
        isEditMode = false;
        editActorId = null;
        const submitBtn = document.getElementById('submit-btn') || document.getElementById('saveActor');
        if (submitBtn) submitBtn.textContent = 'Create';
        if (form) form.reset();
        if (previewImage) previewImage.src = DEFAULT_IMAGE_URL;
        if (modal) {
            if (modal.classList && modal.classList.contains('modal')) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            } else {
                modal.style.display = 'flex';
            }
        }
    });
} else {
    console.error('Create button element not found in DOM.');
}

window.openCreateModal = function() {
    isEditMode = false;
    editActorId = null;
    const submitBtn = document.getElementById('submit-btn') || document.getElementById('saveActor');
    if (submitBtn) submitBtn.textContent = 'Create';
    if (form) form.reset();
    if (previewImage) previewImage.src = DEFAULT_IMAGE_URL;
    if (modal) {
        if (modal.classList && modal.classList.contains('modal')) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        } else {
            modal.style.display = 'flex';
        }
    }
};

if (modal) {
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            if (modal.classList && modal.classList.contains('modal')) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            } else {
                modal.style.display = 'none';
            }
        }
    });
}

if (imgURLInput) {
    imgURLInput.addEventListener('input', () => {
        const url = imgURLInput.value.trim();
        const preview = document.getElementById('previewImage') || document.getElementById('actorPreviewImg');
        if (preview) {
            preview.src = url || DEFAULT_IMAGE_URL;

            preview.onerror = () => {
                preview.onerror = null;
                preview.src = DEFAULT_IMAGE_URL;
            };
        }
    });
}

const actorImageInput = document.getElementById('actorImage');
if (actorImageInput) {
    actorImageInput.addEventListener('input', () => {
        const url = actorImageInput.value.trim();
        const preview = document.getElementById('actorPreviewImg');
        if (preview) {
            preview.src = url || DEFAULT_IMAGE_URL;
            preview.onerror = () => {
                preview.onerror = null;
                preview.src = DEFAULT_IMAGE_URL;
            };
        }
    });
}

function openRemoveModal(id) {
    const removeModal = document.getElementById('modal-remove') || document.getElementById('deleteActorModal');
    if (!removeModal) {
        console.error('Remove modal element not found in DOM.');
        return;
    }

    const actor = allActors.find(a => a.id == id);
    if (actor) {
        const previewName = document.getElementById('actor-preview-name');
        if (previewName) {
            previewName.textContent = `${actor.name} ${actor.surname}`;
        }
    }

    removeModal.setAttribute('data-actor-id', id);
    if (removeModal.classList && removeModal.classList.contains('modal')) {
        const bsModal = new bootstrap.Modal(removeModal);
        bsModal.show();
    } else {
        removeModal.style.display = 'flex';
    }
}

window.openRemoveModal = openRemoveModal;

function closeRemoveModal() {
    const removeModal = document.getElementById('modal-remove') || document.getElementById('deleteActorModal');
    if (!removeModal) return;

    if (removeModal.classList && removeModal.classList.contains('modal')) {
        const bsModal = bootstrap.Modal.getInstance(removeModal);
        if (bsModal) bsModal.hide();
    } else {
        removeModal.style.display = 'none';
    }
    removeModal.removeAttribute('data-actor-id');
}

window.openEditModal = function(id, name, surname, imgURL) {
    isEditMode = true;
    editActorId = id;

    const nameInput = document.getElementById('name') || document.getElementById('actorName');
    const surnameInput = document.getElementById('surname') || document.getElementById('actorSurname');
    const imgURLInput = document.getElementById('imgURL') || document.getElementById('actorImage');
    const submitBtn = document.getElementById('submit-btn') || document.getElementById('saveActor');

    if (nameInput) nameInput.value = name;
    if (surnameInput) surnameInput.value = surname;
    if (imgURLInput) imgURLInput.value = imgURL;

    if (previewImage) {
        previewImage.src = imgURL || DEFAULT_IMAGE_URL;

        previewImage.onerror = () => {
            previewImage.onerror = null;
            previewImage.src = DEFAULT_IMAGE_URL;
        };
    }

    if (submitBtn) submitBtn.textContent = 'Edit';
    if (modal) {
        if (modal.classList && modal.classList.contains('modal')) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        } else {
            modal.style.display = 'flex';
        }
    }
}

const yesBtn = document.getElementById('yes-btn') || document.getElementById('confirm-delete-actor');
if (yesBtn) {
    yesBtn.addEventListener('click', () => {
        const removeModal = document.getElementById('modal-remove') || document.getElementById('deleteActorModal');
        if (!removeModal) return;

        const actorId = removeModal.getAttribute('data-actor-id');
        if (actorId) {
            deleteActor(actorId);
        }

        closeRemoveModal();
    });
}

const noBtn = document.getElementById('no-btn');
if (noBtn) {
    noBtn.addEventListener('click', () => {
        closeRemoveModal();
    });
}

function showToast(message, type = 'success') {
    const backgroundColor = type === 'success' ? '#27ae60' : '#e74c3c';
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: backgroundColor,
        stopOnFocus: true
    }).showToast();
}

async function handleFormSubmit(event) {
    if (event) event.preventDefault();

    const nameInput = document.getElementById('name') || document.getElementById('actorName');
    const surnameInput = document.getElementById('surname') || document.getElementById('actorSurname');
    const imgURLInput = document.getElementById('imgURL') || document.getElementById('actorImage');

    if (!nameInput || !surnameInput || !imgURLInput) {
        console.error('Form inputs not found');
        return;
    }

    const name = nameInput.value.trim();
    const surname = surnameInput.value.trim();
    const imgURL = imgURLInput.value.trim();

    if (!name || !surname || !imgURL) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    const actorData = { name, surname, img_url: imgURL };

    try {
        if (isEditMode) {
            const response = await fetch(`${API_URL2}/${editActorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAccessToken()}`
                },
                body: JSON.stringify(actorData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            showToast('Actor updated successfully!', 'success');
        } else {
            const response = await fetch(API_URL2, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAccessToken()}`
                },
                body: JSON.stringify(actorData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            showToast('Actor created successfully!', 'success');
        }

        if (modal) {
            if (modal.classList && modal.classList.contains('modal')) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            } else {
                modal.style.display = 'none';
            }
        }
        fetchActorsWithPagination();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error: ' + error.message, 'error');
    }
}

if (form) {
    form.addEventListener('submit', handleFormSubmit);
}

const saveActorBtn = document.getElementById('saveActor');
if (saveActorBtn) {
    saveActorBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleFormSubmit(null);
    });
}

async function deleteActor(id) {
    try {
        const response = await fetch(`${API_URL2}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        showToast('Actor deleted successfully!', 'success');
        closeRemoveModal();
        fetchActorsWithPagination();
    } catch (error) {
        console.error('Error deleting actor:', error);
        showToast('Error deleting actor: ' + error.message, 'error');
    }
}
