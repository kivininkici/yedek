import nodemailer from 'nodemailer';
import Mailjet from 'node-mailjet';
import fs from 'fs';
import path from 'path';

// E-posta servis türünü belirle
let emailService: 'smtpcom' | 'mailjet' | 'smtp' | 'console' = 'console';
let transporter: nodemailer.Transporter;
let mailjetClient: any;

// SMTP.com API kontrol et (en basit seçenek)
if (process.env.SMTP_COM_API_KEY) {
  emailService = 'smtpcom';
  console.log('✅ SMTP.com e-posta servisi hazır');
} else if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
  emailService = 'mailjet';
  mailjetClient = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
  );
  console.log('✅ Mailjet e-posta servisi hazır');
} else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  // Gerçek SMTP ayarları varsa onları kullan
  emailService = 'smtp';
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  };
  
  transporter = nodemailer.createTransport(smtpConfig);
  
  // SMTP bağlantısını doğrula
  transporter.verify().then(() => {
    console.log('✅ E-posta servisi hazır ve SMTP bağlantısı başarılı');
  }).catch((error: any) => {
    console.log('⚠️ E-posta servisi hazır ama SMTP ayarları gerekiyor:', error.message);
  });
} else {
  // Konsol modu - e-postaları gerçekten göndermeyen basit mod
  emailService = 'console';
  const smtpConfig = {
    streamTransport: true,
    newline: 'unix',
    buffer: true
  };
  transporter = nodemailer.createTransport(smtpConfig);
  console.log('📧 E-posta servisi konsol modunda hazır');
}

// E-posta template'ini oku ve customize et
function loadEmailTemplate(templateName: string, variables: Record<string, string>): string {
  try {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Template değişkenlerini değiştir
    for (const [key, value] of Object.entries(variables)) {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return template;
  } catch (error) {
    console.error('Template yükleme hatası:', error);
    return '';
  }
}

interface CustomEmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: CustomEmailParams): Promise<boolean> {
  try {
    if (emailService === 'smtpcom') {
      // SMTP.com API ile e-posta gönder
      const response = await fetch('https://api.smtp.com/v4/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SMTP_COM_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          subject: params.subject,
          from: {
            address: 'noreply@smmkiwi.com',
            name: 'OtoKiwi'
          },
          to: [
            {
              address: params.to
            }
          ],
          text: params.text || '',
          html: params.html || params.text || ''
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ SMTP.com e-posta gönderildi:', params.to, 'Message ID:', result.data?.message_id);
        return true;
      } else {
        const error = await response.text();
        console.error('SMTP.com e-posta hatası:', error);
        return false;
      }
    } else if (emailService === 'mailjet') {
      // Mailjet ile e-posta gönder
      const request = mailjetClient.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'noreply@smmkiwi.com',
              Name: 'OtoKiwi'
            },
            To: [
              {
                Email: params.to,
                Name: params.to.split('@')[0]
              }
            ],
            Subject: params.subject,
            TextPart: params.text || '',
            HTMLPart: params.html || params.text || ''
          }
        ]
      });

      const result = await request;
      console.log('✅ Mailjet e-posta gönderildi:', params.to, 'Status:', result.body.Messages[0].Status);
      return true;
    } else if (emailService === 'smtp') {
      // SMTP ile e-posta gönder
      const mailOptions = {
        from: `"OtoKiwi" <noreply@smmkiwi.com>`,
        to: params.to,
        subject: params.subject,
        text: params.text || '',
        html: params.html || params.text || '',
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ SMTP e-posta gönderildi:', params.to, 'Message ID:', info.messageId);
      return true;
    } else {
      // Konsol modunda - e-posta içeriğini konsola yazdır
      console.log('\n📧 E-POSTA GÖNDERİLDİ (KONSOL MODU):');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('From: noreply@smmkiwi.com');
      console.log('To:', params.to);
      console.log('Subject:', params.subject);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(params.text || 'HTML içerik mevcut');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return true;
    }
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    return false;
  }
}

