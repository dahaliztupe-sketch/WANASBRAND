import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

import { db } from '@/lib/firebase/server';
import { logAdminAction } from '@/lib/services/audit.service';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default_session_secret_change_me_in_production';
const secret = new TextEncoder().encode(SESSION_SECRET);

export async function POST(request: Request) {
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
    const adminName = payload.name as string || 'Admin';

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const oldProduct = productDoc.data();

    await productRef.delete();

    await logAdminAction(
      adminId,
      adminName,
      'delete_product',
      id,
      'product',
      oldProduct,
      null
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
