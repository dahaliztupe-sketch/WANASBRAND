/**
 * Email Marketing Automation for WANAS Atelier.
 * Uses Resend API for transactional + campaign emails.
 */

const RESEND_API = 'https://api.resend.com';

function headers() {
  return {
    Authorization: `Bearer ${process.env.RESEND_API_KEY ?? ''}`,
    'Content-Type': 'application/json',
  };
}

const FROM = process.env.SMTP_FROM ?? 'WANAS Atelier <no-reply@wanas-atelier.com>';

function luxuryEmailWrapper(content: string, arabicTitle: string, enTitle?: string) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${arabicTitle}</title>
</head>
<body style="margin:0;padding:0;background:#FDFBF7;font-family:'Tajawal',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF7;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#FDFBF7;border:1px solid #D1C7B7;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px;border-bottom:1px solid #D4AF37;">
              <p style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:28px;color:#1A1A1A;letter-spacing:0.3em;">WANAS</p>
              <p style="margin:4px 0 0;font-size:10px;color:#D4AF37;letter-spacing:0.2em;text-transform:uppercase;">ATELIER</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px;border-top:1px solid #D1C7B7;background:#F5F0E6;">
              <p style="margin:0;font-size:11px;color:#4A4A4A;">أتيليه وناس — حيث تلتقي الحرفية بالأناقة</p>
              <p style="margin:4px 0 0;font-size:10px;color:#D1C7B7;">للإلغاء من القائمة البريدية، تواصلي معنا عبر واتساب</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendEmail(to: string | string[], subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[EmailMarketing] RESEND_API_KEY missing — email skipped');
    return { success: false };
  }

  try {
    const res = await fetch(`${RESEND_API}/emails`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ from: FROM, to: Array.isArray(to) ? to : [to], subject, html }),
    });
    const data = await res.json() as { id?: string };
    if (!res.ok) { console.error('[EmailMarketing] Send error:', data); return { success: false, error: data }; }
    return { success: true, emailId: data.id };
  } catch (e) {
    console.error('[EmailMarketing] Request failed:', e);
    return { success: false, error: e };
  }
}

export const sendSegmentedCampaign = async (
  segment: 'VIP' | 'AbandonedCart' | 'Anniversary',
  recipientEmails: string[],
  customData?: Record<string, string>
) => {
  const campaigns = {
    VIP: {
      subject: 'عروض حصرية لكِ من أتيليه وناس 🌸',
      content: `
        <h2 style="font-family:'Playfair Display',serif;color:#1A1A1A;font-size:24px;">عميلتنا العزيزة</h2>
        <p style="color:#4A4A4A;line-height:1.8;">بصفتكِ من عميلاتنا المميزات، يسعدنا إطلاعكِ على أحدث تشكيلاتنا الحصرية قبل أي شخص آخر.</p>
        <p style="color:#4A4A4A;line-height:1.8;">${customData?.body ?? 'اكتشفي قطعنا الجديدة واحجزي موعد مجاني لتجربتها في الأتيليه.'}</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="https://wanas-atelier.com/collections" style="background:#D4AF37;color:#1A1A1A;padding:14px 32px;text-decoration:none;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">استكشفي التشكيلة</a>
        </div>
      `,
    },
    AbandonedCart: {
      subject: 'قطعتكِ لا تزال بانتظاركِ ✨',
      content: `
        <h2 style="font-family:'Playfair Display',serif;color:#1A1A1A;font-size:24px;">نسيتِ شيئاً؟</h2>
        <p style="color:#4A4A4A;line-height:1.8;">القطعة التي اخترتِها لا تزال محجوزة لكِ مؤقتاً في أتيليه وناس.</p>
        <p style="color:#4A4A4A;line-height:1.8;">أتمي حجزكِ الآن قبل نفاد الكمية المحدودة.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="https://wanas-atelier.com" style="background:#1A1A1A;color:#FDFBF7;padding:14px 32px;text-decoration:none;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">أكملي حجزكِ</a>
        </div>
      `,
    },
    Anniversary: {
      subject: `عيد ميلاد سعيد ${customData?.name ?? ''} 🎂`,
      content: `
        <h2 style="font-family:'Playfair Display',serif;color:#D4AF37;font-size:24px;">كل عام وأنتِ بخير</h2>
        <p style="color:#4A4A4A;line-height:1.8;">في هذا اليوم الاستثنائي، يهديكِ أتيليه وناس خصم خاصاً احتفالاً بكِ.</p>
        <p style="color:#D4AF37;font-size:18px;text-align:center;padding:16px;">كود الخصم: <strong>${customData?.couponCode ?? 'BIRTHDAY20'}</strong></p>
        <div style="text-align:center;margin:32px 0;">
          <a href="https://wanas-atelier.com/collections" style="background:#D4AF37;color:#1A1A1A;padding:14px 32px;text-decoration:none;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">تسوّقي الآن</a>
        </div>
      `,
    },
  };

  const campaign = campaigns[segment];
  const html = luxuryEmailWrapper(campaign.content, campaign.subject);

  const results = await Promise.allSettled(
    recipientEmails.map(email => sendEmail(email, campaign.subject, html))
  );

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  console.info(`[EmailMarketing] ${segment} campaign: ${succeeded}/${recipientEmails.length} sent`);
  return { succeeded, total: recipientEmails.length };
};

