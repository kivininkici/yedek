<?php
/**
 * OtoKiwi Configuration File
 * cPanel Compatible Version
 */

session_start();

// Error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Europe/Istanbul');

// Security Configuration
define('MASTER_PASSWORD', 'OtoKiwi2025');
define('SESSION_LIFETIME', 3600); // 1 hour
define('LOGIN_ATTEMPTS_LIMIT', 3);
define('LOGIN_BLOCK_DURATION', 900); // 15 minutes

// Admin Credentials
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'admin123'); // Change this!

// Security Questions
define('SECURITY_QUESTIONS', [
    'Kiwi\'nin doğum tarihi nedir? (DD/MM/YYYY)' => ['29/05/2020', '29.05.2020', '29-05-2020'],
    'Annenizin adı nedir?' => ['halime', 'Halime', 'HALIME'],
    'Annenizin kızlık soyadı nedir?' => ['bahat', 'Bahat', 'BAHAT'],
    'Annenizin doğum tarihi nedir? (DD/MM/YYYY)' => ['17/12/1978', '17.12.1978', '17-12-1978'],
    'Babanızın adı nedir?' => ['muhammed', 'Muhammed', 'MUHAMMED'],
    'Babanızın soyadı nedir?' => ['yazar', 'Yazar', 'YAZAR']
]);

// Math Questions for validation
define('MATH_QUESTIONS', [
    ['question' => '5 + 3 = ?', 'answer' => 8],
    ['question' => '12 - 4 = ?', 'answer' => 8],
    ['question' => '7 + 6 = ?', 'answer' => 13],
    ['question' => '15 - 8 = ?', 'answer' => 7],
    ['question' => '9 + 4 = ?', 'answer' => 13],
    ['question' => '20 - 12 = ?', 'answer' => 8],
    ['question' => '6 + 7 = ?', 'answer' => 13],
    ['question' => '18 - 9 = ?', 'answer' => 9],
    ['question' => '11 + 5 = ?', 'answer' => 16],
    ['question' => '25 - 15 = ?', 'answer' => 10]
]);

// API Configuration
define('API_TIMEOUT', 30);
define('API_CACHE_DURATION', 15); // seconds
define('ORDER_STATUS_CHECK_INTERVAL', 5); // seconds

// Email Configuration (SendGrid)
// cPanel Environment Variable olarak SENDGRID_API_KEY ayarlanabilir
// Alternatif olarak burada direkt tanımlanabilir:
// define('SENDGRID_API_KEY', 'your-sendgrid-api-key-here');

// File paths
define('BASE_PATH', dirname(__DIR__));
define('ASSETS_PATH', BASE_PATH . '/assets');
define('LOGS_PATH', BASE_PATH . '/logs');

// Ensure logs directory exists
if (!is_dir(LOGS_PATH)) {
    mkdir(LOGS_PATH, 0755, true);
}

// Include required files
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/functions.php';

// Database Helper Function
function getDB() {
    return Database::getInstance();
}

// Helper Functions
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function isAdmin() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

function requireAuth() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Giriş yapılmamış']);
        exit;
    }
}

function requireAdmin() {
    if (!isAdmin()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Admin girişi gerekli']);
        exit;
    }
}

function logActivity($type, $message, $data = null, $userId = null) {
    try {
        $db = getDB();
        $logData = [
            'type' => $type,
            'message' => $message,
            'data' => $data ? json_encode($data) : null,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'user_id' => $userId ?? ($_SESSION['user_id'] ?? null)
        ];
        
        $db->insert('logs', $logData);
    } catch (Exception $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }
}

function generateOrderId() {
    return 'KP' . date('Ymd') . rand(1000, 9999);
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function sendJsonResponse($data, $httpCode = 200) {
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function sendErrorResponse($message, $httpCode = 400) {
    sendJsonResponse(['success' => false, 'message' => $message], $httpCode);
}

function sendSuccessResponse($message, $data = null) {
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    sendJsonResponse($response);
}

// CSRF Protection
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Rate limiting for login attempts
function checkLoginAttempts($ip, $type = 'admin') {
    try {
        $db = getDB();
        $since = date('Y-m-d H:i:s', time() - LOGIN_BLOCK_DURATION);
        
        $attempts = $db->fetchOne(
            "SELECT COUNT(*) as count FROM login_attempts 
             WHERE ip_address = ? AND attempt_type = ? AND status IN ('failed_password', 'failed_security', 'failed_math') 
             AND created_at > ?",
            [$ip, $type, $since]
        );
        
        return $attempts['count'] >= LOGIN_ATTEMPTS_LIMIT;
    } catch (Exception $e) {
        error_log("Failed to check login attempts: " . $e->getMessage());
        return false;
    }
}

function logLoginAttempt($ip, $username, $type, $status) {
    try {
        $db = getDB();
        $db->insert('login_attempts', [
            'ip_address' => $ip,
            'username' => $username,
            'attempt_type' => $type,
            'status' => $status,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    } catch (Exception $e) {
        error_log("Failed to log login attempt: " . $e->getMessage());
    }
}

// Initialize CSRF token
generateCSRFToken();
?>