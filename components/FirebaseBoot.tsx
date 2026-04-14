'use client';

import { useEffect } from 'react';
import { doc, getDocFromServer } from 'firebase/firestore';

import { db } from '@/lib/firebase/client';

export function FirebaseBoot() {
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();
  }, []);

  return null;
}
