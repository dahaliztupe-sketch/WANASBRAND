import nodemailer from 'nodemailer';
import { ReservationItem } from '@/types';
import { db } from '@/lib/firebase/server';

const getTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
});

export async function sendStatusUpdateEmail(
  customerEmail: string,
  orderNumber: string,
  status: 'deposit_paid' | 'shipped',
  trackingInfo?: string,
  customerName: string = 'Client'
) {
  const transporter = getTransporter();

  let subject = '';
  let message = '';

  if (status === 'deposit_paid') {
    subject = `Deposit Received: #${orderNumber} | WANAS`;
    message = `Your deposit is received, weaving has begun.`;
  } else if (status === 'shipped') {
    subject = `Your Order is on its way: #${orderNumber} | WANAS`;
    message = `Your sanctuary piece is on its way.${trackingInfo ? ` Tracking: ${trackingInfo}` : ''}`;
  }

  const htmlContent = `
    <div style="font-family: 'Georgia', serif; background-color: #F9F7F5; color: #1A1A1A; padding: 40px; max-width: 600px; margin: 0 auto;">
      <h1 style="text-align: center; font-weight: normal; margin-bottom: 30px; letter-spacing: 2px;">AURA</h1>
      <p style="font-size: 16px; line-height: 1.6;">Dear ${customerName},</p>
      <p style="font-size: 16px; line-height: 1.6;">${message}</p>
      <p style="font-size: 14px; color: #555; text-align: center; margin-top: 40px;">
        Should you have any enquiries, please reply to this email.<br>
        With elegance,<br>
        The WANAS Concierge
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: '"WANAS Concierge" <concierge@wanasbrand.com>',
    to: customerEmail,
    subject: subject,
    html: htmlContent,
  });
}

export async function sendReservationEmail(
  reservationId: string,
  customerEmail: string,
  orderNumber: string,
  items: ReservationItem[],
  totalAmount: number,
  magicLinkToken: string
) {
  const transporter = getTransporter();

  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track?token=${magicLinkToken}`;

  const htmlContent = `
    <div style="font-family: 'Georgia', serif; background-color: #F9F7F5; color: #1A1A1A; padding: 40px; max-width: 600px; margin: 0 auto;">
      <h1 style="text-align: center; font-weight: normal; margin-bottom: 30px; letter-spacing: 2px;">AURA</h1>
      <p style="font-size: 16px; line-height: 1.6;">Thank you for your reservation at The Atelier.</p>
      <p style="font-size: 16px; line-height: 1.6;">Your reservation <strong>${orderNumber}</strong> has been received and is currently being reviewed by our concierge team.</p>
      
      <div style="margin: 30px 0; border-top: 1px solid #EAE5E5; border-bottom: 1px solid #EAE5E5; padding: 20px 0;">
        <h2 style="font-size: 18px; font-weight: normal; margin-bottom: 20px;">The Collection Details</h2>
        ${items.map(item => `
          <div style="margin-bottom: 10px;">
            <p style="margin: 0;">${item.productName} (x${item.quantity})</p>
            <p style="margin: 0; color: #555; font-size: 14px;">Size: ${item.variant.size} | Color: ${item.variant.color}</p>
          </div>
        `).join('')}
        <p style="margin-top: 20px; font-weight: bold;">Total: EGP ${totalAmount.toLocaleString()}</p>
      </div>

      <p style="font-size: 16px; line-height: 1.6;">You may track the status of your reservation at any time using your personal magic link:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${trackingUrl}" style="background-color: #1A1A1A; color: #F9F7F5; padding: 12px 24px; text-decoration: none; font-family: sans-serif; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Track Reservation</a>
      </div>

      <p style="font-size: 14px; color: #555; text-align: center; margin-top: 40px;">
        Should you have any enquiries, please reply to this email.<br>
        With elegance,<br>
        The WANAS Concierge
      </p>
    </div>
  `;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      await transporter.sendMail({
        from: '"WANAS Concierge" <concierge@wanasbrand.com>',
        to: customerEmail,
        subject: `Your WANAS Reservation ${orderNumber}`,
        html: htmlContent,
      });
      const firestore = db;
      if (firestore) {
        await firestore.collection('reservations').doc(reservationId).update({ emailDeliveryStatus: 'sent' });
      }
      return;
    } catch (error) {
      attempts++;
      console.error(`Error sending email (attempt ${attempts}):`, error);
      if (attempts >= maxAttempts) {
        const firestore = db;
        if (firestore) {
          await firestore.collection('reservations').doc(reservationId).update({ emailDeliveryStatus: 'failed' });
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
      }
    }
  }
}
