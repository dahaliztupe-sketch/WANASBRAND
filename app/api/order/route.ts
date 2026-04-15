import { NextResponse } from 'next/server';

import { db } from '@/lib/firebase/server';
import { sendWhatsAppNotification, templates, generateCartToken } from '@/lib/integrations/whatsapp';

export async function POST(req: Request) {
  try {
    // 1. Check Idempotency Key
    const idempotencyKey = req.headers.get('X-Idempotency-Key');
    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Missing X-Idempotency-Key header' }, { status: 400 });
    }

    const firestore = db;
    if (!firestore) throw new Error('Database not initialized');

    // Check if reservation already exists with this key
    const existingReservationQuery = await firestore.collection('reservations')
      .where('idempotencyKey', '==', idempotencyKey)
      .limit(1)
      .get();

    if (!existingReservationQuery.empty) {
      return NextResponse.json({ 
        success: true, 
        message: 'Reservation already processed', 
        reservationId: existingReservationQuery.docs[0].id,
        isDuplicate: true 
      });
    }

    const body = await req.json();
    const { customerInfo, items, totalAmount } = body;

    // 3. Phase 1: Write to Firestore with 'pending_whatsapp' status
    const reservationRef = firestore.collection('reservations').doc();
    const reservationData = {
      idempotencyKey,
      customerInfo,
      items,
      totalAmount,
      status: 'pending_whatsapp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await reservationRef.set(reservationData);

    // 4. Phase 2: Call WhatsApp API with secure JWT link
    try {
      const cartToken = await generateCartToken({ items, totalAmount });
      const resumeLink = `https://wanas.app/api/reservation/resume?token=${cartToken}`;

      await sendWhatsAppNotification({
        to: customerInfo.phone,
        templateName: templates.RESERVATION_RECEIVED,
        variables: {
          customer_name: customerInfo.fullName,
          reservation_id: reservationRef.id,
          resume_link: resumeLink
        }
      });

      // WhatsApp Success: Update status to 'confirmed'
      await reservationRef.update({
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true, 
        reservationId: reservationRef.id, 
        message: 'Reservation created and WhatsApp notification sent.' 
      });

    } catch (waError) {
      console.error('WhatsApp notification failed:', waError);
      
      // WhatsApp Failure: Rollback status to 'failed_whatsapp'
      await reservationRef.update({
        status: 'failed_whatsapp',
        updatedAt: new Date().toISOString(),
        error: waError instanceof Error ? waError.message : 'Unknown WhatsApp error'
      });

      return NextResponse.json({ 
        success: false, 
        reservationId: reservationRef.id, 
        message: 'Reservation created but WhatsApp notification failed.' 
      }, { status: 502 });
    }

  } catch (error) {
    console.error('Reservation processing error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process reservation.' 
    }, { status: 500 });
  }
}
