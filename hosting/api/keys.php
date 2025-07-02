<?php
/**
 * Keys API Endpoints
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
        default:
            sendErrorResponse('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Keys API Error: " . $e->getMessage());
    sendErrorResponse('Internal server error', 500);
}

function handlePost($path) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($path) {
        case 'validate':
            validateKey($input);
            break;
        case 'use':
            useKey($input);
            break;
        default:
            sendErrorResponse('Endpoint not found', 404);
    }
}

function handleGet($path) {
    $pathParts = explode('/', $path);
    
    switch ($pathParts[0]) {
        case 'export':
            if (isset($pathParts[1])) {
                exportKeys($pathParts[1]);
            } else {
                sendErrorResponse('Kategori gerekli', 400);
            }
            break;
        case 'services':
            if (isset($_GET['key'])) {
                getServicesForKey($_GET['key']);
            } else {
                sendErrorResponse('Key gerekli', 400);
            }
            break;
        default:
            sendErrorResponse('Endpoint not found', 404);
    }
}

function validateKey($input) {
    $keyValue = sanitizeInput($input['key'] ?? '');
    
    if (empty($keyValue)) {
        sendErrorResponse('Key değeri gerekli', 400);
    }
    
    try {
        $db = getDB();
        $key = $db->fetchOne(
            "SELECT k.*, s.name as service_name, s.category as service_category 
             FROM keys k 
             LEFT JOIN services s ON k.service_id = s.id 
             WHERE k.key_value = ?",
            [$keyValue]
        );
        
        if (!$key) {
            logActivity('key_validation_failed', 'Invalid key attempted', ['key' => $keyValue]);
            sendErrorResponse('Geçersiz key', 404);
        }
        
        if ($key['is_used']) {
            logActivity('key_validation_failed', 'Used key attempted', ['key' => $keyValue]);
            sendErrorResponse('Bu key daha önce kullanılmış', 409);
        }
        
        logActivity('key_validation_success', 'Key validated successfully', ['key_id' => $key['id']]);
        
        sendSuccessResponse('Key geçerli', [
            'key' => [
                'id' => $key['id'],
                'category' => $key['category'],
                'service_name' => $key['service_name'],
                'service_category' => $key['service_category'],
                'created_at' => $key['created_at']
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Key validation error: " . $e->getMessage());
        sendErrorResponse('Key doğrulama sırasında hata oluştu', 500);
    }
}

function getServicesForKey($keyValue) {
    try {
        $db = getDB();
        
        // First validate the key
        $key = $db->fetchOne("SELECT * FROM keys WHERE key_value = ? AND is_used = 0", [$keyValue]);
        
        if (!$key) {
            sendErrorResponse('Geçersiz veya kullanılmış key', 404);
        }
        
        // Get services based on key category
        $services = $db->fetchAll(
            "SELECT s.*, a.name as api_name, a.api_url 
             FROM services s 
             JOIN api_settings a ON s.api_settings_id = a.id 
             WHERE s.is_active = 1 AND a.is_active = 1 
             AND (s.category LIKE ? OR s.name LIKE ? OR ? = 'all')
             ORDER BY s.name",
            [
                '%' . $key['category'] . '%',
                '%' . $key['category'] . '%',
                $key['category']
            ]
        );
        
        // If no category-specific services found, return all services
        if (empty($services)) {
            $services = $db->fetchAll(
                "SELECT s.*, a.name as api_name, a.api_url 
                 FROM services s 
                 JOIN api_settings a ON s.api_settings_id = a.id 
                 WHERE s.is_active = 1 AND a.is_active = 1 
                 ORDER BY s.name"
            );
        }
        
        sendSuccessResponse('Servis listesi', [
            'services' => $services,
            'keyCategory' => $key['category']
        ]);
        
    } catch (Exception $e) {
        error_log("Get services error: " . $e->getMessage());
        sendErrorResponse('Servisler alınamadı', 500);
    }
}

function useKey($input) {
    $keyValue = sanitizeInput($input['key'] ?? '');
    $serviceId = $input['serviceId'] ?? '';
    $quantity = max(1, intval($input['quantity'] ?? 1));
    $targetUrl = sanitizeInput($input['targetUrl'] ?? '');
    
    if (empty($keyValue) || empty($serviceId)) {
        sendErrorResponse('Key ve servis gerekli', 400);
    }
    
    try {
        $db = getDB();
        $db->beginTransaction();
        
        // Validate key
        $key = $db->fetchOne(
            "SELECT * FROM keys WHERE key_value = ? AND is_used = 0 FOR UPDATE",
            [$keyValue]
        );
        
        if (!$key) {
            $db->rollback();
            sendErrorResponse('Geçersiz veya kullanılmış key', 404);
        }
        
        // Get service details
        $service = $db->fetchOne(
            "SELECT s.*, a.api_url, a.api_key 
             FROM services s 
             JOIN api_settings a ON s.api_settings_id = a.id 
             WHERE s.id = ? AND s.is_active = 1 AND a.is_active = 1",
            [$serviceId]
        );
        
        if (!$service) {
            $db->rollback();
            sendErrorResponse('Geçersiz servis', 404);
        }
        
        // Validate quantity
        if ($quantity < $service['min_quantity'] || $quantity > $service['max_quantity']) {
            $db->rollback();
            sendErrorResponse(
                "Miktar {$service['min_quantity']} ile {$service['max_quantity']} arasında olmalıdır",
                400
            );
        }
        
        // Calculate charge
        $charge = $service['rate'] * $quantity;
        
        // Generate order ID
        $orderId = generateOrderId();
        
        // Create order
        $orderDbId = $db->insert('orders', [
            'order_id' => $orderId,
            'api_settings_id' => $service['api_settings_id'],
            'service_id' => $serviceId,
            'key_id' => $key['id'],
            'quantity' => $quantity,
            'target_url' => $targetUrl,
            'charge' => $charge,
            'status' => 'Processing',
            'currency' => 'TRY',
            'ip_address' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
        
        // Mark key as used
        $db->update('keys', [
            'is_used' => 1,
            'used_at' => date('Y-m-d H:i:s'),
            'used_by_ip' => $_SERVER['REMOTE_ADDR']
        ], 'id = ?', [$key['id']]);
        
        $db->commit();
        
        // Process order asynchronously
        processOrderAsync($orderDbId, $service, $quantity, $targetUrl, $orderId);
        
        logActivity('key_used', 'Key used for order', [
            'key_id' => $key['id'],
            'order_id' => $orderId,
            'service_id' => $serviceId
        ]);
        
        sendSuccessResponse('Sipariş oluşturuldu', [
            'orderId' => $orderId,
            'charge' => $charge,
            'currency' => 'TRY',
            'status' => 'Processing'
        ]);
        
    } catch (Exception $e) {
        $db->rollback();
        error_log("Use key error: " . $e->getMessage());
        sendErrorResponse('Sipariş oluşturulamadı', 500);
    }
}

function processOrderAsync($orderDbId, $service, $quantity, $targetUrl, $orderId) {
    try {
        // Prepare API request
        $postData = [
            'key' => $service['api_key'],
            'action' => 'add',
            'service' => $service['service_id'],
            'link' => $targetUrl,
            'quantity' => $quantity
        ];
        
        // Make API request
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $service['api_url'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => API_TIMEOUT,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($postData),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/x-www-form-urlencoded'
            ]
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $db = getDB();
        
        if ($httpCode === 200 && $response) {
            $responseData = json_decode($response, true);
            
            if (isset($responseData['order'])) {
                // Success - update order with API order ID
                $db->update('orders', [
                    'api_order_id' => $responseData['order'],
                    'status' => 'Pending',
                    'charge' => $responseData['charge'] ?? $service['rate'] * $quantity
                ], 'id = ?', [$orderDbId]);
                
                // Start status checking
                checkOrderStatusAsync($orderDbId, $responseData['order']);
                
            } else {
                // API error
                $errorMessage = $responseData['error'] ?? 'API request failed';
                $db->update('orders', [
                    'status' => 'Canceled'
                ], 'id = ?', [$orderDbId]);
                
                logActivity('order_failed', 'Order API request failed', [
                    'order_id' => $orderId,
                    'error' => $errorMessage
                ]);
            }
        } else {
            // Connection error
            $db->update('orders', [
                'status' => 'Canceled'
            ], 'id = ?', [$orderDbId]);
            
            logActivity('order_failed', 'Order API connection failed', [
                'order_id' => $orderId,
                'http_code' => $httpCode
            ]);
        }
        
    } catch (Exception $e) {
        error_log("Process order async error: " . $e->getMessage());
        
        try {
            $db = getDB();
            $db->update('orders', [
                'status' => 'Canceled'
            ], 'id = ?', [$orderDbId]);
        } catch (Exception $dbError) {
            error_log("Failed to update failed order: " . $dbError->getMessage());
        }
    }
}

function checkOrderStatusAsync($orderDbId, $apiOrderId) {
    try {
        $db = getDB();
        $order = $db->fetchOne(
            "SELECT o.*, s.service_id, a.api_url, a.api_key 
             FROM orders o 
             JOIN services s ON o.service_id = s.id 
             JOIN api_settings a ON s.api_settings_id = a.id 
             WHERE o.id = ?",
            [$orderDbId]
        );
        
        if (!$order || $order['status'] === 'Completed' || $order['status'] === 'Canceled') {
            return; // Stop checking if order is final
        }
        
        // Check status via API
        $postData = [
            'key' => $order['api_key'],
            'action' => 'status',
            'order' => $apiOrderId
        ];
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $order['api_url'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => API_TIMEOUT,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($postData)
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 && $response) {
            $statusData = json_decode($response, true);
            
            if (isset($statusData['status'])) {
                $newStatus = $statusData['status'];
                $startCount = $statusData['start_count'] ?? null;
                $remains = $statusData['remains'] ?? null;
                
                // Update order status
                $updateData = [
                    'status' => $newStatus,
                    'last_checked' => date('Y-m-d H:i:s')
                ];
                
                if ($startCount !== null) {
                    $updateData['start_count'] = $startCount;
                }
                
                if ($remains !== null) {
                    $updateData['remains'] = $remains;
                }
                
                $db->update('orders', $updateData, 'id = ?', [$orderDbId]);
                
                // Continue checking if not completed
                if (!in_array($newStatus, ['Completed', 'Canceled', 'Partial'])) {
                    // Schedule next check (in a real implementation, you'd use a queue system)
                    // For now, we'll just log that it needs checking
                    logActivity('order_status_check', 'Order status checked', [
                        'order_id' => $order['order_id'],
                        'status' => $newStatus,
                        'needs_recheck' => true
                    ]);
                }
            }
        }
        
    } catch (Exception $e) {
        error_log("Check order status error: " . $e->getMessage());
    }
}

function exportKeys($category) {
    requireAdmin();
    
    try {
        $db = getDB();
        
        $whereClause = $category === 'all' ? '' : 'WHERE category = ?';
        $params = $category === 'all' ? [] : [$category];
        
        $keys = $db->fetchAll(
            "SELECT key_value FROM keys {$whereClause} ORDER BY created_at DESC",
            $params
        );
        
        if (empty($keys)) {
            sendErrorResponse('Bu kategoride key bulunamadı', 404);
        }
        
        $keyList = implode("\n", array_column($keys, 'key_value'));
        $filename = $category === 'all' ? 'All_keys.txt' : $category . '_keys.txt';
        
        header('Content-Type: text/plain; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($keyList));
        
        echo $keyList;
        
        logActivity('keys_exported', 'Keys exported', [
            'category' => $category,
            'count' => count($keys)
        ]);
        
    } catch (Exception $e) {
        error_log("Export keys error: " . $e->getMessage());
        sendErrorResponse('Key export sırasında hata oluştu', 500);
    }
}
?>