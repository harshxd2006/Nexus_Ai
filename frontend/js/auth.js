// AUTHENTICATION MANAGER
class AuthManager {
    constructor() {
        this.user = this.getUser();
        this.token = this.getToken();
    }

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    getToken() {
        return localStorage.getItem('token');
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    isAdmin() {
        return this.user?.role === 'admin';
    }

    async login(email, password) {
        try {
            console.log('🔐 Attempting login...');
            const response = await authAPI.login(email, password);

            if (response.success && response.data) {
                const token = response.data.token;
                const user = response.data.user;

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                this.user = user;
                this.token = token;

                console.log('✅ Login successful');
                return { success: true, message: 'Login successful!' };
            } else {
                console.error('❌ Login failed:', response.message);
                return { success: false, message: response.message || 'Login failed' };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, message: 'An error occurred during login' };
        }
    }

    async register(name, email, password, confirmPassword) {
        try {
            console.log('📝 Attempting registration...');
            
            // Validate locally first
            if (!name || !email || !password || !confirmPassword) {
                return { success: false, message: 'All fields are required' };
            }

            if (password !== confirmPassword) {
                return { success: false, message: 'Passwords do not match' };
            }

            if (password.length < 6) {
                return { success: false, message: 'Password must be at least 6 characters' };
            }

            const response = await authAPI.register(name, email, password, confirmPassword);

            if (response.success && response.data) {
                const token = response.data.token;
                const user = response.data.user;

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                this.user = user;
                this.token = token;

                console.log('✅ Registration successful');
                return { success: true, message: 'Registration successful!' };
            } else {
                console.error('❌ Registration failed:', response.message);
                return { success: false, message: response.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            return { success: false, message: 'An error occurred during registration' };
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberEmail');

        this.user = null;
        this.token = null;

        console.log('👋 Logged out');
        
        // Only redirect if not already on login/home page
        if (window.location.pathname !== '/login.html' && window.location.pathname !== '/index.html') {
            window.location.href = '/index.html';
        }
    }

    getDisplayName() {
        return this.user?.name || 'User';
    }

    getEmail() {
        return this.user?.email || '';
    }

    getRole() {
        return this.user?.role || 'user';
    }
}

// CREATE GLOBAL AUTH INSTANCE
const auth = new AuthManager();

// UPDATE NAVBAR FUNCTION - FIXED: Changed register.html to signup.html and added glitch fix
function updateNavbar() {
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    // Show the nav-auth element after updating (prevents glitch)
    navAuth.style.opacity = '0';
    navAuth.style.transition = 'opacity 0.2s ease';

    if (auth.isAuthenticated()) {
        const userName = auth.getDisplayName();
        const userInitial = userName.charAt(0).toUpperCase();
        const isAdmin = auth.isAdmin();

        navAuth.innerHTML = `
            <div class="nav-auth-links" style="display: flex; gap: 1.5rem; align-items: center;">
                <span style="color: #64c8ff; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="width: 32px; height: 32px; background: linear-gradient(135deg, #64c8ff, #ff1493); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${userInitial}</span>
                    ${userName}
                </span>
                <a href="profile.html" class="nav-link" style="color: #b0b0b0; text-decoration: none;">Profile</a>
                ${isAdmin ? '<a href="admin_dashboard.html" class="nav-link" style="color: #b0b0b0; text-decoration: none;">Admin</a>' : ''}
                <button onclick="handleLogout()" class="nav-link" style="background: none; border: none; cursor: pointer; color: #b0b0b0; font-weight: 500; padding: 0.5rem 1rem;">Logout</button>
            </div>
        `;
    } else {
        // ✅ FIXED: Changed register.html to signup.html
        navAuth.innerHTML = `
            <div class="nav-auth-links" style="display: flex; gap: 1rem; align-items: center;">
                <a href="login.html" class="nav-link" style="color: #b0b0b0; text-decoration: none; font-weight: 500;">Login</a>
                <a href="signup.html" class="nav-link" style="padding: 0.6rem 1.3rem; background: linear-gradient(135deg, #64c8ff, #4a9fd8); border-radius: 25px; color: white; font-weight: 600; text-decoration: none;">Sign Up</a>
            </div>
        `;
    }

    // Fade in after content is ready (prevents glitch)
    setTimeout(() => {
        navAuth.style.opacity = '1';
    }, 10);
}

// LOGOUT HANDLER
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
        if (typeof showToast === 'function') {
            showToast('✅ Logged out successfully', 'success');
        }
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    }
}

// REDIRECT FUNCTIONS
function requireAuth() {
    if (!auth.isAuthenticated()) {
        if (typeof showToast === 'function') {
            showToast('Please login to access this page', 'warning');
        }
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
        return false;
    }
    return true;
}

function requireGuest() {
    if (auth.isAuthenticated()) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!auth.isAuthenticated()) {
        if (typeof showToast === 'function') {
            showToast('Please login first', 'warning');
        }
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
        return false;
    } else if (!auth.isAdmin()) {
        if (typeof showToast === 'function') {
            showToast('Admin access required', 'error');
        }
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);
        return false;
    }
    return true;
}

// INITIALIZE ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Auth module initialized');
    console.log('Authenticated:', auth.isAuthenticated());
    if (auth.isAuthenticated()) {
        console.log('User:', auth.getDisplayName());
    }
});

// EXPORT FOR GLOBAL USE
window.auth = auth;
window.updateNavbar = updateNavbar;
window.handleLogout = handleLogout;
window.requireAuth = requireAuth;
window.requireGuest = requireGuest;
window.requireAdmin = requireAdmin;

console.log('✅ Auth module loaded successfully');