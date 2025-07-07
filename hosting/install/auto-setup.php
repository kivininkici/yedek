<?php
/**
 * OtoKiwi Otomatik Kurulum
 * Tek tıkla kurulum sistemi
 */

// Hata raporlamayı aç
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Header ayarları
header('Content-Type: text/html; charset=utf-8');

// Kurulum adımları
$steps = [
    'Database Bağlantısı',
    'Tabloları Oluştur',
    'Admin Hesabı',
    'Yapılandırma',
    'Test'
];

$currentStep = 0;
$errors = [];
$success = [];

// POST verisi varsa kurulum başlat
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $autoSetup = isset($_POST['auto_setup']);
    
    if ($autoSetup) {
        // Otomatik kurulum
        performAutoSetup();
    } else {
        // Manuel kurulum
        performManualSetup();
    }
}

function performAutoSetup() {
    global $errors, $success, $currentStep;
    
    // Varsayılan ayarlar
    $dbConfig = [
        'host' => 'localhost',
        'username' => 'root',
        'password' => '',
        'database' => 'otokiwi'
    ];
    
    // Adım 1: Database bağlantısı
    $currentStep = 1;
    if (testDatabaseConnection($dbConfig)) {
        $success[] = "Database bağlantısı başarılı";
        
        // Adım 2: Tabloları oluştur
        $currentStep = 2;
        if (createTables($dbConfig)) {
            $success[] = "Tablolar oluşturuldu";
            
            // Adım 3: Admin hesabı
            $currentStep = 3;
            if (createAdminUser($dbConfig)) {
                $success[] = "Admin hesabı oluşturuldu";
                
                // Adım 4: Yapılandırma
                $currentStep = 4;
                if (writeConfig($dbConfig)) {
                    $success[] = "Yapılandırma kaydedildi";
                    
                    // Adım 5: Test
                    $currentStep = 5;
                    if (testSystem()) {
                        $success[] = "Sistem testi başarılı";
                        $success[] = "🎉 Kurulum tamamlandı!";
                    }
                }
            }
        }
    }
}

function testDatabaseConnection($config) {
    global $errors;
    
    try {
        $conn = new mysqli($config['host'], $config['username'], $config['password']);
        
        if ($conn->connect_error) {
            $errors[] = "MySQL bağlantısı başarısız: " . $conn->connect_error;
            return false;
        }
        
        // Database oluştur
        $sql = "CREATE DATABASE IF NOT EXISTS " . $config['database'] . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
        if (!$conn->query($sql)) {
            $errors[] = "Database oluşturulamadı: " . $conn->error;
            return false;
        }
        
        $conn->close();
        return true;
        
    } catch (Exception $e) {
        $errors[] = "Database hatası: " . $e->getMessage();
        return false;
    }
}

function createTables($config) {
    global $errors;
    
    try {
        $conn = new mysqli($config['host'], $config['username'], $config['password'], $config['database']);
        
        if ($conn->connect_error) {
            $errors[] = "Database bağlantısı başarısız";
            return false;
        }
        
        // SQL dosyasını oku
        $sqlFile = __DIR__ . '/database.sql';
        if (!file_exists($sqlFile)) {
            $errors[] = "SQL dosyası bulunamadı";
            return false;
        }
        
        $sql = file_get_contents($sqlFile);
        
        // Sorguları çalıştır
        if ($conn->multi_query($sql)) {
            do {
                if ($result = $conn->store_result()) {
                    $result->free();
                }
            } while ($conn->next_result());
        }
        
        if ($conn->error) {
            $errors[] = "Tablo oluşturma hatası: " . $conn->error;
            return false;
        }
        
        $conn->close();
        return true;
        
    } catch (Exception $e) {
        $errors[] = "Tablo oluşturma hatası: " . $e->getMessage();
        return false;
    }
}

function createAdminUser($config) {
    global $errors;
    
    try {
        $conn = new mysqli($config['host'], $config['username'], $config['password'], $config['database']);
        
        if ($conn->connect_error) {
            $errors[] = "Database bağlantısı başarısız";
            return false;
        }
        
        // Admin kullanıcısı oluştur
        $username = 'admin';
        $password = password_hash('admin123', PASSWORD_DEFAULT);
        $email = 'admin@otokiwi.com';
        
        $sql = "INSERT INTO users (username, password, email, role, is_active) VALUES (?, ?, ?, 'admin', 1) ON DUPLICATE KEY UPDATE password = VALUES(password)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sss', $username, $password, $email);
        
        if (!$stmt->execute()) {
            $errors[] = "Admin kullanıcısı oluşturulamadı: " . $stmt->error;
            return false;
        }
        
        $stmt->close();
        $conn->close();
        return true;
        
    } catch (Exception $e) {
        $errors[] = "Admin kullanıcısı hatası: " . $e->getMessage();
        return false;
    }
}

function writeConfig($config) {
    global $errors;
    
    try {
        $configContent = "<?php\n";
        $configContent .= "// OtoKiwi Database Configuration\n";
        $configContent .= "define('DB_HOST', '{$config['host']}');\n";
        $configContent .= "define('DB_USER', '{$config['username']}');\n";
        $configContent .= "define('DB_PASS', '{$config['password']}');\n";
        $configContent .= "define('DB_NAME', '{$config['database']}');\n";
        $configContent .= "\n// Admin Configuration\n";
        $configContent .= "define('ADMIN_USERNAME', 'admin');\n";
        $configContent .= "define('ADMIN_PASSWORD', 'admin123');\n";
        $configContent .= "define('MASTER_PASSWORD', 'OtoKiwi2025');\n";
        $configContent .= "\n// System Configuration\n";
        $configContent .= "define('SITE_NAME', 'OtoKiwi');\n";
        $configContent .= "define('SITE_URL', 'https://' . \$_SERVER['HTTP_HOST']);\n";
        $configContent .= "define('TIMEZONE', 'Europe/Istanbul');\n";
        $configContent .= "date_default_timezone_set(TIMEZONE);\n";
        $configContent .= "\n// Security\n";
        $configContent .= "session_start();\n";
        $configContent .= "?>";
        
        $configFile = __DIR__ . '/../config/database.php';
        if (!file_put_contents($configFile, $configContent)) {
            $errors[] = "Yapılandırma dosyası yazılamadı";
            return false;
        }
        
        return true;
        
    } catch (Exception $e) {
        $errors[] = "Yapılandırma hatası: " . $e->getMessage();
        return false;
    }
}

