# 🚀 OtoKiwi cPanel Kurulum Rehberi - Detaylı Adımlar

## 📋 Kurulum Öncesi Gereksinimler

### Hosting Gereksinimleri:
- **PHP 7.4 veya üzeri**
- **MySQL 5.7 veya üzeri**
- **cURL desteği**
- **JSON desteği**
- **mod_rewrite aktif**

### Hazırlık:
1. cPanel hosting hesabınıza giriş yapın
2. hosting-fixed.zip dosyasını bilgisayarınıza indirin
3. ZIP dosyasını çıkartın

---

## 🗂️ ADIM 1: Dosyaları Yükleme

### 1.1 File Manager'a Erişim
1. cPanel ana sayfasında **"File Manager"** seçeneğine tıklayın
2. **"public_html"** klasörüne gidin
3. Eğer başka bir domain kullanıyorsanız, o domain'in klasörüne gidin

### 1.2 Dosyaları Yükleme
1. File Manager'da **"Upload"** butonuna tıklayın
2. hosting-fixed.zip dosyasını sürükleyin veya **"Select File"** ile seçin
3. Yükleme tamamlandıktan sonra ZIP dosyasına sağ tıklayın
4. **"Extract"** seçeneğini seçin
5. **"Extract Files"** butonuna tıklayın

### 1.3 Dosyaları Taşıma
1. **"hosting"** klasörüne çift tıklayın
2. **Ctrl+A** ile tüm dosyaları seçin
3. **"Move"** butonuna tıklayın
4. **"public_html"** yazın ve **"Move Files"** tıklayın
5. **"hosting"** klasörünü ve **hosting-fixed.zip** dosyasını silin

---

## 🗄️ ADIM 2: MySQL Veritabanı Oluşturma

### 2.1 MySQL Databases Bölümü
1. cPanel ana sayfasında **"MySQL Databases"** seçeneğine tıklayın

### 2.2 Yeni Veritabanı Oluşturma
1. **"Create New Database"** bölümünde:
   - Database Name: `otokiwi_main` (veya istediğiniz ad)
2. **"Create Database"** butonuna tıklayın
3. **"Database Created Successfully"** mesajını bekleyin

### 2.3 MySQL Kullanıcısı Oluşturma
1. **"MySQL Users"** bölümünde:
   - Username: `otokiwi_user` (veya istediğiniz ad)
   - Password: Güvenli bir şifre girin
   - Password (Again): Aynı şifreyi tekrar girin
2. **"Create User"** butonuna tıklayın

### 2.4 Kullanıcıyı Veritabanına Ekleme
1. **"Add User to Database"** bölümünde:
   - User: Oluşturduğunuz kullanıcıyı seçin
   - Database: Oluşturduğunuz veritabanını seçin
2. **"Add"** butonuna tıklayın
3. **"ALL PRIVILEGES"** seçeneğini işaretleyin
4. **"Make Changes"** butonuna tıklayın

### 2.5 Veritabanı Bilgilerini Kaydetme
Aşağıdaki bilgileri bir yere not edin:
- **Database Host**: `localhost`
- **Database Name**: `cpanel_kullanici_otokiwi_main`
- **Database User**: `cpanel_kullanici_otokiwi_user`
- **Database Password**: Belirlediğiniz şifre

> **NOT**: cPanel otomatik olarak kullanıcı adınızı prefix olarak ekler

---

## 🛠️ ADIM 3: Kurulum Sihirbazını Çalıştırma

### 3.1 Setup Sayfasına Gitme
1. Web tarayıcınızı açın
2. `https://siteniz.com/install/setup.php` adresine gidin
3. Kurulum sihirbazı açılacak

### 3.2 Kurulum Adımları

#### **ADIM 1: Hoş Geldiniz**
- Sistem gereksinimlerini kontrol edin
- Hepsi yeşil tik işaretli olmalı
- **"Kuruluma Başla"** butonuna tıklayın

#### **ADIM 2: Veritabanı Ayarları**
Aşağıdaki bilgileri doldurun:
- **Veritabanı Sunucusu**: `localhost`
- **Veritabanı Adı**: `cpanel_kullanici_otokiwi_main`
- **Kullanıcı Adı**: `cpanel_kullanici_otokiwi_user`
- **Şifre**: Veritabanı kullanıcı şifreniz
- **"Devam Et"** butonuna tıklayın

