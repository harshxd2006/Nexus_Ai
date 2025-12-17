// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${getToastColor(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        font-family: 'Segoe UI', sans-serif;
        font-weight: 500;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getToastColor(type) {
    const colors = {
        'success': '#4CAF50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#64c8ff'
    };
    return colors[type] || colors['info'];
}

// ============================================
// LOADING INDICATOR
// ============================================

function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'app-loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9998;
        backdrop-filter: blur(5px);
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 4px solid rgba(100, 200, 255, 0.3);
        border-top: 4px solid #64c8ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;

    loader.appendChild(spinner);

    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.innerHTML = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.3s ease';
        setTimeout(() => loader.remove(), 300);
    }
}

// ============================================
// NAVBAR MANAGEMENT
// ============================================

function updateNavbar() {
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        // USER IS LOGGED IN
        try {
            const userData = JSON.parse(user);
            const userName = userData.name || userData.email || 'User';
            const userInitial = userName.charAt(0).toUpperCase();

            navAuth.innerHTML = `
                <div class="nav-auth-links" style="display: flex; gap: 1.5rem; align-items: center;">
                    <span style="color: #64c8ff; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="width: 32px; height: 32px; background: linear-gradient(135deg, #64c8ff, #ff1493); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${userInitial}</span>
                        ${userName}
                    </span>
                    <a href="/profile.html" class="nav-link" style="color: #b0b0b0; text-decoration: none; transition: color 0.3s ease;">Profile</a>
                    <button onclick="logout()" class="nav-link" style="background: none; border: none; cursor: pointer; color: #b0b0b0; transition: color 0.3s ease; font-weight: 500;">Logout</button>
                </div>
            `;
        } catch (error) {
            console.error('Error parsing user data:', error);
            showLoginLinks(navAuth);
        }
    } else {
        // USER IS NOT LOGGED IN
        showLoginLinks(navAuth);
    }
}

function showLoginLinks(navAuth) {
    navAuth.innerHTML = `
        <div class="nav-auth-links" style="display: flex; gap: 1rem; align-items: center;">
            <a href="/login.html" class="nav-link" style="color: #b0b0b0; text-decoration: none; font-weight: 500; transition: color 0.3s ease;">Login</a>
            <a href="/register.html" class="nav-link" style="padding: 0.6rem 1.3rem; background: linear-gradient(135deg, #64c8ff, #4a9fd8); border-radius: 25px; color: white; font-weight: 600; text-decoration: none; transition: all 0.3s ease; display: inline-block;">Sign Up</a>
        </div>
    `;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberEmail');
        showToast('✅ Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    }
}

// ============================================
// DATE FORMATTING
// ============================================

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// TIME AGO FORMATTER
// ============================================

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';

    return Math.floor(seconds) + ' seconds ago';
}

// ============================================
// CREATE TOOL CARD HTML
// ============================================

function createToolCard(tool) {
    const ratingStars = tool.averageRating ? '⭐'.repeat(Math.round(tool.averageRating)) : 'N/A';
    
    return `
        <div class="tool-card">
            <div class="tool-header">
                <img src="${tool.logo || 'https://via.placeholder.com/70?text=AI'}" 
                     alt="${tool.name}" 
                     class="tool-logo"
                     onerror="this.src='https://via.placeholder.com/70?text=AI'">
                <div class="tool-info">
                    <h3>${tool.name}</h3>
                    <p class="tool-category">${tool.category || 'AI Tool'}</p>
                </div>
            </div>

            <p class="tool-description">${tool.description.substring(0, 120)}...</p>

            <div class="tool-stats">
                <span class="rating">${ratingStars} ${tool.averageRating ? tool.averageRating.toFixed(1) : 'New'}</span>
                <span class="reviews">${tool.reviewCount || 0} reviews</span>
            </div>

            <div class="tool-buttons">
                <a href="/tool-detail.html?id=${tool._id}" class="btn btn-primary">View Details</a>
                <button onclick="toggleFavorite('${tool._id}')" class="btn btn-secondary">❤️ Save</button>
            </div>
        </div>
    `;
}

// ============================================
// RENDER TOOLS LIST
// ============================================

function renderToolsList(tools, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
    }

    if (!tools || tools.length === 0) {
        container.innerHTML = '<p class="no-results">No tools found</p>';
        return;
    }

    container.innerHTML = tools.map(tool => createToolCard(tool)).join('');
}

// ============================================
// TOGGLE FAVORITE
// ============================================

