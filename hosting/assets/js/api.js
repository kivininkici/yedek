// API client for OtoKiwi cPanel version

const api = {
    // Base URL for API endpoints
    baseUrl: '/api',
    
    // Default headers
    defaultHeaders: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    
    // Make HTTP request
    request: function(method, endpoint, data = null, headers = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method: method.toUpperCase(),
            headers: { ...this.defaultHeaders, ...headers },
            credentials: 'same-origin'
        };
        
        // Add data for non-GET requests
        if (data && method.toUpperCase() !== 'GET') {
            if (data instanceof FormData) {
                delete options.headers['Content-Type']; // Let browser set it
                options.body = data;
            } else {
                options.body = JSON.stringify(data);
            }
        }
        
        // Add query parameters for GET requests
        if (data && method.toUpperCase() === 'GET') {
            const params = new URLSearchParams(data);
            const separator = url.includes('?') ? '&' : '?';
            url += separator + params.toString();
        }
        
        return fetch(url, options)
            .then(response => {
                // Handle different response types
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    return response.json().then(data => {
                        if (!response.ok) {
                            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
                        }
                        return data;
                    });
                } else {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.text();
                }
            })
            .catch(error => {
                // Handle network errors
                if (error instanceof TypeError) {
                    throw new Error('Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.');
                }
                throw error;
            });
    },
    
    // GET request
    get: function(endpoint, params = null, headers = {}) {
        return this.request('GET', endpoint, params, headers);
    },
    
    // POST request
    post: function(endpoint, data = null, headers = {}) {
        return this.request('POST', endpoint, data, headers);
    },
    
    // PUT request
    put: function(endpoint, data = null, headers = {}) {
        return this.request('PUT', endpoint, data, headers);
    },
    
    // PATCH request
    patch: function(endpoint, data = null, headers = {}) {
        return this.request('PATCH', endpoint, data, headers);
    },
    
    // DELETE request
    delete: function(endpoint, headers = {}) {
        return this.request('DELETE', endpoint, null, headers);
    },
    
    // Upload file
    upload: function(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });
        
        return this.request('POST', endpoint, formData);
    },
    
    // Download file
    download: function(endpoint, filename = null) {
        return fetch(`${this.baseUrl}${endpoint}`, {
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.blob();
        })
        .then(blob => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        });
    }
};

// API endpoints for different modules
const endpoints = {
    // Authentication
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        me: '/auth/me',
        forgotPassword: '/auth/forgot-password',
        resetPassword: '/auth/reset-password'
    },
    
    // Admin endpoints
    admin: {
        users: '/admin/users',
        keys: '/admin/keys',
        orders: '/admin/orders',
        services: '/admin/services',
        apis: '/admin/apis',
        logs: '/admin/logs',
        feedback: '/admin/feedback',
        loginAttempts: '/admin/login-attempts',
        stats: '/admin/stats'
    },
    
    // User endpoints
    user: {
        validateKey: '/user/validate-key',
        createOrder: '/user/create-order',
        myOrders: '/user/orders',
        feedback: '/user/feedback'
    },
    
    // Public endpoints
    public: {
        searchOrder: '/public/orders/search',
        services: '/public/services'
    }
};

