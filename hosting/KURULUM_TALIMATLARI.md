# KeyPanel - Web Hosting Kurulum Talimatları

## Genel Bakış

KeyPanel artık tamamen statik HTML/CSS/JavaScript ile çalışacak şekilde yeniden tasarlandı. PHP, MySQL ve sunucu bağımlılıkları kaldırıldı. Bu versiyon herhangi bir web hosting firmasında çalışır.

## ✅ Avantajlar

- **Kolay Kurulum**: Sadece dosyaları yükleyin
- **Düşük Maliyet**: Basit web hosting yeterli  
- **Hızlı**: Sunucu işlemi yok, direkt browser'da çalışır
- **Güvenli**: Statik dosyalar, güvenlik riski minimal

## 📁 Dosya Yapısı

```
public_html/
├── index.html          # Ana sayfa (SPA - Single Page Application)
├── .htaccess          # Apache konfigürasyonu ve güvenlik
├── 404.html           # Hata sayfası
├── assets/
│   ├── style.css      # Bootstrap + özel CSS
│   └── app.js         # Tüm JavaScript fonksiyonları
└── README.md          # Detaylı dokümantasyon
```

## 🚀 Kurulum Adımları

### 1. Hosting Seçimi

**Önerilen Hosting Firmaları:**
- **Türkiye**: Turhost (₺5-15/ay), Hosting.com.tr, Hostinger
- **Global**: Hostinger (₺3-8/ay), SiteGround, Bluehost

**Minimum Gereksinimler:**
- Disk alanı: 50 MB (çok fazla)
- Bant genişliği: 1 GB/ay
- Apache/Nginx web server
- .htaccess desteği

### 2. Domain Bağlama

1. **Domain satın alın** (örn: keypanel.com)
2. **DNS ayarlarını** hosting firmasına yönlendirin
3. **SSL sertifikası** aktif edin (çoğu hosting ücretsiz veriyor)

### 3. Dosya Yükleme

1. **cPanel/FTP** ile giriş yapın
2. `public_html/` klasörünü bulun
3. **Tüm dosyaları** bu klasöre yükleyin:
   ```bash
   public_html/
   ├── index.html
   ├── .htaccess
   ├── 404.html
   └── assets/
   ```

### 4. Test Etme

1. **Ana sayfa**: `https://yourdomain.com`
2. **Admin giriş**: Kullanıcı `admin`, Şifre `admin123`
3. **Demo key**: `DEMO-KEY-123456` test edin

## 🔧 Konfigürasyon

### .htaccess Ayarları

Dosya otomatik yapılandırılmış, isteğe bağlı değişiklikler:

```apache
# HTTPS zorunlu yapmak için (SSL varsa)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# www zorunlu yapmak için
RewriteCond %{HTTP_HOST} !^www\. [NC]
RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Özelleştirme

**CSS renkleri değiştirmek** (assets/style.css):
```css
:root {
    --primary-color: #0d6efd;    /* Ana mavi renk */
    --success-color: #198754;    /* Yeşil renk */
    --danger-color: #dc3545;     /* Kırmızı renk */
}
```

**Demo verileri değiştirmek** (assets/app.js):
```javascript
const sampleKeys = [
    { id: 1, value: 'YOUR-KEY-123456', category: 'Instagram', maxQuantity: 1000, isUsed: false }
];
```

## 🔐 Güvenlik

### Otomatik Korumatlar
- **XSS koruması**: Cross-site scripting engelleme
- **Clickjacking koruması**: iframe içine alma engelleme  
- **MIME sniffing engelleme**: Dosya türü saldırıları engelleme
- **Güvenli headers**: Security headers otomatik ekleniyor

### Manuel Ayarlar
1. **Admin şifresi değiştirin** (app.js dosyasında)
2. **Demo verileri silin** production'da
3. **SSL zorunlu yapın** .htaccess'te

## 📊 Demo Veriler

### Test Hesapları
- **Admin**: admin / admin123
- **Key'ler**: DEMO-KEY-123456, DEMO-KEY-789012

### Demo İçerik
- 3 adet demo key (Instagram, YouTube, TikTok)
- 4 adet demo servis
- 2 adet demo sipariş
- 2 adet demo kullanıcı

## 🚨 Önemli Notlar

### Production'da Yapılacaklar

1. **Demo verileri silin**:
   ```javascript
   const sampleKeys = [];      // Boş bırakın
   const sampleServices = [];  // Boş bırakın  
   const sampleOrders = [];    // Boş bırakın
   ```

2. **Admin şifre değiştirin**:
   ```javascript
   if (username === 'admin' && password === 'YENİ_ŞİFRE') {
   ```

3. **Demo alert'leri kaldırın**:
   ```javascript
   // Bu satırları silin/yorumlayın
   showAlert('Demo sürümünde aktif değil', 'info');
   ```

### Sınırlamalar

- **Veri kalıcılığı yok**: Browser refresh'te veriler gidiyor
- **Gerçek API yok**: Sadece frontend demo
- **Çoklu kullanıcı yok**: Tek browser session

## 🔄 Güncellemeler

### Versiyon Geçmişi
- **v1.0.0**: İlk statik versiyon
- **v0.9.x**: PHP/MySQL versiyonu (eski)

### Gelecek Güncellemeler
- **Backend entegrasyonu**: İsteğe bağlı API sistemi
- **Database desteği**: Kalıcı veri saklama
- **Çoklu kullanıcı**: Gerçek authentication sistemi

## 🆘 Sorun Giderme

### Yaygın Problemler

1. **Sayfa açılmıyor**
   - Domain DNS ayarlarını kontrol edin
   - SSL sertifikası kontrolü yapın

2. **CSS/JS yüklenmiyor**
   - CDN bağlantıları kontrol edin
   - Browser cache temizleyin

3. **Admin paneli çalışmıyor**
   - JavaScript console'da hata bakın
   - LocalStorage desteği var mı kontrol edin

4. **.htaccess çalışmıyor**
   - Hosting Apache kullanıyor mu kontrol edin
   - mod_rewrite aktif mi kontrol edin

### Hata Mesajları

- **404 hatası**: `404.html` sayfası otomatik gösterilir
- **JavaScript hataları**: Browser console'da detayları görün
- **CSS görünmüyor**: CDN linklerini kontrol edin

## 💰 Maliyet Hesabı

### Basit Hosting (Önerilen)
- **Domain**: ₺50-100/yıl (.com.tr)
- **Hosting**: ₺60-180/yıl (5-15₺/ay)
- **SSL**: ₺0 (çoğu hosting ücretsiz)
- **Toplam**: ₺110-280/yıl

### Premium Hosting
- **Domain**: ₺100-200/yıl (.com)
- **Hosting**: ₺200-500/yıl
- **SSL**: ₺0-100/yıl
- **Toplam**: ₺300-800/yıl

## 📞 Destek

### Hosting Firması Desteği
- Dosya yükleme sorunları
- Domain yönlendirme
- SSL sertifikası

### Teknik Destek
- Kod değişiklikleri
- Özelleştirme talepleri
- Hata düzeltmeleri

---

**Kurulum tamamlandığında sisteminiz hazır!**  
Basit, hızlı ve güvenli web hosting çözümü.

**Son Güncelleme**: 2 Temmuz 2025  
**Versiyon**: 1.0.0 - Statik Web Hosting Uyumlu