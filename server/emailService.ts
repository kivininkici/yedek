import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

interface CustomEmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: CustomEmailParams): Promise<boolean> {
  if (!process.env.MAILERSEND_API_KEY) {
    console.error('MailerSend API key not configured');
    return false;
  }

  try {
    const sentFrom = new Sender('noreply@trial-k68zxl24xz7l9yjr.mlsender.net', 'OtoKiwi');
    const recipients = [new Recipient(params.to, 'Kullanıcı')];
    
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(params.subject)
      .setHtml(params.html || params.text || '')
      .setText(params.text || params.html || '');

    const response = await mailerSend.email.send(emailParams);
    console.log('Email sent successfully to:', params.to, 'Response:', response);
    return true;
  } catch (error) {
    console.error('MailerSend email error:', error);
    return false;
  }
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
        <h1 style="margin: 0; font-size: 28px;">KeyPanel Geri Bildirim Yanıtı</h1>
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
            Bu e-posta KeyPanel sisteminden otomatik olarak gönderilmiştir.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `
KeyPanel Geri Bildirim Yanıtı

Merhaba ${userName || 'Değerli Kullanıcımız'},

Geri bildiriminiz için teşekkür ederiz. Ekibimiz yanıtınızı hazırladı:

Orijinal Mesajınız:
"${originalMessage}"
Memnuniyet Seviyesi: ${satisfactionText}

Yanıtımız:
${adminResponse}

Başka sorularınız varsa bize ulaşmaktan çekinmeyin.

Bu e-posta KeyPanel sisteminden otomatik olarak gönderilmiştir.
  `;

  return await sendEmail({
    to: userEmail,
    from: 'kiwipazari@gmail.com',
    subject: 'KeyPanel - Geri Bildirim Yanıtınız',
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
          <h1 style="color: #e74c3c; margin: 0; font-size: 28px;">KeyPanel Şikayet Yanıtı</h1>
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
            Bu e-posta KeyPanel şikayet yönetim sisteminden otomatik olarak gönderilmiştir.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `
KeyPanel Şikayet Yanıtı

Merhaba ${userName || 'Değerli Kullanıcımız'},

"${complaintSubject}" konulu şikayetinizi değerlendirdik ve yanıtımızı hazırladık.

Orijinal Şikayetiniz:
"${originalMessage}"

Yanıtımız:
${adminResponse}

Şikayetinizi ciddiyetle değerlendirdik. Bu yanıt sorununuzu çözmezse, lütfen tekrar iletişime geçmekten çekinmeyin.

Bu e-posta KeyPanel şikayet yönetim sisteminden otomatik olarak gönderilmiştir.
  `;

  return await sendEmail({
    to: userEmail,
    from: 'kiwipazari@gmail.com',
    subject: `KeyPanel - Şikayet Yanıtı: ${complaintSubject}`,
    text: text.trim(),
    html: html.trim()
  });
}

export async function sendPasswordResetEmail(
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