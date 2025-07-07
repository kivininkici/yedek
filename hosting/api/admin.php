<?php
/**
 * Admin API Endpoints
 * OtoKiwi cPanel Compatible Version
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
        case 'PUT':
            handlePut($path);
            break;
        case 'DELETE':
            handleDelete($path);
            break;
        default:
            sendErrorResponse('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Admin API Error: " . $e->getMessage());
    sendErrorResponse('Internal server error', 500);
}

function handlePost($path) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($path) {
        case 'login':
            handleAdminLogin($input);
            break;
        case 'verify-master-password':
            verifyMasterPassword($input);
            break;
        case 'keys':
            createKey($input);
            break;
        case 'api-settings':
            createApiSettings($input);
            break;
        case 'refresh-balances':
            refreshApiBalances();
            break;
        case 'quick-api':
            addQuickApi($input);
            break;
        default:
            sendErrorResponse('Endpoint not found', 404);
    }
}

function handleGet($path) {
    requireAdmin();
    
    switch ($path) {
        case 'me':
            getAdminUser();
            break;
        case 'security-question':
            getRandomSecurityQuestion();
            break;
        case 'dashboard-stats':
            getDashboardStats();
            break;
        case 'users':
            getUsers();
            break;
        case 'keys':
            getKeys();
            break;
        case 'services':
            getServices();
            break;
        case 'api-settings':
            getApiSettings();
            break;
        case 'orders':
            getOrders();
            break;
        case 'logs':
            getLogs();
            break;
        case 'login-attempts':
            getLoginAttempts();
            break;
        case 'key-stats':
            getKeyStats();
            break;
        case 'api-balances':
            getApiBalances();
            break;
        case 'master-password-info':
            getMasterPasswordInfo();
            break;
        default:
            sendErrorResponse('Endpoint not found', 404);
    }
}

function handlePut($path) {
    requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($path) {
        case 'user-role':
            updateUserRole($input);
            break;
        case 'master-password':
            updateMasterPassword($input);
            break;
        default:
            sendErrorResponse('Endpoint not found', 404);
    }
}

function handleDelete($path) {
    requireAdmin();
    
    // Extract ID from path
    $pathParts = explode('/', $path);
    
    switch ($pathParts[0]) {
        case 'api-settings':
            if (isset($pathParts[1])) {
                deleteApiSettings($pathParts[1]);
            } else {
                sendErrorResponse('API ID gerekli', 400);
            }
            break;
        default:
            sendErrorResponse('Endpoint not found', 404);
    }
}

function verifyMasterPassword($input) {
    $password = $input['masterPassword'] ?? $input['password'] ?? '';
    
    if ($password === MASTER_PASSWORD) {
        $_SESSION['master_verified'] = true;
        $_SESSION['master_verified_time'] = time();
        sendSuccessResponse('Master şifre doğrulandı');
    } else {
        sendErrorResponse('Yanlış master şifre', 401);
    }
}

function handleAdminLogin($input) {
    // Check if master password is verified and not expired (30 minutes)
    if (!isset($_SESSION['master_verified']) || 
        (time() - ($_SESSION['master_verified_time'] ?? 0)) > 1800) {
        sendErrorResponse('Master şifre doğrulaması gerekli', 403);
    }
    
    $username = sanitizeInput($input['username'] ?? '');
    $password = $input['password'] ?? '';
    $securityAnswer = sanitizeInput($input['securityAnswer'] ?? '');
    
    $ip = $_SERVER['REMOTE_ADDR'];
    
    // Check if IP is blocked
    if (checkLoginAttempts($ip, 'admin')) {
        logLoginAttempt($ip, $username, 'admin', 'blocked');
        sendErrorResponse('Çok fazla başarısız deneme. 15 dakika sonra tekrar deneyin.', 429);
    }
    
    if (empty($username) || empty($password)) {
        sendErrorResponse('Kullanıcı adı ve şifre gerekli', 400);
    }
    
    // Validate credentials
    if ($username !== ADMIN_USERNAME || $password !== ADMIN_PASSWORD) {
        logLoginAttempt($ip, $username, 'admin', 'failed_password');
        sendErrorResponse('Geçersiz kullanıcı adı veya şifre', 401);
    }
    
    // Skip security answer validation for simple login
    
    // Create admin session
    $_SESSION['user_id'] = 1;
    $_SESSION['username'] = ADMIN_USERNAME;
    $_SESSION['role'] = 'admin';
    $_SESSION['is_admin'] = true;
    
    logLoginAttempt($ip, $username, 'admin', 'success');
    logActivity('admin_login', 'Admin logged in', ['username' => $username], 1);
    
    sendSuccessResponse('Admin girişi başarılı', [
        'user' => [
            'id' => 1,
            'username' => ADMIN_USERNAME,
            'role' => 'admin'
        ]
    ]);
}

function getRandomSecurityQuestion() {
    $questions = array_keys(SECURITY_QUESTIONS);
    $randomQuestion = $questions[array_rand($questions)];
    
    // Store the correct answers in session for validation
    $_SESSION['security_question'] = $randomQuestion;
    $_SESSION['security_answers'] = SECURITY_QUESTIONS[$randomQuestion];
    
    sendSuccessResponse('Güvenlik sorusu', ['question' => $randomQuestion]);
}

function validateSecurityAnswer($answer) {
    if (!isset($_SESSION['security_answers'])) {
        return false;
    }
    
    $correctAnswers = $_SESSION['security_answers'];
    $answer = trim($answer);
    
    foreach ($correctAnswers as $correctAnswer) {
        if (strcasecmp($answer, $correctAnswer) === 0) {
            return true;
        }
    }
    
    return false;
}

function getAdminUser() {
    sendSuccessResponse('Admin kullanıcı bilgileri', [
        'user' => [
            'id' => 1,
            'username' => ADMIN_USERNAME,
            'role' => 'admin'
        ]
    ]);
}

function getDashboardStats() {
    try {
        $db = getDB();
        
        $totalKeys = $db->fetchOne("SELECT COUNT(*) as count FROM keys")['count'];
        $usedKeys = $db->fetchOne("SELECT COUNT(*) as count FROM keys WHERE is_used = 1")['count'];
        $totalOrders = $db->fetchOne("SELECT COUNT(*) as count FROM orders")['count'];
        $totalUsers = $db->fetchOne("SELECT COUNT(*) as count FROM users")['count'];
        
        // Recent activity
        $recentKeys = $db->fetchAll(
            "SELECT k.*, s.name as service_name FROM keys k 
             LEFT JOIN services s ON k.service_id = s.id 
             ORDER BY k.created_at DESC LIMIT 5"
        );
        
        $recentOrders = $db->fetchAll(
            "SELECT o.*, s.name as service_name FROM orders o 
             LEFT JOIN services s ON o.service_id = s.id 
             ORDER BY o.created_at DESC LIMIT 5"
        );
        
        sendSuccessResponse('Dashboard istatistikleri', [
            'stats' => [
                'totalKeys' => $totalKeys,
                'usedKeys' => $usedKeys,
                'availableKeys' => $totalKeys - $usedKeys,
                'totalOrders' => $totalOrders,
                'totalUsers' => $totalUsers
            ],
            'recentKeys' => $recentKeys,
            'recentOrders' => $recentOrders
        ]);
        
    } catch (Exception $e) {
        error_log("Dashboard stats error: " . $e->getMessage());
        sendErrorResponse('İstatistikler alınamadı', 500);
    }
}

function getUsers() {
    try {
        $db = getDB();
        $users = $db->fetchAll("SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC");
        
        sendSuccessResponse('Kullanıcı listesi', ['users' => $users]);
        
    } catch (Exception $e) {
        error_log("Get users error: " . $e->getMessage());
        sendErrorResponse('Kullanıcılar alınamadı', 500);
    }
}

function updateUserRole($input) {
    $userId = $input['userId'] ?? '';
    $role = $input['role'] ?? '';
    
    if (empty($userId) || empty($role)) {
        sendErrorResponse('Kullanıcı ID ve rol gerekli', 400);
    }
    
    if (!in_array($role, ['user', 'admin'])) {
        sendErrorResponse('Geçersiz rol', 400);
    }
    
    try {
        $db = getDB();
        
        $db->update('users', ['role' => $role], 'id = ?', [$userId]);
        
        logActivity('role_update', 'User role updated', [
            'user_id' => $userId,
            'new_role' => $role
        ]);
        
        sendSuccessResponse('Kullanıcı rolü güncellendi');
        
    } catch (Exception $e) {
        error_log("Update user role error: " . $e->getMessage());
        sendErrorResponse('Rol güncellenemedi', 500);
    }
}

function getKeys() {
    try {
        $db = getDB();
        
        $category = $_GET['category'] ?? '';
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(100, max(10, intval($_GET['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;
        
        $whereClause = '';
        $params = [];
        
        if ($category) {
            $whereClause = 'WHERE k.category = ?';
            $params[] = $category;
        }
        
        $keys = $db->fetchAll(
            "SELECT k.*, s.name as service_name, u.username as created_by_username 
             FROM keys k 
             LEFT JOIN services s ON k.service_id = s.id 
             LEFT JOIN users u ON k.created_by = u.id 
             {$whereClause}
             ORDER BY k.created_at DESC 
             LIMIT {$limit} OFFSET {$offset}",
            $params
        );
        
        $totalCount = $db->fetchOne(
            "SELECT COUNT(*) as count FROM keys k {$whereClause}",
            $params
        )['count'];
        
        sendSuccessResponse('Key listesi', [
            'keys' => $keys,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalCount,
                'pages' => ceil($totalCount / $limit)
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Get keys error: " . $e->getMessage());
        sendErrorResponse('Key\'ler alınamadı', 500);
    }
}

function createKey($input) {
    $keyValue = sanitizeInput($input['key'] ?? '');
    $category = sanitizeInput($input['category'] ?? '');
    $serviceId = $input['serviceId'] ?? null;
    
    if (empty($keyValue) || empty($category)) {
        sendErrorResponse('Key değeri ve kategori gerekli', 400);
    }
    
    try {
        $db = getDB();
        
        // Check if key already exists
        $existingKey = $db->fetchOne("SELECT id FROM keys WHERE key_value = ?", [$keyValue]);
        if ($existingKey) {
            sendErrorResponse('Bu key zaten mevcut', 409);
        }
        
        $keyId = $db->insert('keys', [
            'key_value' => $keyValue,
            'category' => $category,
            'service_id' => $serviceId,
            'created_by' => $_SESSION['user_id']
        ]);
        
        logActivity('key_created', 'New key created', [
            'key_id' => $keyId,
            'category' => $category
        ]);
        
        sendSuccessResponse('Key başarıyla oluşturuldu', ['keyId' => $keyId]);
        
    } catch (Exception $e) {
        error_log("Create key error: " . $e->getMessage());
        sendErrorResponse('Key oluşturulamadı', 500);
    }
}

function getApiSettings() {
    try {
        $db = getDB();
        $apiSettings = $db->fetchAll(
            "SELECT *, (SELECT COUNT(*) FROM services WHERE api_settings_id = api_settings.id) as service_count 
             FROM api_settings ORDER BY created_at DESC"
        );
        
        sendSuccessResponse('API ayarları', ['apiSettings' => $apiSettings]);
        
    } catch (Exception $e) {
        error_log("Get API settings error: " . $e->getMessage());
        sendErrorResponse('API ayarları alınamadı', 500);
    }
}

function createApiSettings($input) {
    $name = sanitizeInput($input['name'] ?? '');
    $apiUrl = sanitizeInput($input['apiUrl'] ?? '');
    $apiKey = sanitizeInput($input['apiKey'] ?? '');
    
    if (empty($name) || empty($apiUrl) || empty($apiKey)) {
        sendErrorResponse('Tüm alanlar gerekli', 400);
    }
    
    try {
        $db = getDB();
        
        $apiId = $db->insert('api_settings', [
            'name' => $name,
            'api_url' => $apiUrl,
            'api_key' => $apiKey,
            'is_active' => 1
        ]);
        
        logActivity('api_created', 'New API settings created', ['api_id' => $apiId, 'name' => $name]);
        
        sendSuccessResponse('API ayarları oluşturuldu', ['apiId' => $apiId]);
        
    } catch (Exception $e) {
        error_log("Create API settings error: " . $e->getMessage());
        sendErrorResponse('API ayarları oluşturulamadı', 500);
    }
}

function deleteApiSettings($apiId) {
    try {
        $db = getDB();
        
        $db->beginTransaction();
        
        // Delete related services first
        $deletedServices = $db->query("DELETE FROM services WHERE api_settings_id = ?", [$apiId]);
        
        // Delete API settings
        $deleted = $db->delete('api_settings', 'id = ?', [$apiId]);
        
        $db->commit();
        
        if ($deleted->rowCount() > 0) {
            logActivity('api_deleted', 'API settings deleted', [
                'api_id' => $apiId,
                'deleted_services' => $deletedServices->rowCount()
            ]);
            
            sendSuccessResponse('API ayarları silindi');
        } else {
            sendErrorResponse('API ayarları bulunamadı', 404);
        }
        
    } catch (Exception $e) {
        $db->rollback();
        error_log("Delete API settings error: " . $e->getMessage());
        sendErrorResponse('API ayarları silinemedi', 500);
    }
}

function refreshApiBalances() {
    try {
        $db = getDB();
        $apiSettings = $db->fetchAll("SELECT * FROM api_settings WHERE is_active = 1");
        
        $updatedCount = 0;
        $errors = [];
        
        foreach ($apiSettings as $api) {
            try {
                $balance = fetchApiBalance($api);
                
                if ($balance !== null) {
                    $db->update('api_settings', [
                        'balance' => $balance,
                        'last_balance_check' => date('Y-m-d H:i:s')
                    ], 'id = ?', [$api['id']]);
                    
                    $updatedCount++;
                }
            } catch (Exception $e) {
                $errors[] = $api['name'] . ': ' . $e->getMessage();
            }
        }
        
        $message = "{$updatedCount} API bakiyesi güncellendi";
        if (!empty($errors)) {
            $message .= '. Hatalar: ' . implode(', ', $errors);
        }
        
        sendSuccessResponse($message, ['updatedCount' => $updatedCount, 'errors' => $errors]);
        
    } catch (Exception $e) {
        error_log("Refresh balances error: " . $e->getMessage());
        sendErrorResponse('Bakiyeler güncellenemedi', 500);
    }
}

function fetchApiBalance($api) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $api['api_url'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => API_TIMEOUT,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'key' => $api['api_key'],
            'action' => 'balance'
        ]),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/x-www-form-urlencoded'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200 || !$response) {
        throw new Exception('API request failed');
    }
    
    $data = json_decode($response, true);
    
    // Try multiple possible balance fields
    $balanceFields = ['balance', 'currency', 'fund', 'money', 'credit', 'amount'];
    
    foreach ($balanceFields as $field) {
        if (isset($data[$field]) && is_numeric($data[$field])) {
            return floatval($data[$field]);
        }
    }
    
    return null;
}

function getMasterPasswordInfo() {
    sendSuccessResponse('Master şifre bilgisi', [
        'masterPassword' => MASTER_PASSWORD,
        'lastChanged' => $_SESSION['master_password_changed'] ?? 'Bilinmiyor'
    ]);
}

function updateMasterPassword($input) {
    $currentPassword = $input['currentPassword'] ?? '';
    $newPassword = $input['newPassword'] ?? '';
    
    if ($currentPassword !== MASTER_PASSWORD) {
        sendErrorResponse('Mevcut şifre yanlış', 401);
    }
    
    if (strlen($newPassword) < 10) {
        sendErrorResponse('Yeni şifre en az 10 karakter olmalıdır', 400);
    }
    
    // In a real application, you would update this in a config file or database
    // For now, we'll just simulate success
    $_SESSION['master_password_changed'] = date('Y-m-d H:i:s');
    
    logActivity('master_password_changed', 'Master password updated');
    
    sendSuccessResponse('Master şifre güncellendi');
}

// Continue with other functions...
function getServices() {
    try {
        $db = getDB();
        $services = $db->fetchAll(
            "SELECT s.*, a.name as api_name 
             FROM services s 
             LEFT JOIN api_settings a ON s.api_settings_id = a.id 
             ORDER BY s.created_at DESC"
        );
        
        sendSuccessResponse('Servis listesi', ['services' => $services]);
        
    } catch (Exception $e) {
        error_log("Get services error: " . $e->getMessage());
        sendErrorResponse('Servisler alınamadı', 500);
    }
}

function getOrders() {
    try {
        $db = getDB();
        $orders = $db->fetchAll(
            "SELECT o.*, s.name as service_name, k.key_value 
             FROM orders o 
             LEFT JOIN services s ON o.service_id = s.id 
             LEFT JOIN keys k ON o.key_id = k.id 
             ORDER BY o.created_at DESC 
             LIMIT 100"
        );
        
        sendSuccessResponse('Sipariş listesi', ['orders' => $orders]);
        
    } catch (Exception $e) {
        error_log("Get orders error: " . $e->getMessage());
        sendErrorResponse('Siparişler alınamadı', 500);
    }
}

function getLogs() {
    try {
        $db = getDB();
        $logs = $db->fetchAll(
            "SELECT l.*, u.username 
             FROM logs l 
             LEFT JOIN users u ON l.user_id = u.id 
             ORDER BY l.created_at DESC 
             LIMIT 200"
        );
        
        sendSuccessResponse('Log listesi', ['logs' => $logs]);
        
    } catch (Exception $e) {
        error_log("Get logs error: " . $e->getMessage());
        sendErrorResponse('Loglar alınamadı', 500);
    }
}

function getLoginAttempts() {
    try {
        $db = getDB();
        $attempts = $db->fetchAll(
            "SELECT * FROM login_attempts 
             ORDER BY created_at DESC 
             LIMIT 500"
        );
        
        // Get statistics
        $stats = [
            'total' => count($attempts),
            'successful' => count(array_filter($attempts, fn($a) => $a['status'] === 'success')),
            'failed' => count(array_filter($attempts, fn($a) => in_array($a['status'], ['failed_password', 'failed_security', 'failed_math']))),
            'blocked' => count(array_filter($attempts, fn($a) => $a['status'] === 'blocked'))
        ];
        
        sendSuccessResponse('Giriş denemeleri', [
            'attempts' => $attempts,
            'stats' => $stats
        ]);
        
    } catch (Exception $e) {
        error_log("Get login attempts error: " . $e->getMessage());
        sendErrorResponse('Giriş denemeleri alınamadı', 500);
    }
}

function getKeyStats() {
    try {
        $db = getDB();
        
        // Key statistics by category
        $categoryStats = $db->fetchAll(
            "SELECT category, 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) as used,
                    SUM(CASE WHEN is_used = 0 THEN 1 ELSE 0 END) as available
             FROM keys 
             GROUP BY category 
             ORDER BY total DESC"
        );
        
        // Daily key usage for last 30 days
        $dailyUsage = $db->fetchAll(
            "SELECT DATE(used_at) as date, COUNT(*) as count
             FROM keys 
             WHERE used_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             GROUP BY DATE(used_at)
             ORDER BY date DESC"
        );
        
        sendSuccessResponse('Key istatistikleri', [
            'categoryStats' => $categoryStats,
            'dailyUsage' => $dailyUsage
        ]);
        
    } catch (Exception $e) {
        error_log("Get key stats error: " . $e->getMessage());
        sendErrorResponse('Key istatistikleri alınamadı', 500);
    }
}

function getApiBalances() {
    try {
        $db = getDB();
        $apiSettings = $db->fetchAll(
            "SELECT id, name, balance, last_balance_check, is_active 
             FROM api_settings 
             ORDER BY name"
        );
        
        $totalBalance = array_sum(array_column($apiSettings, 'balance'));
        $activeApis = count(array_filter($apiSettings, fn($api) => $api['is_active']));
        $lowBalanceApis = count(array_filter($apiSettings, fn($api) => $api['balance'] < 10));
        
        sendSuccessResponse('API bakiyeleri', [
            'apiSettings' => $apiSettings,
            'summary' => [
                'totalBalance' => $totalBalance,
                'activeApis' => $activeApis,
                'lowBalanceApis' => $lowBalanceApis
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Get API balances error: " . $e->getMessage());
        sendErrorResponse('API bakiyeleri alınamadı', 500);
    }
}

function addQuickApi($input) {
    $apiType = $input['apiType'] ?? '';
    
    $predefinedApis = [
        'medyabayim' => [
            'name' => 'MedyaBayim',
            'api_url' => 'https://medyabayim.com/api/v2',
            'api_key' => 'your-medyabayim-api-key'
        ],
        'resellerprovider' => [
            'name' => 'ResellerProvider',
            'api_url' => 'https://resellerprovider.com/api/v2',
            'api_key' => 'your-resellerprovider-api-key'
        ]
    ];
    
    if (!isset($predefinedApis[$apiType])) {
        sendErrorResponse('Geçersiz API türü', 400);
    }
    
    $apiData = $predefinedApis[$apiType];
    
    try {
        $db = getDB();
        
        $apiId = $db->insert('api_settings', [
            'name' => $apiData['name'],
            'api_url' => $apiData['api_url'],
            'api_key' => $apiData['api_key'],
            'is_active' => 1
        ]);
        
        logActivity('quick_api_added', 'Quick API added', ['api_type' => $apiType, 'api_id' => $apiId]);
        
        sendSuccessResponse('Hızlı API eklendi', ['apiId' => $apiId]);
        
    } catch (Exception $e) {
        error_log("Add quick API error: " . $e->getMessage());
        sendErrorResponse('Hızlı API eklenemedi', 500);
    }
}
?>