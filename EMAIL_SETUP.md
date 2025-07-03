# OtoKiwi E-posta Servisi Kurulum Rehberi

## Kendi E-posta Servisimiz

OtoKiwi artık kendi e-posta servisini kullanıyor! Nodemailer ile SMTP üzerinden e-posta gönderebiliyoruz.

## SMTP Ayarları

Aşağıdaki environment variable'ları `.env` dosyasına ekleyin:

```env
# E-posta SMTP Ayarları
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Popüler SMTP Sağlayıcıları

### 1. Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Not:** Gmail için 2FA aktif olmalı ve "Uygulama Şifresi" kullanmalısınız.

### 2. Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### 3. Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### 4. SendGrid SMTP
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### 5. Mailgun SMTP
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username@your-domain.com
SMTP_PASS=your-mailgun-password
```

## Güvenlik

- **Uygulama Şifresi:** Gmail, Yahoo gibi sağlayıcılar için normal şifre yerine uygulama şifresi kullanın
- **2FA:** Mümkünse iki faktörlü kimlik doğrulamayı etkinleştirin
- **Environment Variables:** Hassas bilgileri kodda değil, environment variable'larda saklayın

## Test Etme

E-posta servisi otomatik olarak SMTP bağlantısını test eder:
- ✅ Başarılı: "E-posta servisi hazır ve SMTP bağlantısı başarılı"
- ⚠️ Sorun: "E-posta servisi hazır ama SMTP ayarları gerekiyor"

## Özellikler

- ✅ HTML ve düz metin desteği
- ✅ Güvenli TLS/SSL bağlantı
- ✅ Esnek SMTP sağlayıcı desteği
- ✅ Otomatik bağlantı doğrulama
- ✅ Hata yönetimi ve loglama
- ✅ Şifre sıfırlama e-postaları
- ✅ Admin yanıt e-postaları
- ✅ Şikayet yanıt e-postaları

## Kullanım

```typescript
await sendEmail({
  from: 'kiwipazari@gmail.com',
  to: 'user@example.com',
  subject: 'OtoKiwi - Test E-postası',
  html: '<h1>Merhaba!</h1><p>Bu bir test e-postasıdır.</p>',
  text: 'Merhaba! Bu bir test e-postasıdır.'
});
```

Artık herhangi bir üçüncü parti API'ye bağımlı olmadan e-posta gönderebiliyoruz!