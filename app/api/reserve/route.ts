import { NextResponse } from 'next/server';
import { db, auth, appCheck } from '@/lib/firebase/server';
import { encryptPII } from '@/lib/utils/encryption';
import { sendReservationEmail } from '@/lib/services/email.service';
import crypto from 'crypto';
import { ReservationSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

// Basic in-memory rate limiter (for demonstration)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - record.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}


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

    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    
    // Zod Validation
    const validation = ReservationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid reservation data', details: validation.error.errors }, { status: 400 });
    }

    const { customerData, items, shippingFee, userId } = validation.data;

    // Security: Verify Auth Token if userId is provided and not 'guest'
    if (userId && userId !== 'guest') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
      }
      const idToken = authHeader.split('Bearer ')[1];
      try {
        if (!auth) throw new Error('Auth not initialized');
        const decodedToken = await auth.verifyIdToken(idToken);
        if (decodedToken.uid !== userId) {
          return NextResponse.json({ error: 'Forbidden: User ID mismatch' }, { status: 403 });
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
      }
    }

    // Encrypt PII
    const encryptedPhone = encryptPII(customerData.phone);
    const encryptedAddress = encryptPII(customerData.address);

    // Generate Magic Link Token
    const magicLinkToken = crypto.randomBytes(16).toString('hex');

    // Idempotency Key from headers
    const idempotencyKey = req.headers.get('Idempotency-Key');

    // Firestore Transaction for Sequential ID, Inventory, and Reservation
    const firestore = db;
    if (!firestore) throw new Error('Database not initialized');
    
    const counterRef = firestore.collection('counters').doc('reservations');
    const reservationRef = firestore.collection('reservations').doc();
    const id = reservationRef.id;

    const result = await firestore.runTransaction(async (transaction) => {
      // 0. Check Idempotency Key
      if (idempotencyKey) {
        const existingQuery = await firestore.collection('reservations').where('idempotencyKey', '==', idempotencyKey).limit(1).get();
        if (!existingQuery.empty) {
          const existingDoc = existingQuery.docs[0].data();
          return {
            isDuplicate: true,
            orderNumber: existingDoc.reservationNumber,
            id: existingDoc.id,
            calculatedTotal: existingDoc.financials.total,
            validatedItems: existingDoc.items,
            magicLinkToken: existingDoc.magicLinkToken
          };
        }
      }

      // 1. Get Counter for Sequential ID
      const counterDoc = await transaction.get(counterRef);
      let nextId = 10001;
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.lastId || 10000) + 1;
      }

      // 2. Verify Inventory and Calculate True Price
      const updatedProducts = [];
      let calculatedSubtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const productRef = firestore.collection('products').doc(item.productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const productData = productDoc.data();
        if (!productData) throw new Error(`Product ${item.productId} has no data`);

        // Inventory Verification & Update
        const variants = productData.variants || [];
        const variantIndex = variants.findIndex(
          (v: any) => v.sku === item.variant.sku
        );

        if (variantIndex === -1) {
          throw new Error(`Variant not found for product ${item.productId}`);
        }

        if (variants[variantIndex].stock < item.quantity) {
          throw new Error(`Insufficient stock for ${productData.name} (${item.variant.sku})`);
        }

        // Calculate price based on DB, not client request
        const truePrice = productData.price;
        calculatedSubtotal += truePrice * item.quantity;

        // Decrement Stock
        variants[variantIndex].stock -= item.quantity;
        updatedProducts.push({ ref: productRef, variants });
        
        // Store validated item with true price
        validatedItems.push({
          ...item,
          priceAtPurchase: truePrice,
          productName: productData.name,
          recommendedByAI: item.recommendedByAI || false,
        });
      }

      // 3. Commit Changes
      transaction.set(counterRef, { lastId: nextId }, { merge: true });
      
      for (const p of updatedProducts) {
        transaction.update(p.ref, { variants: p.variants, updatedAt: new Date().toISOString() });
      }

      // Calculate final financials securely on the server
      const vat = calculatedSubtotal * 0.14; // Assuming 14% VAT is included or added
      const calculatedTotal = calculatedSubtotal + shippingFee;
      const orderNumber = `#AUR-${nextId}`;

      const reservation = {
        id,
        reservationNumber: orderNumber,
        customerInfo: {
          ...customerData,
          phone: encryptedPhone,
          address: encryptedAddress,
        },
        items: validatedItems,
        financials: {
          subtotal: Number(calculatedSubtotal.toFixed(2)),
          shippingFee: Number(shippingFee.toFixed(2)),
          vat: Number(vat.toFixed(2)),
          total: Number(calculatedTotal.toFixed(2)),
        },
        status: 'pending_contact',
        userId: userId || 'guest',
        magicLinkToken,
        idempotencyKey: idempotencyKey || null,
        createdAt: new Date().toISOString(),
        emailDeliveryStatus: 'pending',
      };

      transaction.set(reservationRef, reservation);

      return { isDuplicate: false, orderNumber, id, calculatedTotal, validatedItems, magicLinkToken };
    });

    const { isDuplicate, orderNumber, calculatedTotal, validatedItems, magicLinkToken: savedMagicLinkToken } = result;

    // Send Email only if it's not a duplicate
    if (!isDuplicate && customerData.email) {
      await sendReservationEmail(
        id,
        customerData.email,
        orderNumber,
        validatedItems,
        calculatedTotal,
        savedMagicLinkToken
      );
    }

    const whatsappMessage = `Hello ${customerData.fullName}, I am your WANAS Ambassador. I have received your reservation ${orderNumber}. Let us begin your journey...`;
    const whatsappLink = `https://wa.me/201000000000?text=${encodeURIComponent(whatsappMessage)}`;

    return NextResponse.json({ success: true, id, orderNumber, magicLinkToken: savedMagicLinkToken, whatsappLink });
  } catch (error: any) {
    console.error('Reservation Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create reservation';
    const status = message.includes('Insufficient stock') || message.includes('not found') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
