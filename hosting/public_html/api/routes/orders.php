<?php
// KeyPanel Orders Routes - cPanel Hosting Uyumlu
// Türkçe: Sipariş yönetim işlemleri

switch ($method) {
    case 'GET':
        if (count($path_parts) > 1) {
            switch ($path_parts[1]) {
                case 'search':
                    if (count($path_parts) > 2) {
                        searchOrder($path_parts[2]);
                    } else {
                        errorResponse('Sipariş ID belirtilmedi');
                    }
                    break;
                default:
                    requireAdmin();
                    getAllOrders();
            }
        } else {
            requireAdmin();
            getAllOrders();
        }
        break;
        
    case 'PUT':
        requireAdmin();
        if (count($path_parts) > 2) {
            updateOrderStatus($path_parts[2], $input);
        } else {
            errorResponse('Sipariş ID belirtilmedi');
        }
        break;
        
    default:
        errorResponse('Desteklenmeyen HTTP method', 405);
}

function searchOrder($orderId) {
    $orderId = sanitizeInput($orderId);
    
    try {
        $db = getDB();
        
        // Sipariş bilgilerini al
        $sql = "SELECT o.*, k.value as key_value, k.category as key_category, 
                       s.name as service_name, s.description as service_description
                FROM orders o 
                LEFT JOIN keys k ON o.key_id = k.id 
                LEFT JOIN services s ON o.service_id = s.id 
                WHERE o.order_id = ?";
        
        $order = $db->fetchOne($sql, [$orderId]);
        
        if (!$order) {
            errorResponse('Sipariş bulunamadı', 404);
        }
        
        // Durum açıklamaları
        $statusDescriptions = [
            'pending' => 'Beklemede',
            'processing' => 'İşleniyor',
            'completed' => 'Tamamlandı',
            'partial' => 'Kısmi Tamamlandı',
            'cancelled' => 'İptal Edildi',
            'error' => 'Hata Oluştu'
        ];
        
        // Response hazırla
        $response = [
            'order' => [
                'id' => $order['id'],
                'order_id' => $order['order_id'],
                'status' => $order['status'],
                'status_description' => $statusDescriptions[$order['status']] ?? $order['status'],
                'quantity' => $order['quantity'],
                'target_url' => $order['target_url'],
                'created_at' => formatDate($order['created_at']),
                'completed_at' => $order['completed_at'] ? formatDate($order['completed_at']) : null,
                'key_info' => [
                    'value' => $order['key_value'],
                    'category' => $order['key_category']
                ],
                'service_info' => [
                    'name' => $order['service_name'],
                    'description' => $order['service_description']
                ],
                'external_order_id' => $order['external_order_id'],
                'api_response' => $order['api_response']
            ]
        ];
        
        // Eğer external order ID varsa, API'den güncel durum al
        if ($order['external_order_id']) {
            $apiStatus = checkExternalOrderStatus($order['external_order_id'], $order['service_id']);
            if ($apiStatus) {
                $response['order']['external_status'] = $apiStatus;
                $response['order']['last_api_check'] = date('d.m.Y H:i:s');
            }
        }
        
        successResponse($response);
        
    } catch (Exception $e) {
        errorResponse('Sipariş sorgulama hatası: ' . $e->getMessage(), 500);
    }
}

function getAllOrders() {
    try {
        $db = getDB();
        
        $orders = $db->fetchAll("
            SELECT o.*, k.value as key_value, s.name as service_name 
            FROM orders o 
            LEFT JOIN keys k ON o.key_id = k.id 
            LEFT JOIN services s ON o.service_id = s.id 
            ORDER BY o.created_at DESC 
            LIMIT 100
        ");
        
        successResponse($orders);
        
    } catch (Exception $e) {
        errorResponse('Siparişler alınırken hata: ' . $e->getMessage(), 500);
    }
}

function updateOrderStatus($orderId, $data) {
    validateRequired($data, ['status']);
    
    $status = sanitizeInput($data['status']);
    $apiResponse = $data['api_response'] ?? null;
    $externalOrderId = sanitizeInput($data['external_order_id'] ?? '');
    
    try {
        $db = getDB();
        
        $order = $db->fetchOne("SELECT * FROM orders WHERE id = ?", [$orderId]);
        if (!$order) {
            errorResponse('Sipariş bulunamadı');
        }
        
        $updateFields = ['status = ?'];
        $updateValues = [$status];
        
        if ($apiResponse) {
            $updateFields[] = 'api_response = ?';
            $updateValues[] = json_encode($apiResponse);
        }
        
        if ($externalOrderId) {
            $updateFields[] = 'external_order_id = ?';
            $updateValues[] = $externalOrderId;
        }
        
        if (in_array($status, ['completed', 'partial', 'cancelled'])) {
            $updateFields[] = 'completed_at = NOW()';
        }
        
        $updateValues[] = $orderId;
        
        $sql = "UPDATE orders SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $db->execute($sql, $updateValues);
        
        logActivity($_SESSION['admin_id'], 'update_order', "Sipariş durumu güncellendi: {$order['order_id']} -> {$status}");
        
        successResponse(['message' => 'Sipariş durumu güncellendi']);
        
    } catch (Exception $e) {
        errorResponse('Sipariş güncelleme hatası: ' . $e->getMessage(), 500);
    }
}

function checkExternalOrderStatus($externalOrderId, $serviceId) {
    try {
        $db = getDB();
        
        // Service'e bağlı API ayarlarını al
        $apiSettings = $db->fetchOne("
            SELECT api.* FROM api_settings api 
            JOIN services s ON api.id = s.api_settings_id 
            WHERE s.id = ? AND api.is_active = 1
        ", [$serviceId]);
        
        if (!$apiSettings) {
            return null;
        }
        
        // API'ye status kontrolü yap (basit HTTP request)
        $url = $apiSettings['api_url'];
        $apiKey = $apiSettings['api_key'];
        
        $postData = [
            'key' => $apiKey,
            'action' => 'status',
            'order' => $externalOrderId
        ];
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/x-www-form-urlencoded',
                'content' => http_build_query($postData),
                'timeout' => 10
            ]
        ]);
        
        $response = @file_get_contents($url, false, $context);
        
        if ($response) {
            $data = json_decode($response, true);
            if ($data && isset($data['status'])) {
                return [
                    'status' => $data['status'],
                    'charge' => $data['charge'] ?? null,
                    'start_count' => $data['start_count'] ?? null,
                    'remains' => $data['remains'] ?? null
                ];
            }
        }
        
        return null;
        
    } catch (Exception $e) {
        error_log('External order status check error: ' . $e->getMessage());
        return null;
    }
}
?>