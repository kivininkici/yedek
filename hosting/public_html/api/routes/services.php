<?php
// KeyPanel Services Routes - cPanel Hosting Uyumlu
// Türkçe: Servis yönetim işlemleri

switch ($method) {
    case 'GET':
        if (count($path_parts) > 1 && $path_parts[1] === 'active') {
            getActiveServices();
        } else {
            requireAdmin();
            getAllServices();
        }
        break;
        
    case 'POST':
        requireAdmin();
        if (count($path_parts) > 1) {
            switch ($path_parts[1]) {
                case 'import':
                    handleImportServices($input);
                    break;
                default:
                    handleCreateService($input);
            }
        } else {
            handleCreateService($input);
        }
        break;
        
    case 'PUT':
        requireAdmin();
        if (count($path_parts) > 1) {
            updateService($path_parts[1], $input);
        } else {
            errorResponse('Servis ID belirtilmedi');
        }
        break;
        
    case 'DELETE':
        requireAdmin();
        if (count($path_parts) > 1) {
            deleteService($path_parts[1]);
        } else {
            errorResponse('Servis ID belirtilmedi');
        }
        break;
        
    default:
        errorResponse('Desteklenmeyen HTTP method', 405);
}

function getActiveServices() {
    try {
        $db = getDB();
        
        $services = $db->fetchAll("
            SELECT s.*, api.name as api_name 
            FROM services s 
            LEFT JOIN api_settings api ON s.api_settings_id = api.id 
            WHERE s.is_active = 1 
            ORDER BY s.name ASC
        ");
        
        successResponse($services);
        
    } catch (Exception $e) {
        errorResponse('Aktif servisler alınırken hata: ' . $e->getMessage(), 500);
    }
}

function getAllServices() {
    try {
        $db = getDB();
        
        $services = $db->fetchAll("
            SELECT s.*, api.name as api_name 
            FROM services s 
            LEFT JOIN api_settings api ON s.api_settings_id = api.id 
            ORDER BY s.created_at DESC
        ");
        
        successResponse($services);
        
    } catch (Exception $e) {
        errorResponse('Servisler alınırken hata: ' . $e->getMessage(), 500);
    }
}

function handleCreateService($data) {
    validateRequired($data, ['name', 'serviceId', 'price', 'apiSettingsId']);
    
    $name = sanitizeInput($data['name']);
    $serviceId = sanitizeInput($data['serviceId']);
    $price = (float)$data['price'];
    $apiSettingsId = (int)$data['apiSettingsId'];
    $description = sanitizeInput($data['description'] ?? '');
    $category = sanitizeInput($data['category'] ?? 'general');
    $minQuantity = (int)($data['minQuantity'] ?? 1);
    $maxQuantity = (int)($data['maxQuantity'] ?? 10000);
    
    try {
        $db = getDB();
        
        // API settings kontrolü
        $apiSettings = $db->fetchOne("SELECT * FROM api_settings WHERE id = ?", [$apiSettingsId]);
        if (!$apiSettings) {
            errorResponse('Seçilen API ayarları bulunamadı');
        }
        
        // Duplicate service ID kontrolü
        $existingService = $db->fetchOne("SELECT id FROM services WHERE service_id = ? AND api_settings_id = ?", [$serviceId, $apiSettingsId]);
        if ($existingService) {
            errorResponse('Bu servis ID zaten mevcut');
        }
        
        $sql = "INSERT INTO services (name, service_id, description, price, category, min_quantity, max_quantity, api_settings_id, is_active, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
        $db->execute($sql, [$name, $serviceId, $description, $price, $category, $minQuantity, $maxQuantity, $apiSettingsId]);
        
        $newServiceId = $db->lastInsertId();
        
        logActivity($_SESSION['admin_id'], 'create_service', "Servis oluşturuldu: {$name}");
        
        successResponse([
            'id' => $newServiceId,
            'message' => 'Servis başarıyla oluşturuldu'
        ]);
        
    } catch (Exception $e) {
        errorResponse('Servis oluşturulurken hata: ' . $e->getMessage(), 500);
    }
}

function handleImportServices($data) {
    validateRequired($data, ['apiSettingsId']);
    
    $apiSettingsId = (int)$data['apiSettingsId'];
    
    try {
        $db = getDB();
        
        // API settings al
        $apiSettings = $db->fetchOne("SELECT * FROM api_settings WHERE id = ?", [$apiSettingsId]);
        if (!$apiSettings) {
            errorResponse('API ayarları bulunamadı');
        }
        
        // API'den servisleri çek
        $services = fetchServicesFromAPI($apiSettings);
        
        if (empty($services)) {
            errorResponse('API\'den servis alınamadı');
        }
        
        $imported = 0;
        $skipped = 0;
        
        foreach ($services as $service) {
            // Mevcut servis kontrolü
            $existing = $db->fetchOne("SELECT id FROM services WHERE service_id = ? AND api_settings_id = ?", [$service['service'], $apiSettingsId]);
            
            if ($existing) {
                $skipped++;
                continue;
            }
            
            // Kategori tespiti
            $category = detectServiceCategory($service['name']);
            
            $sql = "INSERT INTO services (name, service_id, description, price, category, min_quantity, max_quantity, api_settings_id, is_active, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
            
            $db->execute($sql, [
                $service['name'],
                $service['service'],
                $service['name'], // description olarak name kullan
                (float)$service['rate'],
                $category,
                (int)$service['min'],
                (int)$service['max'],
                $apiSettingsId
            ]);
            
            $imported++;
        }
        
        logActivity($_SESSION['admin_id'], 'import_services', "API\'den {$imported} servis import edildi");
        
        successResponse([
            'imported' => $imported,
            'skipped' => $skipped,
            'message' => "{$imported} servis başarıyla import edildi"
        ]);
        
    } catch (Exception $e) {
        errorResponse('Servis import hatası: ' . $e->getMessage(), 500);
    }
}

function fetchServicesFromAPI($apiSettings) {
    try {
        $url = $apiSettings['api_url'];
        $apiKey = $apiSettings['api_key'];
        
        $postData = [
            'key' => $apiKey,
            'action' => 'services'
        ];
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/x-www-form-urlencoded',
                'content' => http_build_query($postData),
                'timeout' => 30
            ]
        ]);
        
        $response = @file_get_contents($url, false, $context);
        
        if (!$response) {
            throw new Exception('API\'den yanıt alınamadı');
        }
        
        $data = json_decode($response, true);
        
        if (!$data || !is_array($data)) {
            throw new Exception('API yanıtı geçersiz format');
        }
        
        // Array formatını kontrol et ve düzelt
        if (isset($data[0]) && is_array($data[0])) {
            return $data; // Zaten doğru format
        } else {
            // Object formatından array formatına çevir
            $services = [];
            foreach ($data as $key => $service) {
                if (is_array($service) && isset($service['name'])) {
                    $services[] = $service;
                }
            }
            return $services;
        }
        
    } catch (Exception $e) {
        throw new Exception('API servis çekme hatası: ' . $e->getMessage());
    }
}

