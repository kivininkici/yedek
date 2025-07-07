# OtoKiwi cPanel Kurulum Rehberi (Güncel)

## 🚀 Kurulum Adımları

### 1. Dosyaları Yükleme
1. Hosting klasörünün içeriğini cPanel File Manager'dan public_html'ye yükleyin
2. Tüm dosyaların yüklenmesini bekleyin

### 2. Veritabanı Oluşturma
1. cPanel'den "MySQL Databases" bölümüne gidin
2. Yeni bir veritabanı oluşturun (örn: `otokiwi_db`)
3. Veritabanı kullanıcısı oluşturun (örn: `otokiwi_user`)
4. Kullanıcıyı veritabanına ekleyin ve "ALL PRIVILEGES" verin

### 3. Kurulum Sihirbazını Çalıştırma
1. Web tarayıcınızda `https://siteniz.com/install/setup.php` adresine gidin
2. Kurulum sihirbazını takip edin:

#### Adım 1: Hoş Geldiniz
- "Kuruluma Başla" butonuna tıklayın

#### Adım 2: Veritabanı Ayarları
- **Veritabanı Sunucusu**: `localhost` (genellikle değişmez)
- **Veritabanı Adı**: Oluşturduğunuz veritabanı adı (örn: `otokiwi_db`)
- **Kullanıcı Adı**: Oluşturduğunuz kullanıcı adı (örn: `otokiwi_user`)
- **Şifre**: Veritabanı kullanıcı şifresi
- "Devam Et" butonuna tıklayın

#### Adım 3: Tablolar
- "Tabloları Oluştur" butonuna tıklayın
- Sistem otomatik olarak gerekli tabloları oluşturacak

#### Adım 4: Admin Kullanıcısı
- **Kullanıcı Adı**: `admin` (varsayılan)
- **E-posta**: Geçerli e-posta adresiniz
- **Şifre**: Güvenli bir şifre (en az 6 karakter)
- "Admin Oluştur" butonuna tıklayın

#### Adım 5: Master Şifre (YENİ!)
- **Master Şifre**: Güvenli bir master şifre girin (en az 8 karakter)
- **Master Şifre Tekrar**: Aynı şifreyi tekrar girin
- "Kurulumu Tamamla" butonuna tıklayın

#### Adım 6: Tamamlandı
- Kurulum başarıyla tamamlandı!
- **ÖNEMLİ**: `install/` klasörünü silin (güvenlik için)

### 4. Sistem Kullanımı

#### Admin Paneline Giriş:
1. `https://siteniz.com/admin/` adresine gidin
2. **Master Şifre** girin (kurulumda belirlediğiniz)
3. **Admin Bilgileri** girin:
   - Kullanıcı Adı: `admin`
   - Şifre: Kurulumda belirlediğiniz admin şifresi

#### Kullanıcı Arayüzü:
- Ana sayfa: `https://siteniz.com/`
- Key kullanma: `https://siteniz.com/user.html`
- Sipariş sorgulama: `https://siteniz.com/order-search.html`

## 🔧 Önemli Notlar

### Güvenlik:
- Master şifre admin paneline erişim için gereklidir
- Admin şifre yönetim işlemleri için kullanılır
- Her iki şifreyi de güvenli tutun

### Dosya İzinleri:
- `config/` klasörü: 755
- `logs/` klasörü: 755 (yazılabilir)
- `uploads/` klasörü: 755 (yazılabilir)

### Sorun Giderme:
1. Kurulum sonrası `install/` klasörünü mutlaka silin
2. Veritabanı bağlantı hatası alırsanız `config/database.php` dosyasını kontrol edin
3. Master şifre hatası alırsanız `config/config.php` dosyasındaki `MASTER_PASSWORD` satırını kontrol edin

## 📧 E-posta Ayarları (Opsiyonel)

E-posta gönderimi için `config/config.php` dosyasında SMTP ayarlarını yapılandırabilirsiniz:

```php
// E-posta ayarları
define('SMTP_HOST', 'your-smtp-server.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@domain.com');
define('SMTP_PASSWORD', 'your-email-password');
```

## 🆘 Destek

Kurulum sırasında sorun yaşarsanız:
1. `logs/` klasöründeki hata loglarını kontrol edin
2. cPanel Error Logs bölümünü kontrol edin
3. Veritabanı bağlantı ayarlarını tekrar gözden geçirin

## 🎯 Kurulum Sonrası

Kurulum tamamlandıktan sonra:
1. Admin panelinden API ayarlarını yapın
2. Servis yönetimine gidin ve servisleri ekleyin
3. Key yönetimi bölümünden test key'leri oluşturun
4. Sistem ayarlarını ihtiyaçlarınıza göre düzenleyin

**Başarıyla OtoKiwi'yi kurdunuz! 🎉**