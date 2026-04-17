import { NextResponse } from 'next/server';

import { db } from '@/lib/firebase/server';
import { logAdminAction } from '@/lib/services/audit.service';
import { ProductSchema } from '@/lib/schemas';
import { adminRateLimit } from '@/lib/upstash';
import { verifyAdminSession, extractSessionToken } from '@/lib/utils/session';

export async function POST(req: Request) {
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    if (adminRateLimit) {
      const { success } = await adminRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
    }

    const sessionToken = extractSessionToken(req.headers.get('cookie'));
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { uid: adminId, isAdmin } = await verifyAdminSession(sessionToken);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, updates } = body;

    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const oldProduct = productDoc.data();
    
    // Validate updates
    const validation = ProductSchema.partial().safeParse(updates);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid update data', details: validation.error.errors }, { status: 400 });
    }

    await productRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    await logAdminAction(
      adminId,
      'update_product',
      'product',
      id,
      oldProduct,
      updates
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
