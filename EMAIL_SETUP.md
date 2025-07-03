# E-posta Kurulum Rehberi

## SendGrid Kurulumu

OtoKiwi sistemi şu anda SendGrid üzerinden e-posta göndermeye çalışıyor ancak domain doğrulaması gerekiyor.

### Sorunu Çözmek İçin:

1. **SendGrid Dashboard'a gidin** → https://app.sendgrid.com/
2. **Sender Authentication** → https://app.sendgrid.com/settings/sender_auth
3. **Single Sender Verification** seçeneğini kullanın
4. Bu e-posta adreslerinden birini verify edin:
   - myazar483@gmail.com (mevcut hesabınız)
   - admin@smmkiwi.com 
   - support@smmkiwi.com

### Hızlı Çözüm:
SendGrid'de "Single Sender" olarak myazar483@gmail.com adresini verify edin:
1. SendGrid → Settings → Sender Authentication
2. "Verify a Single Sender" butonuna tıklayın
3. myazar483@gmail.com adresini girin ve verify edin
4. Verify edildikten sonra bu e-posta adresi "from" olarak kullanılabilir

### Sistem Güncellemesi:
Verified e-posta adresinizi SENDGRID_FROM_EMAIL environment variable'ı olarak ekleyin.

### Test:
Verify işlemi tamamlandıktan sonra şifre sıfırlama sistemi çalışacak.