function detectServiceCategory($serviceName) {
    $serviceName = strtolower($serviceName);
    
    if (strpos($serviceName, 'instagram') !== false || strpos($serviceName, 'insta') !== false) {
        return 'Instagram';
    } elseif (strpos($serviceName, 'youtube') !== false || strpos($serviceName, 'yt') !== false) {
        return 'YouTube';
    } elseif (strpos($serviceName, 'twitter') !== false || strpos($serviceName, 'x.com') !== false) {
        return 'Twitter';
    } elseif (strpos($serviceName, 'facebook') !== false || strpos($serviceName, 'fb') !== false) {
        return 'Facebook';
    } elseif (strpos($serviceName, 'tiktok') !== false || strpos($serviceName, 'tt') !== false) {
        return 'TikTok';
    } elseif (strpos($serviceName, 'telegram') !== false) {
        return 'Telegram';
    } elseif (strpos($serviceName, 'spotify') !== false) {
        return 'Spotify';
    } elseif (strpos($serviceName, 'twitch') !== false) {
        return 'Twitch';
    } else {
        return 'Genel';
    }
}

function updateService($serviceId, $data) {
    try {
        $db = getDB();
        
        $service = $db->fetchOne("SELECT * FROM services WHERE id = ?", [$serviceId]);
        if (!$service) {
            errorResponse('Servis bulunamadı');
        }
        
        $updateFields = [];
        $updateValues = [];
        
        if (isset($data['name'])) {
            $updateFields[] = 'name = ?';
            $updateValues[] = sanitizeInput($data['name']);
        }
        
        if (isset($data['description'])) {
            $updateFields[] = 'description = ?';
            $updateValues[] = sanitizeInput($data['description']);
        }
        
        if (isset($data['price'])) {
            $updateFields[] = 'price = ?';
            $updateValues[] = (float)$data['price'];
        }
        
        if (isset($data['is_active'])) {
            $updateFields[] = 'is_active = ?';
            $updateValues[] = (int)$data['is_active'];
        }
        
        if (isset($data['category'])) {
            $updateFields[] = 'category = ?';
            $updateValues[] = sanitizeInput($data['category']);
        }
        
        if (empty($updateFields)) {
            errorResponse('Güncellenecek veri belirtilmedi');
        }
        
        $updateValues[] = $serviceId;
        $sql = "UPDATE services SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $db->execute($sql, $updateValues);
        
        logActivity($_SESSION['admin_id'], 'update_service', "Servis güncellendi: {$service['name']}");
        
        successResponse(['message' => 'Servis başarıyla güncellendi']);
        
    } catch (Exception $e) {
        errorResponse('Servis güncelleme hatası: ' . $e->getMessage(), 500);
    }
}

function deleteService($serviceId) {
    try {
        $db = getDB();
        
        $service = $db->fetchOne("SELECT * FROM services WHERE id = ?", [$serviceId]);
        if (!$service) {
            errorResponse('Servis bulunamadı');
        }
        
        // Bu servise bağlı key'ler var mı kontrol et
        $keyCount = $db->fetchOne("SELECT COUNT(*) as count FROM keys WHERE service_id = ?", [$serviceId])['count'];
        
        if ($keyCount > 0) {
            errorResponse('Bu servise bağlı key\'ler bulunuyor. Önce key\'leri silin.');
        }
        
        $db->execute("DELETE FROM services WHERE id = ?", [$serviceId]);
        
        logActivity($_SESSION['admin_id'], 'delete_service', "Servis silindi: {$service['name']}");
        
        successResponse(['message' => 'Servis başarıyla silindi']);
        
    } catch (Exception $e) {
        errorResponse('Servis silme hatası: ' . $e->getMessage(), 500);
    }
}
?>