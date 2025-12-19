// API CONFIGURATION - FIXED VERSION
// API CONFIGURATION - FIXED VERSION
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

const API_BASE_URL = isLocalhost 
    ? 'http://localhost:5000/api' 
    : 'https://nexus-ai-sjfi.onrender.com/api';  // ✅ FIXED: Removed space and added /api

console.log('🌐 Environment:', isLocalhost ? 'LOCAL' : 'PRODUCTION');
console.log('🌐 API Base URL:', API_BASE_URL);

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
            headers: getAuthHeaders(),
            mode: 'cors', // Explicitly set CORS mode
            credentials: 'omit' // Changed from 'include' - this was causing issues
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        console.log(`📡 API Request: ${method} ${url}`);
        console.log('📋 Options:', options);

        const response = await fetch(url, options);
        
        console.log(`📨 Response Status: ${response.status} ${response.statusText}`);

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login.html') {
                window.location.href = '/login.html';
            }
            return { success: false, message: 'Session expired' };
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ Response is not JSON:', contentType);
            const text = await response.text();
            console.error('Response text:', text);
            return { 
                success: false, 
                message: 'Invalid response from server',
                details: text.substring(0, 100)
            };
        }

        const data = await response.json();
        console.log(`✅ API Response:`, data);
        return data;

    } catch (error) {
        console.error('❌ API Error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        // More specific error messages
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            return { 
                success: false, 
                message: 'Cannot connect to server. Please check your internet connection.',
                details: 'The backend server may be sleeping (free tier) or not responding. Try refreshing in 30 seconds.',
                networkError: true
            };
        }
        
        return { 
            success: false, 
            message: error.message || 'Network error occurred',
            details: error.stack
        };
    }
}

// AUTHENTICATION API
const authAPI = {
    register: async (name, email, password, confirmPassword) => {
        return await apiRequest('/auth/signup', 'POST', {
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

// TOOLS API - FIXED
const toolsAPI = {
    getAll: async (page = 1, limit = 10, category = null) => {
        let endpoint = `/tools?page=${page}&limit=${limit}`;
        if (category) endpoint += `&category=${encodeURIComponent(category)}`;
        
        console.log('🔧 toolsAPI.getAll called:', { page, limit, category });
        console.log('🔗 Full URL:', API_BASE_URL + endpoint);
        
        return await apiRequest(endpoint, 'GET');
    },

    getById: async (toolId) => {
        return await apiRequest(`/tools/${toolId}`, 'GET');
    },

    create: async (toolData) => {
        return await apiRequest('/tools', 'POST', toolData);
    },

    search: async (query, page = 1, limit = 12) => {
        const endpoint = `/tools/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`;
        console.log('🔍 Search endpoint:', API_BASE_URL + endpoint);
        return await apiRequest(endpoint, 'GET');
    },

    getTrending: async (limit = 10) => {
        return await apiRequest(`/tools/trending/popular?limit=${limit}`, 'GET');
    },

    getByCategory: async (category, page = 1, limit = 10) => {
        return await apiRequest(`/tools/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`, 'GET');
    },

    addToFavorites: async (toolId) => {
        return await apiRequest(`/tools/${toolId}/favorite`, 'POST');
    },

    removeFromFavorites: async (toolId) => {
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

    updateUserProfile: async (userData) => {
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
    },

    deleteAccount: async (password) => {
        return await apiRequest('/users/me/account', 'DELETE', { password });
    },

    removeFavorite: async (toolId) => {
        return await apiRequest(`/tools/${toolId}/favorite`, 'DELETE');
    },

    deleteReview: async (reviewId) => {
        return await apiRequest(`/reviews/${reviewId}`, 'DELETE');
    }
};

// ADMIN API
const adminAPI = {
    getStats: async () => {
        return await apiRequest('/admin/dashboard/stats', 'GET');
    },

    getDashboardStats: async () => {
        return await apiRequest('/admin/dashboard/stats', 'GET');
    },

    getUsers: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/users?page=${page}&limit=${limit}`, 'GET');
    },

    getAllUsers: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/users?page=${page}&limit=${limit}`, 'GET');
    },

    getTools: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/tools?page=${page}&limit=${limit}`, 'GET');
    },

    getAllTools: async (page = 1, limit = 20) => {
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
    },

    getFlaggedReviews: async (page = 1, limit = 20) => {
        return await apiRequest(`/admin/reviews/flagged?page=${page}&limit=${limit}`, 'GET');
    },

    deleteReview: async (reviewId) => {
        return await apiRequest(`/admin/reviews/${reviewId}`, 'DELETE');
    }
};

// EXPORT
window.authAPI = authAPI;
window.userAPI = userAPI;
window.toolsAPI = toolsAPI;
window.reviewsAPI = reviewsAPI;
window.adminAPI = adminAPI;
window.API_BASE_URL = API_BASE_URL;

console.log('✅ API module loaded successfully');
console.log('📍 Running in:', isLocalhost ? 'DEVELOPMENT' : 'PRODUCTION', 'mode');

// Test the API connection on load
console.log('🧪 Testing API connection...');
fetch(`${API_BASE_URL.replace('/api', '')}/api/health`)
    .then(r => r.json())
    .then(data => {
        console.log('✅ API Connection Test:', data);
        console.log('🎉 Backend is responding!');
    })
    .catch(err => {
        console.error('❌ API Connection Test Failed:', err.message);
        console.error('⚠️ The backend may be sleeping or not responding.');
        console.error('💡 Try refreshing in 30-60 seconds if on free tier.');
    });