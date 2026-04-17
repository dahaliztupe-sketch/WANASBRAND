import { NextResponse } from 'next/server';

import { db } from '@/lib/firebase/server';
import { logAdminAction } from '@/lib/services/audit.service';
import { verifyAdminSession, extractSessionToken } from '@/lib/utils/session';

export async function POST(request: Request) {
  if (!db) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  try {
    const sessionToken = extractSessionToken(request.headers.get('cookie'));
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { uid: adminId, isAdmin } = await verifyAdminSession(sessionToken);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
      'delete_product',
      'product',
      id,
      oldProduct,
      null
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
