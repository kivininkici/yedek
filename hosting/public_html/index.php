<?php
// KeyPanel - cPanel Hosting Uyumlu Ana Dosya
// Türkçe: Bu dosya cPanel hosting ortamında çalışacak ana dosyadır

// PHP ile basit routing sistemi
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = dirname($_SERVER['SCRIPT_NAME']);
$path = str_replace($base_path, '', $request_uri);
$path = ltrim($path, '/');

// Static dosyalar için kontrol
if (preg_match('/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/', $path)) {
    return false; // Apache'nin static dosyaları serve etmesine izin ver
}

// API istekleri için yönlendirme
if (strpos($path, 'api/') === 0) {
    include 'api/index.php';
    exit;
}

// React Router için tüm diğer istekleri ana sayfaya yönlendir
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KeyPanel - Anahtar Yönetim Sistemi</title>
    <meta name="description" content="Sosyal medya servisleri için güvenli anahtar yönetim sistemi. Admin paneli ve kullanıcı arayüzü ile kapsamlı yönetim.">
    
    <!-- CSS dosyaları -->
    <link rel="stylesheet" href="assets/index.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
    
    <!-- React ve diğer kütüphaneler CDN'den -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <!-- Uygulama konfigürasyonu -->
    <script>
        window.APP_CONFIG = {
            apiUrl: '<?php echo 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . $_SERVER['HTTP_HOST'] . $base_path; ?>/api',
            basePath: '<?php echo $base_path; ?>'
        };
    </script>
</head>
<body>
    <div id="root">
        <!-- Loading ekranı -->
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Inter, sans-serif;">
            <div style="text-align: center;">
                <div style="width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="color: #6b7280;">KeyPanel Yükleniyor...</p>
            </div>
        </div>
    </div>
    
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    
    <!-- Ana uygulama scripti -->
    <script src="assets/app.js"></script>
</body>
</html>