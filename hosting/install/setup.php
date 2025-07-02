<?php
/**
 * OtoKiwi Installation Script
 * cPanel Compatible Version
 */

// Prevent direct access if already installed
if (file_exists('../config/installed.lock')) {
    die('OtoKiwi is already installed. Delete config/installed.lock to reinstall.');
}

$step = $_GET['step'] ?? 'welcome';
$error = '';
$success = '';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    switch ($step) {
        case 'database':
            $result = configureDatabaseConnection($_POST);
            if ($result['success']) {
                $success = $result['message'];
                header('Location: setup.php?step=tables');
                exit;
            } else {
                $error = $result['message'];
            }
            break;
            
        case 'tables':
            $result = createDatabaseTables();
            if ($result['success']) {
                $success = $result['message'];
                header('Location: setup.php?step=admin');
                exit;
            } else {
                $error = $result['message'];
            }
            break;
            
        case 'admin':
            $result = createAdminUser($_POST);
            if ($result['success']) {
                $success = $result['message'];
                header('Location: setup.php?step=complete');
                exit;
            } else {
                $error = $result['message'];
            }
            break;
    }
}

function configureDatabaseConnection($data) {
    $host = trim($data['host'] ?? 'localhost');
    $dbname = trim($data['dbname'] ?? '');
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    
    if (empty($dbname) || empty($username)) {
        return ['success' => false, 'message' => 'Veritabanı adı ve kullanıcı adı gerekli'];
    }
    
    try {
        // Test connection
        $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        
        // Update config file
        $configContent = file_get_contents('../config/database.php');
        $configContent = str_replace('your_database_name', $dbname, $configContent);
        $configContent = str_replace('your_database_user', $username, $configContent);
        $configContent = str_replace('your_database_password', $password, $configContent);
        $configContent = str_replace('localhost', $host, $configContent);
        
        file_put_contents('../config/database.php', $configContent);
        
        return ['success' => true, 'message' => 'Veritabanı bağlantısı başarıyla yapılandırıldı'];
        
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Veritabanı bağlantısı başarısız: ' . $e->getMessage()];
    }
}

function createDatabaseTables() {
    try {
        require_once '../config/database.php';
        $db = Database::getInstance();
        $pdo = $db->getConnection();
        
        // Read and execute SQL file
        $sql = file_get_contents('database.sql');
        
        // Split into individual statements
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        $pdo->beginTransaction();
        
        foreach ($statements as $statement) {
            if (!empty($statement) && !preg_match('/^(--|\/\*|SET|START|COMMIT)/', $statement)) {
                $pdo->exec($statement);
            }
        }
        
        $pdo->commit();
        
        return ['success' => true, 'message' => 'Veritabanı tabloları başarıyla oluşturuldu'];
        
    } catch (Exception $e) {
        if (isset($pdo)) {
            $pdo->rollback();
        }
        return ['success' => false, 'message' => 'Tablo oluşturma hatası: ' . $e->getMessage()];
    }
}

