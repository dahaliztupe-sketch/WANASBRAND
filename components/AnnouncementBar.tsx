'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

import { db, auth } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';

export function AnnouncementBar() {
  const [settings, setSettings] = useState<{
    announcementBanner: string;
    announcementBarEnabled: boolean;
  } | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as { announcementBanner: string; announcementBarEnabled: boolean; });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global', auth));
    return () => unsub();
  }, []);

  if (!settings?.announcementBarEnabled || !settings?.announcementBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-inverted text-inverted py-2.5 px-4 text-center overflow-hidden"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] font-medium">
          {settings.announcementBanner}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
