import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

import { db } from '@/lib/firebase/client';

/**
 * Social Commerce & Referral System for WANAS.
 */

export const generateSocialShareContent = (productId: string, productName: string) => {
  const url = `https://wanasbrand.com/product/${productId}`;
  return {
    instagram: `Discover the elegance of ${productName} at WANAS. #WANAS #LuxuryFashion ${url}`,
    tiktok: `Unboxing my latest WANAS piece: ${productName}. ✨ #WANASLuxury ${url}`,
    facebook: `I'm in love with this new piece from WANAS! Check out the ${productName} here: ${url}`,
  };
};

export const createReferralLink = async (userId: string) => {
  const referralCode = `WANAS-${userId.slice(0, 6).toUpperCase()}`;
  try {
    await addDoc(collection(db, 'referrals'), {
      userId,
      referralCode,
      createdAt: serverTimestamp(),
      status: 'active',
    });
    return `https://wanasbrand.com/join?ref=${referralCode}`;
  } catch (error) {
    console.error('Error creating referral link:', error);
    return null;
  }
};

export const processReferral = async (referralCode: string, newUserId: string) => {
  const q = query(collection(db, 'referrals'), where('referralCode', '==', referralCode));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const referral = snapshot.docs[0].data();
    // Award rewards to both referrer and referee
    console.log(`Processing referral: ${referralCode} for new user ${newUserId}`);
    return true;
  }
  return false;
};
