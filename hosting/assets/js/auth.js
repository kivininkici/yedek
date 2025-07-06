// Authentication management for OtoKiwi

const auth = {
    // User data
    user: null,
    
    // Initialize authentication
    init: function() {
        // Check if user is logged in
        this.checkAuth();
    },
    
    // Check authentication status
    checkAuth: function() {
        // Try to get user from session storage
        const userData = sessionStorage.getItem('otokiwi_user');
        if (userData) {
            try {
                this.user = JSON.parse(userData);
                this.updateUI();
                return true;
            } catch (e) {
                sessionStorage.removeItem('otokiwi_user');
            }
        }
        
        // Check with server
        api.get('/auth/me')
            .then(response => {
                if (response.user) {
                    this.user = response.user;
                    sessionStorage.setItem('otokiwi_user', JSON.stringify(this.user));
                    this.updateUI();
                }
            })
            .catch(() => {
                this.user = null;
                sessionStorage.removeItem('otokiwi_user');
                this.updateUI();
            });
        
        return false;
    },
    
    // Login user
    login: function(credentials) {
        return api.post('/auth/login', credentials)
            .then(response => {
                if (response.user) {
                    this.user = response.user;
                    sessionStorage.setItem('otokiwi_user', JSON.stringify(this.user));
                    this.updateUI();
                    return response;
                }
                throw new Error('Invalid response');
            });
    },
    
    // Register user
    register: function(userData) {
        return api.post('/auth/register', userData)
            .then(response => {
                if (response.user) {
                    this.user = response.user;
                    sessionStorage.setItem('otokiwi_user', JSON.stringify(this.user));
                    this.updateUI();
                    return response;
                }
                throw new Error('Invalid response');
            });
    },
    
    // Logout user
    logout: function() {
        return api.post('/auth/logout')
            .finally(() => {
                this.user = null;
                sessionStorage.removeItem('otokiwi_user');
                this.updateUI();
                router.navigate('home');
            });
    },
    
    // Check if user is authenticated
    isAuthenticated: function() {
        return this.user !== null;
    },
    
    // Check if user is admin
    isAdmin: function() {
        return this.user && this.user.role === 'admin';
    },
    
    // Get current user
    getUser: function() {
        return this.user;
    },
    
    // Update UI based on authentication status
    updateUI: function() {
        const authButton = document.querySelector('[data-route="auth"]');
        const adminButton = document.querySelector('[data-route="admin"]');
        const logoutButton = document.getElementById('logout-btn');
        const userInfo = document.getElementById('user-info');
        
        if (this.isAuthenticated()) {
            // Update auth button
            if (authButton) {
                authButton.innerHTML = '<i class="fas fa-user"></i> Profil';
                authButton.setAttribute('data-route', 'profile');
            }
            
            // Show admin button for admins
            if (adminButton) {
                adminButton.style.display = this.isAdmin() ? 'inline-block' : 'none';
            }
            
            // Show user info
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="dropdown">
                        <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-user"></i> ${this.user.username}
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" data-route="profile"><i class="fas fa-user"></i> Profil</a></li>
                            ${this.isAdmin() ? '<li><a class="dropdown-item" href="#" data-route="admin"><i class="fas fa-cog"></i> Admin Panel</a></li>' : ''}
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" onclick="auth.logout()"><i class="fas fa-sign-out-alt"></i> Çıkış</a></li>
                        </ul>
                    </div>
                `;
            }
            
            // Show logout button
            if (logoutButton) {
                logoutButton.style.display = 'inline-block';
            }
        } else {
            // Update auth button
            if (authButton) {
                authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş';
                authButton.setAttribute('data-route', 'auth');
            }
            
            // Hide admin button
            if (adminButton) {
                adminButton.style.display = 'none';
            }
            
            // Hide user info
            if (userInfo) {
                userInfo.innerHTML = '';
            }
            
            // Hide logout button
            if (logoutButton) {
                logoutButton.style.display = 'none';
            }
        }
        
        // Update navigation
        this.updateNavigation();
    },
    
    // Update navigation based on user role
    updateNavigation: function() {
        const navItems = document.querySelectorAll('.nav-item[data-auth-required]');
        
        navItems.forEach(item => {
            const authRequired = item.getAttribute('data-auth-required') === 'true';
            const adminRequired = item.getAttribute('data-admin-required') === 'true';
            
            let shouldShow = true;
            
            if (authRequired && !this.isAuthenticated()) {
                shouldShow = false;
            }
            
            if (adminRequired && !this.isAdmin()) {
                shouldShow = false;
            }
            
            item.style.display = shouldShow ? 'block' : 'none';
        });
    },
    
    // Generate avatar URL
    getAvatarUrl: function(avatarId = null) {
        const id = avatarId || (this.user ? this.user.avatar_id : 1);
        return `https://api.dicebear.com/7.x/cats/svg?seed=${id}`;
    },
    
    // Format user display name
    getDisplayName: function() {
        if (!this.user) return 'Misafir';
        return this.user.username || this.user.email;
    },
    
    // Get user role badge
    getRoleBadge: function() {
        if (!this.user) return '';
        
        switch (this.user.role) {
            case 'admin':
                return '<span class="badge bg-danger">Admin</span>';
            case 'user':
                return '<span class="badge bg-primary">Kullanıcı</span>';
            default:
                return '';
        }
    },
    
    // Check session validity
    checkSession: function() {
        const userData = sessionStorage.getItem('otokiwi_user');
        if (!userData) return false;
        
        try {
            const user = JSON.parse(userData);
            const loginTime = sessionStorage.getItem('otokiwi_login_time');
            
            if (!loginTime) return false;
            
            // Check if session is older than 2 hours
            const now = Date.now();
            const sessionAge = now - parseInt(loginTime);
            const maxAge = 2 * 60 * 60 * 1000; // 2 hours
            
            if (sessionAge > maxAge) {
                this.logout();
                utils.showAlert('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.', 'warning');
                return false;
            }
            
            return true;
        } catch (e) {
            sessionStorage.removeItem('otokiwi_user');
            sessionStorage.removeItem('otokiwi_login_time');
            return false;
        }
    },
    
    // Refresh session
    refreshSession: function() {
        if (this.isAuthenticated()) {
            sessionStorage.setItem('otokiwi_login_time', Date.now().toString());
        }
    }
};

// Check session periodically
setInterval(() => {
    if (auth.isAuthenticated()) {
        auth.checkSession();
    }
}, 60000); // Check every minute

// Export auth globally
window.auth = auth;