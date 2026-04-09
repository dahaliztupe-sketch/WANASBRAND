import { db } from '../firebase/server';
import { Log } from '@/types';
import crypto from 'crypto';

export const logAdminAction = async (
  adminId: string,
  adminName: string,
  action: string,
  targetId: string,
  targetType: 'product' | 'reservation' | 'user' | 'system',
  oldValue?: any,
  newValue?: any
): Promise<void> => {
  try {
    const logRef = db.collection('logs').doc();
    const log: Log = {
      id: logRef.id,
      adminId,
      adminName,
      action,
      targetId,
      targetType,
      oldValue,
      newValue,
      createdAt: new Date().toISOString(),
    };
    await logRef.set(log);
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Do not throw, as logging should not block the main operation
  }
};
