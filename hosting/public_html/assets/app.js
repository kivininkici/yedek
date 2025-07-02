// KeyPanel - cPanel Hosting Uyumlu JavaScript
// Türkçe: Ana uygulama JavaScript dosyası

// App state
let appState = {
    currentUser: null,
    isLoggedIn: false,
    isAdmin: false,
    currentPage: 'home',
    loading: false,
    error: null
};

// API helper functions
const api = {
    baseUrl: window.APP_CONFIG.apiUrl,
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API hatası');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    
    post(endpoint, data) {
        return this.request(endpoint, { method: 'POST', body: data });
    },
    
    put(endpoint, data) {
        return this.request(endpoint, { method: 'PUT', body: data });
    },
    
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// Utility functions
function showLoading() {
    const loadingEl = document.querySelector('.loading-overlay');
    if (loadingEl) {
        loadingEl.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingEl = document.querySelector('.loading-overlay');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type} fade-in`;
    alertEl.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="btn btn-sm" style="margin-left: auto;">✕</button>
    `;
    alertEl.style.display = 'flex';
    alertEl.style.alignItems = 'center';
    
    alertContainer.appendChild(alertEl);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertEl.parentElement) {
            alertEl.remove();
        }
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Router
const router = {
    routes: {
        '': 'home',
        'home': 'home',
        'auth': 'auth',
        'admin': 'adminLogin',
        'user': 'userInterface',
        'order-search': 'orderSearch',
        'admin/dashboard': 'adminDashboard',
        'admin/keys': 'adminKeys',
        'admin/services': 'adminServices',
        'admin/users': 'adminUsers'
    },
    
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },
    
    navigate(path) {
        window.location.hash = path;
    },
    
    handleRoute() {
        const hash = window.location.hash.slice(1);
        const route = this.routes[hash] || 'home';
        appState.currentPage = route;
        this.render(route);
    },
    
    render(page) {
        const app = document.getElementById('root');
        app.innerHTML = this.getPageHTML(page);
        this.bindEvents(page);
    },
    
    getPageHTML(page) {
        switch (page) {
            case 'home':
                return this.getHomeHTML();
            case 'auth':
                return this.getAuthHTML();
            case 'adminLogin':
                return this.getAdminLoginHTML();
            case 'userInterface':
                return this.getUserInterfaceHTML();
            case 'orderSearch':
                return this.getOrderSearchHTML();
            case 'adminDashboard':
                return this.getAdminDashboardHTML();
            case 'adminKeys':
                return this.getAdminKeysHTML();
            case 'adminServices':
                return this.getAdminServicesHTML();
            case 'adminUsers':
                return this.getAdminUsersHTML();
            default:
                return this.getHomeHTML();
        }
    },
    
    getHomeHTML() {
        return `
            <div class="min-h-screen bg-gray-50">
                <!-- Navigation -->
                <nav class="nav">
                    <div class="container flex justify-between items-center">
                        <h1 class="text-xl font-bold text-primary">KeyPanel</h1>
                        <div class="flex gap-4">
                            <a href="#order-search" class="nav-link">Sipariş Sorgula</a>
                            ${appState.isLoggedIn ? `
                                <a href="#user" class="nav-link">Kullanıcı Paneli</a>
                                ${appState.isAdmin ? '<a href="#admin/dashboard" class="nav-link">Admin Panel</a>' : ''}
                                <button onclick="handleLogout()" class="btn btn-secondary btn-sm">Çıkış</button>
                            ` : `
                                <a href="#auth" class="nav-link">Giriş Yap</a>
                                <a href="#admin" class="nav-link">Admin Girişi</a>
                            `}
                        </div>
                    </div>
                </nav>
                
                <!-- Hero Section -->
                <div class="container py-16">
                    <div class="text-center max-w-4xl mx-auto">
                        <h1 class="text-4xl font-bold text-gray-900 mb-6">
                            KeyPanel - Anahtar Yönetim Sistemi
                        </h1>
                        <p class="text-xl text-gray-600 mb-8">
                            Sosyal medya servisleri için güvenli ve kolay anahtar yönetimi. 
                            Admin paneli ve kullanıcı dostu arayüz ile kapsamlı kontrol.
                        </p>
                        <div class="flex gap-4 justify-center">
                            <a href="#auth" class="btn btn-primary btn-lg">Key Kullan</a>
                            <a href="#order-search" class="btn btn-secondary btn-lg">Sipariş Sorgula</a>
                        </div>
                    </div>
                    
                    <!-- Features -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                        <div class="card">
                            <div class="card-body text-center">
                                <div class="text-primary text-3xl mb-4">🔐</div>
                                <h3 class="text-lg font-semibold mb-2">Güvenli Key Yönetimi</h3>
                                <p class="text-gray-600">Tek kullanımlık anahtarlar ile güvenli işlem yapın.</p>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-body text-center">
                                <div class="text-primary text-3xl mb-4">⚡</div>
                                <h3 class="text-lg font-semibold mb-2">Hızlı İşlem</h3>
                                <p class="text-gray-600">Anında doğrulama ve hızlı sipariş işleme.</p>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-body text-center">
                                <div class="text-primary text-3xl mb-4">📊</div>
                                <h3 class="text-lg font-semibold mb-2">Detaylı Takip</h3>
                                <p class="text-gray-600">Siparişlerinizi gerçek zamanlı takip edin.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Alert Container -->
                <div id="alert-container" class="fixed top-4 right-4 z-50" style="max-width: 400px;"></div>
            </div>
        `;
    },
    
    getAuthHTML() {
        return `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center">
                <div class="card" style="width: 400px;">
                    <div class="card-header">
                        <h2 class="text-xl font-semibold text-center">Kullanıcı Girişi</h2>
                    </div>
                    <div class="card-body">
                        <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
                            <button class="auth-tab flex-1 py-2 px-4 rounded-md transition active" data-tab="login">
                                Giriş Yap
                            </button>
                            <button class="auth-tab flex-1 py-2 px-4 rounded-md transition" data-tab="register">
                                Kayıt Ol
                            </button>
                        </div>
                        
                        <!-- Login Form -->
                        <form id="login-form" class="auth-form">
                            <div class="mb-4">
                                <label class="form-label">Kullanıcı Adı</label>
                                <input type="text" name="username" class="form-input" required>
                            </div>
                            <div class="mb-6">
                                <label class="form-label">Şifre</label>
                                <input type="password" name="password" class="form-input" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-full">Giriş Yap</button>
                        </form>
                        
                        <!-- Register Form -->
                        <form id="register-form" class="auth-form hidden">
                            <div class="mb-4">
                                <label class="form-label">Kullanıcı Adı</label>
                                <input type="text" name="username" class="form-input" required>
                            </div>
                            <div class="mb-4">
                                <label class="form-label">E-posta</label>
                                <input type="email" name="email" class="form-input" required>
                            </div>
                            <div class="mb-4">
                                <label class="form-label">Şifre</label>
                                <input type="password" name="password" class="form-input" required>
                            </div>
                            <div class="mb-6">
                                <label class="form-label">Şifre Tekrar</label>
                                <input type="password" name="confirmPassword" class="form-input" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-full">Kayıt Ol</button>
                        </form>
                        
                        <div class="text-center mt-4">
                            <a href="#" class="text-gray-600 hover:text-primary">Ana Sayfaya Dön</a>
                        </div>
                    </div>
                </div>
                
                <!-- Alert Container -->
                <div id="alert-container" class="fixed top-4 right-4 z-50"></div>
            </div>
        `;
    },
    
    getAdminLoginHTML() {
        return `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center">
                <div class="card" style="width: 400px;">
                    <div class="card-header">
                        <h2 class="text-xl font-semibold text-center">Admin Girişi</h2>
                    </div>
                    <div class="card-body">
                        <form id="admin-login-form">
                            <div class="mb-4">
                                <label class="form-label">Admin Kullanıcı Adı</label>
                                <input type="text" name="username" class="form-input" required>
                            </div>
                            <div class="mb-4">
                                <label class="form-label">Şifre</label>
                                <input type="password" name="password" class="form-input" required>
                            </div>
                            <div class="mb-6">
                                <label class="form-label">Güvenlik Sorusu Cevabı</label>
                                <input type="text" name="securityAnswer" class="form-input" required 
                                       placeholder="Güvenlik sorusu cevabını girin">
                                <small class="text-gray-500 text-xs mt-1 block">
                                    Güvenlik sorusu: Admin bilgilerinizden birini girin
                                </small>
                            </div>
                            <button type="submit" class="btn btn-primary w-full">Admin Girişi</button>
                        </form>
                        
                        <div class="text-center mt-4">
                            <a href="#" class="text-gray-600 hover:text-primary">Ana Sayfaya Dön</a>
                        </div>
                    </div>
                </div>
                
                <!-- Alert Container -->
                <div id="alert-container" class="fixed top-4 right-4 z-50"></div>
            </div>
        `;
    },
    
    getOrderSearchHTML() {
        return `
            <div class="min-h-screen bg-gray-50">
                <nav class="nav">
                    <div class="container flex justify-between items-center">
                        <a href="#" class="text-xl font-bold text-primary">KeyPanel</a>
                        <a href="#" class="nav-link">Ana Sayfaya Dön</a>
                    </div>
                </nav>
                
                <div class="container py-8">
                    <div class="max-w-2xl mx-auto">
                        <div class="card">
                            <div class="card-header">
                                <h2 class="text-xl font-semibold">Sipariş Sorgulama</h2>
                            </div>
                            <div class="card-body">
                                <form id="order-search-form" class="mb-6">
                                    <div class="flex gap-3">
                                        <input type="text" name="orderId" class="form-input" 
                                               placeholder="Sipariş ID'sini girin (örn: KEY123456789)" required>
                                        <button type="submit" class="btn btn-primary">Sorgula</button>
                                    </div>
                                </form>
                                
                                <div id="order-result" class="hidden">
                                    <!-- Sipariş sonucu buraya gelecek -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Alert Container -->
                <div id="alert-container" class="fixed top-4 right-4 z-50"></div>
            </div>
        `;
    },
    
    getUserInterfaceHTML() {
        return `
            <div class="min-h-screen bg-gray-50">
                <nav class="nav">
                    <div class="container flex justify-between items-center">
                        <a href="#" class="text-xl font-bold text-primary">KeyPanel</a>
                        <div class="flex items-center gap-4">
                            <span class="text-gray-600">Hoş geldin, ${appState.currentUser?.username || 'Kullanıcı'}</span>
                            <button onclick="handleLogout()" class="btn btn-secondary btn-sm">Çıkış</button>
                        </div>
                    </div>
                </nav>
                
                <div class="container py-8">
                    <div class="max-w-4xl mx-auto">
                        <h1 class="text-2xl font-bold mb-8">Key Kullanım Paneli</h1>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <!-- Key Doğrulama -->
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="text-lg font-semibold">Key Doğrulama</h3>
                                </div>
                                <div class="card-body">
                                    <form id="validate-key-form">
                                        <div class="mb-4">
                                            <label class="form-label">Key Değeri</label>
                                            <input type="text" name="keyValue" class="form-input" 
                                                   placeholder="Key değerini girin" required>
                                        </div>
                                        <button type="submit" class="btn btn-primary w-full">Doğrula</button>
                                    </form>
                                    
                                    <div id="key-validation-result" class="mt-4 hidden">
                                        <!-- Doğrulama sonucu buraya gelecek -->
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Servis Seçimi -->
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="text-lg font-semibold">Servis Seçimi</h3>
                                </div>
                                <div class="card-body">
                                    <form id="use-key-form" class="hidden">
                                        <div class="mb-4">
                                            <label class="form-label">Seçilen Key</label>
                                            <input type="text" id="selected-key" class="form-input" readonly>
                                        </div>
                                        <div class="mb-4">
                                            <label class="form-label">Servis</label>
                                            <select name="serviceId" class="form-input" required>
                                                <option value="">Servis seçin</option>
                                            </select>
                                        </div>
                                        <div class="mb-4">
                                            <label class="form-label">Miktar</label>
                                            <input type="number" name="quantity" class="form-input" min="1" required>
                                        </div>
                                        <div class="mb-4">
                                            <label class="form-label">Hedef URL (opsiyonel)</label>
                                            <input type="url" name="targetUrl" class="form-input" 
                                                   placeholder="https://example.com/profile">
                                        </div>
                                        <button type="submit" class="btn btn-success w-full">Key Kullan</button>
                                    </form>
                                    
                                    <div class="text-center text-gray-500" id="service-placeholder">
                                        Önce bir key doğrulayın
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Alert Container -->
                <div id="alert-container" class="fixed top-4 right-4 z-50"></div>
            </div>
        `;
    },
    
    getAdminDashboardHTML() {
        if (!appState.isAdmin) {
            router.navigate('admin');
            return '';
        }
        
        return `
            <div class="min-h-screen bg-gray-50">
                ${this.getAdminNavHTML()}
                
                <div class="container py-8">
                    <h1 class="text-2xl font-bold mb-8">Admin Dashboard</h1>
                    
                    <div id="dashboard-content">
                        <div class="text-center py-8">
                            <div class="spinner mx-auto mb-4"></div>
                            <p class="text-gray-600">Dashboard yükleniyor...</p>
                        </div>
                    </div>
                </div>
                
                <!-- Alert Container -->
                <div id="alert-container" class="fixed top-4 right-4 z-50"></div>
            </div>
        `;
    },
    
    getAdminNavHTML() {
        return `
            <nav class="nav border-b">
                <div class="container">
                    <div class="flex justify-between items-center">
                        <a href="#admin/dashboard" class="text-xl font-bold text-primary">KeyPanel Admin</a>
                        <div class="flex items-center gap-4">
                            <a href="#admin/dashboard" class="nav-link">Dashboard</a>
                            <a href="#admin/keys" class="nav-link">Key Yönetimi</a>
                            <a href="#admin/services" class="nav-link">Servisler</a>
                            <a href="#admin/users" class="nav-link">Kullanıcılar</a>
                            <span class="text-gray-600">Admin: ${appState.currentUser?.username || 'Admin'}</span>
                            <button onclick="handleLogout()" class="btn btn-secondary btn-sm">Çıkış</button>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    },
    
    getAdminKeysHTML() {
        if (!appState.isAdmin) {
            router.navigate('admin');
            return '';
        }
        
        return `
            <div class="min-h-screen bg-gray-50">
                ${this.getAdminNavHTML()}
                
                <div class="container py-8">
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-2xl font-bold">Key Yönetimi</h1>
                        <button onclick="showCreateKeyModal()" class="btn btn-primary">Yeni Key Oluştur</button>
                    </div>
                    
                    <div id="keys-content">
                        <div class="text-center py-8">
                            <div class="spinner mx-auto mb-4"></div>
                            <p class="text-gray-600">Key'ler yükleniyor...</p>
                        </div>
                    </div>
                </div>
                
                <!-- Create Key Modal -->
                <div id="create-key-modal" class="modal-overlay hidden">
                    <div class="modal">
                        <div class="modal-header">
                            <h3 class="text-lg font-semibold">Yeni Key Oluştur</h3>
                            <button onclick="hideCreateKeyModal()" class="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div class="modal-body">
                            <form id="create-key-form">
                                <div class="mb-4">
                                    <label class="form-label">Key Değeri</label>
                                    <input type="text" name="value" class="form-input" required>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label">Kategori</label>
                                    <select name="category" class="form-input" required>
                                        <option value="Instagram">Instagram</option>
                                        <option value="YouTube">YouTube</option>
                                        <option value="Twitter">Twitter</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="TikTok">TikTok</option>
                                        <option value="Genel">Genel</option>
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label">Servis</label>
                                    <select name="serviceId" class="form-input" required>
                                        <option value="">Servis seçin</option>
                                    </select>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label">Maksimum Kullanım</label>
                                    <input type="number" name="maxQuantity" class="form-input" min="1" value="1" required>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label">Açıklama (opsiyonel)</label>
                                    <textarea name="description" class="form-input" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button onclick="hideCreateKeyModal()" class="btn btn-secondary">İptal</button>
                            <button onclick="createKey()" class="btn btn-primary">Oluştur</button>
                        </div>
                    </div>
                </div>
                
                <!-- Alert Container -->
                <div id="alert-container" class="fixed top-4 right-4 z-50"></div>
            </div>
        `;
    },
    
    bindEvents(page) {
        switch (page) {
            case 'auth':
                this.bindAuthEvents();
                break;
            case 'adminLogin':
                this.bindAdminLoginEvents();
                break;
            case 'orderSearch':
                this.bindOrderSearchEvents();
                break;
            case 'userInterface':
                this.bindUserInterfaceEvents();
                break;
            case 'adminDashboard':
                this.loadDashboardData();
                break;
            case 'adminKeys':
                this.loadKeysData();
                break;
        }
    },
    
    bindAuthEvents() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                
                // Update active tab
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // Show/hide forms
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.add('hidden');
                });
                document.getElementById(`${tabName}-form`).classList.remove('hidden');
            });
        });
        
        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                showLoading();
                const response = await api.post('/auth/login', data);
                appState.currentUser = response.data.user;
                appState.isLoggedIn = true;
                appState.isAdmin = response.data.user.role === 'admin';
                
                showAlert('Giriş başarılı! Kullanıcı paneline yönlendiriliyorsunuz...', 'success');
                setTimeout(() => router.navigate('user'), 1000);
            } catch (error) {
                showAlert(error.message, 'danger');
            } finally {
                hideLoading();
            }
        });
        
        // Register form
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            if (data.password !== data.confirmPassword) {
                showAlert('Şifreler eşleşmiyor', 'danger');
                return;
            }
            
            try {
                showLoading();
                const response = await api.post('/auth/register', data);
                appState.currentUser = response.data.user;
                appState.isLoggedIn = true;
                appState.isAdmin = false;
                
                showAlert('Kayıt başarılı! Kullanıcı paneline yönlendiriliyorsunuz...', 'success');
                setTimeout(() => router.navigate('user'), 1000);
            } catch (error) {
                showAlert(error.message, 'danger');
            } finally {
                hideLoading();
            }
        });
    },
    
    bindAdminLoginEvents() {
        document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                showLoading();
                const response = await api.post('/admin/login', data);
                appState.currentUser = response.data.admin;
                appState.isLoggedIn = true;
                appState.isAdmin = true;
                
                showAlert('Admin girişi başarılı! Dashboard\'a yönlendiriliyorsunuz...', 'success');
                setTimeout(() => router.navigate('admin/dashboard'), 1000);
            } catch (error) {
                showAlert(error.message, 'danger');
            } finally {
                hideLoading();
            }
        });
    },
    
    bindOrderSearchEvents() {
        document.getElementById('order-search-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const orderId = formData.get('orderId');
            
            try {
                showLoading();
                const response = await api.get(`/orders/search/${orderId}`);
                this.displayOrderResult(response.data.order);
            } catch (error) {
                showAlert(error.message, 'danger');
                document.getElementById('order-result').classList.add('hidden');
            } finally {
                hideLoading();
            }
        });
    },
    
    bindUserInterfaceEvents() {
        // Key validation
        document.getElementById('validate-key-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const keyValue = formData.get('keyValue');
            
            try {
                showLoading();
                const response = await api.get(`/keys/validate?value=${encodeURIComponent(keyValue)}`);
                this.displayKeyValidation(response.data.key);
                await this.loadServices();
            } catch (error) {
                showAlert(error.message, 'danger');
                document.getElementById('key-validation-result').classList.add('hidden');
                document.getElementById('use-key-form').classList.add('hidden');
            } finally {
                hideLoading();
            }
        });
        
        // Use key
        document.getElementById('use-key-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.keyValue = document.getElementById('selected-key').value;
            
            try {
                showLoading();
                const response = await api.post('/keys/use', data);
                showAlert(`Sipariş başarıyla oluşturuldu! Sipariş ID: ${response.data.order.order_id}`, 'success');
                
                // Reset forms
                document.getElementById('validate-key-form').reset();
                document.getElementById('use-key-form').reset();
                document.getElementById('key-validation-result').classList.add('hidden');
                document.getElementById('use-key-form').classList.add('hidden');
                document.getElementById('service-placeholder').style.display = 'block';
            } catch (error) {
                showAlert(error.message, 'danger');
            } finally {
                hideLoading();
            }
        });
    },
    
    displayOrderResult(order) {
        const resultDiv = document.getElementById('order-result');
        const statusColors = {
            'pending': 'warning',
            'processing': 'info',
            'completed': 'success',
            'partial': 'warning',
            'cancelled': 'danger',
            'error': 'danger'
        };
        
        resultDiv.innerHTML = `
            <div class="border rounded-lg p-4 bg-white">
                <h4 class="font-semibold mb-3">Sipariş Detayları</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <strong>Sipariş ID:</strong> ${order.order_id}
                    </div>
                    <div>
                        <strong>Durum:</strong> 
                        <span class="badge badge-${statusColors[order.status] || 'secondary'}">
                            ${order.status_description}
                        </span>
                    </div>
                    <div>
                        <strong>Servis:</strong> ${order.service_info.name}
                    </div>
                    <div>
                        <strong>Miktar:</strong> ${order.quantity}
                    </div>
                    <div>
                        <strong>Oluşturma Tarihi:</strong> ${order.created_at}
                    </div>
                    ${order.completed_at ? `
                        <div>
                            <strong>Tamamlanma Tarihi:</strong> ${order.completed_at}
                        </div>
                    ` : ''}
                    ${order.target_url ? `
                        <div class="md:col-span-2">
                            <strong>Hedef URL:</strong> 
                            <a href="${order.target_url}" target="_blank" class="text-primary hover:underline">
                                ${order.target_url}
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        resultDiv.classList.remove('hidden');
    },
    
    displayKeyValidation(key) {
        const resultDiv = document.getElementById('key-validation-result');
        resultDiv.innerHTML = `
            <div class="border rounded-lg p-4 bg-green-50 border-green-200">
                <h4 class="font-semibold text-green-800 mb-2">✓ Key Geçerli</h4>
                <div class="text-sm text-green-700">
                    <p><strong>Kategori:</strong> ${key.category}</p>
                    <p><strong>Kalan Kullanım:</strong> ${key.remaining_uses}/${key.max_quantity}</p>
                    <p><strong>Bağlı Servis:</strong> ${key.service_name}</p>
                </div>
            </div>
        `;
        resultDiv.classList.remove('hidden');
        
        // Update use key form
        document.getElementById('selected-key').value = key.value;
        document.getElementById('use-key-form').classList.remove('hidden');
        document.getElementById('service-placeholder').style.display = 'none';
    },
    
    async loadServices() {
        try {
            const response = await api.get('/services/active');
            const serviceSelect = document.querySelector('#use-key-form select[name="serviceId"]');
            
            serviceSelect.innerHTML = '<option value="">Servis seçin</option>';
            response.data.forEach(service => {
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = `${service.name} - ${service.price} TL`;
                serviceSelect.appendChild(option);
            });
        } catch (error) {
            showAlert('Servisler yüklenirken hata oluştu', 'danger');
        }
    },
    
    async loadDashboardData() {
        try {
            const response = await api.get('/admin/dashboard');
            const content = document.getElementById('dashboard-content');
            
            content.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="text-2xl font-bold text-primary">${response.data.stats.totalKeys}</div>
                            <div class="text-gray-600">Toplam Key</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="text-2xl font-bold text-success">${response.data.stats.unusedKeys}</div>
                            <div class="text-gray-600">Kullanılmamış Key</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="text-2xl font-bold text-info">${response.data.stats.activeServices}</div>
                            <div class="text-gray-600">Aktif Servis</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="text-2xl font-bold text-warning">${response.data.stats.totalOrders}</div>
                            <div class="text-gray-600">Toplam Sipariş</div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="font-semibold">Son Key'ler</h3>
                        </div>
                        <div class="card-body">
                            <div class="space-y-3">
                                ${response.data.recentKeys.map(key => `
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <div class="font-medium">${key.value}</div>
                                            <div class="text-sm text-gray-500">${key.service_name || 'Servis seçilmemiş'}</div>
                                        </div>
                                        <span class="badge badge-${key.used_quantity >= key.max_quantity ? 'danger' : 'success'}">
                                            ${key.used_quantity >= key.max_quantity ? 'Tükendi' : 'Aktif'}
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="font-semibold">Son Siparişler</h3>
                        </div>
                        <div class="card-body">
                            <div class="space-y-3">
                                ${response.data.recentOrders.map(order => `
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <div class="font-medium">${order.order_id}</div>
                                            <div class="text-sm text-gray-500">${order.service_name || 'Bilinmeyen'}</div>
                                        </div>
                                        <span class="badge badge-${order.status === 'completed' ? 'success' : 'warning'}">
                                            ${order.status}
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            document.getElementById('dashboard-content').innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-600">Dashboard yüklenirken hata oluştu: ${error.message}</p>
                </div>
            `;
        }
    },
    
    async loadKeysData() {
        try {
            const response = await api.get('/admin/keys');
            const content = document.getElementById('keys-content');
            
            content.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <div class="overflow-auto">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Key Değeri</th>
                                        <th>Kategori</th>
                                        <th>Servis</th>
                                        <th>Kullanım</th>
                                        <th>Durum</th>
                                        <th>Oluşturma</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${response.data.map(key => `
                                        <tr>
                                            <td class="font-mono">${key.value}</td>
                                            <td>${key.category}</td>
                                            <td>${key.service_name || 'Atanmamış'}</td>
                                            <td>${key.used_quantity}/${key.max_quantity}</td>
                                            <td>
                                                <span class="badge badge-${key.used_quantity >= key.max_quantity ? 'danger' : 'success'}">
                                                    ${key.used_quantity >= key.max_quantity ? 'Tükendi' : 'Aktif'}
                                                </span>
                                            </td>
                                            <td>${formatDate(key.created_at)}</td>
                                            <td>
                                                <button onclick="deleteKey(${key.id})" class="btn btn-danger btn-sm">Sil</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            // Load services for create key modal
            await this.loadServicesForKeyCreation();
        } catch (error) {
            document.getElementById('keys-content').innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-600">Key'ler yüklenirken hata oluştu: ${error.message}</p>
                </div>
            `;
        }
    },
    
    async loadServicesForKeyCreation() {
        try {
            const response = await api.get('/admin/services');
            const serviceSelect = document.querySelector('#create-key-form select[name="serviceId"]');
            
            serviceSelect.innerHTML = '<option value="">Servis seçin</option>';
            response.data.forEach(service => {
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = `${service.name} - ${service.price} TL`;
                serviceSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Servisler yüklenirken hata:', error);
        }
    }
};

// Global functions
async function handleLogout() {
    try {
        await api.delete('/auth/logout');
        appState.currentUser = null;
        appState.isLoggedIn = false;
        appState.isAdmin = false;
        showAlert('Çıkış yapıldı', 'success');
        router.navigate('');
    } catch (error) {
        showAlert('Çıkış yapılırken hata oluştu', 'danger');
    }
}

function showCreateKeyModal() {
    document.getElementById('create-key-modal').classList.remove('hidden');
}

function hideCreateKeyModal() {
    document.getElementById('create-key-modal').classList.add('hidden');
    document.getElementById('create-key-form').reset();
}

async function createKey() {
    const form = document.getElementById('create-key-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
        await api.post('/admin/keys', data);
        showAlert('Key başarıyla oluşturuldu', 'success');
        hideCreateKeyModal();
        router.loadKeysData(); // Reload keys
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

async function deleteKey(keyId) {
    if (!confirm('Bu key\'i silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        await api.delete(`/admin/keys/${keyId}`);
        showAlert('Key başarıyla silindi', 'success');
        router.loadKeysData(); // Reload keys
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Check auth status on load
async function checkAuthStatus() {
    try {
        const userResponse = await api.get('/user').catch(() => null);
        if (userResponse?.data?.user) {
            appState.currentUser = userResponse.data.user;
            appState.isLoggedIn = true;
            appState.isAdmin = false;
            return;
        }
        
        const adminResponse = await api.get('/admin/me').catch(() => null);
        if (adminResponse?.data?.admin) {
            appState.currentUser = adminResponse.data.admin;
            appState.isLoggedIn = true;
            appState.isAdmin = true;
            return;
        }
    } catch (error) {
        console.log('No active session');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
    router.init();
});