> **Hata alırsanız**: Veritabanı bilgilerini tekrar kontrol edin

#### **ADIM 3: Tablolar**
- **"Tabloları Oluştur"** butonuna tıklayın
- Sistem otomatik olarak gerekli tabloları oluşturacak
- **"Tablolar başarıyla oluşturuldu"** mesajını bekleyin

#### **ADIM 4: Admin Kullanıcısı**
Admin hesabı bilgilerini doldurun:
- **Kullanıcı Adı**: `admin` (varsayılan)
- **E-posta**: Geçerli e-posta adresiniz
- **Şifre**: Güvenli bir şifre (en az 6 karakter)
- **"Admin Oluştur"** butonuna tıklayın

#### **ADIM 5: Master Şifre**
Master şifre admin panele erişim için gereklidir:
- **Master Şifre**: Güvenli bir şifre girin (en az 8 karakter)
- **Master Şifre Tekrar**: Aynı şifreyi tekrar girin
- **"Kurulumu Tamamla"** butonuna tıklayın

#### **ADIM 6: Tamamlandı**
- **"Kurulum Tamamlandı!"** mesajını görün
- **"Admin Paneline Git"** butonuna tıklayın

---

## 🔒 ADIM 4: İlk Giriş

### 4.1 Admin Paneline Giriş
1. Admin paneli otomatik olarak açılacak
2. **Master Şifre Ekranı**:
   - Kurulumda belirlediğiniz master şifreyi girin
   - **"Devam Et"** butonuna tıklayın

3. **Admin Giriş Ekranı**:
   - **Kullanıcı Adı**: `admin`
   - **Şifre**: Kurulumda belirlediğiniz admin şifresi
   - **"Giriş Yap"** butonuna tıklayın

### 4.2 İlk Kontroller
1. **Dashboard** açılacak
2. **Sistem bilgilerini** kontrol edin
3. **Menü seçeneklerini** test edin:
   - Key Yönetimi
   - Kullanıcı Yönetimi
   - API Yönetimi
   - Sipariş Yönetimi

---

## 🔧 ADIM 5: Güvenlik Ayarları

### 5.1 Install Klasörünü Silme
1. File Manager'a girin
2. **"install"** klasörüne sağ tıklayın
3. **"Delete"** seçeneğini seçin
4. **"Confirm"** butonuna tıklayın

### 5.2 Dosya İzinlerini Ayarlama
1. **"config"** klasörüne sağ tıklayın → **"Change Permissions"**
2. **755** (rwxr-xr-x) olarak ayarlayın
3. **"logs"** klasörü için **755** ayarlayın
4. **"uploads"** klasörü için **755** ayarlayın

### 5.3 .htaccess Kontrolü
1. **".htaccess"** dosyasının mevcut olduğunu kontrol edin
2. Eğer yoksa File Manager'da **"Show Hidden Files"** seçeneğini aktifleştirin

---

## 🌐 ADIM 6: Test Etme

### 6.1 Ana Sayfa Testi
1. `https://siteniz.com` adresine gidin
2. Ana sayfa düzgün yüklenmeli
3. **"Key Kullan"** butonuna tıklayın
4. Key giriş sayfası açılmalı

### 6.2 Admin Panel Testi
1. `https://siteniz.com/admin` adresine gidin
2. Master şifre ile giriş yapın
3. Admin bilgileri ile giriş yapın
4. Dashboard'un açıldığını kontrol edin

### 6.3 API Testi
1. Admin panelde **"API Yönetimi"** bölümüne gidin
2. **"Test API"** butonuna tıklayın
3. API bağlantısının çalıştığını kontrol edin

---

## ⚙️ ADIM 7: Sistem Ayarları

### 7.1 E-posta Ayarları (Opsiyonel)
1. File Manager'da **"config/config.php"** dosyasını açın
2. **"Edit"** butonuna tıklayın
3. SMTP ayarlarını yapılandırın:
```php
define('SMTP_HOST', 'mail.siteniz.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'noreply@siteniz.com');
define('SMTP_PASSWORD', 'email_şifreniz');
```

