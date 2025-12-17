// ============================================
// API CONFIGURATION
// ============================================

const API_BASE_URL = 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('token');
}

function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: getAuthHeaders()
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        
        // Handle 401 - Token expired
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
            return { success: false, message: 'Session expired' };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Network error' };
    }
}

// ============================================
// AUTHENTICATION API CALLS
// ============================================

const authAPI = {
    register: async (name, email, password, confirmPassword) => {
        return await apiRequest('/auth/register', 'POST', {
            name,
            email,
            password,
            confirmPassword
        });
    },

    login: async (email, password) => {
        return await apiRequest('/auth/login', 'POST', {
            email,
            password
        });
    },

    logout: async () => {
        return await apiRequest('/auth/logout', 'POST');
    },

    verifyToken: async () => {
        return await apiRequest('/auth/verify', 'GET');
    },

    refreshToken: async () => {
        return await apiRequest('/auth/refresh', 'POST');
    },

    forgotPassword: async (email) => {
        return await apiRequest('/auth/forgot-password', 'POST', { email });
    },

    resetPassword: async (token, newPassword, confirmPassword) => {
        return await apiRequest('/auth/reset-password', 'POST', {
            token,
            newPassword,
            confirmPassword
        });
    }
};

// ============================================
// USER PROFILE API CALLS
// ============================================

const userAPI = {
    getProfile: async () => {
        return await apiRequest('/users/profile', 'GET');
    },

    updateProfile: async (userData) => {
        return await apiRequest('/users/profile', 'PUT', userData);
    },

    updateAvatar: async (avatarUrl) => {
        return await apiRequest('/users/profile/avatar', 'PUT', { avatarUrl });
    },

    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        return await apiRequest('/users/change-password', 'POST', {
            currentPassword,
            newPassword,
            confirmPassword
        });
    },

    getMyFavorites: async (page = 1, limit = 10) => {
        return await apiRequest(`/users/favorites?page=${page}&limit=${limit}`, 'GET');
    },

    getFavoriteCount: async () => {
        return await apiRequest('/users/favorites/count', 'GET');
    },

    getMyReviews: async (page = 1, limit = 10) => {
        return await apiRequest(`/users/reviews?page=${page}&limit=${limit}`, 'GET');
    },

    getPublicProfile: async (userId) => {
        return await apiRequest(`/users/${userId}`, 'GET');
    }
};

// ============================================
// TOOLS API CALLS
// ============================================

const toolsAPI = {
    getAll: async (page = 1, limit = 10, category = null) => {
        let endpoint = `/tools?page=${page}&limit=${limit}`;
        if (category) endpoint += `&category=${category}`;
        return await apiRequest(endpoint, 'GET');
    },

    getById: async (toolId) => {
        return await apiRequest(`/tools/${toolId}`, 'GET');
    },

    create: async (toolData) => {
        return await apiRequest('/tools', 'POST', toolData);
    },

    update: async (toolId, toolData) => {
        return await apiRequest(`/tools/${toolId}`, 'PUT', toolData);
    },

    delete: async (toolId) => {
        return await apiRequest(`/tools/${toolId}`, 'DELETE');
    },

    search: async (query, page = 1, limit = 12) => {
        return await apiRequest(`/tools/search?query=${query}&page=${page}&limit=${limit}`, 'GET');
    },

    getTrending: async (limit = 10) => {
        return await apiRequest(`/tools/trending/popular?limit=${limit}`, 'GET');
    },

    getTrendingWeek: async (limit = 10) => {
        return await apiRequest(`/tools/trending/week?limit=${limit}`, 'GET');
    },

    getTrendingMonth: async (limit = 10) => {
        return await apiRequest(`/tools/trending/month?limit=${limit}`, 'GET');
    },

    getTopRated: async (limit = 10) => {
        return await apiRequest(`/tools/top-rated?limit=${limit}`, 'GET');
    },

    getMostReviewed: async (limit = 10) => {
        return await apiRequest(`/tools/most-reviewed?limit=${limit}`, 'GET');
    },

    getByCategory: async (category, page = 1, limit = 10) => {
        return await apiRequest(
            `/tools/category/${category}?page=${page}&limit=${limit}`,
            'GET'
        );
    },

    addFavorite: async (toolId) => {
        return await apiRequest(`/tools/${toolId}/favorite`, 'POST');
    },

    removeFavorite: async (toolId) => {
        return await apiRequest(`/tools/${toolId}/favorite`, 'DELETE');
    },

    upvote: async (toolId) => {
        return await apiRequest(`/tools/${toolId}/upvote`, 'POST');
    },

    downvote: async (toolId) => {
        return await apiRequest(`/tools/${toolId}/downvote`, 'POST');
    },

    getFavorites: async (page = 1, limit = 10) => {
        return await apiRequest(`/tools/favorites?page=${page}&limit=${limit}`, 'GET');
    },

    incrementViews: async (toolId) => {
        return await apiRequest(`/tools/${toolId}/views`, 'POST');
    }
};

