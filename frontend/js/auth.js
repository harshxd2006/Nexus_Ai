// ============================================
// AUTHENTICATION MANAGER CLASS
// ============================================

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
            const response = await authAPI.login(email, password);

            if (response.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                this.user = response.data.user;
                this.token = response.data.token;

                updateNavbar();

                return { success: true, message: 'Login successful!' };
            } else {
                return {
                    success: false,
                    message: response.message || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login' };
        }
    }

    async register(name, email, password, confirmPassword) {
        try {
            const response = await authAPI.register(name, email, password, confirmPassword);

            if (response.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                this.user = response.data.user;
                this.token = response.data.token;

                updateNavbar();

                return { success: true, message: 'Registration successful!' };
            } else {
                return {
                    success: false,
                    message: response.message || 'Registration failed'
                };
            }
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'An error occurred during registration' };
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        this.user = null;
        this.token = null;

        updateNavbar();

        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    }

    async updateProfile(userData) {
        try {
            const response = await authAPI.updateProfile(userData);

            if (response.success) {
                const updatedUser = { ...this.user, ...response.data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                this.user = updatedUser;

                updateNavbar();

                return { success: true, message: 'Profile updated successfully!' };
            } else {
                return {
                    success: false,
                    message: response.message || 'Failed to update profile'
                };
            }
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, message: 'An error occurred' };
        }
    }

    async changePassword(currentPassword, newPassword, confirmPassword) {
        try {
            const response = await authAPI.changePassword(
                currentPassword,
                newPassword,
                confirmPassword
            );

            if (response.success) {
                return { success: true, message: 'Password changed successfully!' };
            } else {
                return {
                    success: false,
                    message: response.message || 'Failed to change password'
                };
            }
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: 'An error occurred' };
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

// ============================================
// CREATE GLOBAL AUTH INSTANCE
// ============================================

const auth = new AuthManager();

// ============================================
// REDIRECT FUNCTIONS
// ============================================

function requireAuth() {
    if (!auth.isAuthenticated()) {
        showToast('Please login to access this page', 'warning');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
    }
}

function requireGuest() {
    if (auth.isAuthenticated()) {
        window.location.href = '/index.html';
    }
}

function requireAdmin() {
    if (!auth.isAuthenticated()) {
        showToast('Please login first', 'warning');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
    } else if (!auth.isAdmin()) {
        showToast('Admin access required', 'error');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);
    }
}

// ============================================
// NAVBAR UPDATE FUNCTION
// ============================================

function updateNavbar() {
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    if (auth.isAuthenticated()) {
        const userName = auth.getDisplayName();
        const isAdmin = auth.isAdmin();

        navAuth.innerHTML = `
            <div class="nav-user-menu">
                <span class="user-name">${userName}</span>
                <a href="/profile.html" class="nav-link">Profile</a>
                ${isAdmin ? '<a href="/admin-dashboard.html" class="nav-link">Admin</a>' : ''}
                <button onclick="auth.logout()" class="nav-link logout-btn">Logout</button>
            </div>
        `;
    } else {
        navAuth.innerHTML = `
            <div class="nav-auth-links">
                <a href="/login.html" class="nav-link">Login</a>
                <a href="/register.html" class="nav-link">Register</a>
            </div>
        `;
    }
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});

// ============================================
// LOGOUT HANDLER
// ============================================

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
    }
}
