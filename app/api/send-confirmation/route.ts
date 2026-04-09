import { NextResponse } from 'next/server';
import { sendReservationEmail } from '@/lib/services/email.service';
import { ReservationItem } from '@/types';


export async function POST(req: Request) {
  try {
    const { reservationId, email, orderNumber, items, totalAmount, magicLinkToken } = await req.json() as {
      reservationId: string;
      email: string;
      orderNumber: string;
      items: ReservationItem[];
      totalAmount: number;
      magicLinkToken: string;
    };
    
    if (email) {
      await sendReservationEmail(reservationId, email, orderNumber, items, totalAmount, magicLinkToken);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
