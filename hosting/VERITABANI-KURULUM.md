# 🗄️ OtoKiwi cPanel MySQL Kurulum Rehberi

## 1️⃣ cPanel'de Veritabanı Oluşturma

### MySQL Databases Bölümü:
1. **cPanel → MySQL Databases** menüsüne gidin
2. **"Create New Database"** bölümünde:
   - Database Name: `otokiwi` yazın
   - **Create Database** butonuna tıklayın
   - Tam adı: `kullanici_otokiwi` olacak (örn: `kivi_otokiwi`)

### MySQL Kullanıcısı Oluşturma:
1. **"MySQL Users"** bölümünde:
   - Username: `otokiwi_user` yazın
   - Password: güçlü bir şifre belirleyin
   - **Create User** butonuna tıklayın
   - Tam adı: `kullanici_otokiwi_user` olacak

### Kullanıcıyı Veritabanına Atama:
1. **"Add User to Database"** bölümünde:
   - User: az önce oluşturduğunuz kullanıcıyı seçin
   - Database: az önce oluşturduğunuz veritabanını seçin
   - **Add** butonuna tıklayın
   - **ALL PRIVILEGES** seçeneğini işaretleyin
   - **Make Changes** butonuna tıklayın

## 2️⃣ Veritabanı Tablolarını Oluşturma

### phpMyAdmin ile:
1. **cPanel → phpMyAdmin** açın
2. Sol taraftan `kullanici_otokiwi` veritabanını seçin
3. **SQL** sekmesine tıklayın
4. `database/setup.sql` dosyasının içeriğini kopyalayın
5. SQL penceresine yapıştırın ve **Go** butonuna tıklayın

## 3️⃣ Bağlantı Bilgilerini Güncelleme

### config/database.php dosyasını düzenleyin:
```php
$this->host = 'localhost';
$this->dbname = 'kivi_otokiwi';        // Gerçek veritabanı adınız
$this->username = 'kivi_otokiwi_user'; // Gerçek kullanıcı adınız  
$this->password = 'sizin_guclu_sifreniz'; // MySQL şifreniz
```

**Önemli:** `kivi` yerine kendi cPanel kullanıcı adınızı yazın!

## 4️⃣ Bağlantı Testi

### Test dosyasını kullanın:
1. `test-db.php` dosyasını tarayıcıda açın
2. Doğru bilgileri girin ve test edin
3. Başarılı olunca dosyayı silin (güvenlik)

## 5️⃣ Yaygın Hatalar ve Çözümleri

### SQLSTATE[HY000] [1045] Access denied
- **Sebep:** Kullanıcı adı/şifre hatalı
- **Çözüm:** cPanel'de MySQL kullanıcısını kontrol edin

### SQLSTATE[HY000] [1049] Unknown database
- **Sebep:** Veritabanı adı hatalı
- **Çözüm:** cPanel'de tam veritabanı adını kopyalayın

### Connection refused
- **Sebep:** MySQL servisi çalışmıyor
- **Çözüm:** Hosting sağlayıcısına başvurun

## 6️⃣ Güvenlik Notları

- ✅ Güçlü şifreler kullanın
- ✅ Test dosyalarını silin
- ✅ Veritabanı yedeklerini alın
- ❌ Şifreleri dosyalarda açık yazmayın
- ❌ Root kullanıcısını kullanmayın

## 📞 Destek

Sorun yaşıyorsanız:
1. Hosting sağlayıcınızın MySQL dokümanını okuyun
2. cPanel error logs'u kontrol edin
3. Hosting destek ekibine başvurun