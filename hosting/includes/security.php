<?php
// Security functions for cPanel version

function sanitizeInput($input) {
    return trim(htmlspecialchars(strip_tags($input), ENT_QUOTES, 'UTF-8'));
}

function validateCSRF() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token'])) {
            throw new Exception('CSRF token missing');
        }
        
        if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
            throw new Exception('CSRF token mismatch');
        }
    }
}

function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function checkRateLimit($identifier, $maxAttempts = 5, $timeWindow = 900) {
    $cacheFile = sys_get_temp_dir() . '/rate_limit_' . md5($identifier);
    
    if (file_exists($cacheFile)) {
        $data = json_decode(file_get_contents($cacheFile), true);
        $currentTime = time();
        
        // Clean old attempts
        $data['attempts'] = array_filter($data['attempts'], function($timestamp) use ($currentTime, $timeWindow) {
            return ($currentTime - $timestamp) < $timeWindow;
        });
        
        if (count($data['attempts']) >= $maxAttempts) {
            return false;
        }
    } else {
        $data = ['attempts' => []];
    }
    
    $data['attempts'][] = time();
    file_put_contents($cacheFile, json_encode($data));
    
    return true;
}

function logSecurityEvent($event, $details = []) {
    $logFile = dirname(__DIR__) . '/logs/security.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'event' => $event,
        'details' => $details
    ];
    
    file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
}

function detectSQLInjection($input) {
    $patterns = [
        '/(\bunion\b.*\bselect\b)/i',
        '/(\bselect\b.*\bfrom\b)/i',
        '/(\binsert\b.*\binto\b)/i',
        '/(\bupdate\b.*\bset\b)/i',
        '/(\bdelete\b.*\bfrom\b)/i',
        '/(\bdrop\b.*\btable\b)/i',
        '/(\bor\b.*=.*)/i',
        '/(\band\b.*=.*)/i',
        '/(\'.*\bor\b.*\')/i',
        '/(\-\-)/i',
        '/(\#)/i',
        '/(\/*.*\*/)/i'
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $input)) {
            return true;
        }
    }
    
    return false;
}

function detectXSS($input) {
    $patterns = [
        '/<script[^>]*>.*?<\/script>/i',
        '/<iframe[^>]*>.*?<\/iframe>/i',
        '/javascript:/i',
        '/on\w+\s*=/i',
        '/<.*?on\w+\s*=.*?>/i',
        '/data:text\/html/i'
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $input)) {
            return true;
        }
    }
    
    return false;
}

function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit();
    }
}

function requireAdmin() {
    requireAuth();
    
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit();
    }
}

function validateInput($data, $rules) {
    $errors = [];
    
    foreach ($rules as $field => $rule) {
        if (isset($rule['required']) && $rule['required'] && empty($data[$field])) {
            $errors[$field] = 'This field is required';
            continue;
        }
        
        if (empty($data[$field])) {
            continue;
        }
        
        $value = $data[$field];
        
        if (isset($rule['type'])) {
            switch ($rule['type']) {
                case 'email':
                    if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[$field] = 'Invalid email format';
                    }
                    break;
                    
                case 'url':
                    if (!filter_var($value, FILTER_VALIDATE_URL)) {
                        $errors[$field] = 'Invalid URL format';
                    }
                    break;
                    
                case 'int':
                    if (!filter_var($value, FILTER_VALIDATE_INT)) {
                        $errors[$field] = 'Must be a valid integer';
                    }
                    break;
                    
                case 'float':
                    if (!filter_var($value, FILTER_VALIDATE_FLOAT)) {
                        $errors[$field] = 'Must be a valid number';
                    }
                    break;
            }
        }
        
        if (isset($rule['min_length']) && strlen($value) < $rule['min_length']) {
            $errors[$field] = "Must be at least {$rule['min_length']} characters";
        }
        
        if (isset($rule['max_length']) && strlen($value) > $rule['max_length']) {
            $errors[$field] = "Must not exceed {$rule['max_length']} characters";
        }
        
        if (isset($rule['pattern']) && !preg_match($rule['pattern'], $value)) {
            $errors[$field] = $rule['pattern_message'] ?? 'Invalid format';
        }
    }
    
    return $errors;
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function generateRandomToken($length = 32) {
    return bin2hex(random_bytes($length));
}

function isValidJSON($string) {
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}

function securePath($path) {
    // Prevent directory traversal
    $path = str_replace(['../', '..\\'], '', $path);
    return $path;
}

function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}
?>