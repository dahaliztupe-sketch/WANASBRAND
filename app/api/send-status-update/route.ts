import { NextResponse } from 'next/server';

import { sendStatusUpdateEmail } from '@/lib/services/email.service';

export async function POST(req: Request) {
  try {
    const { email, orderNumber, status, trackingInfo, customerName } = await req.json();
    
    if (email) {
      await sendStatusUpdateEmail(email, orderNumber, status, trackingInfo, customerName);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending status update email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
