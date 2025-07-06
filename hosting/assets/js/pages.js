// Page templates for OtoKiwi SPA

const pages = {
    // Home page
    home: function() {
        return `
            <div class="container-fluid">
                <!-- Hero Section -->
                <section class="hero-section py-5">
                    <div class="container">
                        <div class="row align-items-center min-vh-100">
                            <div class="col-lg-6">
                                <div class="hero-content">
                                    <h1 class="display-4 fw-bold text-white mb-4">
                                        <i class="fas fa-kiwi-bird text-primary"></i>
                                        OtoKiwi
                                    </h1>
                                    <p class="lead text-muted mb-4">
                                        Premium Experience ile sosyal medya key yönetimi
                                    </p>
                                    <div class="hero-buttons">
                                        <button class="btn btn-primary btn-lg me-3" data-route="user">
                                            <i class="fas fa-key"></i> Key Kullan
                                        </button>
                                        <button class="btn btn-outline-primary btn-lg" data-route="order-search">
                                            <i class="fas fa-search"></i> Sipariş Sorgula
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="hero-image text-center">
                                    <div class="feature-card-3d">
                                        <i class="fas fa-shield-alt text-primary" style="font-size: 8rem;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Features Section -->
                <section class="features-section py-5">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-4 mb-4">
                                <div class="card h-100 text-center">
                                    <div class="card-body">
                                        <i class="fas fa-bolt text-primary mb-3" style="font-size: 3rem;"></i>
                                        <h5 class="card-title">Hızlı İşlem</h5>
                                        <p class="card-text">Key doğrulama ve sipariş işlemleri saniyeler içinde tamamlanır.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-4">
                                <div class="card h-100 text-center">
                                    <div class="card-body">
                                        <i class="fas fa-shield-check text-success mb-3" style="font-size: 3rem;"></i>
                                        <h5 class="card-title">Güvenilir Servis</h5>
                                        <p class="card-text">Güvenli altyapı ve 7/24 kesintisiz hizmet garantisi.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-4">
                                <div class="card h-100 text-center">
                                    <div class="card-body">
                                        <i class="fas fa-chart-line text-warning mb-3" style="font-size: 3rem;"></i>
                                        <h5 class="card-title">Canlı Takip</h5>
                                        <p class="card-text">Siparişlerinizi gerçek zamanlı olarak takip edebilirsiniz.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Stats Section -->
                <section class="stats-section py-5 bg-dark">
                    <div class="container">
                        <div class="row text-center">
                            <div class="col-md-3 mb-4">
                                <div class="stat-item">
                                    <h3 class="text-primary">5,847</h3>
                                    <p class="text-muted">Aktif Servis</p>
                                </div>
                            </div>
                            <div class="col-md-3 mb-4">
                                <div class="stat-item">
                                    <h3 class="text-success">50K+</h3>
                                    <p class="text-muted">Tamamlanan Sipariş</p>
                                </div>
                            </div>
                            <div class="col-md-3 mb-4">
                                <div class="stat-item">
                                    <h3 class="text-warning">24/7</h3>
                                    <p class="text-muted">Destek</p>
                                </div>
                            </div>
                            <div class="col-md-3 mb-4">
                                <div class="stat-item">
                                    <h3 class="text-info">4.9</h3>
                                    <p class="text-muted">Memnuniyet</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;
    },

    // Authentication page
    auth: function() {
        return `
            <div class="container">
                <div class="row justify-content-center min-vh-100 align-items-center">
                    <div class="col-md-6 col-lg-4">
                        <div class="card">
                            <div class="card-header text-center">
                                <h4><i class="fas fa-kiwi-bird text-primary"></i> OtoKiwi</h4>
                            </div>
                            <div class="card-body">
                                <!-- Tab Navigation -->
                                <ul class="nav nav-tabs" id="authTabs">
                                    <li class="nav-item flex-fill">
                                        <button class="nav-link active w-100" id="login-tab" data-bs-toggle="tab" data-bs-target="#login" type="button">
                                            <i class="fas fa-sign-in-alt"></i> Giriş
                                        </button>
                                    </li>
                                    <li class="nav-item flex-fill">
                                        <button class="nav-link w-100" id="register-tab" data-bs-toggle="tab" data-bs-target="#register" type="button">
                                            <i class="fas fa-user-plus"></i> Kayıt
                                        </button>
                                    </li>
                                </ul>

                                <!-- Tab Content -->
                                <div class="tab-content mt-4" id="authTabContent">
                                    <!-- Login Tab -->
                                    <div class="tab-pane fade show active" id="login">
                                        <form id="loginForm">
                                            <div class="mb-3">
                                                <label for="loginUsername" class="form-label">Kullanıcı Adı veya E-posta</label>
                                                <input type="text" class="form-control" id="loginUsername" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="loginPassword" class="form-label">Şifre</label>
                                                <input type="password" class="form-control" id="loginPassword" required>
                                            </div>
                                            <button type="submit" class="btn btn-primary w-100">
                                                <i class="fas fa-sign-in-alt"></i> Giriş Yap
                                            </button>
                                        </form>
                                    </div>

                                    <!-- Register Tab -->
                                    <div class="tab-pane fade" id="register">
                                        <form id="registerForm">
                                            <div class="mb-3">
                                                <label for="registerUsername" class="form-label">Kullanıcı Adı</label>
                                                <input type="text" class="form-control" id="registerUsername" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="registerEmail" class="form-label">E-posta</label>
                                                <input type="email" class="form-control" id="registerEmail" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="registerPassword" class="form-label">Şifre</label>
                                                <input type="password" class="form-control" id="registerPassword" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="registerPasswordConfirm" class="form-label">Şifre Tekrar</label>
                                                <input type="password" class="form-control" id="registerPasswordConfirm" required>
                                            </div>
                                            <button type="submit" class="btn btn-success w-100">
                                                <i class="fas fa-user-plus"></i> Kayıt Ol
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // User interface page
    user: function() {
        return `
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="card">
                            <div class="card-header">
                                <h4><i class="fas fa-key text-primary"></i> Key Kullan</h4>
                            </div>
                            <div class="card-body">
                                <!-- Step 1: Key Validation -->
                                <div id="step1" class="step-content">
                                    <h5>1. Key Doğrulama</h5>
                                    <form id="keyValidationForm">
                                        <div class="mb-3">
                                            <label for="keyValue" class="form-label">Key Değeri</label>
                                            <input type="text" class="form-control" id="keyValue" placeholder="Key değerinizi girin" required>
                                        </div>
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-check"></i> Key Doğrula
                                        </button>
                                    </form>
                                </div>

                                <!-- Step 2: Service Selection -->
                                <div id="step2" class="step-content d-none">
                                    <h5>2. Servis Seçimi</h5>
                                    <div id="serviceSelection">
                                        <!-- Services will be loaded here -->
                                    </div>
                                </div>

                                <!-- Step 3: Order Details -->
                                <div id="step3" class="step-content d-none">
                                    <h5>3. Sipariş Detayları</h5>
                                    <form id="orderForm">
                                        <div class="mb-3">
                                            <label for="targetUrl" class="form-label">Hedef URL</label>
                                            <input type="url" class="form-control" id="targetUrl" placeholder="https://..." required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="quantity" class="form-label">Miktar</label>
                                            <input type="number" class="form-control" id="quantity" min="1" required>
                                        </div>
                                        <div class="alert alert-info">
                                            <strong>Toplam Fiyat:</strong> <span id="totalPrice">0 ₺</span>
                                        </div>
                                        <button type="submit" class="btn btn-success">
                                            <i class="fas fa-shopping-cart"></i> Sipariş Ver
                                        </button>
                                    </form>
                                </div>

                                <!-- Step 4: Order Success -->
                                <div id="step4" class="step-content d-none">
                                    <div class="text-center">
                                        <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                                        <h4 class="mt-3">Sipariş Başarıyla Oluşturuldu!</h4>
                                        <p class="text-muted">Sipariş ID: <strong id="orderIdDisplay"></strong></p>
                                        <button class="btn btn-primary" data-route="order-search">
                                            <i class="fas fa-search"></i> Sipariş Takip Et
                                        </button>
                                        <button class="btn btn-outline-primary" onclick="resetUserInterface()">
                                            <i class="fas fa-plus"></i> Yeni Sipariş
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Order search page
    orderSearch: function() {
        return `
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="card">
                            <div class="card-header">
                                <h4><i class="fas fa-search text-primary"></i> Sipariş Sorgula</h4>
                            </div>
                            <div class="card-body">
                                <form id="orderSearchForm">
                                    <div class="input-group mb-3">
                                        <input type="text" class="form-control" id="orderSearchId" placeholder="Sipariş ID girin" required>
                                        <button class="btn btn-primary" type="submit">
                                            <i class="fas fa-search"></i> Sorgula
                                        </button>
                                    </div>
                                </form>

                                <div id="orderSearchResult" class="d-none">
                                    <!-- Order result will be displayed here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Admin panel
    admin: function() {
        if (!auth.isAdmin()) {
            return `
                <div class="container mt-5">
                    <div class="alert alert-danger">
                        <h4>Erişim Reddedildi</h4>
                        <p>Bu sayfaya erişim için admin yetkisi gereklidir.</p>
                        <button class="btn btn-primary" data-route="home">Ana Sayfaya Dön</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="container-fluid">
                <div class="row">
                    <!-- Sidebar -->
                    <nav class="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse" id="sidebarMenu">
                        <div class="sidebar-sticky pt-3">
                            <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                                <span>YÖNETİM</span>
                            </h6>
                            <ul class="nav flex-column">
                                <li class="nav-item">
                                    <a class="nav-link text-light" href="#" onclick="loadAdminPage('dashboard')">
                                        <i class="fas fa-tachometer-alt"></i> Dashboard
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link text-light" href="#" onclick="loadAdminPage('users')">
                                        <i class="fas fa-users"></i> Kullanıcılar
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link text-light" href="#" onclick="loadAdminPage('keys')">
                                        <i class="fas fa-key"></i> Key Yönetimi
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link text-light" href="#" onclick="loadAdminPage('orders')">
                                        <i class="fas fa-shopping-cart"></i> Siparişler
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link text-light" href="#" onclick="loadAdminPage('services')">
                                        <i class="fas fa-cogs"></i> Servisler
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link text-light" href="#" onclick="loadAdminPage('apis')">
                                        <i class="fas fa-plug"></i> API Yönetimi
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link text-light" href="#" onclick="loadAdminPage('feedback')">
                                        <i class="fas fa-comments"></i> Geri Bildirim
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link text-light" href="#" onclick="loadAdminPage('logs')">
                                        <i class="fas fa-list"></i> Loglar
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    <!-- Main content -->
                    <main class="col-md-9 ml-sm-auto col-lg-10 px-md-4">
                        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                            <h1 class="h2">Admin Panel</h1>
                            <div class="btn-toolbar mb-2 mb-md-0">
                                <button class="btn btn-outline-secondary" onclick="refreshAdminData()">
                                    <i class="fas fa-sync-alt"></i> Yenile
                                </button>
                            </div>
                        </div>

                        <div id="adminContent">
                            <!-- Admin content will be loaded here -->
                            <div class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Yükleniyor...</span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        `;
    },

    // Profile page
    profile: function() {
        if (!auth.isAuthenticated()) {
            return `
                <div class="container mt-5">
                    <div class="alert alert-warning">
                        <h4>Giriş Gerekli</h4>
                        <p>Bu sayfaya erişim için giriş yapmanız gerekiyor.</p>
                        <button class="btn btn-primary" data-route="auth">Giriş Yap</button>
                    </div>
                </div>
            `;
        }

        const user = auth.getUser();
        return `
            <div class="container mt-5">
                <div class="row">
                    <div class="col-lg-4">
                        <div class="card">
                            <div class="card-body text-center">
                                <img src="${auth.getAvatarUrl()}" alt="Avatar" class="rounded-circle mb-3" width="120" height="120">
                                <h5>${user.username}</h5>
                                <p class="text-muted">${user.email}</p>
                                ${auth.getRoleBadge()}
                                <hr>
                                <button class="btn btn-outline-danger w-100" onclick="auth.logout()">
                                    <i class="fas fa-sign-out-alt"></i> Çıkış Yap
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-8">
                        <div class="card">
                            <div class="card-header">
                                <h5>Profil Bilgileri</h5>
                            </div>
                            <div class="card-body">
                                <form id="profileForm">
                                    <div class="mb-3">
                                        <label for="profileUsername" class="form-label">Kullanıcı Adı</label>
                                        <input type="text" class="form-control" id="profileUsername" value="${user.username}" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label for="profileEmail" class="form-label">E-posta</label>
                                        <input type="email" class="form-control" id="profileEmail" value="${user.email}" readonly>
                                    </div>
                                    <div class="mb-3">
                                        <label for="profileRole" class="form-label">Rol</label>
                                        <input type="text" class="form-control" id="profileRole" value="${user.role}" readonly>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Export pages globally
window.pages = pages;