<?php
/**
 * KeyPanel Helper Functions
 * cPanel Compatible Version
 */

/**
 * Generate a secure session token
 */
function generateSessionToken() {
    return bin2hex(random_bytes(32));
}

/**
 * Validate session token
 */
function validateSessionToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Format file size
 */
function formatFileSize($bytes) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    
    $bytes /= pow(1024, $pow);
    
    return round($bytes, 2) . ' ' . $units[$pow];
}

/**
 * Time ago format
 */
function timeAgo($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) {
        return 'az önce';
    } elseif ($time < 3600) {
        return floor($time / 60) . ' dakika önce';
    } elseif ($time < 86400) {
        return floor($time / 3600) . ' saat önce';
    } elseif ($time < 2592000) {
        return floor($time / 86400) . ' gün önce';
    } elseif ($time < 31536000) {
        return floor($time / 2592000) . ' ay önce';
    } else {
        return floor($time / 31536000) . ' yıl önce';
    }
}

/**
 * Generate pagination HTML
 */
function generatePagination($currentPage, $totalPages, $baseUrl = '') {
    if ($totalPages <= 1) {
        return '';
    }
    
    $html = '<nav aria-label="Sayfa navigasyonu"><ul class="pagination justify-content-center">';
    
    // Previous button
    if ($currentPage > 1) {
        $html .= '<li class="page-item">';
        $html .= '<a class="page-link" href="' . $baseUrl . '?page=' . ($currentPage - 1) . '">Önceki</a>';
        $html .= '</li>';
    }
    
    // Page numbers
    $start = max(1, $currentPage - 2);
    $end = min($totalPages, $currentPage + 2);
    
    if ($start > 1) {
        $html .= '<li class="page-item"><a class="page-link" href="' . $baseUrl . '?page=1">1</a></li>';
        if ($start > 2) {
            $html .= '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    for ($i = $start; $i <= $end; $i++) {
        $activeClass = $i === $currentPage ? ' active' : '';
        $html .= '<li class="page-item' . $activeClass . '">';
        $html .= '<a class="page-link" href="' . $baseUrl . '?page=' . $i . '">' . $i . '</a>';
        $html .= '</li>';
    }
    
    if ($end < $totalPages) {
        if ($end < $totalPages - 1) {
            $html .= '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        $html .= '<li class="page-item"><a class="page-link" href="' . $baseUrl . '?page=' . $totalPages . '">' . $totalPages . '</a></li>';
    }
    
    // Next button
    if ($currentPage < $totalPages) {
        $html .= '<li class="page-item">';
        $html .= '<a class="page-link" href="' . $baseUrl . '?page=' . ($currentPage + 1) . '">Sonraki</a>';
        $html .= '</li>';
    }
    
    $html .= '</ul></nav>';
    
    return $html;
}

/**
 * Generate breadcrumb HTML
 */
function generateBreadcrumb($items) {
    $html = '<nav aria-label="breadcrumb"><ol class="breadcrumb">';
    
    $count = count($items);
    foreach ($items as $index => $item) {
        $isLast = ($index === $count - 1);
        
        if ($isLast) {
            $html .= '<li class="breadcrumb-item active" aria-current="page">' . htmlspecialchars($item['title']) . '</li>';
        } else {
            $html .= '<li class="breadcrumb-item">';
            if (isset($item['url'])) {
                $html .= '<a href="' . htmlspecialchars($item['url']) . '">' . htmlspecialchars($item['title']) . '</a>';
            } else {
                $html .= htmlspecialchars($item['title']);
            }
            $html .= '</li>';
        }
    }
    
    $html .= '</ol></nav>';
    
    return $html;
}

/**
 * Format Turkish currency
 */
function formatTurkishCurrency($amount) {
    return '₺' . number_format($amount, 2, ',', '.');
}

/**
 * Get status badge HTML
 */
function getStatusBadge($status) {
    $badges = [
        'Pending' => 'bg-warning text-dark',
        'In progress' => 'bg-info text-white',
        'Completed' => 'bg-success text-white',
        'Partial' => 'bg-warning text-dark',
        'Canceled' => 'bg-danger text-white',
        'Processing' => 'bg-primary text-white'
    ];
    
    $statusTexts = [
        'Pending' => 'Beklemede',
        'In progress' => 'İşleniyor',
        'Completed' => 'Tamamlandı',
        'Partial' => 'Kısmen',
        'Canceled' => 'İptal',
        'Processing' => 'İşleme Alındı'
    ];
    
    $class = $badges[$status] ?? 'bg-secondary text-white';
    $text = $statusTexts[$status] ?? $status;
    
    return '<span class="badge ' . $class . '">' . $text . '</span>';
}

/**
 * Get category icon
 */
function getCategoryIcon($category) {
    $icons = [
        'Instagram' => 'fab fa-instagram',
        'YouTube' => 'fab fa-youtube',
        'TikTok' => 'fab fa-tiktok',
        'Twitter' => 'fab fa-twitter',
        'Facebook' => 'fab fa-facebook',
        'LinkedIn' => 'fab fa-linkedin',
        'Telegram' => 'fab fa-telegram',
        'WhatsApp' => 'fab fa-whatsapp',
        'Spotify' => 'fab fa-spotify',
        'SoundCloud' => 'fab fa-soundcloud'
    ];
    
    return $icons[$category] ?? 'fas fa-globe';
}

/**
 * Generate alert HTML
 */
function generateAlert($type, $message, $dismissible = true) {
    $alertClass = 'alert alert-' . $type;
    if ($dismissible) {
        $alertClass .= ' alert-dismissible fade show';
    }
    
    $html = '<div class="' . $alertClass . '" role="alert">';
    $html .= htmlspecialchars($message);
    
    if ($dismissible) {
        $html .= '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    }
    
    $html .= '</div>';
    
    return $html;
}

/**
 * Validate Turkish phone number
 */
function validateTurkishPhone($phone) {
    // Remove all non-digit characters
    $phone = preg_replace('/[^0-9]/', '', $phone);
    
    // Check if it's a valid Turkish mobile number
    if (preg_match('/^(90)?(5[0-9]{9})$/', $phone)) {
        return true;
    }
    
    return false;
}

/**
 * Format Turkish phone number
 */
function formatTurkishPhone($phone) {
    $phone = preg_replace('/[^0-9]/', '', $phone);
    
    if (strlen($phone) === 11 && substr($phone, 0, 2) === '90') {
        $phone = substr($phone, 2);
    }
    
    if (strlen($phone) === 10 && substr($phone, 0, 1) === '5') {
        return '+90 ' . substr($phone, 0, 3) . ' ' . substr($phone, 3, 3) . ' ' . substr($phone, 6, 2) . ' ' . substr($phone, 8, 2);
    }
    
    return $phone;
}

/**
 * Generate random string
 */
function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    
    return $randomString;
}

/**
 * Check if string contains Turkish characters
 */
function containsTurkishChars($string) {
    return preg_match('/[çğıöşüÇĞIİÖŞÜ]/', $string) > 0;
}

/**
 * Convert Turkish characters to ASCII
 */
function turkishToAscii($string) {
    $turkish = ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'I', 'İ', 'Ö', 'Ş', 'Ü'];
    $ascii = ['c', 'g', 'i', 'o', 's', 'u', 'C', 'G', 'I', 'I', 'O', 'S', 'U'];
    
    return str_replace($turkish, $ascii, $string);
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Check if request is AJAX
 */
function isAjaxRequest() {
    return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

/**
 * Redirect with message
 */
function redirectWithMessage($url, $message, $type = 'info') {
    $_SESSION['flash_message'] = $message;
    $_SESSION['flash_type'] = $type;
    header("Location: $url");
    exit;
}

/**
 * Get and clear flash message
 */
function getFlashMessage() {
    if (isset($_SESSION['flash_message'])) {
        $message = $_SESSION['flash_message'];
        $type = $_SESSION['flash_type'] ?? 'info';
        
        unset($_SESSION['flash_message']);
        unset($_SESSION['flash_type']);
        
        return ['message' => $message, 'type' => $type];
    }
    
    return null;
}

/**
 * Generate URL-friendly slug
 */
function generateSlug($text) {
    $text = turkishToAscii($text);
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    $text = trim($text, '-');
    
    return $text;
}

/**
 * Truncate text with ellipsis
 */
function truncateText($text, $length = 100, $suffix = '...') {
    if (mb_strlen($text) <= $length) {
        return $text;
    }
    
    return mb_substr($text, 0, $length) . $suffix;
}

/**
 * Check if file is image
 */
function isImage($filename) {
    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    
    return in_array($extension, $imageExtensions);
}

/**
 * Generate responsive image HTML
 */
function generateResponsiveImage($src, $alt = '', $class = '', $lazy = true) {
    $lazyAttr = $lazy ? 'loading="lazy"' : '';
    $class = $class ? 'class="' . htmlspecialchars($class) . '"' : '';
    $alt = htmlspecialchars($alt);
    
    return "<img src=\"$src\" alt=\"$alt\" $class $lazyAttr>";
}
?>