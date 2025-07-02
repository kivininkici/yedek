# KeyPanel - Web Hosting Uyumlu Statik Versiyon

## Genel Bakış

KeyPanel, sosyal medya servisleri için tasarlanmış güvenli anahtar yönetim sistemidir. Bu versiyon tamamen statik HTML/CSS/JavaScript ile geliştirilmiş olup, herhangi bir web hosting firmasında çalışacak şekilde optimize edilmiştir.

## Özellikler

### 🔐 Kullanıcı Özellikleri
- **Key Doğrulama**: Tek kullanımlık anahtarların doğrulanması
- **Servis Seçimi**: Platform bazlı servis seçenekleri (Instagram, YouTube, TikTok)
- **Sipariş Oluşturma**: Hedef URL ve miktar ile sipariş yerme
- **Sipariş Takibi**: Sipariş ID ile durum sorgulama

### ⚙️ Admin Özellikleri
- **Dashboard**: Sistem istatistikleri ve genel bakış
- **Key Yönetimi**: Anahtar oluşturma, düzenleme ve silme
- **Servis Yönetimi**: Servis ekleme ve düzenleme
- **Kullanıcı Yönetimi**: Kullanıcı hesapları kontrolü
- **Sipariş Yönetimi**: Tüm siparişlerin izlenmesi

### 🎨 Teknik Özellikler
- **Responsive Tasarım**: Mobil uyumlu Bootstrap 5 tabanlı arayüz
- **Modern UI**: Font Awesome ikonları ve özel CSS animasyonları
- **Güvenlik**: XSS, CSRF ve clickjacking koruması
- **Performans**: Gzip sıkıştırma ve browser cache optimizasyonu
- **SEO Uyumlu**: Meta taglar ve yapısal veri

## Teknoloji Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3.0
- **İkonlar**: Font Awesome 6.4.0
- **Bildirimler**: SweetAlert2
- **Veri Depolama**: LocalStorage (demo verisi)

## Kurulum

### 1. Dosya Yükleme
```bash
# Tüm dosyaları web hosting public_html klasörüne yükleyin
public_html/
├── index.html          # Ana sayfa
├── .htaccess          # Apache konfigürasyonu
├── 404.html           # Hata sayfası
├── assets/
│   ├── style.css      # Özel CSS
│   └── app.js         # Ana JavaScript
└── README.md          # Bu dosya
```

### 2. Domain Konfigürasyonu
- Domain'inizi hosting klasörüne yönlendirin
- SSL sertifikası aktif edin (önerilen)
- .htaccess dosyasında domain adını güncelleyin

### 3. Test Etme
- Ana sayfaya erişin: `https://yourdomain.com`
- Admin girişi: kullanıcı `admin`, şifre `admin123`
- Demo key'leri test edin: `DEMO-KEY-123456`

## Demo Verileri

### Test Key'leri
- `DEMO-KEY-123456` - Instagram (1000 max, aktif)
- `DEMO-KEY-789012` - YouTube (500 max, kullanıldı)
- `DEMO-KEY-345678` - TikTok (2000 max, aktif)

### Admin Giriş
- **Kullanıcı Adı**: admin
- **Şifre**: admin123

### Demo Servisler
- Instagram Takipçi - ₺5.00 (10-10,000 adet)
- Instagram Beğeni - ₺2.50 (10-5,000 adet)
- YouTube Görüntüleme - ₺8.00 (100-50,000 adet)
- TikTok Takipçi - ₺4.00 (10-15,000 adet)

## Özelleştirme

### CSS Değişkenleri
```css
:root {
    --primary-color: #0d6efd;    /* Ana renk */
    --secondary-color: #6c757d;  /* İkincil renk */
    --success-color: #198754;    /* Başarı rengi */
    --danger-color: #dc3545;     /* Hata rengi */
}
```

### JavaScript Konfigürasyonu
```javascript
// app.js dosyasında sample data'ları değiştirin
const sampleKeys = [...];      // Key listesi
const sampleServices = [...];  // Servis listesi
const sampleOrders = [...];    // Sipariş listesi
```

## Güvenlik

### .htaccess Korumaları
- XSS (Cross-site scripting) koruması
- Clickjacking koruması
- MIME type sniffing engelleme
- Hassas dosya erişimi engelleme

### Content Security Policy
- İzinli CDN'ler: Bootstrap, Font Awesome, Google Fonts
- Inline script/style izinli (gerekli olan yerler için)
- External resource kontrolü

## Performans Optimizasyonları

### Cache Stratejisi
- HTML dosyaları: 1 saat cache
- CSS/JS dosyaları: 1 hafta cache  
- Resimler: 1 ay cache
- Fontlar: 1 yıl cache

### Sıkıştırma
- Gzip sıkıştırma aktif
- Minification önerisi (production için)

## Browser Desteği

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## Hosting Gereksinimleri

### Minimum Gereksinimler
- **Disk Alanı**: 10 MB
- **Bant Genişliği**: 1 GB/ay (küçük trafik için)
- **Apache/Nginx**: .htaccess desteği
- **SSL**: Önerilen

### Önerilen Hosting Firmaları
- **Türkiye**: Turhost, Hosting.com.tr, Hostinger
- **Global**: Hostinger, SiteGround, Bluehost

## Sorun Giderme

### Yaygın Sorunlar

1. **CSS/JS yüklenmiyor**
   - CDN bağlantılarını kontrol edin
   - .htaccess cache ayarlarını kontrol edin

2. **Admin paneli açılmıyor**
   - JavaScript console'da hata kontrol edin
   - LocalStorage desteğini kontrol edin

3. **Mobile görünümde sorun**
   - Viewport meta tag'ini kontrol edin
   - Bootstrap responsive classes'ları kontrol edin

## Lisans

Bu proje özel kullanım için geliştirilmiştir. Ticari kullanım için izin gereklidir.

## İletişim

Teknik destek için sistem yöneticisiyle iletişime geçin.

---
**Son Güncelleme**: 2 Temmuz 2025  
**Versiyon**: 1.0.0 (Statik Web Hosting)