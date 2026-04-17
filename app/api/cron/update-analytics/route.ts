import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';

import { db } from '@/lib/firebase/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // 1. Aggregate Reservations & Revenue using Admin SDK syntax
    const reservationsSnap = await db.collection('reservations').get();
    const totalReservations = reservationsSnap.size;
    let totalRevenue = 0;

    reservationsSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.status === 'deposit_paid' || data.status === 'delivered' || data.status === 'shipped') {
        totalRevenue += data.financials?.total || data.totalAmount || 0;
      }
    });

    // 2. Aggregate Users using Admin SDK syntax
    const usersSnap = await db.collection('users').get();
    const totalUsers = usersSnap.size;

    // 3. Write to stats/latest using Admin SDK syntax
    await db.collection('stats').doc('latest').set({
      totalReservations,
      totalRevenue,
      totalUsers,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      stats: {
        totalReservations,
        totalRevenue,
        totalUsers,
      }
    });
  } catch (error) {
    console.error('Cron Analytics Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update analytics' }, { status: 500 });
  }
}
