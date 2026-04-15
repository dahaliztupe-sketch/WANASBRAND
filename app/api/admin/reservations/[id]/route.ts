import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/server';
import { decryptPII } from '@/lib/utils/encryption';
import { Reservation } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { id } = await params;

  try {
    const doc = await db.collection('reservations').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const data = doc.data()!;
    const reservation = {
      ...data,
      id: doc.id,
      customerInfo: {
        ...data.customerInfo,
        phone: decryptPII(data.customerInfo.phone),
        address: data.customerInfo.address ? decryptPII(data.customerInfo.address) : '',
      }
    } as Reservation;

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error fetching admin reservation:', error);
    return NextResponse.json({ error: 'Failed to fetch reservation' }, { status: 500 });
  }
}
