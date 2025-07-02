import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured');
    return false;
  }

  try {
    await sgMail.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    console.log('Email sent successfully to:', params.to);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
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
    from: 'akivi@example.com', // Geçici olarak bu adresi kullanıyoruz
    subject: 'KeyPanel - Geri Bildirim Yanıtınız',
    text: text.trim(),
    html: html.trim()
  });
}