// Şifre sıfırlama e-postası gönder
export async function sendPasswordResetEmailNew(email: string, resetToken: string, baseUrl: string): Promise<boolean> {
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const htmlTemplate = loadEmailTemplate('passwordReset', {
    RESET_URL: resetUrl
  });
  
  const textMessage = `
OtoKiwi Şifre Sıfırlama

Merhaba,

Şifre sıfırlama talebinizi aldık. Yeni şifrenizi ayarlamak için aşağıdaki linki kullanın:

${resetUrl}

Bu link 60 dakika boyunca geçerlidir.

Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.

© 2025 OtoKiwi
smmkiwi.com
  `;
  
  return await sendEmail({
    to: email,
    from: 'noreply@smmkiwi.com',
    subject: 'OtoKiwi - Şifre Sıfırlama',
    text: textMessage,
    html: htmlTemplate
  });
}

export async function sendFeedbackResponse(
  userEmail: string,
  userName: string,
  originalMessage: string,
  adminResponse: string,
  satisfactionLevel?: string
): Promise<boolean> {
  const satisfactionText = satisfactionLevel ? ({
    'unsatisfied': 'Memnun Değil',
    'neutral': 'Normal',
    'satisfied': 'Memnun'
  }[satisfactionLevel] || 'Belirtilmemiş') : 'Belirtilmemiş';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">OtoKiwi Geri Bildirim Yanıtı</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Geri bildiriminize yanıt verdik!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <div style="margin-bottom: 25px;">
          <h2 style="color: #333; margin-bottom: 10px;">Merhaba ${userName || 'Değerli Kullanıcımız'},</h2>
          <p style="color: #666; line-height: 1.6;">
            Geri bildiriminiz için teşekkür ederiz. Ekibimiz yanıtınızı hazırladı:
          </p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
          <h3 style="color: #333; margin-top: 0;">Orijinal Mesajınız:</h3>
          <p style="color: #555; font-style: italic;">"${originalMessage}"</p>
          <p style="color: #666; font-size: 14px; margin-bottom: 0;">
            Memnuniyet Seviyesi: <strong>${satisfactionText}</strong>
          </p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #28a745;">
          <h3 style="color: #333; margin-top: 0;">Yanıtımız:</h3>
          <p style="color: #555; line-height: 1.6;">${adminResponse}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; margin-bottom: 15px;">
            Başka sorularınız varsa bize ulaşmaktan çekinmeyin.
          </p>
          <p style="color: #999; font-size: 14px; margin: 0;">
            Bu e-posta OtoKiwi sisteminden otomatik olarak gönderilmiştir.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `
OtoKiwi Geri Bildirim Yanıtı

Merhaba ${userName || 'Değerli Kullanıcımız'},

Geri bildiriminiz için teşekkür ederiz. Ekibimiz yanıtınızı hazırladı:

Orijinal Mesajınız:
"${originalMessage}"
Memnuniyet Seviyesi: ${satisfactionText}

Yanıtımız:
${adminResponse}

Başka sorularınız varsa bize ulaşmaktan çekinmeyin.

Bu e-posta OtoKiwi sisteminden otomatik olarak gönderilmiştir.
  `;

  return await sendEmail({
    to: userEmail,
    from: 'noreply@smmkiwi.com',
    subject: 'OtoKiwi - Geri Bildirim Yanıtınız',
    text: text.trim(),
    html: html.trim()
  });
}

