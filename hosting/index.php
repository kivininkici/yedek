<?php
// OtoKiwi - cPanel Compatible Version
// Single Page Application Bootstrap

// Security Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Content Security Policy
$csp = "default-src 'self'; " .
       "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net; " .
       "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; " .
       "img-src 'self' data: https:; " .
       "font-src 'self' cdn.jsdelivr.net; " .
       "connect-src 'self'";
header("Content-Security-Policy: $csp");

// Get current route
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = dirname($_SERVER['SCRIPT_NAME']);
$route = str_replace($base_path, '', $request_uri);
$route = parse_url($route, PHP_URL_PATH);

// Remove leading slash
$route = ltrim($route, '/');

// Default to home if empty
if (empty($route)) {
    $route = 'home';
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OtoKiwi - Key Yönetim Sistemi</title>
    <meta name="description" content="OtoKiwi - Sosyal medya servisleri için güvenli key yönetim sistemi">
    
    <!-- Bootstrap 5.3 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome 6.4 -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link href="assets/css/style.css" rel="stylesheet">
</head>
<body>
    <!-- Loading Screen -->
    <div id="loading-screen" class="loading-screen">
        <div class="loading-spinner"></div>
        <div class="loading-text">OtoKiwi Yükleniyor...</div>
    </div>

    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div class="container">
            <a class="navbar-brand" href="#" onclick="router.navigate('home')">
                <i class="fas fa-kiwi-bird text-primary"></i> OtoKiwi
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="router.navigate('home')">Ana Sayfa</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="router.navigate('user')">Key Kullan</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="router.navigate('order-search')">Sipariş Sorgula</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" onclick="router.navigate('auth')">Giriş</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main id="app-content" class="mt-5 pt-4">
        <!-- Content will be loaded here by JavaScript -->
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-light py-4 mt-5">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5><i class="fas fa-kiwi-bird text-primary"></i> OtoKiwi</h5>
                    <p>Güvenli key yönetim sistemi</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p>&copy; 2025 OtoKiwi. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap 5.3 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <!-- Custom JavaScript -->
    <script src="assets/js/config.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/auth.js"></script>
    <script src="assets/js/router.js"></script>
    <script src="assets/js/pages.js"></script>
    <script src="assets/js/app.js"></script>
</body>
</html>