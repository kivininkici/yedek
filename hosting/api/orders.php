<?php
/**
 * Orders API Endpoints
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
        case 'GET':
            handleGet($path);
            break;
        case 'POST':
            handlePost($path);
            break;
        default:
            sendErrorResponse('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Orders API Error: " . $e->getMessage());
    sendErrorResponse('Internal server error', 500);
}

function handleGet($path) {
    $pathParts = explode('/', $path);
    
    switch ($pathParts[0]) {
        case 'search':
            if (isset($pathParts[1])) {
                searchOrder($pathParts[1]);
            } else {
                sendErrorResponse('Sipariş ID gerekli', 400);
            }
            break;
        default:
            sendErrorResponse('Endpoint not found', 404);
    }
}

function handlePost($path) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($path) {
        case 'feedback':
            submitFeedback($input);
            break;
        case 'complaint':
            submitComplaint($input);
            break;
        default:
            sendErrorResponse('Endpoint not found', 404);
    }
}

function searchOrder($orderId) {
    $orderId = sanitizeInput($orderId);
    
    if (empty($orderId)) {
        sendErrorResponse('Geçersiz sipariş ID', 400);
    }
    
    try {
        $db = getDB();
        
        // Get order with related data
        $order = $db->fetchOne(
            "SELECT o.*, 
                    s.name as service_name, 
                    s.category as service_category,
                    s.rate as service_rate,
                    k.key_value, 
                    k.category as key_category,
                    a.name as api_name
             FROM orders o 
             LEFT JOIN services s ON o.service_id = s.id 
             LEFT JOIN keys k ON o.key_id = k.id 
             LEFT JOIN api_settings a ON o.api_settings_id = a.id 
             WHERE o.order_id = ?",
            [$orderId]
        );
        
        if (!$order) {
            sendErrorResponse('Sipariş bulunamadı', 404);
        }
        
        // Check if order status needs updating
        if (!in_array($order['status'], ['Completed', 'Canceled', 'Partial']) && 
            $order['api_order_id']) {
            updateOrderStatus($order);
            
            // Re-fetch updated order
            $order = $db->fetchOne(
                "SELECT o.*, 
                        s.name as service_name, 
                        s.category as service_category,
                        s.rate as service_rate,
                        k.key_value, 
                        k.category as key_category,
                        a.name as api_name
                 FROM orders o 
                 LEFT JOIN services s ON o.service_id = s.id 
                 LEFT JOIN keys k ON o.key_id = k.id 
                 LEFT JOIN api_settings a ON o.api_settings_id = a.id 
                 WHERE o.order_id = ?",
                [$orderId]
            );
        }
        
        // Format the response
        $response = [
            'order' => [
                'id' => $order['order_id'],
                'apiOrderId' => $order['api_order_id'],
                'status' => $order['status'],
                'service' => [
                    'name' => $order['service_name'],
                    'category' => $order['service_category']
                ],
                'quantity' => $order['quantity'],
                'targetUrl' => $order['target_url'],
                'charge' => floatval($order['charge']),
                'currency' => $order['currency'],
                'startCount' => $order['start_count'],
                'remains' => $order['remains'],
                'createdAt' => $order['created_at'],
                'lastChecked' => $order['last_checked'],
                'key' => [
                    'category' => $order['key_category'],
                    'value' => substr($order['key_value'], 0, 8) . '...' // Masked for security
                ],
                'api' => $order['api_name']
            ]
        ];
        
        // Add status-specific information
        switch ($order['status']) {
            case 'Completed':
                $response['order']['message'] = 'Siparişiniz başarıyla tamamlandı';
                $response['order']['canGiveFeedback'] = true;
                break;
            case 'Partial':
                $response['order']['message'] = 'Siparişiniz kısmen tamamlandı';
                $response['order']['canComplain'] = true;
                break;
            case 'Canceled':
                $response['order']['message'] = 'Siparişiniz iptal edildi';
                $response['order']['canComplain'] = true;
                break;
            case 'In progress':
                $response['order']['message'] = 'Siparişiniz işleniyor';
                break;
            case 'Pending':
                $response['order']['message'] = 'Siparişiniz beklemede';
                break;
            default:
                $response['order']['message'] = 'Siparişiniz işleme alındı';
        }
        
        // Check for auto-refresh
        $needsRefresh = !in_array($order['status'], ['Completed', 'Canceled', 'Partial']);
        $response['autoRefresh'] = $needsRefresh;
        $response['refreshInterval'] = 10; // seconds
        
        logActivity('order_searched', 'Order searched', ['order_id' => $orderId]);
        
        sendSuccessResponse('Sipariş bulundu', $response);
        
    } catch (Exception $e) {
        error_log("Search order error: " . $e->getMessage());
        sendErrorResponse('Sipariş arama sırasında hata oluştu', 500);
    }
}

function updateOrderStatus($order) {
    if (!$order['api_order_id']) {
        return;
    }
    
    try {
        // Check if we've checked recently (cache for 15 seconds)
        $lastCheck = strtotime($order['last_checked']);
        if (time() - $lastCheck < API_CACHE_DURATION) {
            return; // Too soon to check again
        }
        
        $db = getDB();
        
        // Get API settings
        $apiSettings = $db->fetchOne(
            "SELECT api_url, api_key FROM api_settings WHERE id = ?",
            [$order['api_settings_id']]
        );
        
        if (!$apiSettings) {
            return;
        }
        
        // Make API request to check status
        $postData = [
            'key' => $apiSettings['api_key'],
            'action' => 'status',
            'order' => $order['api_order_id']
        ];
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $apiSettings['api_url'],
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
        
        if ($httpCode === 200 && $response) {
            $statusData = json_decode($response, true);
            
            if (isset($statusData['status'])) {
                $updateData = [
                    'status' => $statusData['status'],
                    'last_checked' => date('Y-m-d H:i:s')
                ];
                
                if (isset($statusData['start_count'])) {
                    $updateData['start_count'] = $statusData['start_count'];
                }
                
                if (isset($statusData['remains'])) {
                    $updateData['remains'] = $statusData['remains'];
                }
                
                if (isset($statusData['charge'])) {
                    $updateData['charge'] = $statusData['charge'];
                }
                
                $db->update('orders', $updateData, 'id = ?', [$order['id']]);
                
                logActivity('order_status_updated', 'Order status updated from API', [
                    'order_id' => $order['order_id'],
                    'old_status' => $order['status'],
                    'new_status' => $statusData['status']
                ]);
            }
        } else {
            // Just update last_checked even if API call failed
            $db->update('orders', [
                'last_checked' => date('Y-m-d H:i:s')
            ], 'id = ?', [$order['id']]);
        }
        
    } catch (Exception $e) {
        error_log("Update order status error: " . $e->getMessage());
        
        // Update last_checked even on error
        try {
            $db = getDB();
            $db->update('orders', [
                'last_checked' => date('Y-m-d H:i:s')
            ], 'id = ?', [$order['id']]);
        } catch (Exception $dbError) {
            error_log("Failed to update last_checked: " . $dbError->getMessage());
        }
    }
}

function submitFeedback($input) {
    $orderId = sanitizeInput($input['orderId'] ?? '');
    $rating = intval($input['rating'] ?? 0);
    $message = sanitizeInput($input['message'] ?? '');
    $email = sanitizeInput($input['email'] ?? '');
    
    if (empty($orderId) || $rating < 1 || $rating > 5) {
        sendErrorResponse('Geçersiz geri bildirim verileri', 400);
    }
    
    if (!empty($email) && !validateEmail($email)) {
        sendErrorResponse('Geçerli bir e-posta adresi girin', 400);
    }
    
    try {
        $db = getDB();
        
        // Check if order exists
        $order = $db->fetchOne("SELECT id FROM orders WHERE order_id = ?", [$orderId]);
        
        if (!$order) {
            sendErrorResponse('Sipariş bulunamadı', 404);
        }
        
        // Check if feedback already exists
        $existingFeedback = $db->fetchOne(
            "SELECT id FROM feedback WHERE order_id = ?",
            [$orderId]
        );
        
        if ($existingFeedback) {
            sendErrorResponse('Bu sipariş için zaten geri bildirim verilmiş', 409);
        }
        
        // Insert feedback
        $feedbackId = $db->insert('feedback', [
            'order_id' => $orderId,
            'rating' => $rating,
            'message' => $message,
            'email' => $email,
            'ip_address' => $_SERVER['REMOTE_ADDR']
        ]);
        
        logActivity('feedback_submitted', 'Feedback submitted', [
            'order_id' => $orderId,
            'rating' => $rating,
            'feedback_id' => $feedbackId
        ]);
        
        // If rating is low (1-2), redirect to complaint
        if ($rating <= 2) {
            sendSuccessResponse('Geri bildiriminiz alındı. Sorunları çözmek için şikayet formumuzu da kullanabilirsiniz.', [
                'redirectToComplaint' => true,
                'orderId' => $orderId
            ]);
        } else {
            sendSuccessResponse('Geri bildiriminiz için teşekkürler!');
        }
        
    } catch (Exception $e) {
        error_log("Submit feedback error: " . $e->getMessage());
        sendErrorResponse('Geri bildirim gönderilirken hata oluştu', 500);
    }
}

function submitComplaint($input) {
    $orderId = sanitizeInput($input['orderId'] ?? '');
    $issueType = sanitizeInput($input['issueType'] ?? '');
    $description = sanitizeInput($input['description'] ?? '');
    $email = sanitizeInput($input['email'] ?? '');
    
    if (empty($orderId) || empty($issueType) || empty($description)) {
        sendErrorResponse('Tüm alanlar gerekli', 400);
    }
    
    if (!empty($email) && !validateEmail($email)) {
        sendErrorResponse('Geçerli bir e-posta adresi girin', 400);
    }
    
    try {
        $db = getDB();
        
        // Check if order exists
        $order = $db->fetchOne("SELECT id FROM orders WHERE order_id = ?", [$orderId]);
        
        if (!$order) {
            sendErrorResponse('Sipariş bulunamadı', 404);
        }
        
        // Insert complaint
        $complaintId = $db->insert('complaints', [
            'order_id' => $orderId,
            'issue_type' => $issueType,
            'description' => $description,
            'email' => $email,
            'ip_address' => $_SERVER['REMOTE_ADDR']
        ]);
        
        logActivity('complaint_submitted', 'Complaint submitted', [
            'order_id' => $orderId,
            'issue_type' => $issueType,
            'complaint_id' => $complaintId
        ]);
        
        sendSuccessResponse('Şikayetiniz alındı. En kısa sürede size dönüş yapılacaktır.');
        
    } catch (Exception $e) {
        error_log("Submit complaint error: " . $e->getMessage());
        sendErrorResponse('Şikayet gönderilirken hata oluştu', 500);
    }
}
?>