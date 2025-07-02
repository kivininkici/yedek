<?php
// KeyPanel Auth Routes - cPanel Hosting Uyumlu
// Türkçe: Kullanıcı kimlik doğrulama işlemleri

startSession();

switch ($method) {
    case 'POST':
        if (count($path_parts) > 1) {
            switch ($path_parts[1]) {
                case 'login':
                    handleLogin($input);
                    break;
                case 'register':
                    handleRegister($input);
                    break;
                case 'auto-login':
                    handleAutoLogin($input);
                    break;
                default:
                    errorResponse('Geçersiz auth endpoint', 404);
            }
        } else {
            errorResponse('Auth endpoint belirtilmedi', 400);
        }
        break;
        
    case 'GET':
        if (count($path_parts) > 1 && $path_parts[1] === 'me') {
            getUserInfo();
        } else {
            errorResponse('Geçersiz GET endpoint', 404);
        }
        break;
        
    case 'DELETE':
        if (count($path_parts) > 1 && $path_parts[1] === 'logout') {
            handleLogout();
        } else {
            errorResponse('Geçersiz DELETE endpoint', 404);
        }
        break;
        
    default:
        errorResponse('Desteklenmeyen HTTP method', 405);
}

function handleLogin($data) {
    validateRequired($data, ['username', 'password']);
    
    $username = sanitizeInput($data['username']);
    $password = $data['password'];
    $ipAddress = getClientIP();
    
    // Rate limiting kontrolü
    if (!checkRateLimit($ipAddress)) {
        logLoginAttempt($ipAddress, $username, 'blocked', $_SERVER['HTTP_USER_AGENT'] ?? null);
        errorResponse('Çok fazla başarısız deneme. 15 dakika sonra tekrar deneyin.', 429);
    }
    
    try {
        $db = getDB();
        
        // Normal kullanıcı kontrolü
        $sql = "SELECT * FROM normal_users WHERE username = ?";
        $user = $db->fetchOne($sql, [$username]);
        
        if (!$user) {
            logLoginAttempt($ipAddress, $username, 'failed_password', $_SERVER['HTTP_USER_AGENT'] ?? null);
            errorResponse('Kullanıcı adı veya şifre hatalı');
        }
        
        if (!verifyPassword($password, $user['password_hash'])) {
            logLoginAttempt($ipAddress, $username, 'failed_password', $_SERVER['HTTP_USER_AGENT'] ?? null);
            errorResponse('Kullanıcı adı veya şifre hatalı');
        }
        
        // Başarılı giriş
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['is_admin'] = false;
        
        logLoginAttempt($ipAddress, $username, 'success', $_SERVER['HTTP_USER_AGENT'] ?? null);
        logActivity($user['id'], 'login', 'Normal kullanıcı girişi');
        
        successResponse([
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => 'user'
            ]
        ], 'Giriş başarılı');
        
    } catch (Exception $e) {
        errorResponse('Giriş sırasında hata oluştu: ' . $e->getMessage(), 500);
    }
}

function handleRegister($data) {
    validateRequired($data, ['username', 'email', 'password', 'confirmPassword']);
    
    $username = sanitizeInput($data['username']);
    $email = sanitizeInput($data['email']);
    $password = $data['password'];
    $confirmPassword = $data['confirmPassword'];
    
    // Validation
    if (strlen($username) < 3) {
        errorResponse('Kullanıcı adı en az 3 karakter olmalı');
    }
    
    if (!validateEmail($email)) {
        errorResponse('Geçerli bir email adresi girin');
    }
    
    if (strlen($password) < 6) {
        errorResponse('Şifre en az 6 karakter olmalı');
    }
    
    if ($password !== $confirmPassword) {
        errorResponse('Şifreler eşleşmiyor');
    }
    
    try {
        $db = getDB();
        
        // Kullanıcı adı kontrolü
        $existingUser = $db->fetchOne("SELECT id FROM normal_users WHERE username = ?", [$username]);
        if ($existingUser) {
            errorResponse('Bu kullanıcı adı zaten kullanılıyor');
        }
        
        // Email kontrolü
        $existingEmail = $db->fetchOne("SELECT id FROM normal_users WHERE email = ?", [$email]);
        if ($existingEmail) {
            errorResponse('Bu email adresi zaten kullanılıyor');
        }
        
        // Yeni kullanıcı oluştur
        $passwordHash = hashPassword($password);
        $sql = "INSERT INTO normal_users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())";
        $db->execute($sql, [$username, $email, $passwordHash]);
        
        $userId = $db->lastInsertId();
        
        // Otomatik giriş
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['is_admin'] = false;
        
        logActivity($userId, 'register', 'Yeni kullanıcı kaydı');
        
        successResponse([
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'role' => 'user'
            ]
        ], 'Kayıt başarılı');
        
    } catch (Exception $e) {
        errorResponse('Kayıt sırasında hata oluştu: ' . $e->getMessage(), 500);
    }
}

function handleAutoLogin($data) {
    requireAdmin(); // Sadece admin bu işlemi yapabilir
    
    validateRequired($data, ['userId']);
    
    $userId = (int)$data['userId'];
    
    try {
        $db = getDB();
        $user = $db->fetchOne("SELECT * FROM normal_users WHERE id = ?", [$userId]);
        
        if (!$user) {
            errorResponse('Kullanıcı bulunamadı');
        }
        
        // Session'u güncelle
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['is_admin'] = false;
        
        logActivity($user['id'], 'auto_login', 'Admin tarafından otomatik giriş');
        
        successResponse([
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => 'user'
            ]
        ], 'Otomatik giriş başarılı');
        
    } catch (Exception $e) {
        errorResponse('Otomatik giriş sırasında hata: ' . $e->getMessage(), 500);
    }
}

function getUserInfo() {
    if (!isset($_SESSION['user_id'])) {
        errorResponse('Giriş yapılmamış', 401);
    }
    
    try {
        $db = getDB();
        $user = $db->fetchOne("SELECT * FROM normal_users WHERE id = ?", [$_SESSION['user_id']]);
        
        if (!$user) {
            errorResponse('Kullanıcı bulunamadı', 404);
        }
        
        successResponse([
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => 'user'
            ]
        ]);
        
    } catch (Exception $e) {
        errorResponse('Kullanıcı bilgileri alınırken hata: ' . $e->getMessage(), 500);
    }
}

function handleLogout() {
    if (isset($_SESSION['user_id'])) {
        logActivity($_SESSION['user_id'], 'logout', 'Kullanıcı çıkışı');
    }
    
    session_destroy();
    successResponse([], 'Çıkış başarılı');
}
?>