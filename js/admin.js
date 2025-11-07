// // Token yoxlaması
// window.addEventListener('load', () => {
//     const accessToken = sessionStorage.getItem('access_token');

//     if (!accessToken) {
//         window.location.href = '../auth/login.html';
//     }
// });

// // Logout funksiyası
// const logoutDiv = document.querySelector('.logout-div');
// if (logoutDiv) {
//     logoutDiv.addEventListener('click', () => {
//         sessionStorage.removeItem('access_token');
//         window.location.href = '../auth/login.html';
//     });
// }

// API URL-ləri
const apiURLCategories = 'https://api.sarkhanrahimli.dev/api/filmalisa/admin/categories';
const apiURLMovie = 'https://api.sarkhanrahimli.dev/api/filmalisa/movies';
const apiURLActors = 'https://api.sarkhanrahimli.dev/api/filmalisa/admin/actors';
const apiURLMovieCreate = 'https://api.sarkhanrahimli.dev/api/filmalisa/admin/movie';
const ADMIN_EMAILS = ['admin@admin.com'];

function isAdminEmail(email) {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
}

function getToken() {
    const token = sessionStorage.getItem('access_token');
    const email = sessionStorage.getItem('user_email');

    if (!token || !isAdminEmail(email)) {
        showToast('Your session has expired. Please sign in again.', 'error');
        setTimeout(() => {
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('user_email');
            sessionStorage.removeItem('user_data');
            window.location.replace('../auth/adminlogin.html');
        }, 800);
        return null;
    }

    return token;
}

// Element seçiciləri
const modal = document.getElementById('movieModal');
const myForm = document.getElementById('movieForm');
const title = document.getElementById('movieTitle');
const overview = document.getElementById('movieOverview');
const coverUrl = document.getElementById('movieCoverUrl');
const fragman = document.getElementById('movieFragman');
const watchUrl = document.getElementById('movieWatchUrl');
const imdb = document.getElementById('movieImdb');
const runtime = document.getElementById('movieRuntime');
const adult = document.getElementById('movieAdult');
const submitBtn = document.getElementById('submit-btn') || document.querySelector('.submit-btn');
const tableBody = document.getElementById('moviesTableBody');
const paginationContainer = document.getElementById('moviesPagination') || document.querySelector('.pagination-container');
const dropdown = document.querySelector('.dropdown');
const dropdownToggle = dropdown ? dropdown.querySelector('.dropdown-togglee') : null;
const dropdownItems = dropdown ? dropdown.querySelector('#dropdown-items') : null;
const categoryDropdown = document.querySelector('.category-dropdown');
const categoryToggle = categoryDropdown ? categoryDropdown.querySelector('.category-toggle') : null;
const categoryItems = categoryDropdown ? categoryDropdown.querySelector('#category-items') : null;
const imageElement = document.querySelector('#moviePreview') || document.querySelector('.image-wrapper img');

const defaultImage = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'450\'%3E%3Crect width=\'300\' height=\'450\' fill=\'%23333\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-family=\'Arial\' font-size=\'18\' fill=\'%23fff\' text-anchor=\'middle\' dy=\'.3em\'%3ENo Image%3C/text%3E%3C/svg%3E';

// Dəyişənlər
let currentPage = 1;
const rowsPerPage = 7;
let movies = [];
let movieToEditId = null;
let movieToRemoveId = null;
let isSubmitting = false;

// Toastify bildiriş funksiyası
function showToast(message, type = 'success') {
    const backgroundColor = type === 'success' ? '#27ae60' : '#e74c3c';
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: {
            background: backgroundColor
        },
        stopOnFocus: true
    }).showToast();
}

