<?php
// KeyPanel Keys Routes - cPanel Hosting Uyumlu
// Türkçe: Key yönetim işlemleri

switch ($method) {
    case 'GET':
        if (count($path_parts) > 1) {
            switch ($path_parts[1]) {
                case 'validate':
                    // GET /api/keys/validate?value=key_value
                    $keyValue = $_GET['value'] ?? null;
                    if (!$keyValue) {
                        errorResponse('Key değeri belirtilmedi');
                    }
                    validateKey($keyValue);
                    break;
                default:
                    errorResponse('Geçersiz keys endpoint', 404);
            }
        } else {
            errorResponse('Keys endpoint belirtilmedi', 400);
        }
        break;
        
    case 'POST':
        if (count($path_parts) > 1 && $path_parts[1] === 'use') {
            handleUseKey($input);
        } else {
            errorResponse('Geçersiz keys POST endpoint', 404);
        }
        break;
        
    default:
        errorResponse('Desteklenmeyen HTTP method', 405);
}

function validateKey($keyValue) {
    $keyValue = sanitizeInput($keyValue);
    
    try {
        $db = getDB();
        
        // Key ve service bilgilerini al
        $sql = "SELECT k.*, s.name as service_name, s.is_active as service_active 
                FROM keys k 
                LEFT JOIN services s ON k.service_id = s.id 
                WHERE k.value = ?";
        $key = $db->fetchOne($sql, [$keyValue]);
        
        if (!$key) {
            errorResponse('Key bulunamadı');
        }
        
        // Key kullanım durumu kontrolü
        if ($key['used_quantity'] >= $key['max_quantity']) {
            errorResponse('Bu key\'in kullanım limiti dolmuş');
        }
        
        // Expiry kontrolü
        if ($key['expires_at'] && strtotime($key['expires_at']) < time()) {
            errorResponse('Bu key\'in süresi dolmuş');
        }
        
        // Service aktiflik kontrolü
        if (!$key['service_active']) {
            errorResponse('Bu key\'e bağlı servis aktif değil');
        }
        
        // Kalan kullanım sayısı
        $remainingUses = $key['max_quantity'] - $key['used_quantity'];
        
        successResponse([
            'valid' => true,
            'key' => [
                'id' => $key['id'],
                'value' => $key['value'],
                'category' => $key['category'],
                'service_id' => $key['service_id'],
                'service_name' => $key['service_name'],
                'max_quantity' => $key['max_quantity'],
                'used_quantity' => $key['used_quantity'],
                'remaining_uses' => $remainingUses,
                'description' => $key['description'],
                'expires_at' => $key['expires_at']
            ]
        ], 'Key geçerli ve kullanılabilir');
        
    } catch (Exception $e) {
        errorResponse('Key doğrulama hatası: ' . $e->getMessage(), 500);
    }
}

function handleUseKey($data) {
    validateRequired($data, ['keyValue', 'serviceId', 'quantity']);
    
    $keyValue = sanitizeInput($data['keyValue']);
    $serviceId = (int)$data['serviceId'];
    $quantity = (int)$data['quantity'];
    $targetUrl = sanitizeInput($data['targetUrl'] ?? '');
    
    if ($quantity <= 0) {
        errorResponse('Miktar 0\'dan büyük olmalı');
    }
    
    try {
        $db = getDB();
        
        // Transaction başlat
        $db->getConnection()->beginTransaction();
        
        // Key kontrolü
        $key = $db->fetchOne("SELECT * FROM keys WHERE value = ?", [$keyValue]);
        if (!$key) {
            throw new Exception('Key bulunamadı');
        }
        
        // Kullanım limiti kontrolü
        if (($key['used_quantity'] + $quantity) > $key['max_quantity']) {
            throw new Exception('Key\'in kalan kullanım miktarı yetersiz');
        }
        
        // Service kontrolü
        $service = $db->fetchOne("SELECT * FROM services WHERE id = ? AND is_active = 1", [$serviceId]);
        if (!service) {
            throw new Exception('Seçilen servis bulunamadı veya aktif değil');
        }
        
        // Sipariş oluştur
        $orderId = generateOrderId();
        $orderSql = "INSERT INTO orders (order_id, key_id, service_id, quantity, target_url, status, created_at) 
                     VALUES (?, ?, ?, ?, ?, 'pending', NOW())";
        $db->execute($orderSql, [$orderId, $key['id'], $serviceId, $quantity, $targetUrl]);
        
        $orderDbId = $db->lastInsertId();
        
        // Key kullanım miktarını güncelle
        $updateKeySql = "UPDATE keys SET used_quantity = used_quantity + ? WHERE id = ?";
        $db->execute($updateKeySql, [$quantity, $key['id']]);
        
        // Log oluştur
        logActivity($key['id'], 'key_used', "Key kullanıldı - Sipariş: {$orderId}, Miktar: {$quantity}");
        
        // Transaction commit
        $db->getConnection()->commit();
        
        // Başarılı response
        successResponse([
            'order' => [
                'id' => $orderDbId,
                'order_id' => $orderId,
                'service_name' => $service['name'],
                'quantity' => $quantity,
                'target_url' => $targetUrl,
                'status' => 'pending'
            ]
        ], 'Sipariş başarıyla oluşturuldu');
        
    } catch (Exception $e) {
        // Transaction rollback
        if ($db->getConnection()->inTransaction()) {
            $db->getConnection()->rollBack();
        }
        errorResponse('Key kullanım hatası: ' . $e->getMessage(), 500);
    }
}
?>