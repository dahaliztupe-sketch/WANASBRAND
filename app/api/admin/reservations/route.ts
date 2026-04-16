import { NextResponse } from 'next/server';

import { db } from '@/lib/firebase/server';
import { decryptPII } from '@/lib/utils/encryption';
import { Reservation } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') || 'active';
  const limitCount = parseInt(searchParams.get('limit') || '100');

  try {
    let query: FirebaseFirestore.Query = db.collection('reservations').orderBy('createdAt', 'desc');
    
    if (statusFilter === 'active') {
      query = query.where('status', 'in', ['pending_contact', 'contacted', 'deposit_paid', 'in_production']);
    } else if (statusFilter !== 'all') {
      query = query.where('status', '==', statusFilter);
    }

    if (limitCount > 0) {
      query = query.limit(limitCount);
    }

    const snapshot = await query.get();
    const reservations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        customerInfo: {
          ...data.customerInfo,
          phone: decryptPII(data.customerInfo.phone),
        }
      } as Reservation;
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching admin reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}
