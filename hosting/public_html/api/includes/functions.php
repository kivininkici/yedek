<?php
// KeyPanel Helper Functions - cPanel Hosting Uyumlu
// Türkçe: Yardımcı fonksiyonlar ve genel kullanım fonksiyonları

// Session yönetimi
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

// JSON response gönderme
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Error response
function errorResponse($message, $statusCode = 400) {
    jsonResponse([
        'error' => true,
        'message' => $message
    ], $statusCode);
}

// Success response
function successResponse($data, $message = null) {
    $response = [
        'success' => true,
        'data' => $data
    ];
    
    if ($message) {
        $response['message'] = $message;
    }
    
    jsonResponse($response);
}

// Input validation
function validateRequired($data, $fields) {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        errorResponse('Gerekli alanlar eksik: ' . implode(', ', $missing));
    }
}

// Email validation
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Password hashing
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Password verification
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Generate random key
function generateKey($length = 32) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $key = '';
    for ($i = 0; $i < $length; $i++) {
        $key .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $key;
}

// Generate order ID
function generateOrderId() {
    return 'KEY' . time() . rand(1000, 9999);
}

// Date formatting for Turkish locale
function formatDate($date, $format = 'd.m.Y H:i') {
    return date($format, strtotime($date));
}

// Admin authentication check
function requireAdmin() {
    startSession();
    if (!isset($_SESSION['admin_id']) || !$_SESSION['is_admin']) {
        errorResponse('Admin girişi gerekli', 401);
    }
}

// User authentication check
function requireAuth() {
    startSession();
    if (!isset($_SESSION['user_id'])) {
        errorResponse('Giriş yapmanız gerekli', 401);
    }
}

// Log activity
function logActivity($userId, $action, $details = null) {
    try {
        $db = getDB();
        $sql = "INSERT INTO logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())";
        $db->execute($sql, [$userId, $action, $details]);
    } catch (Exception $e) {
        // Log hatası sessizce geç
        error_log('Log hatası: ' . $e->getMessage());
    }
}

// Clean expired keys
function cleanExpiredKeys() {
    try {
        $db = getDB();
        $sql = "DELETE FROM keys WHERE expires_at IS NOT NULL AND expires_at < NOW()";
        return $db->execute($sql);
    } catch (Exception $e) {
        error_log('Süresi dolan key temizleme hatası: ' . $e->getMessage());
        return 0;
    }
}

// Security: Rate limiting check
function checkRateLimit($identifier, $maxAttempts = 5, $timeWindow = 900) { // 15 dakika
    try {
        $db = getDB();
        $since = date('Y-m-d H:i:s', time() - $timeWindow);
        
        $sql = "SELECT COUNT(*) as attempts FROM login_attempts 
                WHERE ip_address = ? AND created_at >= ? AND attempt_type = 'failed_password'";
        $result = $db->fetchOne($sql, [$identifier, $since]);
        
        return $result['attempts'] < $maxAttempts;
    } catch (Exception $e) {
        // Güvenlik kontrolü hata verse bile devam et
        return true;
    }
}

// Log login attempt
function logLoginAttempt($ipAddress, $username, $attemptType, $userAgent = null) {
    try {
        $db = getDB();
        $sql = "INSERT INTO login_attempts (ip_address, username, attempt_type, user_agent, created_at) 
                VALUES (?, ?, ?, ?, NOW())";
        $db->execute($sql, [$ipAddress, $username, $attemptType, $userAgent]);
    } catch (Exception $e) {
        error_log('Login attempt log hatası: ' . $e->getMessage());
    }
}

// Get client IP address
function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) && !empty($_SERVER[$key])) {
            $ip = $_SERVER[$key];
            if (strpos($ip, ',') !== false) {
                $ip = explode(',', $ip)[0];
            }
            return trim($ip);
        }
    }
    return '0.0.0.0';
}

// Sanitize input
function sanitizeInput($input) {
    if (is_string($input)) {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }
    return $input;
}

// Validate and sanitize array
function sanitizeArray($data) {
    if (!is_array($data)) {
        return [];
    }
    
    $sanitized = [];
    foreach ($data as $key => $value) {
        if (is_array($value)) {
            $sanitized[$key] = sanitizeArray($value);
        } else {
            $sanitized[$key] = sanitizeInput($value);
        }
    }
    return $sanitized;
}
?>