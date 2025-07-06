# OtoKiwi - cPanel Uyumlu Versiyon

Bu, OtoKiwi key yönetim sisteminin cPanel web hosting ortamları için özel olarak hazırlanmış versiyonudur.

## 🚀 Özellikler

- **Tam cPanel Uyumluluğu**: Herhangi bir shared hosting sağlayıcısında çalışır
- **PHP/MySQL Stack**: Node.js bağımlılığı yoktur
- **Single Page Application**: Modern kullanıcı deneyimi
- **Güvenlik Odaklı**: Kapsamlı güvenlik önlemleri
- **Responsive Tasarım**: Mobil uyumlu arayüz
- **API Management**: Çoklu sosyal medya API desteği

## 📋 Sistem Gereksinimleri

### Minimum Gereksinimler
- PHP 7.4 veya üzeri (PHP 8.0+ önerilir)
- MySQL 5.7 veya üzeri (MySQL 8.0+ önerilir)
- Apache web server
- mod_rewrite etkin
- 512MB RAM (1GB+ önerilir)
- 100MB disk alanı

### PHP Eklentileri
- PDO MySQL
- cURL
- JSON
- OpenSSL
- mbstring

## 🛠️ Kurulum

### 1. Dosyaları Yükleyin
```bash
# Hosting klasöründeki tüm dosyaları web sitenizin kök dizinine yükleyin
# Örnek: public_html/ klasörüne
```

### 2. Veritabanı Kurulumu
```bash
# cPanel üzerinden MySQL veritabanı oluşturun
# database/setup.sql dosyasını phpMyAdmin'de çalıştırın
```

### 3. Konfigürasyon
```php
# config/database.php dosyasını düzenleyin
# Veritabanı bilgilerinizi girin
```

### 4. Dosya İzinleri
```bash
# Gerekli klasörler için yazma izni verin
chmod 755 logs/
chmod 755 uploads/ (eğer varsa)
```

## 🔧 Konfigürasyon

### Veritabanı Ayarları
`config/database.php` dosyasını düzenleyin:

```php
// Veritabanı ayarları
$this->host = 'localhost';
$this->dbname = 'your_database_name';
$this->username = 'your_username';
$this->password = 'your_password';
```

### Environment Variables (Opsiyonel)
`.env` dosyası oluşturarak çevre değişkenlerini ayarlayabilirsiniz:

```env
DB_HOST=localhost
DB_NAME=otokiwi_db
DB_USER=your_username
DB_PASS=your_password
```

## 📁 Dosya Yapısı

```
hosting/
├── api/                    # API endpoints
│   ├── auth.php           # Authentication API
│   ├── admin.php          # Admin API
│   ├── user.php           # User API
│   └── public.php         # Public API
├── assets/                # Static assets
│   ├── css/
│   │   └── style.css      # Ana CSS dosyası
│   └── js/
│       ├── app.js         # Ana uygulama
│       ├── api.js         # API client
│       ├── auth.js        # Authentication
│       ├── config.js      # Konfigürasyon
│       ├── pages.js       # Sayfa template'leri
│       └── router.js      # SPA router
├── config/                # Konfigürasyon dosyaları
│   └── database.php       # Veritabanı konfigürasyonu
├── includes/              # PHP include dosyaları
│   └── security.php       # Güvenlik fonksiyonları
├── database/              # Veritabanı dosyaları
│   └── setup.sql          # Veritabanı kurulum script'i
├── .htaccess              # Apache konfigürasyonu
├── index.php              # Ana sayfa
└── README.md              # Bu dosya
```

## 🔒 Güvenlik

### Otomatik Güvenlik Önlemleri
- SQL Injection koruması
- XSS (Cross-Site Scripting) koruması
- CSRF (Cross-Site Request Forgery) koruması
- Rate limiting
- Input validation
- Security headers
- File upload güvenliği

### Güvenlik Konfigürasyonu
`.htaccess` dosyasında kapsamlı güvenlik ayarları mevcuttur:
- Directory browsing kapalı
- Sensitive dosyalara erişim engellendi
- Security headers otomatik ekleniyor
- Attack pattern engelleme

## 🚀 API Kullanımı

### Authentication Endpoints
```
POST /api/auth/login       # Kullanıcı girişi
POST /api/auth/register    # Kullanıcı kaydı
POST /api/auth/logout      # Çıkış
GET  /api/auth/me          # Kullanıcı bilgileri
```

### Admin Endpoints
```
GET    /api/admin/users     # Kullanıcı listesi
POST   /api/admin/keys      # Key oluşturma
GET    /api/admin/orders    # Sipariş listesi
POST   /api/admin/apis      # API ekleme
```

### User Endpoints
```
POST /api/user/validate-key   # Key doğrulama
POST /api/user/create-order   # Sipariş oluşturma
GET  /api/user/orders         # Kullanıcının siparişleri
```

## 🎨 Özelleştirme

### Tema Değişiklikleri
`assets/css/style.css` dosyasında CSS değişkenleri kullanılmıştır:

```css
:root {
    --primary-color: #3b82f6;
    --background-color: #0f172a;
    --text-color: #f8fafc;
    /* Diğer renkler... */
}
```

### JavaScript Konfigürasyonu
`assets/js/config.js` dosyasında uygulama ayarları:

```javascript
const config = {
    app: {
        name: 'OtoKiwi',
        version: '1.0.0'
    },
    // Diğer ayarlar...
};
```

## 🔧 Sorun Giderme

### Yaygın Problemler

#### 1. 500 Internal Server Error
```bash
# PHP hata loglarını kontrol edin
# .htaccess dosyasının doğru yapılandırıldığından emin olun
# Dosya izinlerini kontrol edin
```

#### 2. Veritabanı Bağlantı Hatası
```bash
# config/database.php dosyasındaki bilgileri kontrol edin
# MySQL servisinin çalıştığından emin olun
# Kullanıcı izinlerini kontrol edin
```

#### 3. API Yanıt Vermiyor
```bash
# mod_rewrite'ın etkin olduğundan emin olun
# .htaccess dosyasının yüklendiğini kontrol edin
# PHP hata loglarını inceleyin
```

### Debug Modu
PHP hata raporlamasını etkinleştirmek için:

```php
# config/database.php dosyasının başına ekleyin
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 🆘 Destek

### Loglar
Hata logları aşağıdaki konumlarda saklanır:
- `logs/error.log` - Genel hatalar
- `logs/security.log` - Güvenlik olayları

### Performans Optimizasyonu
- Gzip sıkıştırması etkin
- Browser caching yapılandırılmış
- CSS/JS dosyaları optimize edilmiş
- Database query'leri optimize edilmiş

## 📈 İzleme ve Analitik

### Dahili Özellikler
- Kullanıcı aktivite takibi
- Sipariş durumu monitoring
- API kullanım istatistikleri
- Güvenlik olay logları

### Performans Metrikleri
- Sayfa yükleme süreleri
- API response süreleri
- Veritabanı query performansı

## 🔄 Güncelleme

### Manual Güncelleme
1. Mevcut dosyaların yedeğini alın
2. Yeni dosyaları yükleyin
3. Veritabanı değişikliklerini uygulayın
4. Cache'i temizleyin

### Veritabanı Migration
```sql
-- Yeni sürümlerde gerekli veritabanı değişiklikleri
-- migration script'leri sağlanacaktır
```

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Commit'lerinizi yapın
4. Push edin
5. Pull Request oluşturun

---

**Not**: Bu versiyon sadece cPanel/shared hosting ortamları için optimize edilmiştir. Production kullanımı öncesinde tüm güvenlik ayarlarını gözden geçirin ve test edin.