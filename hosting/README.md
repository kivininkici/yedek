# OtoKiwi - cPanel Hosting Uyumlu Versiyon

## 📋 Genel Bakış
Bu klasör, OtoKiwi sisteminin cPanel hosting ortamları için özel olarak hazırlanmış versiyonunu içerir.

## 🛠 Teknoloji Stack (cPanel Uyumlu)
- **Backend**: PHP 8.0+ (OOP yapısı)
- **Frontend**: Vanilla JavaScript + HTML5 + CSS3
- **Veritabanı**: MySQL 8.0+
- **UI Framework**: Bootstrap 5.3
- **İconlar**: Font Awesome 6.4
- **Animasyonlar**: CSS3 + JavaScript

## 📁 Dosya Yapısı
```
hosting/
├── index.html              # Ana sayfa
├── admin/                  # Admin panel
│   ├── index.php          # Admin giriş
│   ├── dashboard.php      # Ana dashboard
│   ├── keys.php           # Key yönetimi
│   ├── services.php       # Servis yönetimi
│   └── users.php          # Kullanıcı yönetimi
├── api/                   # PHP API endpoints
│   ├── auth.php          # Authentication
│   ├── keys.php          # Key operations
│   ├── orders.php        # Sipariş işlemleri
│   └── services.php      # Servis operations
├── assets/               # CSS, JS, images
│   ├── css/
│   ├── js/
│   └── images/
├── config/
│   ├── database.php      # DB bağlantı ayarları
│   └── config.php        # Genel ayarlar
└── install/
    ├── database.sql      # Veritabanı kurulum scripti
    └── setup.php         # Kurulum sihirbazı
```

## 🚀 Kurulum Adımları

### 1. Dosyaları cPanel'e Yükleme
- hosting/ klasörünün içeriğini public_html/ dizinine yükleyin

### 2. MySQL Veritabanı Kurulumu
- cPanel'de yeni MySQL veritabanı oluşturun
- install/database.sql dosyasını import edin

### 3. Konfigürasyon
- config/database.php dosyasını düzenleyin
- Veritabanı bağlantı bilgilerini girin

### 4. İzinler
- api/ klasörüne 755 izni verin
- config/ klasörüne 644 izni verin

## 🔧 Özellik Karşılaştırması

| Özellik | Replit Versiyonu | cPanel Versiyonu |
|---------|------------------|------------------|
| Backend | Node.js/Express | PHP 8.0+ |
| Frontend | React + Vite | Vanilla JS |
| Database | PostgreSQL | MySQL |
| Authentication | Passport.js | PHP Sessions |
| API | REST + TypeScript | REST + PHP |
| Responsive | Tailwind CSS | Bootstrap 5 |

## ⚡ Performans Optimizasyonları
- Minified CSS/JS dosyaları
- Browser caching (.htaccess)
- Image compression
- CDN desteği (Bootstrap, Font Awesome)

## 🔒 Güvenlik
- SQL injection koruması (PDO)
- XSS koruması
- CSRF token sistemi
- Secure session management
- Input validation ve sanitization