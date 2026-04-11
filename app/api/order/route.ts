import { NextResponse } from 'next/server';
import { db, appCheck } from '@/lib/firebase/server';
import { sendWhatsAppNotification, templates, generateCartToken } from '@/lib/integrations/whatsapp';

export async function POST(req: Request) {
  try {
    // 1. Verify App Check Token
    const appCheckToken = req.headers.get('X-Firebase-AppCheck');
    if (!appCheckToken) {
      return NextResponse.json({ error: 'Unauthorized: Missing App Check token' }, { status: 401 });
    }

    if (appCheck) {
      try {
        await appCheck.verifyToken(appCheckToken);
      } catch (err) {
        console.error('App Check token verification failed:', err);
        return NextResponse.json({ error: 'Unauthorized: Invalid App Check token' }, { status: 401 });
      }
    }

    // 2. Check Idempotency Key
    const idempotencyKey = req.headers.get('X-Idempotency-Key');
    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Missing X-Idempotency-Key header' }, { status: 400 });
    }

    const firestore = db;
    if (!firestore) throw new Error('Database not initialized');

    // Check if order already exists with this key
    const existingOrderQuery = await firestore.collection('orders')
      .where('idempotencyKey', '==', idempotencyKey)
      .limit(1)
      .get();

    if (!existingOrderQuery.empty) {
      const existingOrder = existingOrderQuery.docs[0].data();
      return NextResponse.json({ 
        success: true, 
        message: 'Order already processed', 
        orderId: existingOrderQuery.docs[0].id,
        isDuplicate: true 
      });
    }

    const body = await req.json();
    const { customerInfo, items, totalAmount } = body;

    // 3. Phase 1: Write to Firestore with 'pending_whatsapp' status
    const orderRef = firestore.collection('orders').doc();
    const orderData = {
      idempotencyKey,
      customerInfo,
      items,
      totalAmount,
      status: 'pending_whatsapp',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await orderRef.set(orderData);

    // 4. Phase 2: Call WhatsApp API with secure JWT link
    try {
      const cartToken = await generateCartToken({ items, totalAmount });
      const resumeLink = `https://wanas.app/api/order/resume?token=${cartToken}`;

      await sendWhatsAppNotification({
        to: customerInfo.phone,
        templateName: templates.RESERVATION_RECEIVED,
        variables: {
          customer_name: customerInfo.fullName,
          order_id: orderRef.id,
          resume_link: resumeLink
        }
      });

      // WhatsApp Success: Update status to 'confirmed'
      await orderRef.update({
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true, 
        orderId: orderRef.id, 
        message: 'Order created and WhatsApp notification sent.' 
      });

    } catch (waError) {
      console.error('WhatsApp notification failed:', waError);
      
      // WhatsApp Failure: Rollback status to 'failed_whatsapp'
      await orderRef.update({
        status: 'failed_whatsapp',
        updatedAt: new Date().toISOString(),
        error: waError instanceof Error ? waError.message : 'Unknown WhatsApp error'
      });

      return NextResponse.json({ 
        success: false, 
        orderId: orderRef.id, 
        message: 'Order created but WhatsApp notification failed.' 
      }, { status: 502 });
    }

  } catch (error) {
    console.error('Order processing error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process order.' 
    }, { status: 500 });
  }
}
