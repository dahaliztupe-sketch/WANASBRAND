import { Resend } from 'resend';

import { ReservationConfirmationEmail } from '@/components/emails/ReservationConfirmationEmail';
import { StatusUpdateEmail } from '@/components/emails/StatusUpdateEmail';

let resend: Resend | null = null;

try {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    resend = new Resend(apiKey);
  } else {
    console.warn('⚠️ RESEND_API_KEY is missing. Email features will be disabled.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Resend:', error);
}

const fromEmail = process.env.SMTP_FROM || 'atelier@wanasbrand.com';

export async function sendEmailWithRetry(
  to: string,
  subject: string,
  html: string,
  maxRetries = 3
): Promise<{ success: boolean; queued?: boolean }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!resend) throw new Error('Resend not initialized');
      await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
      });
      return { success: true };
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`Failed to send email after ${maxRetries} attempts:`, error);
        // Save to queue logic could go here
        return { success: false, queued: true };
      }
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  return { success: false };
}

async function sendWithRetry(params: Record<string, unknown>, maxRetries = 2): Promise<Record<string, unknown>> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (!resend) throw new Error('Resend not initialized');
      return await resend.emails.send(params);
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

export async function sendStatusUpdateEmail(email: string, reservationNumber: string, status: 'deposit_paid' | 'shipped', trackingInfo?: string, customerName: string = 'Client') {
  if (!resend) {
    console.warn('Skipping email send: Resend not initialized.');
    return;
  }
  
  let subject = '';

  if (status === 'deposit_paid') {
    subject = `Deposit Received: #${reservationNumber} | WANAS`;
  } else if (status === 'shipped') {
    subject = `Your Reservation is on its way: #${reservationNumber} | WANAS`;
  }

  try {
    await sendWithRetry({
      from: `WANAS Atelier <${fromEmail}>`,
      to: email,
      subject: subject,
      react: StatusUpdateEmail({ customerName, reservationNumber, status, trackingInfo }),
    });
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
}

export async function sendReservationConfirmation(email: string, reservationId: string, magicLink: string, customerName: string = 'Client') {
  if (!resend) {
    console.warn('Skipping email send: Resend not initialized.');
    return;
  }
  
  try {
    await sendWithRetry({
      from: `WANAS Atelier <${fromEmail}>`,
      to: email,
      subject: `Reservation Confirmed: #${reservationId} | WANAS`,
      react: ReservationConfirmationEmail({ customerName, reservationId, magicLink }),
    });
  } catch (error) {
    console.error('Error sending reservation confirmation email:', error);
  }
}
