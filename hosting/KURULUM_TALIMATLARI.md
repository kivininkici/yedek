# KeyPanel - cPanel Hosting Kurulum Talimatları

## Türkçe Kurulum Rehberi

Bu kılavuz KeyPanel uygulamasını cPanel hosting ortamına nasıl kuracağınızı adım adım anlatır.

---

## 📋 Gereksinimler

### Hosting Gereksinimleri
- **PHP**: 7.4 veya üzeri (8.0+ önerilir)
- **MySQL**: 5.7 veya üzeri / MariaDB 10.2+
- **Apache**: mod_rewrite etkin
- **SSL Sertifikası**: HTTPS desteği (Let's Encrypt ücretsiz)
- **Disk Alanı**: Minimum 100MB
- **RAM**: Minimum 256MB PHP memory limit

### cPanel Özellikleri
- File Manager erişimi
- MySQL Database wizard
- Subdomain yönetimi (opsiyonel)

---

## 🚀 Kurulum Adımları

### 1. Dosyaları Yükleme

#### 1.1 cPanel File Manager'a Giriş
1. cPanel'e giriş yapın
2. **File Manager**'ı açın
3. `public_html` klasörüne gidin

#### 1.2 Dosyaları Upload Etme
1. `hosting/public_html` klasöründeki tüm dosyaları seçin
2. ZIP olarak sıkıştırın: `keypanel_files.zip`
3. cPanel File Manager'da **Upload** butonuna tıklayın
4. ZIP dosyasını yükleyin
5. Yüklendikten sonra **Extract** ile açın
6. Dosyalar doğru yerlere yerleştiğinden emin olun:
   ```
   public_html/
   ├── index.php
   ├── .htaccess
   ├── api/
   ├── assets/
   └── ...
   ```

### 2. MySQL Veritabanı Kurulumu

#### 2.1 Veritabanı Oluşturma
1. cPanel'de **MySQL Database Wizard**'ı açın
2. **Veritabanı Adı**: `keypanel_db` (veya istediğiniz ad)
3. **Next** butonuna tıklayın

#### 2.2 Kullanıcı Oluşturma
1. **Kullanıcı Adı**: `keypanel_user` (veya istediğiniz ad)
2. **Güçlü bir şifre** oluşturun (en az 12 karakter)
3. **Create User** butonuna tıklayın

#### 2.3 Yetkilendirme
1. Kullanıcıya **ALL PRIVILEGES** verin
2. **Next** butonuna tıklayın

#### 2.4 Database Script'ini Çalıştırma
1. cPanel'de **phpMyAdmin**'i açın
2. Oluşturduğunuz veritabanını seçin
3. **SQL** sekmesine gidin
4. `hosting/database_setup.sql` dosyasının içeriğini kopyalayın
5. SQL alanına yapıştırıp **Go** butonuna tıklayın

### 3. Konfigürasyon

#### 3.1 Database Ayarları
1. `public_html/api/config/database.php` dosyasını açın
2. Aşağıdaki değerleri güncelleyin:
   ```php
   define('DB_HOST', 'localhost'); // Genellikle localhost
   define('DB_NAME', 'cpanel_kullanici_keypanel_db'); // cPanel format: kullanici_veritabani
   define('DB_USER', 'cpanel_kullanici_keypanel_user'); // cPanel format: kullanici_dbuser
   define('DB_PASS', 'veritabani_sifreniz'); // Oluşturduğunuz şifre
   ```

#### 3.2 Dosya İzinleri (Gerekirse)
```bash
# API klasörü yazılabilir olmalı
chmod 755 public_html/api/
chmod 644 public_html/api/config/database.php
```

### 4. Admin Hesabı Kurulumu

#### 4.1 Varsayılan Admin
- **Kullanıcı Adı**: `admin`
- **Şifre**: `admin123`
- **Güvenlik Soruları**: Kiwi doğum tarihi (29/05/2020), Anne adı (Halime), vb.

#### 4.2 Güvenlik (ÖNEMLİ!)
1. İlk girişten sonra mutlaka admin şifresini değiştirin
2. phpMyAdmin'de admin tablosunu açın:
   ```sql
   UPDATE admin_users SET password_hash = '$2y$10$YeniHashDeğeriniz' WHERE username = 'admin';
   ```

### 5. SSL ve Güvenlik

#### 5.1 SSL Sertifikası
1. cPanel'de **SSL/TLS** bölümüne gidin
2. **Let's Encrypt** ile ücretsiz SSL kurun
3. **Force HTTPS Redirect** özelliğini aktifleştirin

#### 5.2 Güvenlik Ayarları
1. `.htaccess` dosyasında güvenlik başlıkları kontrol edin
2. `php.ini` ayarlarını kontrol edin (gerekirse)
3. Hassas dosyalara erişimi engelleyin

---

## 🔧 Test ve Doğrulama

### 1. Temel Test
1. Tarayıcıda sitenizi açın: `https://yourdomain.com`
2. Ana sayfa yüklenmeli
3. "Sipariş Sorgula" linkine tıklayın - çalışmalı

### 2. API Testi
1. `https://yourdomain.com/api/services/active` adresini açın
2. JSON yanıt dönmeli (boş array olabilir)

### 3. Admin Panel Testi
1. `https://yourdomain.com#admin` adresine gidin
2. Varsayılan bilgilerle giriş yapın
3. Dashboard açılmalı

### 4. Database Bağlantı Testi
1. Admin panelde "Kullanıcılar" sayfasını açın
2. Veriler görünmeli (boş olabilir)

---

## 🔑 İlk Kullanım

### 1. API Ayarları
1. Admin panelde **API Ayarları** bölümüne gidin
2. MedyaBayim veya ResellerProvider API bilgilerinizi ekleyin:
   - **API URL**: `https://medyabayim.com/api/v2`
   - **API Key**: Gerçek API anahtarınız
   - **Aktif**: Evet

### 2. Servis Import
1. **Servisler** sayfasına gidin
2. **Servisleri API'den Çek** butonuna tıklayın
3. Servisler otomatik import edilecek

### 3. İlk Key Oluşturma
1. **Key Yönetimi** sayfasına gidin
2. **Yeni Key Oluştur** butonuna tıklayın
3. Key bilgilerini doldurun
4. Servis seçin ve kaydedin

### 4. Kullanıcı Testi
1. Ana sayfada **Key Kullan** butonuna tıklayın
2. Kayıt olun veya giriş yapın
3. Oluşturduğunuz key'i test edin

---

## 📂 Dosya Yapısı

```
public_html/
├── index.php                 # Ana sayfa
├── .htaccess                 # Apache yapılandırması
├── api/                      # Backend API
│   ├── index.php            # API gateway
│   ├── config/
│   │   └── database.php     # Database ayarları
│   ├── includes/
│   │   └── functions.php    # Yardımcı fonksiyonlar
│   └── routes/              # API endpoint'leri
│       ├── admin.php
│       ├── auth.php
│       ├── keys.php
│       ├── orders.php
│       ├── services.php
│       └── user.php
└── assets/                  # Frontend dosyaları
    ├── index.css           # Ana stil dosyası
    ├── app.js              # Ana JavaScript
    └── favicon.svg         # Site ikonu
```

---

## ⚠️ Güvenlik Notları

### Kritik Güvenlik Ayarları
1. **Database şifrelerini güçlü tutun**
2. **Admin şifresini mutlaka değiştirin**
3. **SSL sertifikası kullanın**
4. **Dosya izinlerini kontrol edin**
5. **Güncellemeleri takip edin**

### Yedekleme
1. **Düzenli veritabanı yedekleri** alın
2. **Dosya yedeklerini** unutmayın
3. **API anahtarlarını** güvenli saklayın

---

## 🆘 Sorun Giderme

### Yaygın Sorunlar

#### 1. "500 Internal Server Error"
- **Sebep**: PHP hataları, .htaccess sorunları
- **Çözüm**: Error log'larını kontrol edin
- **Log Konumu**: cPanel > Error Logs

#### 2. Database Bağlantı Hatası
- **Sebep**: Yanlış DB bilgileri
- **Çözüm**: `database.php` dosyasındaki bilgileri kontrol edin
- **Format**: cPanel genellikle `kullanici_veritabani` formatı kullanır

#### 3. API Çalışmıyor
- **Sebep**: mod_rewrite kapalı, .htaccess sorunları
- **Çözüm**: Hosting sağlayıcınızla iletişime geçin

#### 4. CSS/JS Yüklenmiyor
- **Sebep**: Dosya yolları, izin sorunları
- **Çözüm**: assets klasörü izinlerini kontrol edin

### Log Kontrolü
```bash
# PHP Error Log
tail -f /home/kullanici/public_html/error_log

# Apache Error Log (hosting sağlayıcıya bağlı)
```

---

## 📞 Destek

### Hosting Desteği Gereken Durumlar
- mod_rewrite aktifleştirme
- PHP memory limit artırma
- SSL sertifika kurulumu
- Database izin sorunları

### Self-Help Kaynakları
- cPanel dokümantasyonu
- PHP manual
- MySQL referansı

---

## 🔄 Güncelleme

### Manuel Güncelleme
1. Yeni dosyaları yedek klasöre kopyalayın
2. Mevcut dosyaları yedekleyin
3. Yeni dosyaları upload edin
4. Database değişikliklerini uygulayın
5. Test edin

### Yedekleme Öncesi
```sql
-- Database backup
mysqldump -u kullanici -p veritabani > keypanel_backup.sql
```

---

✅ **Kurulum tamamlandığında KeyPanel sistemi production seviyesinde çalışacaktır!**

🚀 **İyi kullanımlar!**