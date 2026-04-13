import { collection, query, where, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export const getProductsOptimized = async (filters: { category?: string; minPrice?: number }) => {
  let q = collection(db, 'products');
  const constraints = [];
  if (filters.category) constraints.push(where('category', '==', filters.category));
  if (filters.minPrice) constraints.push(where('price', '>=', filters.minPrice));
  
  return getDocs(query(q, ...constraints, orderBy('price', 'asc')));
};

export const getPaginatedProducts = async (pageSize: number, lastVisible?: QueryDocumentSnapshot) => {
  let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(pageSize));
  if (lastVisible) q = query(q, startAfter(lastVisible));
  return getDocs(q);
};
