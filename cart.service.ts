import { db } from '@/lib/firebase/client';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ReservationItem, Product } from '@/types';

export const CART_COLLECTION = 'carts';

export async function syncCartToCloud(userId: string, localItems: ReservationItem[], isInitialSync: boolean = false) {
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    let mergedItems = [...localItems];

    // Only merge with cloud items on initial login/hydration
    if (isInitialSync) {
      const cartDoc = await getDoc(cartRef);
      if (cartDoc.exists()) {
        const cloudItems: ReservationItem[] = cartDoc.data().items || [];
        for (const cloudItem of cloudItems) {
          const existsLocally = mergedItems.find(i => i.variant.sku === cloudItem.variant.sku);
          if (!existsLocally) {
            mergedItems.push(cloudItem);
          }
        }
      }
    }

    // Validate merged items (remove orphaned items)
    const { validatedItems, removedItems } = await validateCartItems(mergedItems);

    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() : null;

    await setDoc(cartRef, {
      items: validatedItems,
      updatedAt: new Date().toISOString(),
      userEmail: userData?.email || null,
      userPhone: userData?.phone || null,
      userId
    }, { merge: true });

    return { validatedItems, removedItems };
  } catch (error) {
    console.error('Error syncing cart:', error);
    return { validatedItems: localItems, removedItems: [] };
  }
}

export async function validateCartItems(items: ReservationItem[]): Promise<{ validatedItems: ReservationItem[], removedItems: ReservationItem[] }> {
  if (items.length === 0) return { validatedItems: [], removedItems: [] };

  try {
    const productIds = Array.from(new Set(items.map(i => i.productId)));
    const validItems: ReservationItem[] = [];
    const removedItems: ReservationItem[] = [];

    for (const productId of productIds) {
      const productDoc = await getDoc(doc(db, 'products', productId));
      const productItems = items.filter(i => i.productId === productId);
      
      if (productDoc.exists()) {
        const productData = productDoc.data() as Product;
        
        // Check if product is published
        if (productData.status !== 'Published') {
          removedItems.push(...productItems);
          continue;
        }

        for (const item of productItems) {
          const variant = productData.variants.find(v => v.sku === item.variant.sku);
          
          if (variant && variant.stock > 0 && variant.isActive !== false) {
            validItems.push({
              ...item,
              productName: productData.name, // Snapshot update
              priceAtPurchase: productData.price, // Update to current price
              variant: {
                ...variant,
                stock: variant.stock // Update stock info
              }
            });
          } else {
            removedItems.push(item);
          }
        }
      } else {
        removedItems.push(...productItems);
      }
    }

    return { validatedItems: validItems, removedItems };
  } catch (error) {
    console.error('Error validating cart:', error);
    return { validatedItems: items, removedItems: [] };
  }
}

export async function getCloudCart(userId: string): Promise<ReservationItem[]> {
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    const cartDoc = await getDoc(cartRef);
    
    if (cartDoc.exists()) {
      return cartDoc.data().items || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting cloud cart:', error);
    return [];
  }
}
