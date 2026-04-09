import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendStatusUpdateEmail(email: string, orderId: string, status: 'deposit_paid' | 'shipped', trackingInfo?: string, customerName: string = 'Client') {
  let subject = '';
  let message = '';

  if (status === 'deposit_paid') {
    subject = `Deposit Received: #${orderId} | WANAS`;
    message = `Your deposit is received, weaving has begun.`;
  } else if (status === 'shipped') {
    subject = `Your Order is on its way: #${orderId} | WANAS`;
    message = `Your sanctuary piece is on its way.${trackingInfo ? ` Tracking: ${trackingInfo}` : ''}`;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', sans-serif; color: #1a1a1a;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td align="center" style="padding-bottom: 60px;">
            <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 400; letter-spacing: 8px; margin: 0; text-transform: uppercase;">WANAS</h1>
          </td>
        </tr>
        <tr>
          <td>
            <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 400; margin-bottom: 20px;">Reservation Update</h2>
            <p style="font-size: 16px; line-height: 1.8; font-weight: 300;">
              Dear ${customerName},<br><br>
              ${message}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 40px; border-top: 1px solid #eeeeee;">
            <p style="font-size: 14px; margin-top: 30px;">
              With elegance,<br>
              <strong>The WANAS Team</strong>
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"WANAS Atelier" <${process.env.SMTP_FROM || 'atelier@wanasbrand.com'}>`,
    to: email,
    subject: subject,
    html: html,
  });
}

export async function sendOrderConfirmation(email: string, orderId: string, magicLink: string, customerName: string = 'Client') {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', sans-serif; color: #1a1a1a;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td align="center" style="padding-bottom: 60px;">
            <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 400; letter-spacing: 8px; margin: 0; text-transform: uppercase;">WANAS</h1>
            <p style="font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #888; margin-top: 10px;">Atelier de Haute Couture</p>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 30px;">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 400; margin-bottom: 20px;">Confirmation of Reservation</h2>
            <p style="font-size: 16px; line-height: 1.8; font-weight: 300;">
              Dear ${customerName},<br><br>
              It is our distinct pleasure to confirm that your reservation <strong>#${orderId}</strong> has been received at the WANAS Atelier. 
              Our master artisans are now preparing to bring your selection to life with the meticulous care it deserves.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 40px 0;">
            <div style="background-color: #f9f9f9; padding: 40px; border-radius: 2px;">
              <p style="font-size: 14px; color: #666; margin-bottom: 25px; letter-spacing: 1px;">Access your private tracking portal via the link below:</p>
              <a href="${magicLink}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 18px 45px; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Enter Private Portal</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 40px; border-top: 1px solid #eeeeee;">
            <p style="font-size: 14px; line-height: 1.8; color: #666; font-weight: 300;">
              Should you require any assistance, our Client Services team is available to guide you through your journey with WANAS.
            </p>
            <p style="font-size: 14px; margin-top: 30px;">
              With elegance,<br>
              <strong>The WANAS Team</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top: 80px; font-size: 10px; color: #aaa; letter-spacing: 1px; text-transform: uppercase;">
            &copy; 2026 WANAS Fashion House | Cairo, Egypt
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"WANAS Atelier" <${process.env.SMTP_FROM || 'atelier@wanasbrand.com'}>`,
    to: email,
    subject: `Reservation Confirmed: #${orderId} | WANAS`,
    html: html,
  });
}
