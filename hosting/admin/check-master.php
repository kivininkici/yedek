<?php
// Master Password Check Script
require_once '../config/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$masterPassword = $input['masterPassword'] ?? '';

if (empty($masterPassword)) {
    echo json_encode(['success' => false, 'message' => 'Master şifre gerekli']);
    exit;
}

// Check master password
if ($masterPassword === MASTER_PASSWORD) {
    $_SESSION['master_verified'] = true;
    $_SESSION['master_verified_time'] = time();
    echo json_encode(['success' => true, 'message' => 'Master şifre doğru']);
} else {
    echo json_encode(['success' => false, 'message' => 'Master şifre yanlış']);
}
?>