<?php
// KeyPanel Admin Routes - cPanel Hosting Uyumlu
// Türkçe: Admin panel işlemleri

startSession();

switch ($method) {
    case 'POST':
        if (count($path_parts) > 1) {
            switch ($path_parts[1]) {
                case 'login':
                    handleAdminLogin($input);
                    break;
                case 'keys':
                    requireAdmin();
                    handleCreateKey($input);
                    break;
                default:
                    errorResponse('Geçersiz admin endpoint', 404);
            }
        } else {
            errorResponse('Admin endpoint belirtilmedi', 400);
        }
        break;
        
    case 'GET':
        requireAdmin();
        if (count($path_parts) > 1) {
            switch ($path_parts[1]) {
                case 'me':
                    getAdminInfo();
                    break;
                case 'users':
                    getAllUsers();
                    break;
                case 'keys':
                    if (count($path_parts) > 2) {
                        switch ($path_parts[2]) {
                            case 'export':
                                $category = $path_parts[3] ?? 'all';
                                exportKeys($category);
                                break;
                            case 'stats':
                                getKeyStats();
                                break;
                            default:
                                getAllKeys();
                        }
                    } else {
                        getAllKeys();
                    }
                    break;
                case 'services':
                    getAllServices();
                    break;
                case 'dashboard':
                    getDashboardStats();
                    break;
                case 'notifications':
                    getNotifications();
                    break;
                case 'login-attempts':
                    getLoginAttempts();
                    break;
                case 'api-balances':
                    getApiBalances();
                    break;
                case 'feedback':
                    getFeedbackList();
                    break;
                default:
                    errorResponse('Geçersiz admin GET endpoint', 404);
            }
        } else {
            errorResponse('Admin GET endpoint belirtilmedi', 400);
        }
        break;
        
    case 'PUT':
        requireAdmin();
        if (count($path_parts) > 2) {
            switch ($path_parts[1]) {
                case 'users':
                    updateUserRole($path_parts[2], $input);
                    break;
                case 'keys':
                    updateKey($path_parts[2], $input);
                    break;
                case 'services':
                    updateService($path_parts[2], $input);
                    break;
                case 'feedback':
                    updateFeedback($path_parts[2], $input);
                    break;
                default:
                    errorResponse('Geçersiz admin PUT endpoint', 404);
            }
        } else {
            errorResponse('Admin PUT endpoint ID belirtilmedi', 400);
        }
        break;
        
    case 'DELETE':
        requireAdmin();
        if (count($path_parts) > 2) {
            switch ($path_parts[1]) {
                case 'keys':
                    deleteKey($path_parts[2]);
                    break;
                case 'services':
                    deleteService($path_parts[2]);
                    break;
                default:
                    errorResponse('Geçersiz admin DELETE endpoint', 404);
            }
        } else {
            errorResponse('Admin DELETE endpoint ID belirtilmedi', 400);
        }
        break;
        
    default:
        errorResponse('Desteklenmeyen HTTP method', 405);
}

function handleAdminLogin($data) {
    validateRequired($data, ['username', 'password', 'securityAnswer']);
    
    $username = sanitizeInput($data['username']);
    $password = $data['password'];
    $securityAnswer = sanitizeInput($data['securityAnswer']);
    $ipAddress = getClientIP();
    
    // Rate limiting kontrolü
    if (!checkRateLimit($ipAddress)) {
        logLoginAttempt($ipAddress, $username, 'blocked', $_SERVER['HTTP_USER_AGENT'] ?? null);
        errorResponse('Çok fazla başarısız deneme. 15 dakika sonra tekrar deneyin.', 429);
    }
    
    try {
        $db = getDB();
        $admin = $db->fetchOne("SELECT * FROM admin_users WHERE username = ?", [$username]);
        
        if (!$admin) {
            logLoginAttempt($ipAddress, $username, 'failed_password', $_SERVER['HTTP_USER_AGENT'] ?? null);
            errorResponse('Admin kullanıcı adı veya şifre hatalı');
        }
        
        if (!verifyPassword($password, $admin['password_hash'])) {
            logLoginAttempt($ipAddress, $username, 'failed_password', $_SERVER['HTTP_USER_AGENT'] ?? null);
            errorResponse('Admin kullanıcı adı veya şifre hatalı');
        }
        
        // Güvenlik sorusu kontrolü
        $validAnswers = [
            '29/05/2020', '29.05.2020', '29-05-2020',
            'halime', 'bahat', '17/12/1978', '17.12.1978', '17-12-1978',
            'muhammed', 'yazar'
        ];
        
        if (!in_array(strtolower($securityAnswer), array_map('strtolower', $validAnswers))) {
            logLoginAttempt($ipAddress, $username, 'failed_security', $_SERVER['HTTP_USER_AGENT'] ?? null);
            errorResponse('Güvenlik sorusu cevabı hatalı');
        }
        
        // Başarılı admin girişi
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        $_SESSION['is_admin'] = true;
        
        // Son giriş zamanını güncelle
        $db->execute("UPDATE admin_users SET last_login = NOW() WHERE id = ?", [$admin['id']]);
        
        logLoginAttempt($ipAddress, $username, 'success', $_SERVER['HTTP_USER_AGENT'] ?? null);
        logActivity($admin['id'], 'admin_login', 'Admin panel girişi');
        
        successResponse([
            'admin' => [
                'id' => $admin['id'],
                'username' => $admin['username'],
                'role' => 'admin'
            ]
        ], 'Admin girişi başarılı');
        
    } catch (Exception $e) {
        errorResponse('Admin girişi sırasında hata: ' . $e->getMessage(), 500);
    }
}

