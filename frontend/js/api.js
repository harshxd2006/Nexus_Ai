// ============================================
// API CONFIGURATION - FINAL FIX
// Matches backend requirements exactly
// ============================================

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
    return token;
}

function getAuthHeaders() {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
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
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            return { 
                success: false, 
                message: 'Cannot connect to server. The backend may be sleeping (free tier). Try refreshing in 30 seconds.',
                networkError: true
            };
        }
        
        return { 
            success: false, 
            message: error.message || 'Network error occurred'
        };
    }
}

// ============================================
// AUTHENTICATION API
// ============================================
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

// ============================================
// TOOLS API
// ============================================
const toolsAPI = {
    getAll: async (page = 1, limit = 10, category = null) => {
        let endpoint = `/tools?page=${page}&limit=${limit}`;
        if (category) endpoint += `&category=${encodeURIComponent(category)}`;
        console.log('=== TOOLS: Get All ===');
        return await apiRequest(endpoint, 'GET');
    },

    getById: async (toolId) => {
        console.log('=== TOOLS: Get By ID ===', toolId);
        return await apiRequest(`/tools/${toolId}`, 'GET');
    },

    create: async (toolData) => {
        console.log('=== TOOLS: Create ===');
        return await apiRequest('/tools', 'POST', toolData);
    },

    search: async (query, page = 1, limit = 12) => {
        const endpoint = `/tools/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`;
        console.log('=== TOOLS: Search ===', query);
        return await apiRequest(endpoint, 'GET');
    },

    getTrending: async (limit = 10) => {
        console.log('=== TOOLS: Get Trending ===');
        return await apiRequest(`/tools/trending/popular?limit=${limit}`, 'GET');
    },

    getByCategory: async (category, page = 1, limit = 10) => {
        console.log('=== TOOLS: Get By Category ===', category);
        return await apiRequest(`/tools/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`, 'GET');
    },

    addToFavorites: async (toolId) => {
        console.log('=== TOOLS: Add to Favorites ===', toolId);
        return await apiRequest(`/tools/${toolId}/favorite`, 'POST');
    },

    removeFromFavorites: async (toolId) => {
        console.log('=== TOOLS: Remove from Favorites ===', toolId);
        return await apiRequest(`/tools/${toolId}/favorite`, 'DELETE');
    }
};

// ============================================
// REVIEWS API - FIXED TO MATCH BACKEND
// ============================================
const reviewsAPI = {
    getAll: async (toolId, page = 1, limit = 10) => {
        console.log('=== REVIEWS: Get All ===');
        console.log('Tool ID:', toolId, 'Page:', page, 'Limit:', limit);
        
        const endpoint = `/reviews?toolId=${toolId}&page=${page}&limit=${limit}`;
        const result = await apiRequest(endpoint, 'GET');
        console.log('Reviews result:', result);
        return result;
    },

    create: async (reviewData) => {
        console.log('=== REVIEWS: Create (FIXED) ===');
        console.log('Input data:', reviewData);
        
        // ✅ CRITICAL VALIDATION - Backend requires ALL 4 fields
        if (!reviewData.toolId) {
            console.error('❌ Missing toolId');
            return { success: false, message: 'Tool ID is required' };
        }
        
        if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
            console.error('❌ Invalid rating:', reviewData.rating);
            return { success: false, message: 'Please select a rating between 1 and 5' };
        }
        
        // Check for comment/content
        const comment = reviewData.comment || reviewData.content || '';
        if (!comment || comment.trim().length === 0) {
            console.error('❌ Missing comment/content');
            return { success: false, message: 'Please write a review' };
        }
        
        if (comment.trim().length < 10) {
            console.error('❌ Comment too short:', comment.length);
            return { success: false, message: 'Review must be at least 10 characters long' };
        }
        
        // ✅ FIX: Backend expects these EXACT 4 fields:
        // - toolId (String, required)
        // - rating (Number 1-5, required)
        // - title (String 3-100 chars, required)
        // - content (String min 10 chars, required)
        
        const requestBody = {
            toolId: reviewData.toolId,
            rating: parseInt(reviewData.rating),
            title: reviewData.title || 'Review',  // ✅ ADDED: Backend requires this!
            content: comment.trim(),              // ✅ FIXED: Backend expects 'content' not 'comment'
            aspects: reviewData.aspects || {}     // Optional
        };
        
        console.log('✅ Sending request body:', requestBody);
        console.log('Fields check:');
        console.log('  - toolId:', requestBody.toolId);
        console.log('  - rating:', requestBody.rating);
        console.log('  - title:', requestBody.title);
        console.log('  - content:', requestBody.content);
        
        const result = await apiRequest('/reviews', 'POST', requestBody);
        console.log('Create review result:', result);
        return result;
    },

    update: async (reviewId, reviewData) => {
        console.log('=== REVIEWS: Update ===', reviewId);
        return await apiRequest(`/reviews/${reviewId}`, 'PUT', reviewData);
    },

    delete: async (reviewId) => {
        console.log('=== REVIEWS: Delete ===', reviewId);
        return await apiRequest(`/reviews/${reviewId}`, 'DELETE');
    }
};

// ============================================
// USER API
// ============================================
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
        console.log('=== USER: Get Reviews ===', page, limit);
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
        console.log('=== USER: Remove Favorite ===', toolId);
        return await apiRequest(`/tools/${toolId}/favorite`, 'DELETE');
    },

    deleteReview: async (reviewId) => {
        console.log('=== USER: Delete Review ===', reviewId);
        return await apiRequest(`/reviews/${reviewId}`, 'DELETE');
    }
};

// ============================================
// ADMIN API
// ============================================
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

// ============================================
// EXPORT TO GLOBAL SCOPE
// ============================================
window.authAPI = authAPI;
window.userAPI = userAPI;
window.toolsAPI = toolsAPI;
window.reviewsAPI = reviewsAPI;
window.adminAPI = adminAPI;
window.API_BASE_URL = API_BASE_URL;

console.log('✅ API module loaded successfully');
console.log('📍 Running in:', isLocalhost ? 'DEVELOPMENT' : 'PRODUCTION', 'mode');
console.log('========================================');