import { Resend } from 'resend';

import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import { StatusUpdateEmail } from '@/components/emails/StatusUpdateEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.SMTP_FROM || 'atelier@wanasbrand.com';

export async function sendStatusUpdateEmail(email: string, orderId: string, status: 'deposit_paid' | 'shipped', trackingInfo?: string, customerName: string = 'Client') {
  let subject = '';

  if (status === 'deposit_paid') {
    subject = `Deposit Received: #${orderId} | WANAS`;
  } else if (status === 'shipped') {
    subject = `Your Order is on its way: #${orderId} | WANAS`;
  }

  try {
    await resend.emails.send({
      from: `WANAS Atelier <${fromEmail}>`,
      to: email,
      subject: subject,
      react: StatusUpdateEmail({ customerName, orderId, status, trackingInfo }),
    });
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
}

export async function sendOrderConfirmation(email: string, orderId: string, magicLink: string, customerName: string = 'Client') {
  try {
    await resend.emails.send({
      from: `WANAS Atelier <${fromEmail}>`,
      to: email,
      subject: `Reservation Confirmed: #${orderId} | WANAS`,
      react: OrderConfirmationEmail({ customerName, orderId, magicLink }),
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
}
