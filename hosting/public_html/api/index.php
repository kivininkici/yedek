<?php
// KeyPanel API - cPanel Hosting Uyumlu API Gateway
// Türkçe: Bu dosya tüm API isteklerini yönlendirir

error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers - güvenlik için gerekli
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Preflight OPTIONS istekleri için
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database bağlantısı için konfigürasyon
require_once 'config/database.php';
require_once 'includes/functions.php';

// Request path'i al
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = dirname(dirname($_SERVER['SCRIPT_NAME']));
$api_path = str_replace($base_path . '/api', '', $request_uri);
$api_path = ltrim($api_path, '/');

// Query string'i kaldır
if (($pos = strpos($api_path, '?')) !== false) {
    $api_path = substr($api_path, 0, $pos);
}

$method = $_SERVER['REQUEST_METHOD'];
$path_parts = explode('/', $api_path);

// Request body'yi al
$input = json_decode(file_get_contents('php://input'), true);

try {
    // Router sistemi
    switch ($path_parts[0]) {
        case 'user':
            require_once 'routes/user.php';
            break;
            
        case 'admin':
            require_once 'routes/admin.php';
            break;
            
        case 'keys':
            require_once 'routes/keys.php';
            break;
            
        case 'services':
            require_once 'routes/services.php';
            break;
            
        case 'orders':
            require_once 'routes/orders.php';
            break;
            
        case 'auth':
            require_once 'routes/auth.php';
            break;
            
        default:
            http_response_code(404);
            echo json_encode([
                'error' => 'API endpoint bulunamadı',
                'path' => $api_path
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Sunucu hatası',
        'message' => $e->getMessage()
    ]);
}
?>