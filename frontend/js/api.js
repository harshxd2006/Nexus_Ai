// API CONFIGURATION - ENHANCED DEBUG VERSION
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

const API_BASE_URL = isLocalhost 
    ? 'http://localhost:5000/api' 
    : 'https://nexus-ai-sjfi.onrender.com/api';

console.log('========================================');
console.log('🌐 API Configuration');
console.log('Environment:', isLocalhost ? 'LOCAL' : 'PRODUCTION');
console.log('API Base URL:', API_BASE_URL);
console.log('========================================');

function getToken() {
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    if (token) {
        console.log('Token preview:', token.substring(0, 20) + '...');
    }
    return token;
}

function getAuthHeaders() {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
    console.log('Request headers:', Object.keys(headers));
    return headers;
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: getAuthHeaders(),
            mode: 'cors',
            credentials: 'omit'
        };

        if (body) {
            options.body = JSON.stringify(body);
            console.log('Request body:', body);
        }

        console.log(`📡 API Request: ${method} ${url}`);

        const response = await fetch(url, options);
        
        console.log(`📨 Response Status: ${response.status} ${response.statusText}`);

        if (response.status === 401) {
            console.warn('⚠️ Unauthorized - clearing auth data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login.html') {
                window.location.href = '/login.html';
            }
            return { success: false, message: 'Session expired' };
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ Response is not JSON:', contentType);
            const text = await response.text();
            console.error('Response text:', text.substring(0, 200));
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
        console.log('=== AUTH: Register ===');
        return await apiRequest('/auth/signup', 'POST', {
            name, email, password, confirmPassword
        });
    },

    login: async (email, password) => {
        console.log('=== AUTH: Login ===');
        return await apiRequest('/auth/login', 'POST', { email, password });
    },

    logout: async () => {
        console.log('=== AUTH: Logout ===');
        return await apiRequest('/auth/logout', 'POST');
    },

    verifyToken: async () => {
        console.log('=== AUTH: Verify Token ===');
        return await apiRequest('/auth/verify', 'GET');
    }
};

// TOOLS API
const toolsAPI = {
    getAll: async (page = 1, limit = 10, category = null) => {
        let endpoint = `/tools?page=${page}&limit=${limit}`;
        if (category) endpoint += `&category=${encodeURIComponent(category)}`;
        
        console.log('=== TOOLS: Get All ===');
        console.log('Params:', { page, limit, category });
        
        return await apiRequest(endpoint, 'GET');
    },

    getById: async (toolId) => {
        console.log('=== TOOLS: Get By ID ===');
        console.log('Tool ID:', toolId);
        return await apiRequest(`/tools/${toolId}`, 'GET');
    },

    create: async (toolData) => {
        console.log('=== TOOLS: Create ===');
        return await apiRequest('/tools', 'POST', toolData);
    },

    search: async (query, page = 1, limit = 12) => {
        const endpoint = `/tools/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`;
        console.log('=== TOOLS: Search ===');
        console.log('Query:', query);
        return await apiRequest(endpoint, 'GET');
    },

    getTrending: async (limit = 10) => {
        console.log('=== TOOLS: Get Trending ===');
        return await apiRequest(`/tools/trending/popular?limit=${limit}`, 'GET');
    },

    getByCategory: async (category, page = 1, limit = 10) => {
        console.log('=== TOOLS: Get By Category ===');
        console.log('Category:', category);
        return await apiRequest(`/tools/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`, 'GET');
    },

    addToFavorites: async (toolId) => {
        console.log('=== TOOLS: Add to Favorites ===');
        console.log('Tool ID:', toolId);
        return await apiRequest(`/tools/${toolId}/favorite`, 'POST');
    },

    removeFromFavorites: async (toolId) => {
        console.log('=== TOOLS: Remove from Favorites ===');
        console.log('Tool ID:', toolId);
        return await apiRequest(`/tools/${toolId}/favorite`, 'DELETE');
    }
};

// REVIEWS API - ENHANCED
const reviewsAPI = {
    getAll: async (toolId, page = 1, limit = 10) => {
        console.log('=== REVIEWS: Get All ===');
        console.log('Tool ID:', toolId);
        console.log('Page:', page, 'Limit:', limit);
        
        const endpoint = `/reviews?toolId=${toolId}&page=${page}&limit=${limit}`;
        console.log('Full endpoint:', API_BASE_URL + endpoint);
        
        const result = await apiRequest(endpoint, 'GET');
        console.log('Reviews result:', result);
        return result;
    },

    create: async (reviewData) => {
        console.log('=== REVIEWS: Create ===');
        console.log('Review data:', reviewData);
        console.log('Tool ID:', reviewData.toolId);
        console.log('Rating:', reviewData.rating);
        console.log('Comment length:', reviewData.comment?.length);
        
        const result = await apiRequest('/reviews', 'POST', reviewData);
        console.log('Create review result:', result);
        return result;
    },

    update: async (reviewId, reviewData) => {
        console.log('=== REVIEWS: Update ===');
        console.log('Review ID:', reviewId);
        return await apiRequest(`/reviews/${reviewId}`, 'PUT', reviewData);
    },

    delete: async (reviewId) => {
        console.log('=== REVIEWS: Delete ===');
        console.log('Review ID:', reviewId);
        return await apiRequest(`/reviews/${reviewId}`, 'DELETE');
    }
};