// Service-specific API functions
const apiService = {
    // Authentication services
    auth: {
        login: (credentials) => api.post(endpoints.auth.login, credentials),
        register: (userData) => api.post(endpoints.auth.register, userData),
        logout: () => api.post(endpoints.auth.logout),
        getMe: () => api.get(endpoints.auth.me),
        forgotPassword: (email) => api.post(endpoints.auth.forgotPassword, { email }),
        resetPassword: (token, password) => api.post(endpoints.auth.resetPassword, { token, password })
    },
    
    // Admin services
    admin: {
        // Users
        getUsers: (page = 1, limit = 50) => api.get(`${endpoints.admin.users}?page=${page}&limit=${limit}`),
        createUser: (userData) => api.post(endpoints.admin.users, userData),
        updateUser: (userId, userData) => api.put(`${endpoints.admin.users}/${userId}`, userData),
        deleteUser: (userId) => api.delete(`${endpoints.admin.users}/${userId}`),
        
        // Keys
        getKeys: (page = 1, limit = 50) => api.get(`${endpoints.admin.keys}?page=${page}&limit=${limit}`),
        createKey: (keyData) => api.post(endpoints.admin.keys, keyData),
        updateKey: (keyId, keyData) => api.put(`${endpoints.admin.keys}/${keyId}`, keyData),
        deleteKey: (keyId) => api.delete(`${endpoints.admin.keys}/${keyId}`),
        exportKeys: (category) => api.download(`${endpoints.admin.keys}/export/${category}`, `${category}_keys.txt`),
        
        // Orders
        getOrders: (page = 1, limit = 50) => api.get(`${endpoints.admin.orders}?page=${page}&limit=${limit}`),
        updateOrder: (orderId, orderData) => api.put(`${endpoints.admin.orders}/${orderId}`, orderData),
        deleteOrder: (orderId) => api.delete(`${endpoints.admin.orders}/${orderId}`),
        
        // Services
        getServices: (page = 1, limit = 50) => api.get(`${endpoints.admin.services}?page=${page}&limit=${limit}`),
        createService: (serviceData) => api.post(endpoints.admin.services, serviceData),
        updateService: (serviceId, serviceData) => api.put(`${endpoints.admin.services}/${serviceId}`, serviceData),
        deleteService: (serviceId) => api.delete(`${endpoints.admin.services}/${serviceId}`),
        
        // APIs
        getApis: () => api.get(endpoints.admin.apis),
        createApi: (apiData) => api.post(endpoints.admin.apis, apiData),
        updateApi: (apiId, apiData) => api.put(`${endpoints.admin.apis}/${apiId}`, apiData),
        deleteApi: (apiId) => api.delete(`${endpoints.admin.apis}/${apiId}`),
        testApi: (apiId) => api.post(`${endpoints.admin.apis}/${apiId}/test`),
        fetchServices: (apiId) => api.post(`${endpoints.admin.apis}/${apiId}/fetch-services`),
        
        // Logs
        getLogs: (page = 1, limit = 50) => api.get(`${endpoints.admin.logs}?page=${page}&limit=${limit}`),
        
        // Feedback
        getFeedback: (page = 1, limit = 50) => api.get(`${endpoints.admin.feedback}?page=${page}&limit=${limit}`),
        respondToFeedback: (feedbackId, response) => api.put(`${endpoints.admin.feedback}/${feedbackId}`, { response }),
        
        // Login attempts
        getLoginAttempts: (page = 1, limit = 50) => api.get(`${endpoints.admin.loginAttempts}?page=${page}&limit=${limit}`),
        
        // Statistics
        getStats: () => api.get(endpoints.admin.stats)
    },
    
    // User services
    user: {
        validateKey: (keyValue) => api.post(endpoints.user.validateKey, { keyValue }),
        createOrder: (orderData) => api.post(endpoints.user.createOrder, orderData),
        getMyOrders: () => api.get(endpoints.user.myOrders),
        submitFeedback: (feedbackData) => api.post(endpoints.user.feedback, feedbackData)
    },
    
    // Public services
    public: {
        searchOrder: (orderId) => api.get(`${endpoints.public.searchOrder}/${orderId}`),
        getServices: () => api.get(endpoints.public.services)
    }
};

// Request interceptor for error handling
const originalRequest = api.request;
api.request = function(method, endpoint, data = null, headers = {}) {
    return originalRequest.call(this, method, endpoint, data, headers)
        .catch(error => {
            // Handle common errors
            if (error.message.includes('401')) {
                // Unauthorized - redirect to login
                auth.logout();
                router.navigate('auth');
                throw new Error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
            } else if (error.message.includes('403')) {
                // Forbidden
                throw new Error('Bu işlem için yetkiniz yok.');
            } else if (error.message.includes('404')) {
                // Not found
                throw new Error('İstenen kaynak bulunamadı.');
            } else if (error.message.includes('429')) {
                // Rate limited
                throw new Error('Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.');
            } else if (error.message.includes('500')) {
                // Server error
                throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
            }
            
            // Re-throw the original error
            throw error;
        });
};

// Export API utilities globally
window.api = api;
window.apiService = apiService;
window.endpoints = endpoints;