# KeyPanel cPanel Kurulum Rehberi

## 📋 Genel Bakış

Bu rehber, KeyPanel'in cPanel hosting ortamında kurulumu için adım adım talimatları içerir.

## 🛠 Sistem Gereksinimleri

### Minimum Gereksinimler:
- **PHP**: 7.4 veya üzeri (8.0+ önerilen)
- **MySQL**: 5.7 veya üzeri (8.0+ önerilen)
- **Disk Alanı**: 100MB
- **SSL Sertifikası**: Önerilen

### PHP Eklentileri:
- PDO MySQL
- cURL
- JSON
- mbstring
- OpenSSL

## 📁 Dosya Yapısı

```
public_html/
├── index.html              # Ana sayfa
├── user.html              # Kullanıcı arayüzü
├── order-search.html      # Sipariş sorgulama
├── auth.html              # Giriş/Kayıt
├── admin/                 # Admin panel
├── api/                   # PHP API endpoints
├── assets/                # CSS, JS, resimler
├── config/                # Konfigürasyon dosyaları
├── includes/              # PHP helper dosyalar
├── install/               # Kurulum script'leri
└── .htaccess             # Apache ayarları
```

## 🚀 Kurulum Adımları

### 1. Dosyaları Yükleme
```bash
# hosting/ klasörünün içeriğini cPanel File Manager ile public_html/ dizinine yükleyin
# Veya FTP kullanarak dosyaları transfer edin
```

### 2. MySQL Veritabanı Oluşturma

#### cPanel MySQL Databases bölümünden:
1. **Create New Database**: `keypanel_db` (veya istediğiniz isim)
2. **Add New User**: `keypanel_user` + güçlü şifre
3. **Add User To Database**: Tüm yetkiler (ALL PRIVILEGES)

### 3. Veritabanı Bağlantısını Yapılandırma

`config/database.php` dosyasını düzenleyin:
```php
private const DB_HOST = 'localhost';          // Genellikle localhost
private const DB_NAME = 'your_db_name';       // Oluşturduğunuz DB adı
private const DB_USER = 'your_db_user';       // DB kullanıcı adı
private const DB_PASS = 'your_db_password';   // DB şifresi
```

### 4. Otomatik Kurulum

Tarayıcınızda şu adrese gidin:
```
https://yourdomain.com/install/setup.php
```

Kurulum sihirbazını takip edin:
1. **Hoş Geldiniz** - Sistem gereksinimlerini kontrol edin
2. **Veritabanı** - DB bağlantı bilgilerini girin
3. **Tablolar** - Veritabanı tablolarını oluşturun
4. **Admin** - Yönetici hesabı oluşturun
5. **Tamamlandı** - Kurulum tamamlandı

### 5. Güvenlik Ayarları

Kurulum tamamlandıktan sonra:
```bash
# install/ klasörünü silin
rm -rf install/

# config/ klasörü izinlerini ayarlayın
chmod 644 config/*.php
```

## ⚙️ Konfigürasyon

### Master Şifre Ayarları
`config/config.php` dosyasında:
```php
define('MASTER_PASSWORD', 'your-secure-master-password');
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'your-admin-password');
```

### Güvenlik Soruları
Önceden tanımlanmış 6 güvenlik sorusu mevcuttur. Kendi sorularınızı ekleyebilirsiniz:
```php
define('SECURITY_QUESTIONS', [
    'Soru?' => ['cevap1', 'cevap2', 'cevap3']
]);
```

### E-posta Ayarları (Opsiyonel)
SendGrid kullanmak isterseniz API key ekleyin:
```php
// E-posta service için environment variable ekleyin
putenv('SENDGRID_API_KEY=your-sendgrid-api-key');
```

## 🔧 API Entegrasyonu

### Desteklenen API'ler:
- **MedyaBayim**: https://medyabayim.com/api/v2
- **ResellerProvider**: https://resellerprovider.com/api/v2
- **Custom API**: Kendi API'nizi ekleyebilirsiniz

### API Ekleme:
1. Admin paneline giriş yapın
2. **API Ayarları** > **Yeni API Ekle**
3. API bilgilerini girin ve test edin

## 📊 Özellikler

### Admin Panel:
- Dashboard ve istatistikler
- Key yönetimi (oluştur, listele, export)
- API ayarları ve bakiye yönetimi
- Kullanıcı yönetimi
- Sipariş takibi
- Log ve güvenlik takibi

### Kullanıcı Arayüzü:
- Key doğrulama
- Servis seçimi ve sipariş oluşturma
- Sipariş sorgulama ve takip
- Geri bildirim ve şikayet sistemi

### Güvenlik:
- Master şifre koruması
- Güvenlik soruları
- Matematik doğrulama
- Giriş denemesi sınırlaması
- SQL injection koruması
- XSS filtreleme

## 🌐 Tarayıcı Erişimi

### Kullanıcı Arayüzü:
- **Ana Sayfa**: `https://yourdomain.com/`
- **Key Kullan**: `https://yourdomain.com/user.html`
- **Sipariş Sorgula**: `https://yourdomain.com/order-search.html`

### Admin Panel:
- **Admin Giriş**: `https://yourdomain.com/admin/`
- **Dashboard**: `https://yourdomain.com/admin/dashboard.html`

## 🔍 Sorun Giderme

### Yaygın Sorunlar:

#### 1. Veritabanı Bağlantı Hatası
```
Çözüm: config/database.php dosyasındaki bilgileri kontrol edin
```

#### 2. 500 Internal Server Error
```
Çözüm: 
- .htaccess dosyasını kontrol edin
- PHP error log'larını inceleyin
- Dosya izinlerini kontrol edin (755/644)
```

#### 3. API Endpoint'ler Çalışmıyor
```
Çözüm:
- mod_rewrite aktif mi kontrol edin
- .htaccess URL rewriting kurallarını kontrol edin
```

#### 4. CSS/JS Dosyaları Yüklenmiyor
```
Çözüm:
- assets/ klasörünün doğru yüklendiğini kontrol edin
- CDN linklerinin çalıştığını kontrol edin
```

### Debug Modu:
Geliştirme sırasında `config/config.php` dosyasında:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

Production'da bu ayarları kapatın:
```php
error_reporting(0);
ini_set('display_errors', 0);
```

## 📞 Destek

Kurulum sırasında sorun yaşarsanız:
1. PHP error log'larını kontrol edin
2. Tarayıcı console'unu kontrol edin
3. Network sekmesinde API çağrılarını kontrol edin

## 🔒 Güvenlik Önerileri

1. **Güçlü Şifreler**: Master şifre ve admin şifresi en az 12 karakter
2. **SSL Sertifikası**: HTTPS kullanın
3. **Düzenli Yedekleme**: Veritabanı ve dosyaları yedekleyin
4. **Güncellemeler**: PHP ve MySQL'i güncel tutun
5. **İzinler**: Dosya izinlerini minimum seviyede tutun

## 📈 Performans Optimizasyonu

1. **Browser Caching**: .htaccess ile cache ayarları aktif
2. **Compression**: GZIP sıkıştırma aktif
3. **CDN**: Bootstrap ve Font Awesome CDN'den yükleniyor
4. **Database**: Index'ler optimize edilmiş
5. **API Cache**: 15 saniye cache süresi

---

**✅ Kurulum tamamlandığında KeyPanel tamamen çalışır durumda olacaktır!**