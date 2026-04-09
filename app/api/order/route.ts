import { NextResponse } from 'next/server';
import { sendOrderConfirmation } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email, orderId } = await req.json();
    const magicLink = `https://wanas.app/track?orderId=${orderId}&privacyKey=6772`;

    await sendOrderConfirmation(email, orderId, magicLink);

    return NextResponse.json({ success: true, message: 'Order confirmation sent.' });
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return NextResponse.json({ success: false, message: 'Failed to send order confirmation.' }, { status: 500 });
  }
}