async function toggleFavorite(toolId) {
    if (!localStorage.getItem('token')) {
        showToast('Please login to save favorites', 'warning');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
        return;
    }

    showLoading();
    try {
        const response = await toolsAPI.addFavorite(toolId);
        hideLoading();

        if (response.success) {
            showToast('✅ Added to favorites!', 'success');
        } else {
            showToast('❌ Failed to add favorite', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Error adding favorite:', error);
        showToast('❌ An error occurred', 'error');
    }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/\d/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }

    return { valid: true, message: 'Password is valid' };
}

// ============================================
// URL UTILITIES
// ============================================

function getUrlParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function setUrlParameter(name, value) {
    const params = new URLSearchParams(window.location.search);
    params.set(name, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

// ============================================
// TEXT UTILITIES
// ============================================

function truncateText(text, length = 100) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ============================================
// SCROLL UTILITIES
// ============================================

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================
// DEBOUNCE FUNCTION
// ============================================

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// ============================================
// PAGINATION
// ============================================

function createPaginationButtons(currentPage, totalPages, onPageClick) {
    let html = '';

    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="${onPageClick}(${currentPage - 1})">← Previous</button>`;
    }

    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        if (i === currentPage) {
            html += `<button class="page-btn active">${i}</button>`;
        } else {
            html += `<button class="page-btn" onclick="${onPageClick}(${i})">${i}</button>`;
        }
    }

    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="${onPageClick}(${currentPage + 1})">Next →</button>`;
    }

    return html;
}

// ============================================
// REVIEW FUNCTIONS
// ============================================

async function markHelpful(reviewId) {
    if (!localStorage.getItem('token')) {
        showToast('Please login to mark reviews as helpful', 'warning');
        return;
    }

    showLoading();
    try {
        const response = await reviewsAPI.markHelpful(reviewId);
        hideLoading();

        if (response.success) {
            showToast('👍 Thanks for your feedback!', 'success');
            location.reload();
        } else {
            showToast('Failed to mark as helpful', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Error marking helpful:', error);
        showToast('❌ An error occurred', 'error');
    }
}

async function flagReview(reviewId) {
    const reason = prompt('Why are you reporting this review?');
    if (!reason) return;

    showLoading();
    try {
        const response = await reviewsAPI.flagReview(reviewId, reason);
        hideLoading();

        if (response.success) {
            showToast('🚩 Review reported successfully', 'success');
        } else {
            showToast('Failed to report review', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Error flagging review:', error);
        showToast('❌ An error occurred', 'error');
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

let currentSearchPage = 1;

async function performSearch(query, page = 1) {
    if (query.length < 2) {
        showToast('Please enter at least 2 characters', 'warning');
        return;
    }

    showLoading();

    try {
        const response = await toolsAPI.search(query, page, 12);
        hideLoading();

        if (response.success) {
            currentSearchPage = page;
            renderToolsList(response.data.tools, 'tools-container');
            
            if (response.data.totalPages > 1) {
                const pagination = document.getElementById('pagination');
                if (pagination) {
                    pagination.innerHTML = createPaginationButtons(
                        page,
                        response.data.totalPages,
                        'goToSearchPage'
                    );
                }
            }
        } else {
            showToast('❌ ' + (response.message || 'Search failed'), 'error');
            const container = document.getElementById('tools-container');
            if (container) {
                container.innerHTML = '<p class="no-results">No tools found for your search</p>';
            }
        }
    } catch (error) {
        hideLoading();
        console.error('Search error:', error);
        showToast('❌ An error occurred while searching', 'error');
    }
}

function goToSearchPage(page) {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    performSearch(query, page);
}

// ============================================
// CATEGORY FILTERING
// ============================================

async function filterByCategory(category, page = 1) {
    showLoading();

    try {
        const response = await toolsAPI.getByCategory(category, page, 12);
        hideLoading();

        if (response.success) {
            renderToolsList(response.data.tools, 'tools-container');
            showToast(`✅ Showing ${response.data.tools.length} tools in ${category}`, 'success');
        } else {
            showToast('❌ Failed to load category', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Category filter error:', error);
        showToast('❌ An error occurred', 'error');
    }
}

// ============================================
// INITIALIZE APP ON LOAD
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 NexusAI App Initialized');

    // Update navbar first
    updateNavbar();

    // Setup search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query.length >= 2) {
                    performSearch(query, 1);
                }
            }
        });

        // Real-time search suggestions (debounced)
        searchInput.addEventListener('input', debounce(async (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                console.log('Searching for:', query);
            }
        }, 500));
    }

    // Setup search button
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput ? searchInput.value.trim() : '';
            if (query.length >= 2) {
                performSearch(query, 1);
            } else {
                showToast('Please enter at least 2 characters', 'warning');
            }
        });
    }

    // Add scroll-to-top button
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #64c8ff, #ff1493);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        z-index: 100;
        font-size: 1.5rem;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(100, 200, 255, 0.3);
    `;

    document.body.appendChild(scrollBtn);

    // Show/hide scroll button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.style.display = 'flex';
            scrollBtn.style.alignItems = 'center';
            scrollBtn.style.justifyContent = 'center';
        } else {
            scrollBtn.style.display = 'none';
        }
    });

    // Scroll to top on click
    scrollBtn.addEventListener('click', scrollToTop);

    // Add hover effect
    scrollBtn.addEventListener('mouseover', () => {
        scrollBtn.style.transform = 'scale(1.1)';
    });

    scrollBtn.addEventListener('mouseout', () => {
        scrollBtn.style.transform = 'scale(1)';
    });
});

// ============================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ============================================

window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.updateNavbar = updateNavbar;
window.logout = logout;
window.formatDate = formatDate;
window.timeAgo = timeAgo;
window.renderToolsList = renderToolsList;
window.toggleFavorite = toggleFavorite;
window.markHelpful = markHelpful;
window.flagReview = flagReview;
window.performSearch = performSearch;
window.goToSearchPage = goToSearchPage;
window.filterByCategory = filterByCategory;
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.scrollToTop = scrollToTop;