function getAdminInfo() {
    if (!isset($_SESSION['admin_id'])) {
        errorResponse('Admin girişi gerekli', 401);
    }
    
    try {
        $db = getDB();
        $admin = $db->fetchOne("SELECT * FROM admin_users WHERE id = ?", [$_SESSION['admin_id']]);
        
        if (!$admin) {
            errorResponse('Admin bulunamadı', 404);
        }
        
        successResponse([
            'admin' => [
                'id' => $admin['id'],
                'username' => $admin['username'],
                'role' => 'admin'
            ]
        ]);
        
    } catch (Exception $e) {
        errorResponse('Admin bilgileri alınırken hata: ' . $e->getMessage(), 500);
    }
}

function getAllUsers() {
    try {
        $db = getDB();
        
        // Normal kullanıcılar
        $normalUsers = $db->fetchAll("
            SELECT id, username, email, created_at, 'user' as role 
            FROM normal_users 
            ORDER BY created_at DESC
        ");
        
        // Admin kullanıcılar
        $adminUsers = $db->fetchAll("
            SELECT id, username, last_login, created_at, 'admin' as role 
            FROM admin_users 
            ORDER BY created_at DESC
        ");
        
        successResponse([
            'normalUsers' => $normalUsers,
            'adminUsers' => $adminUsers
        ]);
        
    } catch (Exception $e) {
        errorResponse('Kullanıcılar alınırken hata: ' . $e->getMessage(), 500);
    }
}

function handleCreateKey($data) {
    validateRequired($data, ['value', 'serviceId', 'maxQuantity', 'category']);
    
    $value = sanitizeInput($data['value']);
    $serviceId = (int)$data['serviceId'];
    $maxQuantity = (int)$data['maxQuantity'];
    $category = sanitizeInput($data['category']);
    $description = sanitizeInput($data['description'] ?? '');
    $expiresAt = isset($data['expiresAt']) ? $data['expiresAt'] : null;
    
    try {
        $db = getDB();
        
        // Service kontrolü
        $service = $db->fetchOne("SELECT * FROM services WHERE id = ?", [$serviceId]);
        if (!$service) {
            errorResponse('Seçilen servis bulunamadı');
        }
        
        // Key value duplicate kontrolü
        $existingKey = $db->fetchOne("SELECT id FROM keys WHERE value = ?", [$value]);
        if ($existingKey) {
            errorResponse('Bu key değeri zaten mevcut');
        }
        
        $sql = "INSERT INTO keys (value, service_id, max_quantity, used_quantity, category, description, expires_at, created_at) 
                VALUES (?, ?, ?, 0, ?, ?, ?, NOW())";
        $db->execute($sql, [$value, $serviceId, $maxQuantity, $category, $description, $expiresAt]);
        
        $keyId = $db->lastInsertId();
        
        logActivity($_SESSION['admin_id'], 'create_key', "Key oluşturuldu: {$value}");
        
        successResponse([
            'id' => $keyId,
            'message' => 'Key başarıyla oluşturuldu'
        ]);
        
    } catch (Exception $e) {
        errorResponse('Key oluşturulurken hata: ' . $e->getMessage(), 500);
    }
}

function getAllKeys() {
    try {
        $db = getDB();
        
        $keys = $db->fetchAll("
            SELECT k.*, s.name as service_name 
            FROM keys k 
            LEFT JOIN services s ON k.service_id = s.id 
            ORDER BY k.created_at DESC
        ");
        
        successResponse($keys);
        
    } catch (Exception $e) {
        errorResponse('Key\'ler alınırken hata: ' . $e->getMessage(), 500);
    }
}

function getDashboardStats() {
    try {
        $db = getDB();
        
        // Temel istatistikler
        $totalKeys = $db->fetchOne("SELECT COUNT(*) as count FROM keys")['count'];
        $usedKeys = $db->fetchOne("SELECT COUNT(*) as count FROM keys WHERE used_quantity >= max_quantity")['count'];
        $activeServices = $db->fetchOne("SELECT COUNT(*) as count FROM services WHERE is_active = 1")['count'];
        $totalOrders = $db->fetchOne("SELECT COUNT(*) as count FROM orders")['count'];
        
        // Son aktiviteler
        $recentKeys = $db->fetchAll("
            SELECT k.*, s.name as service_name 
            FROM keys k 
            LEFT JOIN services s ON k.service_id = s.id 
            ORDER BY k.created_at DESC 
            LIMIT 5
        ");
        
        $recentOrders = $db->fetchAll("
            SELECT o.*, k.value as key_value, s.name as service_name 
            FROM orders o 
            LEFT JOIN keys k ON o.key_id = k.id 
            LEFT JOIN services s ON o.service_id = s.id 
            ORDER BY o.created_at DESC 
            LIMIT 5
        ");
        
        successResponse([
            'stats' => [
                'totalKeys' => $totalKeys,
                'usedKeys' => $usedKeys,
                'unusedKeys' => $totalKeys - $usedKeys,
                'activeServices' => $activeServices,
                'totalOrders' => $totalOrders
            ],
            'recentKeys' => $recentKeys,
            'recentOrders' => $recentOrders
        ]);
        
    } catch (Exception $e) {
        errorResponse('Dashboard istatistikleri alınırken hata: ' . $e->getMessage(), 500);
    }
}

function exportKeys($category) {
    try {
        $db = getDB();
        
        $sql = "SELECT value FROM keys WHERE category = ? AND used_quantity < max_quantity";
        $keys = $db->fetchAll($sql, [$category]);
        
        if (empty($keys)) {
            errorResponse('Bu kategoride kullanılabilir key bulunamadı');
        }
        
        $keyValues = array_column($keys, 'value');
        $content = implode("\n", $keyValues);
        
        header('Content-Type: text/plain');
        header('Content-Disposition: attachment; filename="' . $category . '_keys.txt"');
        header('Content-Length: ' . strlen($content));
        
        echo $content;
        exit;
        
    } catch (Exception $e) {
        errorResponse('Key export hatası: ' . $e->getMessage(), 500);
    }
}

function getLoginAttempts() {
    try {
        $db = getDB();
        
        $attempts = $db->fetchAll("
            SELECT * FROM login_attempts 
            ORDER BY created_at DESC 
            LIMIT 100
        ");
        
        // İstatistikler
        $stats = [
            'total' => count($attempts),
            'successful' => count(array_filter($attempts, fn($a) => $a['attempt_type'] === 'success')),
            'failed' => count(array_filter($attempts, fn($a) => in_array($a['attempt_type'], ['failed_password', 'failed_security']))),
            'blocked' => count(array_filter($attempts, fn($a) => $a['attempt_type'] === 'blocked'))
        ];
        
        successResponse([
            'attempts' => $attempts,
            'stats' => $stats
        ]);
        
    } catch (Exception $e) {
        errorResponse('Giriş denemeleri alınırken hata: ' . $e->getMessage(), 500);
    }
}

function getFeedbackList() {
    try {
        $db = getDB();
        
        $feedbacks = $db->fetchAll("
            SELECT * FROM feedback 
            ORDER BY created_at DESC 
            LIMIT 100
        ");
        
        // İstatistikler
        $stats = [
            'total' => count($feedbacks),
            'unread' => count(array_filter($feedbacks, fn($f) => !$f['is_read'])),
            'read' => count(array_filter($feedbacks, fn($f) => $f['is_read']))
        ];
        
        successResponse([
            'feedbacks' => $feedbacks,
            'stats' => $stats
        ]);
        
    } catch (Exception $e) {
        errorResponse('Geri bildirimler alınırken hata: ' . $e->getMessage(), 500);
    }
}

function updateFeedback($feedbackId, $data) {
    try {
        $db = getDB();
        
        $feedback = $db->fetchOne("SELECT * FROM feedback WHERE id = ?", [$feedbackId]);
        if (!$feedback) {
            errorResponse('Geri bildirim bulunamadı');
        }
        
        $updateFields = [];
        $updateValues = [];
        
        if (isset($data['is_read'])) {
            $updateFields[] = 'is_read = ?';
            $updateValues[] = (int)$data['is_read'];
        }
        
        if (isset($data['admin_notes'])) {
            $updateFields[] = 'admin_notes = ?';
            $updateValues[] = sanitizeInput($data['admin_notes']);
        }
        
        if (empty($updateFields)) {
            errorResponse('Güncellenecek veri belirtilmedi');
        }
        
        $updateFields[] = 'updated_at = NOW()';
        $updateValues[] = $feedbackId;
        
        $sql = "UPDATE feedback SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $db->execute($sql, $updateValues);
        
        logActivity($_SESSION['admin_id'], 'update_feedback', "Geri bildirim güncellendi: #{$feedbackId}");
        
        successResponse(['message' => 'Geri bildirim başarıyla güncellendi']);
        
    } catch (Exception $e) {
        errorResponse('Geri bildirim güncelleme hatası: ' . $e->getMessage(), 500);
    }
}

// Admin nav için feedback sayısını almak
function getUnreadFeedbackCount() {
    try {
        $db = getDB();
        $count = $db->fetchOne("SELECT COUNT(*) as count FROM feedback WHERE is_read = 0")['count'];
        return $count;
    } catch (Exception $e) {
        return 0;
    }
}

// updateUserRole, deleteKey, getAllServices gibi diğer fonksiyonlar burada devam edebilir...
?>