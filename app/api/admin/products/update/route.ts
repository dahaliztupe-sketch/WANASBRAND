import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/server';
import { logAdminAction } from '@/lib/services/audit.service';
import { ProductSchema } from '@/lib/schemas';
import { jwtVerify } from 'jose';
import { adminRateLimit } from '@/lib/upstash';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret_change_me_in_production';
const secret = new TextEncoder().encode(SESSION_SECRET);

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    if (adminRateLimit) {
      const { success } = await adminRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
    }

    const sessionToken = req.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(sessionToken, secret);
    const adminId = payload.uid as string;
    const adminName = payload.name as string || 'Admin';

    const body = await req.json();
    const { id, updates } = body;
    const firestore = db;
    if (!firestore) throw new Error('Database not initialized');

    const productRef = firestore.collection('products').doc(id);
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
      adminName,
      'update_product',
      id,
      'product',
      oldProduct,
      updates
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
