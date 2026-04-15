import { Resend } from 'resend';
import { CreateEmailOptions, CreateEmailResponse } from 'resend/build/src/emails/interfaces';

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

async function sendWithRetry(params: CreateEmailOptions, maxRetries = 2): Promise<CreateEmailResponse> {
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