function testSystem() {
    global $errors;
    
    try {
        // Config dosyasını dahil et
        $configFile = __DIR__ . '/../config/database.php';
        if (!file_exists($configFile)) {
            $errors[] = "Yapılandırma dosyası bulunamadı";
            return false;
        }
        
        include $configFile;
        
        // Database bağlantısını test et
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            $errors[] = "Final test başarısız: " . $conn->connect_error;
            return false;
        }
        
        // Kullanıcı sayısını kontrol et
        $result = $conn->query("SELECT COUNT(*) as count FROM users");
        if (!$result) {
            $errors[] = "Kullanıcı tablosu erişilemez";
            return false;
        }
        
        $conn->close();
        return true;
        
    } catch (Exception $e) {
        $errors[] = "Sistem test hatası: " . $e->getMessage();
        return false;
    }
}

?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OtoKiwi - Otomatik Kurulum</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: #667eea;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        
        .content {
            padding: 30px;
        }
        
        .step {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ddd;
        }
        
        .step.active {
            border-left-color: #667eea;
            background: #f8f9ff;
        }
        
        .step.success {
            border-left-color: #10b981;
            background: #f0fdf4;
        }
        
        .step.error {
            border-left-color: #ef4444;
            background: #fef2f2;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        
        .btn:hover {
            background: #5a67d8;
        }
        
        .btn-success {
            background: #10b981;
        }
        
        .btn-danger {
            background: #ef4444;
        }
        
        .message {
            padding: 12px;
            margin: 15px 0;
            border-radius: 6px;
        }
        
        .success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
        }
        
        .progress {
            background: #f3f4f6;
            border-radius: 10px;
            height: 20px;
            margin: 20px 0;
            overflow: hidden;
        }
        
        .progress-bar {
            background: #667eea;
            height: 100%;
            transition: width 0.3s ease;
        }
        
        .actions {
            margin-top: 30px;
            text-align: center;
        }
        
        .actions a {
            margin: 0 10px;
        }
        
        .code {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 OtoKiwi Otomatik Kurulum</h1>
            <p>Tek tıkla kurulum sistemi</p>
        </div>
        
        <div class="content">
            <?php if (!empty($success) || !empty($errors)): ?>
                <div class="progress">
                    <div class="progress-bar" style="width: <?= ($currentStep / count($steps)) * 100 ?>%"></div>
                </div>
                
                <?php foreach ($steps as $index => $step): ?>
                    <div class="step <?= $index < $currentStep ? 'success' : ($index == $currentStep ? 'active' : '') ?>">
                        <strong><?= $index + 1 ?>. <?= $step ?></strong>
                        <?php if ($index < $currentStep): ?>
                            <span style="color: #10b981; float: right;">✅</span>
                        <?php elseif ($index == $currentStep): ?>
                            <span style="color: #667eea; float: right;">⏳</span>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
                
                <?php foreach ($success as $msg): ?>
                    <div class="message success">✅ <?= $msg ?></div>
                <?php endforeach; ?>
                
                <?php foreach ($errors as $msg): ?>
                    <div class="message error">❌ <?= $msg ?></div>
                <?php endforeach; ?>
                
                <?php if (empty($errors) && $currentStep == count($steps)): ?>
                    <div class="actions">
                        <a href="../admin/fresh-start.html" class="btn btn-success">Admin Paneline Git</a>
                        <a href="../index.html" class="btn">Ana Sayfaya Git</a>
                    </div>
                <?php elseif (!empty($errors)): ?>
                    <div class="actions">
                        <a href="setup.php" class="btn btn-danger">Manuel Kurulum</a>
                        <a href="?" class="btn">Tekrar Dene</a>
                    </div>
                <?php endif; ?>
                
            <?php else: ?>
                <h2>Kurulum Seçenekleri</h2>
                
                <div class="step">
                    <h3>🔧 Otomatik Kurulum</h3>
                    <p>Varsayılan ayarlarla hızlı kurulum:</p>
                    <div class="code">
                        Database: localhost/otokiwi<br>
                        Admin: admin/admin123<br>
                        Master Şifre: OtoKiwi2025
                    </div>
                    <form method="post" style="margin-top: 15px;">
                        <input type="hidden" name="auto_setup" value="1">
                        <button type="submit" class="btn">Otomatik Kurulum Başlat</button>
                    </form>
                </div>
                
                <div class="step">
                    <h3>⚙️ Manuel Kurulum</h3>
                    <p>Özel ayarlarla kurulum yapmak için:</p>
                    <a href="setup.php" class="btn">Manuel Kurulum</a>
                </div>
                
                <div class="step">
                    <h3>📋 Kurulum Gereksinimleri</h3>
                    <ul>
                        <li>PHP 7.4 veya üzeri</li>
                        <li>MySQL 5.7 veya üzeri</li>
                        <li>Apache/Nginx web sunucusu</li>
                        <li>Yazma izinleri (config klasörü)</li>
                    </ul>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>