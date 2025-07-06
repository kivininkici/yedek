// Single Page Application Router for OtoKiwi

const router = {
    // Current route
    currentRoute: '',
    
    // Route configurations
    routes: {
        'home': {
            title: 'OtoKiwi - Ana Sayfa',
            template: 'home',
            requireAuth: false
        },
        'auth': {
            title: 'OtoKiwi - Giriş',
            template: 'auth',
            requireAuth: false
        },
        'user': {
            title: 'OtoKiwi - Key Kullan',
            template: 'user',
            requireAuth: false
        },
        'order-search': {
            title: 'OtoKiwi - Sipariş Sorgula',
            template: 'orderSearch',
            requireAuth: false
        },
        'admin': {
            title: 'OtoKiwi - Admin Panel',
            template: 'admin',
            requireAuth: true,
            requireAdmin: true
        },
        'profile': {
            title: 'OtoKiwi - Profil',
            template: 'profile',
            requireAuth: true
        }
    },
    
    // Initialize router
    init: function() {
        // Handle browser navigation
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
        
        // Handle initial load
        this.handleRoute();
        
        // Handle navigation links
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-route')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigate(route);
            }
        });
    },
    
    // Navigate to route
    navigate: function(route, addToHistory = true) {
        if (addToHistory) {
            history.pushState(null, null, `#${route}`);
        }
        this.handleRoute();
    },
    
    // Handle current route
    handleRoute: function() {
        // Get route from hash
        let route = window.location.hash.slice(1) || 'home';
        
        // Check if route exists
        if (!this.routes[route]) {
            route = 'home';
        }
        
        const routeConfig = this.routes[route];
        
        // Check authentication requirements
        if (routeConfig.requireAuth && !auth.isAuthenticated()) {
            this.navigate('auth');
            return;
        }
        
        if (routeConfig.requireAdmin && !auth.isAdmin()) {
            utils.showAlert('Bu sayfaya erişim izniniz yok!', 'error');
            this.navigate('home');
            return;
        }
        
        // Update current route
        this.currentRoute = route;
        
        // Update document title
        document.title = routeConfig.title;
        
        // Update navigation
        this.updateNavigation(route);
        
        // Load page content
        this.loadPage(route, routeConfig.template);
    },
    
    // Update navigation active states
    updateNavigation: function(currentRoute) {
        const navLinks = document.querySelectorAll('.nav-link, [data-route]');
        navLinks.forEach(link => {
            const linkRoute = link.getAttribute('data-route') || 
                            link.getAttribute('onclick')?.match(/navigate\('([^']+)'\)/)?.[1];
            
            if (linkRoute === currentRoute) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },
    
    // Load page content
    loadPage: function(route, template) {
        const content = document.getElementById('app-content');
        
        // Show loading
        content.innerHTML = `
            <div class="container mt-5">
                <div class="d-flex justify-content-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Yükleniyor...</span>
                    </div>
                </div>
            </div>
        `;
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            if (pages[template]) {
                content.innerHTML = pages[template]();
                
                // Initialize page-specific functionality
                if (typeof window[`init${template.charAt(0).toUpperCase() + template.slice(1)}`] === 'function') {
                    window[`init${template.charAt(0).toUpperCase() + template.slice(1)}`]();
                }
                
                // Add fade-in animation
                content.classList.add('fade-in');
                setTimeout(() => {
                    content.classList.remove('fade-in');
                }, 500);
            } else {
                content.innerHTML = `
                    <div class="container mt-5">
                        <div class="alert alert-danger">
                            <h4>Sayfa Bulunamadı</h4>
                            <p>Aradığınız sayfa mevcut değil.</p>
                            <button class="btn btn-primary" onclick="router.navigate('home')">Ana Sayfaya Dön</button>
                        </div>
                    </div>
                `;
            }
        }, 300);
    },
    
    // Get current route
    getCurrentRoute: function() {
        return this.currentRoute;
    },
    
    // Check if current route matches
    isCurrentRoute: function(route) {
        return this.currentRoute === route;
    }
};

// Export router globally
window.router = router;