<?php
session_start();

// Database bağlantısı
$config = include 'config.php';
$db = new PDO($config['database']['dsn'], $config['database']['username'], $config['database']['password']);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Sayfa routing
$page = isset($_GET['page']) ? $_GET['page'] : 'home';

// Login kontrolü
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function isAdmin() {
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] == 1;
}

// Admin sayfaları için kontrol
$adminPages = ['dashboard', 'keys', 'services', 'users', 'orders', 'settings'];
if (in_array($page, $adminPages) && !isAdmin()) {
    $page = 'login';
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KeyPanel - Anahtar Yönetim Sistemi</title>
    <meta name="description" content="Sosyal medya servisleri için güvenli anahtar yönetim sistemi">
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="?page=home">
                <i class="fas fa-key me-2"></i>KeyPanel
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link <?php echo $page == 'home' ? 'active' : ''; ?>" href="?page=home">
                            <i class="fas fa-home me-1"></i>Ana Sayfa
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo $page == 'user' ? 'active' : ''; ?>" href="?page=user">
                            <i class="fas fa-user me-1"></i>Key Kullan
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo $page == 'order-search' ? 'active' : ''; ?>" href="?page=order-search">
                            <i class="fas fa-search me-1"></i>Sipariş Sorgula
                        </a>
                    </li>
                </ul>
                
                <ul class="navbar-nav">
                    <?php if (isLoggedIn()): ?>
                        <?php if (isAdmin()): ?>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-cog me-1"></i>Admin Panel
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="?page=dashboard">
                                        <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                                    </a></li>
                                    <li><a class="dropdown-item" href="?page=keys">
                                        <i class="fas fa-key me-2"></i>Key Yönetimi
                                    </a></li>
                                    <li><a class="dropdown-item" href="?page=services">
                                        <i class="fas fa-cogs me-2"></i>Servis Yönetimi
                                    </a></li>
                                    <li><a class="dropdown-item" href="?page=users">
                                        <i class="fas fa-users me-2"></i>Kullanıcılar
                                    </a></li>
                                    <li><a class="dropdown-item" href="?page=orders">
                                        <i class="fas fa-shopping-cart me-2"></i>Siparişler
                                    </a></li>
                                </ul>
                            </li>
                        <?php endif; ?>
                        <li class="nav-item">
                            <a class="nav-link" href="?page=logout">
                                <i class="fas fa-sign-out-alt me-1"></i>Çıkış
                            </a>
                        </li>
                    <?php else: ?>
                        <li class="nav-item">
                            <a class="nav-link <?php echo $page == 'login' ? 'active' : ''; ?>" href="?page=login">
                                <i class="fas fa-sign-in-alt me-1"></i>Giriş
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link <?php echo $page == 'register' ? 'active' : ''; ?>" href="?page=register">
                                <i class="fas fa-user-plus me-1"></i>Kayıt
                            </a>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="py-4">
        <?php
        switch ($page) {
            case 'home':
                include 'pages/home.php';
                break;
            case 'user':
                include 'pages/user.php';
                break;
            case 'order-search':
                include 'pages/order-search.php';
                break;
            case 'login':
                include 'pages/login.php';
                break;
            case 'register':
                include 'pages/register.php';
                break;
            case 'logout':
                include 'pages/logout.php';
                break;
            case 'dashboard':
                include 'pages/admin/dashboard.php';
                break;
            case 'keys':
                include 'pages/admin/keys.php';
                break;
            case 'services':
                include 'pages/admin/services.php';
                break;
            case 'users':
                include 'pages/admin/users.php';
                break;
            case 'orders':
                include 'pages/admin/orders.php';
                break;
            default:
                include 'pages/404.php';
                break;
        }
        ?>
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-light py-4 mt-5">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5><i class="fas fa-key me-2"></i>KeyPanel</h5>
                    <p class="mb-0">Sosyal medya servisleri için güvenli anahtar yönetim sistemi</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="mb-0">&copy; 2025 KeyPanel. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom JS -->
    <script src="assets/script.js"></script>
</body>
</html>