// USER API
const userAPI = {
    getProfile: async () => {
        console.log('=== USER: Get Profile ===');
        return await apiRequest('/users/me/profile', 'GET');
    },

    updateProfile: async (userData) => {
        console.log('=== USER: Update Profile ===');
        return await apiRequest('/users/me/profile', 'PUT', userData);
    },

    updateUserProfile: async (userData) => {
        console.log('=== USER: Update User Profile ===');
        return await apiRequest('/users/me/profile', 'PUT', userData);
    },

    getFavorites: async (page = 1, limit = 10) => {
        console.log('=== USER: Get Favorites ===');
        return await apiRequest(`/users/favorites?page=${page}&limit=${limit}`, 'GET');
    },

    getReviews: async (page = 1, limit = 10) => {
        console.log('=== USER: Get Reviews ===');
        console.log('Page:', page, 'Limit:', limit);
        const result = await apiRequest(`/users/reviews?page=${page}&limit=${limit}`, 'GET');
        console.log('User reviews result:', result);
        return result;
    },

    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        console.log('=== USER: Change Password ===');
        return await apiRequest('/users/me/password', 'PUT', {
            currentPassword, newPassword, confirmPassword
        });
    },

    deleteAccount: async (password) => {
        console.log('=== USER: Delete Account ===');
        return await apiRequest('/users/me/account', 'DELETE', { password });
    },

    removeFavorite: async (toolId) => {
        console.log('=== USER: Remove Favorite ===');
        console.log('Tool ID:', toolId);
        return await apiRequest(`/tools/${toolId}/favorite`, 'DELETE');
    },

    deleteReview: async (reviewId) => {
        console.log('=== USER: Delete Review ===');
        console.log('Review ID:', reviewId);
        return await apiRequest(`/reviews/${reviewId}`, 'DELETE');
    }
};

// ADMIN API
const adminAPI = {
    getStats: async () => {
        console.log('=== ADMIN: Get Stats ===');
        return await apiRequest('/admin/dashboard/stats', 'GET');
    },

    getDashboardStats: async () => {
        console.log('=== ADMIN: Get Dashboard Stats ===');
        return await apiRequest('/admin/dashboard/stats', 'GET');
    },

    getUsers: async (page = 1, limit = 20) => {
        console.log('=== ADMIN: Get Users ===');
        return await apiRequest(`/admin/users?page=${page}&limit=${limit}`, 'GET');
    },

    getAllUsers: async (page = 1, limit = 20) => {
        console.log('=== ADMIN: Get All Users ===');
        return await apiRequest(`/admin/users?page=${page}&limit=${limit}`, 'GET');
    },

    getTools: async (page = 1, limit = 20) => {
        console.log('=== ADMIN: Get Tools ===');
        return await apiRequest(`/admin/tools?page=${page}&limit=${limit}`, 'GET');
    },

    getAllTools: async (page = 1, limit = 20) => {
        console.log('=== ADMIN: Get All Tools ===');
        return await apiRequest(`/admin/tools?page=${page}&limit=${limit}`, 'GET');
    },

    getPendingTools: async (page = 1, limit = 20) => {
        console.log('=== ADMIN: Get Pending Tools ===');
        return await apiRequest(`/admin/tools/pending?page=${page}&limit=${limit}`, 'GET');
    },

    approveTool: async (toolId) => {
        console.log('=== ADMIN: Approve Tool ===');
        console.log('Tool ID:', toolId);
        return await apiRequest(`/admin/tools/${toolId}/approve`, 'POST');
    },

    rejectTool: async (toolId, reason) => {
        console.log('=== ADMIN: Reject Tool ===');
        console.log('Tool ID:', toolId);
        return await apiRequest(`/admin/tools/${toolId}/reject`, 'POST', { reason });
    },

    deleteTool: async (toolId) => {
        console.log('=== ADMIN: Delete Tool ===');
        console.log('Tool ID:', toolId);
        return await apiRequest(`/admin/tools/${toolId}`, 'DELETE');
    },

    banUser: async (userId, reason = '') => {
        console.log('=== ADMIN: Ban User ===');
        console.log('User ID:', userId);
        return await apiRequest(`/admin/users/${userId}/ban`, 'POST', { reason });
    },

    getReports: async (page = 1, limit = 20) => {
        console.log('=== ADMIN: Get Reports ===');
        return await apiRequest(`/admin/reviews/flagged?page=${page}&limit=${limit}`, 'GET');
    },

    getFlaggedReviews: async (page = 1, limit = 20) => {
        console.log('=== ADMIN: Get Flagged Reviews ===');
        return await apiRequest(`/admin/reviews/flagged?page=${page}&limit=${limit}`, 'GET');
    },

    deleteReview: async (reviewId) => {
        console.log('=== ADMIN: Delete Review ===');
        console.log('Review ID:', reviewId);
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
console.log('========================================');

// Test the API connection on load
console.log('🧪 Testing API connection...');
fetch(`${API_BASE_URL.replace('/api', '')}/api/health`)
    .then(r => r.json())
    .then(data => {
        console.log('✅ API Connection Test:', data);
        console.log('🎉 Backend is responding!');
        console.log('========================================');
    })
    .catch(err => {
        console.error('❌ API Connection Test Failed:', err.message);
        console.error('⚠️ The backend may be sleeping or not responding.');
        console.error('💡 Try refreshing in 30-60 seconds if on free tier.');
        console.log('========================================');
    });