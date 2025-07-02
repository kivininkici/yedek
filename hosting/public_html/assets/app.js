// KeyPanel - Main Application JavaScript
// Web Hosting Uyumlu Statik Versiyon

// Global Variables
let currentUser = null;
let isAdmin = false;
let currentPage = 'home';

// Sample Data (gerçek uygulamada API'den gelecek)
const sampleKeys = [
    { id: 1, value: 'DEMO-KEY-123456', category: 'Instagram', maxQuantity: 1000, isUsed: false, createdAt: '2025-07-02' },
    { id: 2, value: 'DEMO-KEY-789012', category: 'YouTube', maxQuantity: 500, isUsed: true, createdAt: '2025-07-01' },
    { id: 3, value: 'DEMO-KEY-345678', category: 'TikTok', maxQuantity: 2000, isUsed: false, createdAt: '2025-06-30' }
];

const sampleServices = [
    { id: 1, name: 'Instagram Takipçi', category: 'Instagram', price: 5.0, minQuantity: 10, maxQuantity: 10000 },
    { id: 2, name: 'Instagram Beğeni', category: 'Instagram', price: 2.5, minQuantity: 10, maxQuantity: 5000 },
    { id: 3, name: 'YouTube Görüntüleme', category: 'YouTube', price: 8.0, minQuantity: 100, maxQuantity: 50000 },
    { id: 4, name: 'TikTok Takipçi', category: 'TikTok', price: 4.0, minQuantity: 10, maxQuantity: 15000 }
];

const sampleOrders = [
    { id: 'ORD-123456', service: 'Instagram Takipçi', quantity: 500, targetUrl: 'https://instagram.com/demo', status: 'Tamamlandı', createdAt: '2025-07-02', key: 'DEMO-KEY-123456' },
    { id: 'ORD-789012', service: 'YouTube Görüntüleme', quantity: 1000, targetUrl: 'https://youtube.com/watch?v=demo', status: 'İşlemde', createdAt: '2025-07-01', key: 'DEMO-KEY-789012' }
];

const sampleUsers = [
    { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: '2025-06-01' },
    { id: 2, username: 'user1', email: 'user1@example.com', role: 'user', createdAt: '2025-06-15' }
];

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Load saved session
    loadSession();
    
    // Show initial page
    showPage('home');
    
    // Set up navigation
    updateNavigation();
});

// Session Management
function loadSession() {
    const savedUser = localStorage.getItem('keypanel_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isAdmin = currentUser.role === 'admin';
    }
}

function saveSession(user) {
    currentUser = user;
    isAdmin = user.role === 'admin';
    localStorage.setItem('keypanel_user', JSON.stringify(user));
    updateNavigation();
}

function logout() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem('keypanel_user');
    updateNavigation();
    showPage('home');
    showAlert('Başarıyla çıkış yapıldı!', 'success');
}