function createAdminUser($data) {
    $username = trim($data['username'] ?? 'admin');
    $password = $data['password'] ?? '';
    $email = trim($data['email'] ?? '');
    
    if (empty($password) || strlen($password) < 6) {
        return ['success' => false, 'message' => 'Şifre en az 6 karakter olmalıdır'];
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'message' => 'Geçerli bir e-posta adresi girin'];
    }
    
    try {
        require_once '../config/database.php';
        $db = Database::getInstance();
        
        // Update or insert admin user
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $existingAdmin = $db->fetchOne("SELECT id FROM users WHERE username = ?", [$username]);
        
        if ($existingAdmin) {
            $db->update('users', [
                'password' => $hashedPassword,
                'email' => $email,
                'role' => 'admin'
            ], 'username = ?', [$username]);
        } else {
            $db->insert('users', [
                'username' => $username,
                'password' => $hashedPassword,
                'email' => $email,
                'role' => 'admin'
            ]);
        }
        
        // Create installation lock file
        file_put_contents('../config/installed.lock', date('Y-m-d H:i:s'));
        
        return ['success' => true, 'message' => 'Admin kullanıcısı başarıyla oluşturuldu'];
        
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Admin oluşturma hatası: ' . $e->getMessage()];
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OtoKiwi Kurulumu</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        .setup-container {
            max-width: 600px;
            margin: 0 auto;
        }
        .setup-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .setup-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .setup-content {
            padding: 2rem;
        }
        .progress-steps {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2rem;
        }
        .step {
            flex: 1;
            text-align: center;
            position: relative;
        }
        .step-number {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e9ecef;
            color: #6c757d;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 0.5rem;
            font-weight: bold;
        }
        .step.active .step-number {
            background: #0d6efd;
            color: white;
        }
        .step.completed .step-number {
            background: #198754;
            color: white;
        }
        .step-title {
            font-size: 0.9rem;
            color: #6c757d;
        }
        .step.active .step-title {
            color: #0d6efd;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="setup-container">
            <div class="setup-card">
                <div class="setup-header">
                    <h1><i class="fas fa-key me-2"></i>OtoKiwi</h1>
                    <p class="mb-0">Kurulum Sihirbazı</p>
                </div>
                
                <div class="setup-content">
                    <!-- Progress Steps -->
                    <div class="progress-steps">
                        <div class="step <?= $step === 'welcome' ? 'active' : ($step !== 'welcome' ? 'completed' : '') ?>">
                            <div class="step-number">1</div>
                            <div class="step-title">Hoş Geldiniz</div>
                        </div>
                        <div class="step <?= $step === 'database' ? 'active' : (in_array($step, ['tables', 'admin', 'complete']) ? 'completed' : '') ?>">
                            <div class="step-number">2</div>
                            <div class="step-title">Veritabanı</div>
                        </div>
                        <div class="step <?= $step === 'tables' ? 'active' : (in_array($step, ['admin', 'complete']) ? 'completed' : '') ?>">
                            <div class="step-number">3</div>
                            <div class="step-title">Tablolar</div>
                        </div>
                        <div class="step <?= $step === 'admin' ? 'active' : ($step === 'complete' ? 'completed' : '') ?>">
                            <div class="step-number">4</div>
                            <div class="step-title">Admin</div>
                        </div>
                        <div class="step <?= $step === 'complete' ? 'active' : '' ?>">
                            <div class="step-number">5</div>
                            <div class="step-title">Tamamlandı</div>
                        </div>
                    </div>

                    <!-- Error/Success Messages -->
                    <?php if ($error): ?>
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i><?= htmlspecialchars($error) ?>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($success): ?>
                        <div class="alert alert-success">
                            <i class="fas fa-check me-2"></i><?= htmlspecialchars($success) ?>
                        </div>
                    <?php endif; ?>

                    <!-- Step Content -->
                    <?php switch ($step): case 'welcome': ?>
                        <div class="text-center">
                            <h3>OtoKiwi'e Hoş Geldiniz</h3>
                            <p class="text-muted mb-4">Bu sihirbaz size OtoKiwi'i kurmada yardımcı olacaktır.</p>
                            
                            <div class="mb-4">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-check-circle text-success me-2"></i>
                                            <span>PHP 7.4+ desteği</span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-check-circle text-success me-2"></i>
                                            <span>MySQL 5.7+ desteği</span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-check-circle text-success me-2"></i>
                                            <span>cURL desteği</span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-check-circle text-success me-2"></i>
                                            <span>JSON desteği</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <a href="setup.php?step=database" class="btn btn-primary btn-lg">
                                Kuruluma Başla <i class="fas fa-arrow-right ms-2"></i>
                            </a>
                        </div>

                    <?php break; case 'database': ?>
                        <div>
                            <h3>Veritabanı Ayarları</h3>
                            <p class="text-muted mb-4">cPanel'den oluşturduğunuz MySQL veritabanı bilgilerini girin.</p>
                            
                            <form method="POST">
                                <div class="mb-3">
                                    <label for="host" class="form-label">Veritabanı Sunucusu</label>
                                    <input type="text" class="form-control" id="host" name="host" value="localhost" required>
                                    <div class="form-text">Genellikle "localhost" olarak kalabilir</div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="dbname" class="form-label">Veritabanı Adı</label>
                                    <input type="text" class="form-control" id="dbname" name="dbname" required>
                                    <div class="form-text">cPanel'de oluşturduğunuz veritabanının adı</div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="username" class="form-label">Kullanıcı Adı</label>
                                    <input type="text" class="form-control" id="username" name="username" required>
                                    <div class="form-text">Veritabanı kullanıcı adı</div>
                                </div>
                                
                                <div class="mb-4">
                                    <label for="password" class="form-label">Şifre</label>
                                    <input type="password" class="form-control" id="password" name="password">
                                    <div class="form-text">Veritabanı şifresi (boş bırakılabilir)</div>
                                </div>
                                
                                <div class="d-flex justify-content-between">
                                    <a href="setup.php?step=welcome" class="btn btn-outline-secondary">Geri</a>
                                    <button type="submit" class="btn btn-primary">Devam Et</button>
                                </div>
                            </form>
                        </div>

                    <?php break; case 'tables': ?>
                        <div class="text-center">
                            <h3>Veritabanı Tabloları</h3>
                            <p class="text-muted mb-4">Gerekli veritabanı tabloları oluşturuluyor...</p>
                            
                            <form method="POST">
                                <div class="mb-4">
                                    <i class="fas fa-database fa-3x text-primary mb-3"></i>
                                    <p>Veritabanı bağlantısı başarılı. Şimdi tabloları oluşturabilirsiniz.</p>
                                </div>
                                
                                <button type="submit" class="btn btn-primary btn-lg">
                                    Tabloları Oluştur <i class="fas fa-cogs ms-2"></i>
                                </button>
                            </form>
                        </div>

                    <?php break; case 'admin': ?>
                        <div>
                            <h3>Admin Kullanıcısı</h3>
                            <p class="text-muted mb-4">Yönetici paneline erişim için admin kullanıcısı oluşturun.</p>
                            
                            <form method="POST">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Kullanıcı Adı</label>
                                    <input type="text" class="form-control" id="username" name="username" value="admin" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="email" class="form-label">E-posta</label>
                                    <input type="email" class="form-control" id="email" name="email" required>
                                </div>
                                
                                <div class="mb-4">
                                    <label for="password" class="form-label">Şifre</label>
                                    <input type="password" class="form-control" id="password" name="password" required minlength="6">
                                    <div class="form-text">En az 6 karakter olmalıdır</div>
                                </div>
                                
                                <div class="d-flex justify-content-between">
                                    <a href="setup.php?step=tables" class="btn btn-outline-secondary">Geri</a>
                                    <button type="submit" class="btn btn-primary">Admin Oluştur</button>
                                </div>
                            </form>
                        </div>

                    <?php break; case 'complete': ?>
                        <div class="text-center">
                            <h3>Kurulum Tamamlandı!</h3>
                            <p class="text-muted mb-4">OtoKiwi başarıyla kuruldu. Artık sistemi kullanmaya başlayabilirsiniz.</p>
                            
                            <div class="mb-4">
                                <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
                                <div class="alert alert-warning">
                                    <strong>Güvenlik Uyarısı:</strong> Kurulum tamamlandıktan sonra <code>install/</code> klasörünü silin.
                                </div>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <a href="../admin/" class="btn btn-primary btn-lg">
                                    <i class="fas fa-tachometer-alt me-2"></i>Admin Paneline Git
                                </a>
                                <a href="../" class="btn btn-outline-primary">
                                    <i class="fas fa-home me-2"></i>Ana Sayfaya Git
                                </a>
                            </div>
                        </div>

                    <?php break; endswitch; ?>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>