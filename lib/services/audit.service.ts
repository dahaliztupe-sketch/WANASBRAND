import { db } from '@/lib/firebase/server';

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: 'product' | 'reservation' | 'user' | 'system',
  targetId?: string,
  oldValue?: unknown,
  newValue?: unknown
): Promise<void> {
  if (!db) return;
  
  try {
    const adminDoc = await db.collection('users').doc(adminId).get();
    const adminName = adminDoc.exists ? adminDoc.data()?.fullName || 'Unknown' : 'Unknown';
    
    await db.collection('audit_logs').add({
      adminId,
      adminName,
      action,
      targetType,
      targetId: targetId || null,
      oldValue: oldValue || null,
      newValue: newValue || null,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