// Navigation Management
function updateNavigation() {
    const loginSection = document.getElementById('nav-login-section');
    const adminSection = document.getElementById('nav-admin-section');
    const logoutSection = document.getElementById('nav-logout-section');
    
    if (currentUser) {
        loginSection.classList.add('d-none');
        logoutSection.classList.remove('d-none');
        
        if (isAdmin) {
            adminSection.classList.remove('d-none');
        } else {
            adminSection.classList.add('d-none');
        }
    } else {
        loginSection.classList.remove('d-none');
        adminSection.classList.add('d-none');
        logoutSection.classList.add('d-none');
    }
    
    // Update active nav item
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeNav = document.getElementById(`nav-${currentPage}`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

// Page Management
function showPage(page) {
    currentPage = page;
    updateNavigation();
    
    const content = document.getElementById('main-content');
    content.innerHTML = '';
    content.className = 'py-4 fade-in';
    
    switch (page) {
        case 'home':
            showHomePage();
            break;
        case 'user':
            showUserPage();
            break;
        case 'order-search':
            showOrderSearchPage();
            break;
        case 'login':
            showLoginPage();
            break;
        case 'dashboard':
            if (isAdmin) showDashboardPage();
            else showPage('login');
            break;
        case 'keys':
            if (isAdmin) showKeysPage();
            else showPage('login');
            break;
        case 'services':
            if (isAdmin) showServicesPage();
            else showPage('login');
            break;
        case 'users':
            if (isAdmin) showUsersPage();
            else showPage('login');
            break;
        case 'orders':
            if (isAdmin) showOrdersPage();
            else showPage('login');
            break;
        default:
            show404Page();
    }
}

// Home Page
function showHomePage() {
    document.getElementById('main-content').innerHTML = `
        <div class="hero-section">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <h1 class="hero-title">
                            <i class="fas fa-key me-3"></i>KeyPanel
                        </h1>
                        <p class="hero-subtitle">
                            Sosyal medya servisleri için güvenli anahtar yönetim sistemi. 
                            Tek kullanımlık anahtarlar ile güvenli sipariş yönetimi.
                        </p>
                        <div class="d-flex gap-3 flex-wrap">
                            <button class="btn btn-light btn-lg" onclick="showPage('user')">
                                <i class="fas fa-user me-2"></i>Key Kullan
                            </button>
                            <button class="btn btn-outline-light btn-lg" onclick="showPage('order-search')">
                                <i class="fas fa-search me-2"></i>Sipariş Sorgula
                            </button>
                        </div>
                    </div>
                    <div class="col-lg-4 text-center">
                        <i class="fas fa-shield-alt" style="font-size: 8rem; opacity: 0.3;"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="container">
            <div class="row">
                <div class="col-lg-4 mb-4">
                    <div class="card feature-card">
                        <div class="card-body">
                            <div class="feature-icon">
                                <i class="fas fa-key"></i>
                            </div>
                            <h5 class="card-title">Güvenli Key Sistemi</h5>
                            <p class="card-text">
                                Tek kullanımlık anahtarlar ile maksimum güvenlik. 
                                Her key sadece bir kez kullanılabilir.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4 mb-4">
                    <div class="card feature-card">
                        <div class="card-body">
                            <div class="feature-icon">
                                <i class="fas fa-cogs"></i>
                            </div>
                            <h5 class="card-title">Çoklu Servis Desteği</h5>
                            <p class="card-text">
                                Instagram, YouTube, TikTok ve daha fazla platform 
                                için geniş servis yelpazesi.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4 mb-4">
                    <div class="card feature-card">
                        <div class="card-body">
                            <div class="feature-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <h5 class="card-title">Anlık Takip</h5>
                            <p class="card-text">
                                Siparişlerinizi anlık olarak takip edin. 
                                Gerçek zamanlı durum güncellemeleri.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-5">
                <div class="col-12 text-center">
                    <h3 class="mb-4">Sistem İstatistikleri</h3>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stats-card">
                        <div class="stats-number">${sampleKeys.length}</div>
                        <div class="stats-label">Toplam Key</div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stats-card">
                        <div class="stats-number">${sampleServices.length}</div>
                        <div class="stats-label">Aktif Servis</div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stats-card">
                        <div class="stats-number">${sampleOrders.length}</div>
                        <div class="stats-label">Toplam Sipariş</div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stats-card">
                        <div class="stats-number">${sampleUsers.length}</div>
                        <div class="stats-label">Kayıtlı Kullanıcı</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// User Page
function showUserPage() {
    document.getElementById('main-content').innerHTML = `
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h4 class="mb-0">
                                <i class="fas fa-key me-2"></i>Key Doğrulama ve Servis Seçimi
                            </h4>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-4">
                                        <label for="keyInput" class="form-label">Key Değeri</label>
                                        <input type="text" class="form-control" id="keyInput" 
                                               placeholder="Örn: DEMO-KEY-123456" 
                                               onchange="validateKey()">
                                        <div class="form-text">Key değerinizi yukarıdaki alana girin</div>
                                    </div>
                                    
                                    <button class="btn btn-primary w-100" onclick="validateKey()">
                                        <i class="fas fa-check me-2"></i>Key'i Doğrula
                                    </button>
                                </div>
                                
                                <div class="col-md-6">
                                    <div id="keyValidationResult"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mt-4 d-none" id="serviceSelectionCard">
                        <div class="card-header">
                            <h5 class="mb-0">
                                <i class="fas fa-cogs me-2"></i>Servis Seçimi
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="servicesList"></div>
                            
                            <div class="row mt-4 d-none" id="orderForm">
                                <div class="col-md-6">
                                    <label for="targetUrl" class="form-label">Hedef URL</label>
                                    <input type="url" class="form-control" id="targetUrl" 
                                           placeholder="https://instagram.com/username">
                                </div>
                                <div class="col-md-6">
                                    <label for="quantity" class="form-label">Miktar</label>
                                    <input type="number" class="form-control" id="quantity" 
                                           placeholder="100" min="1">
                                </div>
                                <div class="col-12 mt-3">
                                    <button class="btn btn-success w-100" onclick="createOrder()">
                                        <i class="fas fa-shopping-cart me-2"></i>Siparişi Oluştur
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Order Search Page
function showOrderSearchPage() {
    document.getElementById('main-content').innerHTML = `
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h4 class="mb-0">
                                <i class="fas fa-search me-2"></i>Sipariş Durumu Sorgulama
                            </h4>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <label for="orderIdInput" class="form-label">Sipariş ID</label>
                                    <input type="text" class="form-control" id="orderIdInput" 
                                           placeholder="ORD-123456">
                                </div>
                                <div class="col-md-4 d-flex align-items-end">
                                    <button class="btn btn-primary w-100" onclick="searchOrder()">
                                        <i class="fas fa-search me-2"></i>Sorgula
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="orderSearchResult" class="mt-4"></div>
                </div>
            </div>
        </div>
    `;
}

// Login Page
function showLoginPage() {
    document.getElementById('main-content').innerHTML = `
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-4">
                    <div class="card">
                        <div class="card-header text-center">
                            <h4 class="mb-0">
                                <i class="fas fa-sign-in-alt me-2"></i>Admin Giriş
                            </h4>
                        </div>
                        <div class="card-body">
                            <form onsubmit="return handleLogin(event)">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Kullanıcı Adı</label>
                                    <input type="text" class="form-control" id="username" 
                                           required value="admin">
                                </div>
                                
                                <div class="mb-3">
                                    <label for="password" class="form-label">Şifre</label>
                                    <input type="password" class="form-control" id="password" 
                                           required value="admin123">
                                </div>
                                
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="fas fa-sign-in-alt me-2"></i>Giriş Yap
                                </button>
                            </form>
                            
                            <div class="mt-3 text-center">
                                <small class="text-muted">Demo: admin / admin123</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Dashboard Page
function showDashboardPage() {
    const totalKeys = sampleKeys.length;
    const usedKeys = sampleKeys.filter(k => k.isUsed).length;
    const activeKeys = totalKeys - usedKeys;
    
    document.getElementById('main-content').innerHTML = `
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="fas fa-tachometer-alt me-2"></i>Admin Dashboard</h2>
                <div class="text-muted">Hoş geldiniz, ${currentUser.username}</div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-3 mb-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4>${totalKeys}</h4>
                                    <p class="mb-0">Toplam Key</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-key fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 mb-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4>${activeKeys}</h4>
                                    <p class="mb-0">Aktif Key</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-check-circle fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 mb-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4>${sampleServices.length}</h4>
                                    <p class="mb-0">Toplam Servis</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-cogs fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3 mb-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4>${sampleOrders.length}</h4>
                                    <p class="mb-0">Toplam Sipariş</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-shopping-cart fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Son Key'ler</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Key</th>
                                            <th>Kategori</th>
                                            <th>Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${sampleKeys.slice(0, 5).map(key => `
                                            <tr>
                                                <td><code>${key.value}</code></td>
                                                <td><span class="badge bg-secondary">${key.category}</span></td>
                                                <td>
                                                    <span class="badge ${key.isUsed ? 'bg-danger' : 'bg-success'}">
                                                        ${key.isUsed ? 'Kullanıldı' : 'Aktif'}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Son Siparişler</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Sipariş ID</th>
                                            <th>Servis</th>
                                            <th>Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${sampleOrders.map(order => `
                                            <tr>
                                                <td><code>${order.id}</code></td>
                                                <td>${order.service}</td>
                                                <td>
                                                    <span class="badge ${order.status === 'Tamamlandı' ? 'bg-success' : 'bg-warning'}">
                                                        ${order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Keys Management Page
function showKeysPage() {
    document.getElementById('main-content').innerHTML = `
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="fas fa-key me-2"></i>Key Yönetimi</h2>
                <button class="btn btn-primary" onclick="showCreateKeyModal()">
                    <i class="fas fa-plus me-2"></i>Yeni Key Oluştur
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Key Değeri</th>
                                    <th>Kategori</th>
                                    <th>Maksimum Miktar</th>
                                    <th>Durum</th>
                                    <th>Oluşturulma</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sampleKeys.map(key => `
                                    <tr>
                                        <td>${key.id}</td>
                                        <td><code>${key.value}</code></td>
                                        <td><span class="badge bg-secondary">${key.category}</span></td>
                                        <td>${key.maxQuantity.toLocaleString()}</td>
                                        <td>
                                            <span class="badge ${key.isUsed ? 'bg-danger' : 'bg-success'}">
                                                ${key.isUsed ? 'Kullanıldı' : 'Aktif'}
                                            </span>
                                        </td>
                                        <td>${key.createdAt}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" onclick="editKey(${key.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" onclick="deleteKey(${key.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Services Management Page
function showServicesPage() {
    document.getElementById('main-content').innerHTML = `
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="fas fa-cogs me-2"></i>Servis Yönetimi</h2>
                <button class="btn btn-primary" onclick="showCreateServiceModal()">
                    <i class="fas fa-plus me-2"></i>Yeni Servis Ekle
                </button>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Servis Adı</th>
                                    <th>Kategori</th>
                                    <th>Fiyat</th>
                                    <th>Min-Max Miktar</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sampleServices.map(service => `
                                    <tr>
                                        <td>${service.id}</td>
                                        <td>${service.name}</td>
                                        <td><span class="badge bg-secondary">${service.category}</span></td>
                                        <td><strong>₺${service.price.toFixed(2)}</strong></td>
                                        <td>${service.minQuantity} - ${service.maxQuantity.toLocaleString()}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" onclick="editService(${service.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" onclick="deleteService(${service.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Users Management Page
function showUsersPage() {
    document.getElementById('main-content').innerHTML = `
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="fas fa-users me-2"></i>Kullanıcı Yönetimi</h2>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Kullanıcı Adı</th>
                                    <th>E-posta</th>
                                    <th>Rol</th>
                                    <th>Kayıt Tarihi</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sampleUsers.map(user => `
                                    <tr>
                                        <td>${user.id}</td>
                                        <td>${user.username}</td>
                                        <td>${user.email}</td>
                                        <td>
                                            <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}">
                                                ${user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                                            </span>
                                        </td>
                                        <td>${user.createdAt}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" onclick="editUser(${user.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            ${user.id !== 1 ? `
                                                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Orders Management Page
function showOrdersPage() {
    document.getElementById('main-content').innerHTML = `
        <div class="container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2><i class="fas fa-shopping-cart me-2"></i>Sipariş Yönetimi</h2>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Sipariş ID</th>
                                    <th>Servis</th>
                                    <th>Miktar</th>
                                    <th>Hedef URL</th>
                                    <th>Durum</th>
                                    <th>Tarih</th>
                                    <th>Key</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sampleOrders.map(order => `
                                    <tr>
                                        <td><code>${order.id}</code></td>
                                        <td>${order.service}</td>
                                        <td>${order.quantity.toLocaleString()}</td>
                                        <td><a href="${order.targetUrl}" target="_blank" class="text-truncate d-inline-block" style="max-width: 200px;">${order.targetUrl}</a></td>
                                        <td>
                                            <span class="badge ${order.status === 'Tamamlandı' ? 'bg-success' : 'bg-warning'}">
                                                ${order.status}
                                            </span>
                                        </td>
                                        <td>${order.createdAt}</td>
                                        <td><code>${order.key}</code></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 404 Page
function show404Page() {
    document.getElementById('main-content').innerHTML = `
        <div class="container text-center">
            <div class="py-5">
                <i class="fas fa-exclamation-triangle fa-5x text-warning mb-4"></i>
                <h1 class="display-4">404 - Sayfa Bulunamadı</h1>
                <p class="lead">Aradığınız sayfa mevcut değil.</p>
                <button class="btn btn-primary" onclick="showPage('home')">
                    <i class="fas fa-home me-2"></i>Ana Sayfaya Dön
                </button>
            </div>
        </div>
    `;
}

// Event Handlers
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Demo login validation
    if (username === 'admin' && password === 'admin123') {
        const adminUser = sampleUsers.find(u => u.username === 'admin');
        saveSession(adminUser);
        showPage('dashboard');
        showAlert('Başarıyla giriş yapıldı!', 'success');
    } else {
        showAlert('Geçersiz kullanıcı adı veya şifre!', 'error');
    }
    
    return false;
}

function validateKey() {
    const keyValue = document.getElementById('keyInput').value.trim();
    const resultDiv = document.getElementById('keyValidationResult');
    
    if (!keyValue) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Lütfen bir key değeri girin</div>';
        return;
    }
    
    // Demo key validation
    const foundKey = sampleKeys.find(k => k.value === keyValue);
    
    if (foundKey) {
        if (foundKey.isUsed) {
            resultDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    <strong>Key Kullanıldı!</strong><br>
                    Bu key daha önce kullanılmış.
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Key Doğrulandı!</strong><br>
                    <strong>Kategori:</strong> ${foundKey.category}<br>
                    <strong>Maksimum Miktar:</strong> ${foundKey.maxQuantity.toLocaleString()}<br>
                    <strong>Durum:</strong> Aktif
                </div>
            `;
            
            // Show services for this category
            showServicesForCategory(foundKey.category);
        }
    } else {
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-times-circle me-2"></i>
                <strong>Geçersiz Key!</strong><br>
                Bu key sistemde bulunamadı.
            </div>
        `;
    }
}

function showServicesForCategory(category) {
    const serviceCard = document.getElementById('serviceSelectionCard');
    const servicesList = document.getElementById('servicesList');
    
    const categoryServices = sampleServices.filter(s => s.category === category);
    
    servicesList.innerHTML = categoryServices.map(service => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h6 class="card-title mb-1">${service.name}</h6>
                        <p class="card-text text-muted mb-0">
                            ${service.minQuantity} - ${service.maxQuantity.toLocaleString()} adet
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="h5 text-primary mb-1">₺${service.price.toFixed(2)}</div>
                        <button class="btn btn-sm btn-primary" onclick="selectService(${service.id})">
                            Seç
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    serviceCard.classList.remove('d-none');
}

function selectService(serviceId) {
    const service = sampleServices.find(s => s.id === serviceId);
    
    // Update quantity input constraints
    const quantityInput = document.getElementById('quantity');
    quantityInput.min = service.minQuantity;
    quantityInput.max = service.maxQuantity;
    quantityInput.placeholder = `${service.minQuantity} - ${service.maxQuantity.toLocaleString()}`;
    
    // Show order form
    document.getElementById('orderForm').classList.remove('d-none');
    
    // Store selected service
    window.selectedService = service;
    
    showAlert(`${service.name} seçildi. Sipariş detaylarını doldurun.`, 'info');
}

function createOrder() {
    const keyValue = document.getElementById('keyInput').value.trim();
    const targetUrl = document.getElementById('targetUrl').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value);
    
    if (!keyValue || !targetUrl || !quantity || !window.selectedService) {
        showAlert('Lütfen tüm alanları doldurun!', 'error');
        return;
    }
    
    // Generate order ID
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Create order
    const newOrder = {
        id: orderId,
        service: window.selectedService.name,
        quantity: quantity,
        targetUrl: targetUrl,
        status: 'İşlemde',
        createdAt: new Date().toISOString().split('T')[0],
        key: keyValue
    };
    
    sampleOrders.unshift(newOrder);
    
    // Mark key as used
    const keyIndex = sampleKeys.findIndex(k => k.value === keyValue);
    if (keyIndex !== -1) {
        sampleKeys[keyIndex].isUsed = true;
    }
    
    showAlert(`Sipariş oluşturuldu! Sipariş ID: ${orderId}`, 'success');
    
    // Reset form
    document.getElementById('keyInput').value = '';
    document.getElementById('targetUrl').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('keyValidationResult').innerHTML = '';
    document.getElementById('serviceSelectionCard').classList.add('d-none');
    document.getElementById('orderForm').classList.add('d-none');
}

function searchOrder() {
    const orderId = document.getElementById('orderIdInput').value.trim();
    const resultDiv = document.getElementById('orderSearchResult');
    
    if (!orderId) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Lütfen sipariş ID girin</div>';
        return;
    }
    
    const order = sampleOrders.find(o => o.id === orderId);
    
    if (order) {
        const progressPercent = order.status === 'Tamamlandı' ? 100 : 65;
        
        resultDiv.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between">
                    <h5 class="mb-0">Sipariş Detayları</h5>
                    <span class="badge ${order.status === 'Tamamlandı' ? 'bg-success' : 'bg-warning'}">
                        ${order.status}
                    </span>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <strong>Sipariş ID:</strong> ${order.id}
                        </div>
                        <div class="col-md-6">
                            <strong>Tarih:</strong> ${order.createdAt}
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <strong>Servis:</strong> ${order.service}
                        </div>
                        <div class="col-md-6">
                            <strong>Miktar:</strong> ${order.quantity.toLocaleString()}
                        </div>
                    </div>
                    <div class="mb-3">
                        <strong>Hedef URL:</strong><br>
                        <a href="${order.targetUrl}" target="_blank">${order.targetUrl}</a>
                    </div>
                    <div class="mb-3">
                        <strong>Kullanılan Key:</strong> <code>${order.key}</code>
                    </div>
                    <div class="mb-3">
                        <strong>İlerleme:</strong>
                        <div class="progress mt-2">
                            <div class="progress-bar" style="width: ${progressPercent}%"></div>
                        </div>
                        <small class="text-muted">${progressPercent}% tamamlandı</small>
                    </div>
                    ${order.status === 'Tamamlandı' ? `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            Sipariş başarıyla tamamlandı!
                        </div>
                    ` : `
                        <div class="alert alert-info">
                            <i class="fas fa-clock me-2"></i>
                            Sipariş işleniyor. Lütfen bekleyin...
                        </div>
                    `}
                </div>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-times-circle me-2"></i>
                <strong>Sipariş Bulunamadı!</strong><br>
                Girdiğiniz sipariş ID sistemde bulunamadı.
            </div>
        `;
    }
}

// Helper Functions
function showAlert(message, type = 'info') {
    Swal.fire({
        title: type === 'success' ? 'Başarılı!' : type === 'error' ? 'Hata!' : 'Bilgi',
        text: message,
        icon: type === 'error' ? 'error' : type === 'success' ? 'success' : 'info',
        confirmButtonText: 'Tamam'
    });
}

// Placeholder functions for admin actions
function showCreateKeyModal() {
    showAlert('Key oluşturma özelliği demo sürümünde aktif değil', 'info');
}

function showCreateServiceModal() {
    showAlert('Servis ekleme özelliği demo sürümünde aktif değil', 'info');
}

function editKey(id) {
    showAlert('Key düzenleme özelliği demo sürümünde aktif değil', 'info');
}

function deleteKey(id) {
    showAlert('Key silme özelliği demo sürümünde aktif değil', 'info');
}

function editService(id) {
    showAlert('Servis düzenleme özelliği demo sürümünde aktif değil', 'info');
}

function deleteService(id) {
    showAlert('Servis silme özelliği demo sürümünde aktif değil', 'info');
}

function editUser(id) {
    showAlert('Kullanıcı düzenleme özelliği demo sürümünde aktif değil', 'info');
}

function deleteUser(id) {
    showAlert('Kullanıcı silme özelliği demo sürümünde aktif değil', 'info');
}