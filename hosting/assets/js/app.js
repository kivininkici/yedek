/**
 * OtoKiwi JavaScript Application
 * Modern ES6+ JavaScript - cPanel Compatible
 */

// Global App Configuration
window.OtoKiwi = {
    apiBase: '/api',
    version: '2.0.0',
    animations: {
        duration: 300,
        easing: 'ease-out'
    },
    cache: new Map(),
    currentUser: null
};

// Utility Functions
const Utils = {
    // API Request helper
    async request(endpoint, options = {}) {
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(`${OtoKiwi.apiBase}${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            Utils.showAlert('error', error.message || 'Bir hata oluştu');
            throw error;
        }
    },

    // Show alert using SweetAlert2
    showAlert(type, message, title = '') {
        const config = {
            text: message,
            icon: type,
            timer: type === 'success' ? 3000 : 0,
            showConfirmButton: type !== 'success',
            customClass: {
                popup: 'fade-in'
            }
        };

        if (title) config.title = title;
        
        return Swal.fire(config);
    },

    // Show loading state
    showLoading(element, text = 'Yükleniyor...') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.innerHTML = `
                <div class="d-flex align-items-center justify-content-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    <span>${text}</span>
                </div>
            `;
            element.disabled = true;
        }
    },

    // Hide loading state
    hideLoading(element, originalText = '') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.innerHTML = originalText;
            element.disabled = false;
        }
    },

    // Format currency
    formatCurrency(amount, currency = 'TRY') {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    },

    // Format date
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Intl.DateTimeFormat('tr-TR', { ...defaultOptions, ...options })
            .format(new Date(date));
    },

    // Validate email
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Generate random ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            Utils.showAlert('success', 'Kopyalandı!');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            Utils.showAlert('success', 'Kopyalandı!');
        }
    }
};

// Animation Manager
const Animations = {
    // Fade in animation
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `all ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 10);
    },

    // Slide in animation
    slideIn(element, direction = 'left', duration = 300) {
        const transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
        element.style.transform = transform;
        element.style.transition = `transform ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.transform = 'translateX(0)';
        }, 10);
    },

    // Pulse animation
    pulse(element, duration = 1000) {
        element.style.animation = `pulse ${duration}ms ease-in-out`;
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    },

    // Scale animation
    scale(element, scale = 1.1, duration = 300) {
        element.style.transition = `transform ${duration}ms ease-out`;
        element.style.transform = `scale(${scale})`;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, duration);
    }
};

// Form Handler
class FormHandler {
    constructor(formSelector, options = {}) {
        this.form = document.querySelector(formSelector);
        this.options = {
            validateOnSubmit: true,
            showLoading: true,
            resetOnSuccess: true,
            ...options
        };
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Real-time validation
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.options.validateOnSubmit && !this.validateForm()) {
            return;
        }

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        if (this.options.showLoading) {
            const submitBtn = this.form.querySelector('button[type="submit"]');
            Utils.showLoading(submitBtn, 'İşleniyor...');
        }

        try {
            const result = await this.options.onSubmit(data);
            
            if (this.options.resetOnSuccess && result.success) {
                this.form.reset();
            }
            
            if (this.options.onSuccess) {
                this.options.onSuccess(result);
            }
        } catch (error) {
            if (this.options.onError) {
                this.options.onError(error);
            }
        } finally {
            if (this.options.showLoading) {
                const submitBtn = this.form.querySelector('button[type="submit"]');
                Utils.hideLoading(submitBtn, submitBtn.dataset.originalText || 'Gönder');
            }
        }
    }

    validateForm() {
        let isValid = true;
        const fields = this.form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'Bu alan zorunludur';
        }

        // Email validation
        if (field.type === 'email' && value && !Utils.validateEmail(value)) {
            isValid = false;
            message = 'Geçerli bir e-posta adresi girin';
        }

        // Min length validation
        if (field.hasAttribute('minlength') && value.length < field.getAttribute('minlength')) {
            isValid = false;
            message = `En az ${field.getAttribute('minlength')} karakter olmalıdır`;
        }

        // Show validation feedback
        this.showFieldValidation(field, isValid, message);
        
        return isValid;
    }

    showFieldValidation(field, isValid, message) {
        const feedbackElement = field.parentNode.querySelector('.invalid-feedback') || 
                              this.createFeedbackElement(field);
        
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            feedbackElement.textContent = '';
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            feedbackElement.textContent = message;
        }
    }

    createFeedbackElement(field) {
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        field.parentNode.appendChild(feedback);
        return feedback;
    }
}

// Progress Bar Component
class ProgressBar {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? 
                        document.querySelector(container) : container;
        this.options = {
            animated: true,
            striped: true,
            showPercentage: true,
            color: 'primary',
            ...options
        };
        this.value = 0;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="progress" style="height: ${this.options.height || '20px'};">
                <div class="progress-bar ${this.options.animated ? 'progress-bar-animated' : ''} 
                     ${this.options.striped ? 'progress-bar-striped' : ''} 
                     bg-${this.options.color}" 
                     role="progressbar" style="width: 0%">
                    ${this.options.showPercentage ? '0%' : ''}
                </div>
            </div>
        `;
        this.bar = this.container.querySelector('.progress-bar');
    }

    setValue(value, animate = true) {
        this.value = Math.max(0, Math.min(100, value));
        
        if (animate) {
            this.animateToValue();
        } else {
            this.updateBar();
        }
    }

    animateToValue() {
        const start = parseFloat(this.bar.style.width) || 0;
        const end = this.value;
        const duration = 500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = start + (end - start) * progress;
            
            this.bar.style.width = `${currentValue}%`;
            if (this.options.showPercentage) {
                this.bar.textContent = `${Math.round(currentValue)}%`;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    updateBar() {
        this.bar.style.width = `${this.value}%`;
        if (this.options.showPercentage) {
            this.bar.textContent = `${this.value}%`;
        }
    }
}

// Data Table Component
class DataTable {
    constructor(tableSelector, options = {}) {
        this.table = document.querySelector(tableSelector);
        this.options = {
            searchable: true,
            sortable: true,
            pagination: true,
            itemsPerPage: 10,
            ...options
        };
        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        
        if (this.table) {
            this.init();
        }
    }

    init() {
        this.createControls();
        this.bindEvents();
    }

    createControls() {
        const controlsHtml = `
            <div class="table-controls mb-3">
                ${this.options.searchable ? `
                    <div class="row">
                        <div class="col-md-6">
                            <input type="text" class="form-control" placeholder="Ara..." id="table-search">
                        </div>
                        <div class="col-md-6 text-end">
                            <select class="form-select d-inline-block w-auto" id="items-per-page">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select> <span>kayıt göster</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.table.insertAdjacentHTML('beforebegin', controlsHtml);
        
        if (this.options.pagination) {
            this.table.insertAdjacentHTML('afterend', '<div class="table-pagination mt-3"></div>');
        }
    }

    bindEvents() {
        if (this.options.searchable) {
            const searchInput = document.getElementById('table-search');
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.search(e.target.value);
            }, 300));
        }

        if (this.options.sortable) {
            this.table.addEventListener('click', (e) => {
                if (e.target.classList.contains('sortable')) {
                    this.sort(e.target.dataset.column);
                }
            });
        }
    }

    setData(data) {
        this.data = data;
        this.filteredData = [...data];
        this.render();
    }

    search(query) {
        if (!query) {
            this.filteredData = [...this.data];
        } else {
            this.filteredData = this.data.filter(row => 
                Object.values(row).some(value => 
                    String(value).toLowerCase().includes(query.toLowerCase())
                )
            );
        }
        this.currentPage = 1;
        this.render();
    }

    sort(column) {
        this.filteredData.sort((a, b) => {
            const aVal = a[column];
            const bVal = b[column];
            
            if (typeof aVal === 'number') {
                return aVal - bVal;
            }
            
            return String(aVal).localeCompare(String(bVal));
        });
        
        this.render();
    }

    render() {
        // Implementation depends on table structure
        // This is a basic framework
        this.renderPagination();
    }

    renderPagination() {
        if (!this.options.pagination) return;
        
        const totalPages = Math.ceil(this.filteredData.length / this.options.itemsPerPage);
        const paginationContainer = document.querySelector('.table-pagination');
        
        let paginationHtml = '<nav><ul class="pagination justify-content-center">';
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        paginationHtml += '</ul></nav>';
        paginationContainer.innerHTML = paginationHtml;
        
        // Bind pagination events
        paginationContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                this.currentPage = parseInt(e.target.dataset.page);
                this.render();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation to elements in viewport
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(() => {
        document.querySelectorAll('.alert').forEach(alert => {
            if (alert.classList.contains('alert-success')) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        });
    }, 5000);

    console.log('OtoKiwi JavaScript initialized successfully');
});

// Export for use in other scripts
window.Utils = Utils;
window.Animations = Animations;
window.FormHandler = FormHandler;
window.ProgressBar = ProgressBar;
window.DataTable = DataTable;