// ============================================
// REVIEWS API CALLS
// ============================================

const reviewsAPI = {
    getAll: async (toolId, page = 1, limit = 10) => {
        return await apiRequest(
            `/reviews?toolId=${toolId}&page=${page}&limit=${limit}`,
            'GET'
        );
    },

    getById: async (reviewId) => {
        return await apiRequest(`/reviews/${reviewId}`, 'GET');
    },

    create: async (reviewData) => {
        return await apiRequest('/reviews', 'POST', reviewData);
    },

    update: async (reviewId, reviewData) => {
        return await apiRequest(`/reviews/${reviewId}`, 'PUT', reviewData);
    },

    delete: async (reviewId) => {
        return await apiRequest(`/reviews/${reviewId}`, 'DELETE');
    },

    markHelpful: async (reviewId) => {
        return await apiRequest(`/reviews/${reviewId}/helpful`, 'POST');
    },

    flagReview: async (reviewId, reason) => {
        return await apiRequest(`/reviews/${reviewId}/flag`, 'POST', { reason });
    },

    getFeatured: async (toolId, limit = 5) => {
        return await apiRequest(`/reviews/featured?toolId=${toolId}&limit=${limit}`, 'GET');
    },

    getMyReviews: async (page = 1, limit = 10) => {
        return await apiRequest(`/reviews/my-reviews?page=${page}&limit=${limit}`, 'GET');
    },

    getUserReviews: async (userId, page = 1, limit = 10) => {
        return await apiRequest(`/reviews/user/${userId}?page=${page}&limit=${limit}`, 'GET');
    }
};

// ============================================
// CATEGORIES API CALLS
// ============================================

const categoriesAPI = {
    getAll: async () => {
        return await apiRequest('/categories', 'GET');
    },

    getById: async (categoryId) => {
        return await apiRequest(`/categories/${categoryId}`, 'GET');
    },

    create: async (categoryData) => {
        return await apiRequest('/categories', 'POST', categoryData);
    },

    update: async (categoryId, categoryData) => {
        return await apiRequest(`/categories/${categoryId}`, 'PUT', categoryData);
    },

    delete: async (categoryId) => {
        return await apiRequest(`/categories/${categoryId}`, 'DELETE');
    }
};

// ============================================
// ADMIN API CALLS
// ============================================

const adminAPI = {
    getStats: async () => {
        return await apiRequest('/admin/stats', 'GET');
    },

    // Get all users
    getUsers: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/users?page=${page}&limit=${limit}`, 'GET');
    },

    // Get all tools (approved)
    getTools: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/tools?page=${page}&limit=${limit}`, 'GET');
    },

    // Get pending tool submissions
    getPendingTools: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/tools/pending?page=${page}&limit=${limit}`, 'GET');
    },

    // Get all reviews
    getReviews: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/reviews?page=${page}&limit=${limit}`, 'GET');
    },

    // Get flagged/reported reviews
    getReports: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/reports?page=${page}&limit=${limit}`, 'GET');
    },

    // Tool management
    approveTool: async (toolId) => {
        return await apiRequest(`/admin/tools/${toolId}/approve`, 'POST');
    },

    rejectTool: async (toolId, reason) => {
        return await apiRequest(`/admin/tools/${toolId}/reject`, 'POST', { reason });
    },

    deleteTool: async (toolId) => {
        return await apiRequest(`/admin/tools/${toolId}`, 'DELETE');
    },

    // User management
    deleteUser: async (userId) => {
        return await apiRequest(`/admin/users/${userId}`, 'DELETE');
    },

    banUser: async (userId, reason = '') => {
        return await apiRequest(`/admin/users/${userId}/ban`, 'POST', { reason });
    },

    unbanUser: async (userId) => {
        return await apiRequest(`/admin/users/${userId}/unban`, 'POST');
    },

    // Report management
    resolveReport: async (reportId) => {
        return await apiRequest(`/admin/reports/${reportId}/resolve`, 'POST');
    },

    dismissReport: async (reportId) => {
        return await apiRequest(`/admin/reports/${reportId}/dismiss`, 'POST');
    }
};

// ============================================
// EXPORT FUNCTIONS
// ============================================

window.authAPI = authAPI;
window.userAPI = userAPI;
window.toolsAPI = toolsAPI;
window.reviewsAPI = reviewsAPI;
window.categoriesAPI = categoriesAPI;
window.adminAPI = adminAPI;
