import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

import { db } from '@/lib/firebase/server';
import { decryptPII } from '@/lib/utils/encryption';
import { Reservation } from '@/types';
import { logAdminAction } from '@/lib/services/audit.service';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret_change_me_in_production';
const secret = new TextEncoder().encode(SESSION_SECRET);

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const sessionToken = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(sessionToken, secret);
    const adminId = payload.uid as string;

    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const reservationRef = db.collection('reservations').doc(id);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const oldData = reservationDoc.data();

    await reservationRef.update({
      status,
      updatedAt: new Date().toISOString(),
    });

    await logAdminAction(
      adminId,
      'update_reservation_status',
      'reservation',
      id,
      oldData?.status,
      status
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
