<?php
/**
 * Authentication API Endpoints
 * KeyPanel cPanel Compatible Version
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';

try {
    switch ($method) {
        case 'POST':
            handlePost($path);
            break;
        case 'GET':
            handleGet($path);
            break;
        case 'DELETE':
            handleDelete($path);
            break;
        default:
            sendErrorResponse('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Auth API Error: " . $e->getMessage());
    sendErrorResponse('Internal server error', 500);
}

function handlePost($path) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($path) {
        case 'login':
            handleLogin($input);
            break;
        case 'register':
            handleRegister($input);
            break;
        case 'verify-math':
            handleMathVerification($input);
            break;
        case 'auto-login':
            handleAutoLogin($input);
            break;
        default:
            sendErrorResponse('Endpoint not found', 404);
    }
}

function handleGet($path) {
    switch ($path) {
        case 'user':
            getCurrentUser();
            break;
        case 'math-question':
            getMathQuestion();
            break;
        default:
            sendErrorResponse('Endpoint not found', 404);
    }
}

function handleDelete($path) {
    switch ($path) {
        case 'logout':
            handleLogout();
            break;
        default:
            sendErrorResponse('Endpoint not found', 404);
    }
}

function handleLogin($input) {
    $username = sanitizeInput($input['username'] ?? '');
    $password = $input['password'] ?? '';
    $mathAnswer = $input['mathAnswer'] ?? '';
    $questionId = $input['questionId'] ?? '';
    
    $ip = $_SERVER['REMOTE_ADDR'];
    
    // Check if IP is blocked
    if (checkLoginAttempts($ip, 'user')) {
        logLoginAttempt($ip, $username, 'user', 'blocked');
        sendErrorResponse('Çok fazla başarısız deneme. 15 dakika sonra tekrar deneyin.', 429);
    }
    
    // Validate math question
    if (!validateMathAnswer($mathAnswer, $questionId)) {
        logLoginAttempt($ip, $username, 'user', 'failed_math');
        sendErrorResponse('Matematik sorusu yanlış yanıtlandı.', 400);
    }
    
    if (empty($username) || empty($password)) {
        sendErrorResponse('Kullanıcı adı ve şifre gerekli', 400);
    }
    
    try {
        $db = getDB();
        $user = $db->fetchOne(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            [$username, $username]
        );
        
        if (!$user || !verifyPassword($password, $user['password'])) {
            logLoginAttempt($ip, $username, 'user', 'failed_password');
            sendErrorResponse('Geçersiz kullanıcı adı veya şifre', 401);
        }
        
        // Create session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        
        logLoginAttempt($ip, $username, 'user', 'success');
        logActivity('user_login', 'User logged in', ['username' => $username], $user['id']);
        
        sendSuccessResponse('Giriş başarılı', [
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        sendErrorResponse('Giriş sırasında hata oluştu', 500);
    }
}

function handleRegister($input) {
    $username = sanitizeInput($input['username'] ?? '');
    $email = sanitizeInput($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $confirmPassword = $input['confirmPassword'] ?? '';
    $mathAnswer = $input['mathAnswer'] ?? '';
    $questionId = $input['questionId'] ?? '';
    
    // Validate math question
    if (!validateMathAnswer($mathAnswer, $questionId)) {
        sendErrorResponse('Matematik sorusu yanlış yanıtlandı.', 400);
    }
    
    // Validation
    if (empty($username) || empty($email) || empty($password)) {
        sendErrorResponse('Tüm alanlar gerekli', 400);
    }
    
    if ($password !== $confirmPassword) {
        sendErrorResponse('Şifreler eşleşmiyor', 400);
    }
    
    if (strlen($password) < 6) {
        sendErrorResponse('Şifre en az 6 karakter olmalıdır', 400);
    }
    
    if (!validateEmail($email)) {
        sendErrorResponse('Geçerli bir e-posta adresi girin', 400);
    }
    
    try {
        $db = getDB();
        
        // Check if user exists
        $existingUser = $db->fetchOne(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [$username, $email]
        );
        
        if ($existingUser) {
            sendErrorResponse('Bu kullanıcı adı veya e-posta zaten kullanımda', 409);
        }
        
        // Create user
        $hashedPassword = hashPassword($password);
        $userId = $db->insert('users', [
            'username' => $username,
            'email' => $email,
            'password' => $hashedPassword,
            'role' => 'user'
        ]);
        
        // Auto login after registration
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = 'user';
        
        logActivity('user_register', 'New user registered', ['username' => $username], $userId);
        
        sendSuccessResponse('Kayıt başarılı', [
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'role' => 'user'
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        sendErrorResponse('Kayıt sırasında hata oluştu', 500);
    }
}

function handleAutoLogin($input) {
    requireAdmin();
    
    $userId = $input['userId'] ?? '';
    
    if (empty($userId)) {
        sendErrorResponse('Kullanıcı ID gerekli', 400);
    }
    
    try {
        $db = getDB();
        $user = $db->fetchOne("SELECT * FROM users WHERE id = ?", [$userId]);
        
        if (!$user) {
            sendErrorResponse('Kullanıcı bulunamadı', 404);
        }
        
        // Create new session for the user
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        
        logActivity('admin_auto_login', 'Admin logged in as user', ['target_user' => $user['username']]);
        
        sendSuccessResponse('Otomatik giriş başarılı', [
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Auto login error: " . $e->getMessage());
        sendErrorResponse('Otomatik giriş sırasında hata oluştu', 500);
    }
}

function getCurrentUser() {
    if (!isLoggedIn()) {
        sendErrorResponse('Giriş yapılmamış', 401);
    }
    
    try {
        $db = getDB();
        $user = $db->fetchOne("SELECT * FROM users WHERE id = ?", [$_SESSION['user_id']]);
        
        if (!$user) {
            session_destroy();
            sendErrorResponse('Kullanıcı bulunamadı', 404);
        }
        
        sendSuccessResponse('Kullanıcı bilgileri', [
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Get user error: " . $e->getMessage());
        sendErrorResponse('Kullanıcı bilgileri alınamadı', 500);
    }
}

function getMathQuestion() {
    $questions = MATH_QUESTIONS;
    $randomQuestion = $questions[array_rand($questions)];
    
    $questionId = md5($randomQuestion['question'] . time());
    $_SESSION['math_question'] = [
        'id' => $questionId,
        'answer' => $randomQuestion['answer'],
        'timestamp' => time()
    ];
    
    sendSuccessResponse('Matematik sorusu', [
        'question' => $randomQuestion['question'],
        'questionId' => $questionId
    ]);
}

function validateMathAnswer($answer, $questionId) {
    if (!isset($_SESSION['math_question'])) {
        return false;
    }
    
    $storedQuestion = $_SESSION['math_question'];
    
    // Check if question ID matches and hasn't expired (5 minutes)
    if ($storedQuestion['id'] !== $questionId || 
        (time() - $storedQuestion['timestamp']) > 300) {
        return false;
    }
    
    return intval($answer) === $storedQuestion['answer'];
}

function handleMathVerification($input) {
    $answer = $input['answer'] ?? '';
    $questionId = $input['questionId'] ?? '';
    
    $isValid = validateMathAnswer($answer, $questionId);
    
    sendSuccessResponse('Matematik doğrulama', ['valid' => $isValid]);
}

function handleLogout() {
    if (isLoggedIn()) {
        logActivity('user_logout', 'User logged out', ['username' => $_SESSION['username']]);
    }
    
    session_destroy();
    sendSuccessResponse('Çıkış başarılı');
}
?>