<?php
// KeyPanel Feedback Routes - cPanel Hosting Uyumlu
// Türkçe: Geri bildirim gönderme sistemi

switch ($method) {
    case 'POST':
        if (count($path_parts) > 1 && $path_parts[1] === 'send') {
            handleSendFeedback($input);
        } else {
            errorResponse('Geçersiz feedback endpoint', 404);
        }
        break;
        
    default:
        errorResponse('Desteklenmeyen HTTP method', 405);
}

function handleSendFeedback($data) {
    validateRequired($data, ['firstName', 'lastName', 'email', 'message']);
    
    $firstName = sanitizeInput($data['firstName']);
    $lastName = sanitizeInput($data['lastName']);
    $email = sanitizeInput($data['email']);
    $message = sanitizeInput($data['message']);
    
    // Email validation
    if (!validateEmail($email)) {
        errorResponse('Geçerli bir email adresi girin');
    }
    
    // Message length validation
    if (strlen($message) < 10) {
        errorResponse('Mesaj en az 10 karakter olmalı');
    }
    
    if (strlen($message) > 1000) {
        errorResponse('Mesaj en fazla 1000 karakter olabilir');
    }
    
    try {
        // Database'e kaydet
        $db = getDB();
        $sql = "INSERT INTO feedback (first_name, last_name, email, message, ip_address, user_agent, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())";
        
        $ipAddress = getClientIP();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        $db->execute($sql, [$firstName, $lastName, $email, $message, $ipAddress, $userAgent]);
        
        $feedbackId = $db->lastInsertId();
        
        // Email gönder
        $emailSent = sendFeedbackEmail($firstName, $lastName, $email, $message, $feedbackId);
        
        // Response
        if ($emailSent) {
            successResponse([
                'id' => $feedbackId,
                'email_sent' => true
            ], 'Mesajınız başarıyla gönderildi! En kısa sürede dönüş yapacağız.');
        } else {
            successResponse([
                'id' => $feedbackId,
                'email_sent' => false
            ], 'Mesajınız kaydedildi ancak email gönderilemedi. En kısa sürede dönüş yapacağız.');
        }
        
        // Log activity
        logActivity($feedbackId, 'feedback_sent', "Geri bildirim gönderildi: {$firstName} {$lastName} ({$email})");
        
    } catch (Exception $e) {
        errorResponse('Mesaj gönderilirken hata oluştu: ' . $e->getMessage(), 500);
    }
}

function sendFeedbackEmail($firstName, $lastName, $email, $message, $feedbackId) {
    try {
        // Email ayarları - Bu değerleri hosting'inizde mail() fonksiyonu için ayarlayın
        $toEmail = "admin@yourdomain.com"; // BU DEĞERİ DEĞİŞTİRİN!
        $fromEmail = "noreply@yourdomain.com"; // BU DEĞERİ DEĞİŞTİRİN!
        $subject = "KeyPanel - Yeni Geri Bildirim (#$feedbackId)";
        
        // Email content
        $emailContent = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>KeyPanel - Yeni Geri Bildirim</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { background: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .label { font-weight: bold; color: #666; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔑 KeyPanel</h1>
            <h2>Yeni Geri Bildirim</h2>
        </div>
        
        <div class='content'>
            <div class='info-box'>
                <p><span class='label'>Geri Bildirim ID:</span> #$feedbackId</p>
                <p><span class='label'>Tarih:</span> " . date('d.m.Y H:i:s') . "</p>
            </div>
            
            <div class='info-box'>
                <h3>👤 Gönderen Bilgileri</h3>
                <p><span class='label'>Ad Soyad:</span> $firstName $lastName</p>
                <p><span class='label'>E-posta:</span> <a href='mailto:$email'>$email</a></p>
                <p><span class='label'>IP Adresi:</span> " . getClientIP() . "</p>
            </div>
            
            <div class='info-box'>
                <h3>💬 Mesaj</h3>
                <div style='background: white; padding: 15px; border-left: 4px solid #3b82f6;'>
                    " . nl2br(htmlspecialchars($message)) . "
                </div>
            </div>
        </div>
        
        <div class='footer'>
            <p>Bu email KeyPanel geri bildirim sistemi tarafından otomatik olarak gönderilmiştir.</p>
            <p>Yanıtlamak için doğrudan $email adresine email gönderebilirsiniz.</p>
        </div>
    </div>
</body>
</html>";

        // Email headers
        $headers = array(
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: KeyPanel <' . $fromEmail . '>',
            'Reply-To: ' . $email,
            'X-Mailer: PHP/' . phpversion()
        );
        
        // Email gönder
        $mailSent = mail($toEmail, $subject, $emailContent, implode("\r\n", $headers));
        
        return $mailSent;
        
    } catch (Exception $e) {
        error_log('Feedback email error: ' . $e->getMessage());
        return false;
    }
}
?>