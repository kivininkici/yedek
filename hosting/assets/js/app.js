// OtoKiwi Main Application JavaScript

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize router
    router.init();
    
    // Initialize authentication
    auth.init();
    
    // Initialize background animation
    createAnimatedBackground();
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1000);
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Check authentication status
    auth.checkAuth();
});

// Create animated background
function createAnimatedBackground() {
    const background = document.createElement('div');
    background.className = 'animated-background';
    
    // Create floating orbs
    for (let i = 0; i < 4; i++) {
        const orb = document.createElement('div');
        orb.className = 'floating-orb';
        background.appendChild(orb);
    }
    
    document.body.appendChild(background);
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Utility functions
const utils = {
    // Show loading spinner
    showLoading: function(element) {
        if (element) {
            element.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
        }
    },
    
    // Hide loading spinner
    hideLoading: function(element) {
        if (element) {
            element.innerHTML = '';
        }
    },
    
    // Show alert
    showAlert: function(message, type = 'info') {
        Swal.fire({
            title: type === 'error' ? 'Hata' : type === 'success' ? 'Başarılı' : 'Bilgi',
            text: message,
            icon: type,
            confirmButtonText: 'Tamam',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#3b82f6'
        });
    },
    
    // Show confirmation dialog
    showConfirm: function(message, title = 'Onay') {
        return Swal.fire({
            title: title,
            text: message,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Evet',
            cancelButtonText: 'Hayır',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444'
        });
    },
    
    // Format date
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Format currency
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    },
    
    // Validate email
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate URL
    isValidUrl: function(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // Debounce function
    debounce: function(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    // Throttle function
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Copy to clipboard
    copyToClipboard: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showAlert('Panoya kopyalandı!', 'success');
        }).catch(() => {
            this.showAlert('Kopyalama başarısız!', 'error');
        });
    },
    
    // Generate random string
    generateRandomString: function(length = 8) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }
};

// Animation helpers
const animations = {
    // Fade in element
    fadeIn: function(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    // Fade out element
    fadeOut: function(element, duration = 300) {
        let start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    // Slide up element
    slideUp: function(element, duration = 300) {
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const translateY = 20 * (1 - progress);
            element.style.transform = `translateY(${translateY}px)`;
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
};

// Event listeners
document.addEventListener('click', function(e) {
    // Handle copy buttons
    if (e.target.classList.contains('copy-btn')) {
        const text = e.target.getAttribute('data-copy');
        if (text) {
            utils.copyToClipboard(text);
        }
    }
    
    // Handle external links
    if (e.target.tagName === 'A' && e.target.href && e.target.href.startsWith('http')) {
        if (!e.target.href.includes(window.location.hostname)) {
            e.target.target = '_blank';
            e.target.rel = 'noopener noreferrer';
        }
    }
});

// Handle form submissions
document.addEventListener('submit', function(e) {
    // Prevent double submissions
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        setTimeout(() => {
            submitButton.disabled = false;
        }, 2000);
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }
});

// Handle window resize
window.addEventListener('resize', utils.debounce(function() {
    // Update charts or other responsive elements
    const event = new CustomEvent('windowResize');
    document.dispatchEvent(event);
}, 250));

// Handle online/offline status
window.addEventListener('online', function() {
    utils.showAlert('İnternet bağlantısı yeniden kuruldu!', 'success');
});

window.addEventListener('offline', function() {
    utils.showAlert('İnternet bağlantısı kesildi!', 'warning');
});

// Export utilities globally
window.utils = utils;
window.animations = animations;