// Film cədvəli
async function fetchMovies() {
    try {
        const token = getToken();
        if (!token) {
            return;
        }
        const response = await fetch(apiURLMovie, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        movies = Array.isArray(data.data) ? data.data : [];

        if (movies.length === 0) {
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="7">No movies found.</td></tr>';
            }
            return;
        }

        displayTable(movies, tableBody, rowsPerPage, currentPage);
        setupPagination(movies, paginationContainer, rowsPerPage);
    } catch (error) {
        console.error('Error while loading movies:', error);
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`;
        }
    }
}

function displayTable(items, tableBody, rowsPerPage, page) {
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedItems = items.slice(start, end);

    paginatedItems.forEach((movie, index) => {
        const newRow = document.createElement('tr');

        const imdbValue = isNaN(parseFloat(movie.imdb)) ? 'N/A' : movie.imdb;
        const categoryValue = movie.category?.name || 'Unknown category';

        newRow.innerHTML = `
            <td>${start + index + 1}</td>
            <td>
                <img
                    src="${movie.cover_url || defaultImage}"
                    style="width: 29px; height: 39px; object-fit: cover; border-radius: 4px;"
                    alt="Movie poster"
                    class="image-default-1"
                    onerror="this.onerror=null;if(this.src!=='${defaultImage}'){this.src='${defaultImage}';}"
                />
            </td>
            <td>${movie.title || 'Untitled'}</td>
            <td>${movie.overview ? (movie.overview.substring(0, 80) + '...') : 'No description'}</td>
            <td>${categoryValue}</td>
            <td>${imdbValue}</td>
            <td class="actions">
                <button class="edit-button" onclick="editMovie(${movie.id})" style="background: none; border: none; cursor: pointer; padding: 5px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="color: #58209d;">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L6.5 12.207a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V9.5a.5.5 0 0 1 .146-.354L12.146.146zM2.5 9.5l3 3V12H2.5v-2.5z"/>
                    </svg>
                </button>
                <button class="delete-button" onclick="removeMovie(${movie.id})" style="background: none; border: none; cursor: pointer; padding: 5px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="color: #e74c3c;">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            </td>
        `;

        tableBody.appendChild(newRow);
    });
}

function setupPagination(items, container, rowsPerPage) {
    if (!container) return;
    
    container.innerHTML = '';
    const pageCount = Math.ceil(items.length / rowsPerPage);

    if (pageCount === 0) {
        return;
    }

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
                displayTable(movies, tableBody, rowsPerPage, currentPage);
                setupPagination(movies, container, rowsPerPage);
            }
        });

        container.appendChild(button);
    });
}

// Aktörləri yüklə
document.addEventListener('DOMContentLoaded', () => {
    async function populateActors() {
        try {
            const token = getToken();
            if (!token) {
                return;
            }
            const response = await fetch(apiURLActors, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const dropdownItemsDiv = document.getElementById('dropdown-items') || document.getElementById('actorsSelect');

            if (!dropdownItemsDiv) {
                return;
            }

            const actors = data.data;

            if (!actors || !Array.isArray(actors)) {
                throw new Error('Actor data is not an array.');
            }

            if (dropdownItemsDiv.tagName === 'SELECT') {
                dropdownItemsDiv.innerHTML = actors.map(actor => 
                    `<option value="${actor.id}">${actor.name} ${actor.surname}</option>`
                ).join('');
            } else {
                dropdownItemsDiv.innerHTML = '';
                actors.forEach((actor) => {
                    const div = document.createElement('div');
                    div.className = 'dropdown-item';
                    div.textContent = `${actor.name} ${actor.surname}`;
                    div.setAttribute('data-value', `${actor.name} ${actor.surname}`);
                    div.setAttribute('data-id', actor.id);
                    dropdownItemsDiv.appendChild(div);
                });
            }
        } catch (error) {
            showToast('Actors could not be loaded.', 'error');
        }
    }

    populateActors();
});

// Aktör dropdown funksiyaları
if (dropdownToggle && dropdownItems) {
    dropdownToggle.addEventListener('click', (event) => {
        const isVisible = dropdownItems.classList.contains('visible');
        dropdownItems.classList.toggle('visible', !isVisible);
        if (categoryItems) categoryItems.classList.remove('visible');
        event.stopPropagation();
    });

    document.addEventListener('click', () => {
        if (dropdownItems) dropdownItems.classList.remove('visible');
    });

    if (dropdown) {
        dropdown.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }

    if (dropdownItems) {
        dropdownItems.addEventListener('click', (event) => {
            const item = event.target;
            if (item.classList.contains('dropdown-item')) {
                const value = item.dataset.value;

                if (item.classList.contains('selected')) {
                    item.classList.remove('selected');
                } else {
                    item.classList.add('selected');
                }
                updateDropdownToggleText();
            }
        });
    }
}

function updateDropdownToggleText() {
    if (!dropdownToggle || !dropdownItems) return;
    
    const selectedItems = Array.from(
        dropdownItems.querySelectorAll('.dropdown-item.selected')
    ).map((item) => item.dataset.value);

    if (selectedItems.length === 0) {
        dropdownToggle.textContent = 'actors';
    } else {
        dropdownToggle.textContent = selectedItems.join(', ');
    }
}

// Kategoriyaları yüklə
document.addEventListener('DOMContentLoaded', () => {
    async function populateCategories() {
        try {
            const token = getToken();
            if (!token) {
                return;
            }
            const response = await fetch(apiURLCategories, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const categoryItemsDiv = document.getElementById('category-items') || document.getElementById('categorySelect');
            const categorySpan = document.getElementById('category-span');

            if (!categoryItemsDiv) {
                return;
            }

            const categories = data.data;

            if (!categories || !Array.isArray(categories)) {
                throw new Error('Categories are not an array.');
            }

            if (categoryItemsDiv.tagName === 'SELECT') {
                categoryItemsDiv.innerHTML = '<option value="">Select category</option>' + 
                    categories.map(category => 
                        `<option value="${category.id}">${category.name}</option>`
                    ).join('');
            } else {
                categoryItemsDiv.innerHTML = '';
                categories.forEach((category) => {
                    if (!category.id || typeof category.id !== 'number') {
                        return;
                    }

                    const div = document.createElement('div');
                    div.className = 'category-item';
                    div.textContent = category.name || 'Unknown category';
                    div.setAttribute('data-value', category.name || 'Unknown');
                    div.setAttribute('data-id', category.id);

                    div.addEventListener('click', () => {
                        if (categorySpan) categorySpan.textContent = category.name || 'Unknown category';
                        document.querySelectorAll('.category-item.selected').forEach((selected) => selected.classList.remove('selected'));
                        div.classList.add('selected');
                        if (categoryToggle) categoryToggle.textContent = category.name || 'Unknown category';
                        if (categoryItems) categoryItems.classList.remove('visible');
                    });

                    categoryItemsDiv.appendChild(div);
                });
            }
        } catch (error) {
            showToast('Categories could not be loaded.', 'error');
        }
    }

    populateCategories();
});

// Kategoriya dropdown funksiyaları
if (categoryToggle && categoryItems) {
    categoryToggle.addEventListener('click', (event) => {
        const isVisible = categoryItems.classList.contains('visible');
        categoryItems.classList.toggle('visible', !isVisible);
        if (dropdownItems) dropdownItems.classList.remove('visible');
        event.stopPropagation();
    });

    document.addEventListener('click', () => {
        if (categoryItems) categoryItems.classList.remove('visible');
    });
}

// Create modal
const createBtn = document.getElementById('create-btn');
if (createBtn) {
    createBtn.addEventListener('click', () => {
        openModalCreate();
    });
}

function openModalCreate() {
    movieToEditId = null;
    if (modal) modal.style.display = 'flex';
    if (submitBtn) submitBtn.textContent = 'Submit';
    resetForm();
}

function resetForm() {
    if (myForm) myForm.reset();
    
    if (imageElement) {
        imageElement.src = defaultImage;
    }

    document.querySelectorAll('.category-item.selected').forEach((item) => {
        item.classList.remove('selected');
    });

    document.querySelectorAll('.dropdown-item.selected').forEach((item) => {
        item.classList.remove('selected');
    });

    if (dropdownToggle) dropdownToggle.textContent = 'actors';
    if (categoryToggle) categoryToggle.textContent = 'category';

    if (dropdownToggle) dropdownToggle.classList.remove('error');
    if (categoryToggle) categoryToggle.classList.remove('error');
}

function closeModal() {
    if (modal) modal.style.display = 'none';
    resetForm();
    movieToEditId = null;
}

// Film yarat
async function createMovie() {
    if (isSubmitting) return;
    isSubmitting = true;

    let isValid = true;

    const inputs = document.querySelectorAll('#movieForm input, #movieForm textarea, #movieForm select');
    inputs.forEach((input) => {
        if (input.type !== 'checkbox' && input.value.trim() === '') {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });

    if (!runtime || isNaN(runtime.value) || runtime.value.trim() === '' || runtime.value.length > 4 || parseInt(runtime.value) <= 0) {
        if (runtime) runtime.classList.add('error2');
        isValid = false;
    } else {
        if (runtime) runtime.classList.remove('error2');
    }

    if (!imdb || !/^\d{1,2}(\.\d{1})?$/.test(imdb.value)) {
        if (imdb) imdb.classList.add('error2');
        isValid = false;
    } else {
        if (imdb) imdb.classList.remove('error2');
    }

    const selectedActors = Array.from(
        document.querySelectorAll('#dropdown-items .dropdown-item.selected')
    ).map((actor) => parseInt(actor.getAttribute('data-id'))).filter(id => !isNaN(id));

    const selectedCategory = parseInt(
        document.querySelector('#category-items .category-item.selected')?.getAttribute('data-id')
    );

    if (!selectedCategory || isNaN(selectedCategory)) {
        if (categoryToggle) categoryToggle.classList.add('error');
        isValid = false;
    } else {
        if (categoryToggle) categoryToggle.classList.remove('error');
    }

    if (selectedActors.length === 0) {
        if (dropdownToggle) dropdownToggle.classList.add('error');
        isValid = false;
    } else {
        if (dropdownToggle) dropdownToggle.classList.remove('error');
    }

    if (!isValid) {
        isSubmitting = false;
        return;
    }

    const movieData = {
        title: title ? title.value.trim() : '',
        cover_url: coverUrl ? coverUrl.value.trim() : '',
        fragman: fragman ? fragman.value.trim() : '',
        watch_url: watchUrl ? watchUrl.value.trim() : '',
        adult: adult ? adult.checked : false,
        run_time_min: runtime ? parseInt(runtime.value, 10) : 120,
        imdb: imdb ? parseFloat(imdb.value).toFixed(1) : '0.0',
        category: [selectedCategory],
        actors: selectedActors,
        overview: overview ? overview.value.trim() : ''
    };

    try {
        const token = getToken();
        if (!token) {
            isSubmitting = false;
            return;
        }
        const response = await fetch(apiURLMovieCreate, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData)
        });

        if (!response.ok) {
            const errorResponse = await response.json().catch(() => ({}));
            showToast('Error: ' + (errorResponse.message || 'Unknown error'), 'error');
            isSubmitting = false;
            return;
        }

        const responseData = await response.json();
        showToast('Movie created successfully!', 'success');
        fetchMovies();
        closeModal();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        isSubmitting = false;
    }
}

// Film redaktə et
function editMovie(movieId) {
    if (!movieId) {
        return;
    }

    movieToEditId = movieId;
    openEditModal();
    fetchMovieDetails(movieId);
}

function openEditModal() {
    if (modal) modal.style.display = 'flex';
    if (submitBtn) submitBtn.textContent = 'Edit';
}

async function fetchMovieDetails(movieId) {
    try {
        const token = getToken();
        if (!token) {
            return;
        }
        const apiUrl = `${apiURLMovie}/${movieId}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const { data: movie } = await response.json();

        if (!movie) {
            return;
        }

        fillFormWithMovieDetails(movie);
    } catch (error) {
        showToast('Movie details could not be loaded', 'error');
    }
}

