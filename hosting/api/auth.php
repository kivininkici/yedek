<?php
// Authentication API endpoints for cPanel version
session_start();
require_once '../config/database.php';
require_once '../includes/security.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = new Database();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Parse the path to get the endpoint
$pathParts = explode('/', trim($path, '/'));
$endpoint = end($pathParts);

try {
    switch ($method) {
        case 'POST':
            if ($endpoint === 'login') {
                handleLogin($db);
            } elseif ($endpoint === 'register') {
                handleRegister($db);
            } elseif ($endpoint === 'logout') {
                handleLogout($db);
            } else {
                throw new Exception('Endpoint not found');
            }
            break;
            
        case 'GET':
            if ($endpoint === 'me') {
                handleGetUser($db);
            } else {
                throw new Exception('Endpoint not found');
            }
            break;
            
        default:
            throw new Exception('Method not allowed');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleLogin($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        throw new Exception('Username and password are required');
    }
    
    $username = sanitizeInput($input['username']);
    $password = $input['password'];
    
    // Log login attempt
    logLoginAttempt($db, $username, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'], 'attempt');
    
    // Check rate limiting
    if (isRateLimited($db, $_SERVER['REMOTE_ADDR'])) {
        throw new Exception('Too many login attempts. Please try again later.');
    }
    
    // Find user
    $user = $db->fetchOne(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [$username, $username]
    );
    
    if (!$user || !password_verify($password, $user['password'])) {
        logLoginAttempt($db, $username, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'], 'failed_password');
        throw new Exception('Invalid credentials');
    }
    
    // Create session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['login_time'] = time();
    
    logLoginAttempt($db, $username, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'], 'success');
    
    echo json_encode([
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'avatar_id' => $user['avatar_id']
        ]
    ]);
}

function handleRegister($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['email']) || !isset($input['password'])) {
        throw new Exception('Username, email and password are required');
    }
    
    $username = sanitizeInput($input['username']);
    $email = sanitizeInput($input['email']);
    $password = $input['password'];
    
    // Validate input
    if (strlen($username) < 3) {
        throw new Exception('Username must be at least 3 characters');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    if (strlen($password) < 6) {
        throw new Exception('Password must be at least 6 characters');
    }
    
    // Check if user exists
    $existingUser = $db->fetchOne(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [$username, $email]
    );
    
    if ($existingUser) {
        throw new Exception('Username or email already exists');
    }
    
    // Create user
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $avatarId = rand(1, 24); // Random avatar
    
    $success = $db->insert('users', [
        'username' => $username,
        'email' => $email,
        'password' => $hashedPassword,
        'role' => 'user',
        'avatar_id' => $avatarId
    ]);
    
    if (!$success) {
        throw new Exception('Failed to create user');
    }
    
    $userId = $db->lastInsertId();
    
    // Auto-login after registration
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['role'] = 'user';
    $_SESSION['login_time'] = time();
    
    echo json_encode([
        'user' => [
            'id' => $userId,
            'username' => $username,
            'email' => $email,
            'role' => 'user',
            'avatar_id' => $avatarId
        ]
    ]);
}

function handleLogout($db) {
    session_destroy();
    echo json_encode(['message' => 'Logged out successfully']);
}

function handleGetUser($db) {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $user = $db->fetchOne(
        'SELECT id, username, email, role, avatar_id FROM users WHERE id = ?',
        [$_SESSION['user_id']]
    );
    
    if (!$user) {
        throw new Exception('User not found');
    }
    
    echo json_encode(['user' => $user]);
}

function logLoginAttempt($db, $username, $ip, $userAgent, $status) {
    $db->insert('login_attempts', [
        'username' => $username,
        'ip_address' => $ip,
        'user_agent' => $userAgent,
        'status' => $status
    ]);
}

function isRateLimited($db, $ip) {
    $attempts = $db->fetchOne(
        'SELECT COUNT(*) as count FROM login_attempts WHERE ip_address = ? AND status IN ("failed_password", "failed_security") AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)',
        [$ip]
    );
    
    return $attempts['count'] >= 5;
}
?>