export const setupEmailAutomation = () => ({
  onReservationCreated: async (reservationId: string, to: string, customerName: string) => {
    const html = luxuryEmailWrapper(`
      <h2 style="font-family:'Playfair Display',serif;color:#1A1A1A;">شكراً لكِ، ${customerName}</h2>
      <p style="color:#4A4A4A;line-height:1.8;">تم استلام حجزكِ رقم <strong>#${reservationId}</strong> بنجاح.</p>
      <p style="color:#4A4A4A;line-height:1.8;">سيتواصل معكِ فريقنا خلال 24 ساعة لتأكيد موعد التجربة في الأتيليه.</p>
    `, 'تأكيد الحجز — وناس أتيليه');
    return sendEmail(to, `تأكيد الحجز #${reservationId} — وناس أتيليه`, html);
  },

  onShipped: async (reservationId: string, to: string, trackingNumber?: string) => {
    const html = luxuryEmailWrapper(`
      <h2 style="font-family:'Playfair Display',serif;color:#1A1A1A;">طلبكِ في الطريق إليكِ 📦</h2>
      <p style="color:#4A4A4A;line-height:1.8;">تم شحن طلبكِ رقم <strong>#${reservationId}</strong>.</p>
      ${trackingNumber ? `<p style="color:#D4AF37;">رقم التتبع: <strong>${trackingNumber}</strong></p>` : ''}
    `, 'تم الشحن — وناس أتيليه');
    return sendEmail(to, `تم شحن طلبكِ #${reservationId}`, html);
  },

  onDelivered: async (reservationId: string, to: string) => {
    const html = luxuryEmailWrapper(`
      <h2 style="font-family:'Playfair Display',serif;color:#D4AF37;">وصلت قطعتكِ بسلامة ✨</h2>
      <p style="color:#4A4A4A;line-height:1.8;">نأمل أن تنعمي بقطعتكِ من أتيليه وناس.</p>
      <p style="color:#4A4A4A;line-height:1.8;">يسعدنا معرفة رأيكِ — شاركينا تجربتكِ.</p>
    `, 'تم التسليم — وناس أتيليه');
    return sendEmail(to, 'وصلت قطعتكِ بسلامة 🌸', html);
  },

  onInactive: async (userId: string, to: string, name: string) => {
    const html = luxuryEmailWrapper(`
      <h2 style="font-family:'Playfair Display',serif;color:#1A1A1A;">نفتقد وجودكِ، ${name} 🌸</h2>
      <p style="color:#4A4A4A;line-height:1.8;">لقد مرّ وقت منذ زيارتكِ الأخيرة لأتيليه وناس.</p>
      <p style="color:#4A4A4A;line-height:1.8;">اكتشفي تشكيلاتنا الجديدة واحجزي موعداً مجانياً للمشاورة.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://wanas-atelier.com" style="background:#D4AF37;color:#1A1A1A;padding:14px 32px;text-decoration:none;font-size:12px;letter-spacing:0.2em;">عودي إلينا</a>
      </div>
    `, 'نفتقدكِ — وناس أتيليه');
    return sendEmail(to, 'نفتقد وجودكِ في وناس أتيليه 🌸', html);
  },
});