### 7.2 API Ayarları
1. Admin panelde **"API Yönetimi"** bölümüne gidin
2. **"Yeni API Ekle"** butonuna tıklayın
3. API bilgilerini girin:
   - **API Adı**: MedyaBayim
   - **API URL**: `https://medyabayim.com/api/v2`
   - **API Key**: API anahtarınız

### 7.3 Servis Ayarları
1. **"Servis Yönetimi"** bölümüne gidin
2. **"Servisleri Getir"** butonuna tıklayın
3. API'den servisleri import edin

---

## 🎯 ADIM 8: İlk Key Oluşturma

### 8.1 Key Oluşturma
1. Admin panelde **"Key Yönetimi"** bölümüne gidin
2. **"Yeni Key Oluştur"** butonuna tıklayın
3. Key bilgilerini doldurun:
   - **Key Adı**: Test Key
   - **Key Değeri**: TEST123
   - **Kategori**: Instagram
   - **Servis**: Seçin
   - **Miktar**: 1000

### 8.2 Key Testi
1. Ana sayfada **"Key Kullan"** butonuna tıklayın
2. Oluşturduğunuz key'i test edin
3. Key'in tanındığını ve servis bilgilerinin görüntülendiğini kontrol edin

---

## 🛡️ Güvenlik Kontrolleri

### ✅ Yapılması Gerekenler:
- [ ] `install/` klasörü silindi
- [ ] Master şifre güvenli (en az 8 karakter)
- [ ] Admin şifre güvenli (en az 6 karakter)
- [ ] Dosya izinleri doğru ayarlandı
- [ ] .htaccess dosyası mevcut
- [ ] E-posta ayarları yapılandırıldı
- [ ] API ayarları yapılandırıldı
- [ ] Test key oluşturuldu ve test edildi

### ❌ Yapılmaması Gerekenler:
- Setup şifrelerini paylaşmayın
- Config dosyalarını herkese açık bırakmayın
- Güvenlik güncellemelerini atlayın
- Backup almayı unutmayın

---

## 🆘 Sorun Giderme

### Veritabanı Bağlantı Hatası
```
Error: Connection failed: Access denied for user
```
**Çözüm**: 
1. Veritabanı bilgilerini kontrol edin
2. Kullanıcının veritabanı erişimi olduğunu kontrol edin
3. Şifrenin doğru olduğunu kontrol edin

### Dosya İzin Hatası
```
Error: Permission denied
```
**Çözüm**:
1. `config/` klasörü izinlerini 755 yapın
2. `logs/` klasörü izinlerini 755 yapın
3. PHP dosyalarını 644 yapın

### Master Şifre Hatası
```
Error: Invalid master password
```
**Çözüm**:
1. `config/config.php` dosyasını kontrol edin
2. `MASTER_PASSWORD` satırını bulun
3. Kurulumda belirlediğiniz şifre ile eşleştirin

### Setup Sayfası Açılmıyor
```
Error: 404 Not Found
```
**Çözüm**:
1. `install/setup.php` dosyasının var olduğunu kontrol edin
2. Dosya yollarını kontrol edin
3. `.htaccess` dosyasını kontrol edin

---

## 📞 Destek

Kurulum sırasında sorun yaşarsanız:

1. **Log Dosyalarını Kontrol Edin**:
   - `logs/error.log`
   - cPanel Error Logs bölümü

2. **Sistem Bilgilerini Kontrol Edin**:
   - PHP versiyon
   - MySQL versiyon
   - Disk alanı

3. **Backup Alın**:
   - Kurulum tamamlandıktan sonra mutlaka backup alın
   - Veritabanı backup'ı almayı unutmayın

---

## 🎉 Kurulum Tamamlandı!

Kurulum başarıyla tamamlandıktan sonra:

### ✅ Sistem Hazır:
- Ana sayfa: `https://siteniz.com`
- Admin paneli: `https://siteniz.com/admin`
- Key kullanımı: `https://siteniz.com/user.html`
- Sipariş sorgulama: `https://siteniz.com/order-search.html`

### 🚀 Sonraki Adımlar:
1. API entegrasyonları yapın
2. Servisleri ekleyin
3. Key'leri oluşturun
4. Test işlemleri yapın
5. Kullanıcılara sistemi tanıtın

**Başarıyla OtoKiwi'yi kurdunuz!**