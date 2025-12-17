// API CONFIGURATION
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

        console.log(`📡 API Request: ${method} ${endpoint}`);

        const response = await fetch(url, options);
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login.html') {
                window.location.href = '/login.html';
            }
            return { success: false, message: 'Session expired' };
        }

        const data = await response.json();
        console.log(`✅ API Response:`, data);
        return data;
    } catch (error) {
        console.error('❌ API Error:', error);
        return { success: false, message: 'Network error: ' + error.message };
    }
}

// AUTHENTICATION API
const authAPI = {
    register: async (name, email, password, confirmPassword) => {
        return await apiRequest('/auth/register', 'POST', {
            name, email, password, confirmPassword
        });
    },

    login: async (email, password) => {
        return await apiRequest('/auth/login', 'POST', { email, password });
    },

    logout: async () => {
        return await apiRequest('/auth/logout', 'POST');
    },

    verifyToken: async () => {
        return await apiRequest('/auth/verify', 'GET');
    }
};

// TOOLS API
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

    search: async (query, page = 1, limit = 12) => {
        return await apiRequest(`/tools/search/${query}?page=${page}&limit=${limit}`, 'GET');
    },

    getTrending: async (limit = 10) => {
        return await apiRequest(`/tools/trending/popular?limit=${limit}`, 'GET');
    },

    getByCategory: async (category, page = 1, limit = 10) => {
        return await apiRequest(`/tools/category/${category}?page=${page}&limit=${limit}`, 'GET');
    },

    addToFavorites: async (toolId) => {
        return await apiRequest(`/tools/${toolId}/favorite`, 'POST');
    },

    removeFavorite: async (toolId) => {
        return await apiRequest(`/tools/${toolId}/favorite`, 'DELETE');
    }
};

// REVIEWS API
const reviewsAPI = {
    getAll: async (toolId, page = 1, limit = 10) => {
        return await apiRequest(`/reviews?toolId=${toolId}&page=${page}&limit=${limit}`, 'GET');
    },

    create: async (reviewData) => {
        return await apiRequest('/reviews', 'POST', reviewData);
    },

    update: async (reviewId, reviewData) => {
        return await apiRequest(`/reviews/${reviewId}`, 'PUT', reviewData);
    },

    delete: async (reviewId) => {
        return await apiRequest(`/reviews/${reviewId}`, 'DELETE');
    }
};

// USER API
const userAPI = {
    getProfile: async () => {
        return await apiRequest('/users/me/profile', 'GET');
    },

    updateProfile: async (userData) => {
        return await apiRequest('/users/me/profile', 'PUT', userData);
    },

    getFavorites: async (page = 1, limit = 10) => {
        return await apiRequest(`/users/favorites?page=${page}&limit=${limit}`, 'GET');
    },

    getReviews: async (page = 1, limit = 10) => {
        return await apiRequest(`/users/reviews?page=${page}&limit=${limit}`, 'GET');
    },

    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        return await apiRequest('/users/me/password', 'PUT', {
            currentPassword, newPassword, confirmPassword
        });
    }
};

// ADMIN API
const adminAPI = {
    getStats: async () => {
        return await apiRequest('/admin/dashboard/stats', 'GET');
    },

    getUsers: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/users?page=${page}&limit=${limit}`, 'GET');
    },

    getTools: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/tools?page=${page}&limit=${limit}`, 'GET');
    },

    getPendingTools: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/tools/pending?page=${page}&limit=${limit}`, 'GET');
    },

    approveTool: async (toolId) => {
        return await apiRequest(`/admin/tools/${toolId}/approve`, 'POST');
    },

    rejectTool: async (toolId, reason) => {
        return await apiRequest(`/admin/tools/${toolId}/reject`, 'POST', { reason });
    },

    deleteTool: async (toolId) => {
        return await apiRequest(`/admin/tools/${toolId}`, 'DELETE');
    },

    banUser: async (userId, reason = '') => {
        return await apiRequest(`/admin/users/${userId}/ban`, 'POST', { reason });
    },

    getReports: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/reviews/flagged?page=${page}&limit=${limit}`, 'GET');
    }
};

// EXPORT
window.authAPI = authAPI;
window.userAPI = userAPI;
window.toolsAPI = toolsAPI;
window.reviewsAPI = reviewsAPI;
window.adminAPI = adminAPI;

console.log('✅ API module loaded successfully');