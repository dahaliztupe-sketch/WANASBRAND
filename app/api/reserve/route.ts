import crypto from 'crypto';

import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from "@upstash/ratelimit";

import { db, auth } from '@/lib/firebase/server';
import { sendReservationEmail } from '@/lib/services/email.service';
import { ReservationSchema } from '@/lib/schemas';
import { ProductVariant } from '@/types';
import { encryptPII } from '@/lib/utils/encryption';


export const runtime = 'nodejs';

// Upstash Redis Rate Limiter
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
}) : null;

async function checkRateLimit(ip: string): Promise<boolean> {
  if (!ratelimit) {
    console.warn('Upstash Redis not configured, skipping rate limit');
    return true;
  }

  try {
    const { success } = await ratelimit.limit(ip);
    return success;
  } catch (error) {
    console.error('Rate limit error:', error);
    return true; // Fail open
  }
}


/**
 * Handles the reservation POST request.
 * Validates data, checks rate limits, ensures idempotency, 
 * and performs atomic inventory updates via Firestore transactions.
 * 
 * @param req - The incoming Request object.
 * @returns A NextResponse with success status or error details.
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!(await checkRateLimit(ip))) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    
    // Honeypot Check
    if (body.website) {
      console.warn(`Honeypot triggered in Reservation by IP: ${ip}`);
      return NextResponse.json({ success: true, message: 'Reservation received' });
    }
    
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
        // Security: Ensure key is 32 bytes hex (64 chars)
        if (idempotencyKey.length !== 64) {
          throw new Error('Invalid idempotency key format');
        }

        const existingQuery = await firestore.collection('reservations')
          .where('idempotencyKey', '==', idempotencyKey)
          .limit(1)
          .get();

        if (!existingQuery.empty) {
          const existingDoc = existingQuery.docs[0].data();
          const createdAt = new Date(existingDoc.createdAt).getTime();
          const now = Date.now();
          
          // 24-hour expiration check
          if (now - createdAt < 24 * 60 * 60 * 1000) {
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
      }

      // 1. Get Counter for Sequential ID
      const counterDoc = await transaction.get(counterRef);
      let nextId = 10001;
      if (counterDoc.exists) {
        nextId = (counterDoc.data()?.lastId || 10000) + 1;
      }

      // 2. Verify Inventory and Calculate True Price
      const productUpdates = new Map<string, { ref: FirebaseFirestore.DocumentReference, variants: ProductVariant[], name: string, price: number }>();
      let calculatedSubtotal = 0;
      const validatedItems = [];

      // First, collect all unique products involved
      const productIds = Array.from(new Set(items.map(item => item.productId)));
      for (const pid of productIds) {
        const productRef = firestore.collection('products').doc(pid);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists) {
          throw new Error(`Product ${pid} not found`);
        }

        const productData = productDoc.data();
        if (!productData) throw new Error(`Product ${pid} has no data`);

        productUpdates.set(pid, {
          ref: productRef,
          variants: [...(productData.variants || [])],
          name: productData.name,
          price: productData.price
        });
      }

      // Now process items using the cached product data
      for (const item of items) {
        const productInfo = productUpdates.get(item.productId);
        if (!productInfo) throw new Error(`Product info missing for ${item.productId}`);

        const variantIndex = productInfo.variants.findIndex(
          (v: ProductVariant) => v.sku === item.variant.sku
        );

        if (variantIndex === -1) {
          throw new Error(`Variant not found for product ${productInfo.name}`);
        }

        if (productInfo.variants[variantIndex].stock < item.quantity) {
          throw new Error(`Insufficient stock for ${productInfo.name} (${item.variant.sku})`);
        }

        // Calculate price based on DB
        calculatedSubtotal += productInfo.price * item.quantity;

        // Decrement Stock in the cached variants array
        productInfo.variants[variantIndex].stock -= item.quantity;
        
        // Store validated item
        validatedItems.push({
          ...item,
          priceAtPurchase: productInfo.price,
          productName: productInfo.name,
          recommendedByAI: item.recommendedByAI || false,
        });
      }

      // 3. Commit Changes
      transaction.set(counterRef, { lastId: nextId }, { merge: true });
      
      for (const [, info] of productUpdates) {
        transaction.update(info.ref, { 
          variants: info.variants, 
          updatedAt: new Date().toISOString() 
        });
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
  } catch (error: unknown) {
    console.error('Reservation Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create reservation';
    const status = message.includes('Insufficient stock') || message.includes('not found') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