function fillFormWithMovieDetails(movie) {
    if (title) title.value = movie.title || '';
    if (overview) overview.value = movie.overview || '';
    if (coverUrl) coverUrl.value = movie.cover_url || '';
    if (fragman) fragman.value = movie.fragman || '';
    if (watchUrl) watchUrl.value = movie.watch_url || '';
    if (imdb) imdb.value = movie.imdb || '';
    if (runtime) runtime.value = movie.run_time_min || '';
    if (adult) adult.checked = movie.adult || false;

    if (imageElement) {
        imageElement.src = movie.cover_url || defaultImage;
        imageElement.onerror = function() {
            if (this.src !== defaultImage) {
                this.src = defaultImage;
                this.onerror = null;
            }
        };
    }

    if (categoryToggle) {
        const categoryToggle = document.getElementById('categoryDropdown');
        categoryToggle.textContent = movie.category ? movie.category.name : 'No category selected';

        const categoryItems = document.querySelectorAll('#category-items .category-item');
        categoryItems.forEach((item) => {
            const categoryId = parseInt(item.getAttribute('data-id'));
            if (movie.category && movie.category.id === categoryId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    if (dropdownToggle) {
        const selectedActors = movie.actors
            ? movie.actors.map((actor) => `${actor.name} ${actor.surname}`).join(', ')
            : 'No actors selected';
        dropdownToggle.textContent = selectedActors;

        const dropdownItems = document.querySelectorAll('#dropdown-items .dropdown-item');
        dropdownItems.forEach((item) => {
            const actorId = parseInt(item.getAttribute('data-id'));
            if (Array.isArray(movie.actors) && movie.actors.some((actor) => actor.id === actorId)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
}

async function updateMovie() {
    if (isSubmitting) return;
    isSubmitting = true;

    const apiURLMovieEdit = `${apiURLMovieCreate}/${movieToEditId}`;

    let isValid = true;

    const inputs = document.querySelectorAll('#movieForm input, #movieForm textarea, #movieForm select');
    inputs.forEach((input) => {
        if (input.type !== 'checkbox' && input.value.trim() === '') {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });

    if (!runtime || isNaN(runtime.value) || runtime.value.trim() === '' || runtime.value.length > 4 || parseInt(runtime.value) <= 0) {
        if (runtime) runtime.classList.add('error2');
        isValid = false;
    } else {
        if (runtime) runtime.classList.remove('error2');
    }

    if (!imdb || !/^\d{1,2}(\.\d{1})?$/.test(imdb.value)) {
        if (imdb) imdb.classList.add('error2');
        isValid = false;
    } else {
        if (imdb) imdb.classList.remove('error2');
    }

    const selectedActors = Array.from(
        document.querySelectorAll('#dropdown-items .dropdown-item.selected')
    ).map((actor) => parseInt(actor.getAttribute('data-id'))).filter(id => !isNaN(id));

    const selectedCategory = parseInt(
        document.querySelector('#category-items .category-item.selected')?.getAttribute('data-id')
    );

    if (!selectedCategory || isNaN(selectedCategory)) {
        if (categoryToggle) categoryToggle.classList.add('error');
        isValid = false;
    } else {
        if (categoryToggle) categoryToggle.classList.remove('error');
    }

    if (selectedActors.length === 0) {
        if (dropdownToggle) dropdownToggle.classList.add('error');
        isValid = false;
    } else {
        if (dropdownToggle) dropdownToggle.classList.remove('error');
    }

    if (!isValid) {
        isSubmitting = false;
        return;
    }

    const movieData = {
        title: title ? title.value.trim() : '',
        cover_url: coverUrl ? coverUrl.value.trim() : '',
        fragman: fragman ? fragman.value.trim() : '',
        watch_url: watchUrl ? watchUrl.value.trim() : '',
        adult: adult ? adult.checked : false,
        run_time_min: runtime ? parseInt(runtime.value, 10) : 120,
        imdb: imdb ? parseFloat(imdb.value).toFixed(1) : '0.0',
        category: [selectedCategory],
        actors: selectedActors,
        overview: overview ? overview.value.trim() : ''
    };

    try {
        const token = getToken();
        if (!token) {
            isSubmitting = false;
            return;
        }
        const response = await fetch(apiURLMovieEdit, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData)
        });

        if (!response.ok) {
            const errorResponse = await response.json().catch(() => ({}));
            showToast('Error: ' + (errorResponse.message || 'Unknown error'), 'error');
            isSubmitting = false;
            return;
        }

        showToast('Movie updated successfully!', 'success');
        fetchMovies();
        closeModal();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        isSubmitting = false;
    }
}

// Film sil
function removeMovie(movieId) {
    movieToRemoveId = movieId;
    openRemoveModal();
}

function openRemoveModal() {
    const removeModal = document.getElementById('removeModal');
    if (removeModal) removeModal.style.display = 'flex';
}

function closeRemoveModal() {
    const removeModal = document.getElementById('removeModal');
    if (removeModal) removeModal.style.display = 'none';
    movieToRemoveId = null;
}

const yesBtn = document.getElementById('confirmDeleteBtn') || document.getElementById('yes-btn');
if (yesBtn) {
    yesBtn.addEventListener('click', async function() {
        if (!movieToRemoveId) {
            closeRemoveModal();
            return;
        }

        try {
            const token = getToken();
            if (!token) {
                closeRemoveModal();
                return;
            }
            const response = await fetch(
                `${apiURLMovieCreate}/${movieToRemoveId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error('Error response:', errorResponse);
                showToast('Movie could not be deleted', 'error');
                closeRemoveModal();
                return;
            }

            showToast('Movie deleted successfully!', 'success');
            closeRemoveModal();
            fetchMovies();
        } catch (error) {
            console.error('Error while deleting the movie:', error);
            showToast('Error: ' + error.message, 'error');
            closeRemoveModal();
        }
    });
}

// Submit düyməsi
if (submitBtn) {
    submitBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        const btnText = submitBtn.textContent;

        if (btnText === 'Submit' || btnText === 'Create') {
            await createMovie();
        } else if (btnText === 'Edit') {
            await updateMovie();
        }
    });
}

// Şəkil preview
if (imageElement) {
    imageElement.onerror = function() {
        if (this.src !== defaultImage) {
            this.src = defaultImage;
            this.onerror = null;
        }
    };
}

if (coverUrl) {
    coverUrl.addEventListener('input', function() {
        const newSrc = this.value.trim();
        if (imageElement) {
            imageElement.src = newSrc || defaultImage;
            imageElement.onerror = function() {
                if (this.src !== defaultImage) {
                    this.src = defaultImage;
                    this.onerror = null;
                }
            };
        }
    });
}

// Səhifə yüklənəndə
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchMovies);
} else {
    fetchMovies();
}

// Global funksiyalar
window.editMovie = editMovie;
window.removeMovie = removeMovie;
window.openCreateModal = openModalCreate;
window.submitMovie = function() {
    if (movieToEditId) {
        updateMovie();
    } else {
        createMovie();
    }
};
window.confirmRemove = function() {
    if (yesBtn) yesBtn.click();
};
