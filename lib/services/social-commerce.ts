import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  increment,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/client';

/**
 * Social Commerce & Referral System for WANAS Atelier.
 * Referrer earns 150 pts + 5% discount voucher.
 * Referee earns 50 pts on first purchase.
 */

const REFERRAL_POINTS_REFERRER = 150;
const REFERRAL_POINTS_REFEREE  = 50;
const REFERRAL_DISCOUNT_PCT    = 0.05; // 5%

export const generateSocialShareContent = (productSlug: string, productName: string, language: 'ar' | 'en' = 'ar') => {
  const url = `https://wanas-atelier.com/product/${productSlug}`;

  return language === 'ar' ? {
    instagram: `اكتشفي "${productName}" من أتيليه وناس — حيث تلتقي الحرفية بالأناقة ✨ ${url} #وناس_أتيليه #موضة_فاخرة`,
    whatsapp:  `شاهدي هذه القطعة الرائعة من أتيليه وناس: "${productName}" ✨\n${url}`,
    twitter:   `"${productName}" من أتيليه وناس — حرفية مصرية خالصة 🌸 ${url} #وناس #موضة`,
  } : {
    instagram: `Discover "${productName}" at WANAS Atelier — where Egyptian craftsmanship meets quiet luxury ✨ ${url} #WANASAtelier #LuxuryFashion`,
    whatsapp:  `I found this beautiful piece at WANAS Atelier: "${productName}" ✨\n${url}`,
    twitter:   `"${productName}" by WANAS Atelier — authentic Egyptian luxury 🌸 ${url} #WANAS`,
  };
};

export const createReferralLink = async (userId: string): Promise<string | null> => {
  const referralCode = `WANAS-${userId.slice(0, 6).toUpperCase()}`;

  try {
    const existing = await getDocs(
      query(collection(db, 'referrals'), where('userId', '==', userId))
    );

    if (!existing.empty) {
      const data = existing.docs[0]!.data();
      return `https://wanas-atelier.com/join?ref=${data.referralCode as string}`;
    }

    await addDoc(collection(db, 'referrals'), {
      userId,
      referralCode,
      status: 'active',
      totalConversions: 0,
      totalPointsEarned: 0,
      createdAt: serverTimestamp(),
    });

    return `https://wanas-atelier.com/join?ref=${referralCode}`;
  } catch (error) {
    console.error('[SocialCommerce] Error creating referral link:', error);
    return null;
  }
};

export const processReferral = async (referralCode: string, newUserId: string): Promise<{
  success: boolean;
  referrerId?: string;
  pointsAwarded?: { referrer: number; referee: number };
}> => {
  try {
    const q = query(collection(db, 'referrals'), where('referralCode', '==', referralCode), where('status', '==', 'active'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return { success: false };

    const referralDoc = snapshot.docs[0]!;
    const referral    = referralDoc.data();
    const referrerId  = referral.userId as string;

    if (referrerId === newUserId) return { success: false };

    const alreadyUsed = await getDocs(
      query(collection(db, 'referral_uses'), where('referralCode', '==', referralCode), where('newUserId', '==', newUserId))
    );
    if (!alreadyUsed.empty) return { success: false };

    await addDoc(collection(db, 'referral_uses'), {
      referralCode,
      referrerId,
      newUserId,
      usedAt: serverTimestamp(),
    });

    const referrerRef = doc(db, 'users', referrerId);
    const referrerSnap = await getDoc(referrerRef);
    if (referrerSnap.exists()) {
      await updateDoc(referrerRef, {
        loyaltyPoints: increment(REFERRAL_POINTS_REFERRER),
      });
    }

    const newUserRef = doc(db, 'users', newUserId);
    const newUserSnap = await getDoc(newUserRef);
    if (newUserSnap.exists()) {
      await updateDoc(newUserRef, {
        loyaltyPoints: increment(REFERRAL_POINTS_REFEREE),
        referredBy: referrerId,
      });
    }

    const discountCode = `REF-${referralCode}-${Date.now().toString(36).toUpperCase()}`;
    await addDoc(collection(db, 'discount_codes'), {
      code: discountCode,
      userId: referrerId,
      type: 'referral_reward',
      discountPct: REFERRAL_DISCOUNT_PCT,
      used: false,
      expiresAt: new Date(Date.now() + 90 * 86400_000),
      createdAt: serverTimestamp(),
    });

    await updateDoc(referralDoc.ref, {
      totalConversions: increment(1),
      totalPointsEarned: increment(REFERRAL_POINTS_REFERRER),
    });

    await addDoc(collection(db, 'loyalty_transactions'), {
      userId: referrerId,
      action: 'referral_signup',
      points: REFERRAL_POINTS_REFERRER,
      metadata: { newUserId, discountCode },
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'loyalty_transactions'), {
      userId: newUserId,
      action: 'referred_signup',
      points: REFERRAL_POINTS_REFEREE,
      metadata: { referrerId },
      createdAt: serverTimestamp(),
    });

    console.info(`[SocialCommerce] Referral processed: code=${referralCode} referrer=${referrerId} new=${newUserId}`);

    return {
      success: true,
      referrerId,
      pointsAwarded: { referrer: REFERRAL_POINTS_REFERRER, referee: REFERRAL_POINTS_REFEREE },
    };
  } catch (error) {
    console.error('[SocialCommerce] Error processing referral:', error);
    return { success: false };
  }
};

export const getReferralStats = async (userId: string) => {
  try {
    const q = query(collection(db, 'referrals'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const data = snap.docs[0]!.data();
    return {
      referralCode: data.referralCode as string,
      referralLink: `https://wanas-atelier.com/join?ref=${data.referralCode as string}`,
      totalConversions: (data.totalConversions as number) ?? 0,
      totalPointsEarned: (data.totalPointsEarned as number) ?? 0,
    };
  } catch {
    return null;
  }
};

export const getLeaderboard = async (limitCount = 10) => {
  try {
    const snap = await getDocs(
      query(collection(db, 'referrals'), where('totalConversions', '>', 0))
    );
    return snap.docs
      .map(d => ({ userId: d.data().userId as string, conversions: (d.data().totalConversions as number) ?? 0 }))
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, limitCount);
  } catch {
    return [];
  }
};
