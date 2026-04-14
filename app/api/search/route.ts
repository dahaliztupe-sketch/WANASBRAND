import { NextResponse } from 'next/server';

import { db } from '@/lib/firebase/server';
import { Product } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const firestore = db;
    if (!firestore) throw new Error('Database not initialized');

    // Fetch all products
    const productsSnapshot = await firestore.collection('products').where('isArchived', '==', false).get();
    const products = productsSnapshot.docs.map(doc => {
      const data = doc.data() as Product;
      return { ...data, id: doc.id };
    });

    // Basic text matching
    const results = products.filter(product => {
      const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      return text.includes(query.toLowerCase());
    }).slice(0, 10);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