export async function sendComplaintResponse(
  userEmail: string,
  userName: string,
  complaintSubject: string,
  originalMessage: string,
  adminResponse: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: #fff; border-radius: 8px; padding: 30px; border: 2px solid #e74c3c;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e74c3c; margin: 0; font-size: 28px;">OtoKiwi Şikayet Yanıtı</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Şikayetiniz değerlendirildi</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Merhaba ${userName || 'Değerli Kullanıcımız'},</h3>
          <p style="color: #555; line-height: 1.6; margin: 0;">
            "${complaintSubject}" konulu şikayetinizi değerlendirdik ve yanıtımızı hazırladık.
          </p>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
          <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">Orijinal Şikayetiniz:</h4>
          <p style="color: #856404; margin: 0; font-style: italic;">"${originalMessage}"</p>
        </div>

        <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin-bottom: 20px;">
          <h4 style="color: #0c5460; margin: 0 0 10px 0; font-size: 16px;">Yanıtımız:</h4>
          <p style="color: #0c5460; margin: 0; line-height: 1.6;">${adminResponse}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #555; line-height: 1.6; margin: 0 0 15px 0;">
            Şikayetinizi ciddiyetle değerlendirdik. Bu yanıt sorununuzu çözmezse, 
            lütfen tekrar iletişime geçmekten çekinmeyin.
          </p>
          <p style="color: #999; font-size: 14px; margin: 0;">
            Bu e-posta OtoKiwi şikayet yönetim sisteminden otomatik olarak gönderilmiştir.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `
OtoKiwi Şikayet Yanıtı

Merhaba ${userName || 'Değerli Kullanıcımız'},

"${complaintSubject}" konulu şikayetinizi değerlendirdik ve yanıtımızı hazırladık.

Orijinal Şikayetiniz:
"${originalMessage}"

Yanıtımız:
${adminResponse}

Şikayetinizi ciddiyetle değerlendirdik. Bu yanıt sorununuzu çözmezse, lütfen tekrar iletişime geçmekten çekinmeyin.

Bu e-posta OtoKiwi şikayet yönetim sisteminden otomatik olarak gönderilmiştir.
  `;

  return await sendEmail({
    to: userEmail,
    from: 'noreply@smmkiwi.com',
    subject: `OtoKiwi - Şikayet Yanıtı: ${complaintSubject}`,
    text: text.trim(),
    html: html.trim()
  });
}

export async function sendPasswordResetEmailOld(
  userEmail: string,
  userName: string,
  resetUrl: string
): Promise<boolean> {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 40px 20px;">
      <div style="background: white; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: bold;">
            🔐 OtoKiwi Şifre Sıfırlama
          </h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">
            Admin panel şifrenizi sıfırlamak için
          </p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 25px; margin: 20px 0;">
          <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">
            Merhaba ${userName || 'Admin Kullanıcısı'},
          </h2>
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">
            OtoKiwi admin paneli için şifre sıfırlama talebinde bulundunuz. 
            Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" 
               style="background: #2563eb; color: white; text-decoration: none; 
                      padding: 15px 30px; border-radius: 8px; font-weight: bold; 
                      display: inline-block; font-size: 16px;">
              Şifremi Sıfırla
            </a>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              ⚠️ <strong>Güvenlik Uyarısı:</strong> Bu link 1 saat içinde geçerliliğini yitirecektir.
              Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı göz ardı edebilirsiniz.
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #555; line-height: 1.6; margin: 0 0 15px 0;">
            Sorun yaşıyorsanız, link yerine aşağıdaki URL'yi tarayıcınıza kopyalayabilirsiniz:
          </p>
          <p style="color: #999; font-size: 12px; word-break: break-all; margin: 0 0 15px 0;">
            ${resetUrl}
          </p>
          <p style="color: #999; font-size: 14px; margin: 0;">
            Bu e-posta OtoKiwi güvenlik sisteminden otomatik olarak gönderilmiştir.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `
OtoKiwi Şifre Sıfırlama

Merhaba ${userName || 'Admin Kullanıcısı'},

OtoKiwi admin paneli için şifre sıfırlama talebinde bulundunuz.

Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:
${resetUrl}

Güvenlik Uyarısı: Bu link 1 saat içinde geçerliliğini yitirecektir.
Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı göz ardı edebilirsiniz.

Bu e-posta OtoKiwi güvenlik sisteminden otomatik olarak gönderilmiştir.
  `;

  return await sendEmail({
    to: userEmail,
    from: 'noreply@smmkiwi.com',
    subject: 'OtoKiwi - Şifre Sıfırlama Talebi',
    text: text.trim(),
    html: html.trim()
  });
}