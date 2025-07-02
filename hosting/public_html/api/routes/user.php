<?php
// KeyPanel User Routes - cPanel Hosting Uyumlu
// Türkçe: Normal kullanıcı işlemleri

startSession();

switch ($method) {
    case 'GET':
        if (!isset($_SESSION['user_id'])) {
            errorResponse('Giriş yapılmamış', 401);
        }
        getUserProfile();
        break;
        
    default:
        errorResponse('Desteklenmeyen HTTP method', 405);
}

function getUserProfile() {
    try {
        $db = getDB();
        
        $user = $db->fetchOne("SELECT * FROM normal_users WHERE id = ?", [$_SESSION['user_id']]);
        
        if (!$user) {
            errorResponse('Kullanıcı bulunamadı', 404);
        }
        
        successResponse([
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => 'user',
                'created_at' => formatDate($user['created_at'])
            ]
        ]);
        
    } catch (Exception $e) {
        errorResponse('Kullanıcı profili alınırken hata: ' . $e->getMessage(), 500);
    }
}
?>