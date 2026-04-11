'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Sparkles } from 'lucide-react';
import { auth, db, messaging } from '@/lib/firebase/client';
import { getToken } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function PushNotificationModal() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Check if user has already granted or denied
        const hasResponded = localStorage.getItem('fcm_permission_responded');
        if (!hasResponded && Notification.permission === 'default') {
          setTimeout(() => setShow(true), 5000); // Show after 5 seconds
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handlePermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const m = await messaging;
        if (m) {
          const token = await getToken(m, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY // User should provide this in env
          });
          
          if (token && user) {
            await updateDoc(doc(db, 'users', user.uid), {
              fcmToken: token,
              pushEnabled: true,
              updatedAt: new Date()
            });
          }
        }
      }
      localStorage.setItem('fcm_permission_responded', 'true');
      setShow(false);
    } catch (error) {
      console.error('Error granting notification permission:', error);
      setShow(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-secondary border border-primary/10 p-8 max-w-md w-full relative overflow-hidden"
          >
            {/* Decorative background element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-primary/5 rounded-full blur-3xl" />
            
            <button 
              onClick={() => {
                localStorage.setItem('fcm_permission_responded', 'true');
                setShow(false);
              }}
              className="absolute top-4 right-4 text-primary/40 hover:text-primary transition-colors"
            >
              <X size={20} strokeWidth={1} />
            </button>

            <div className="space-y-6 relative z-10">
              <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Bell className="text-accent-primary" size={32} strokeWidth={1} />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-serif text-primary italic">{t.pushNotificationModal.title}</h3>
                <p className="text-sm text-primary/60 leading-relaxed">
                  {t.pushNotificationModal.description}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePermission}
                  className="w-full py-4 bg-accent-primary text-primary font-bold text-xs uppercase tracking-[0.2em] hover:bg-accent-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  {t.pushNotificationModal.enable}
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('fcm_permission_responded', 'true');
                    setShow(false);
                  }}
                  className="w-full py-4 text-primary/40 text-[10px] uppercase tracking-widest hover:text-primary transition-all"
                >
                  {t.pushNotificationModal.later}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
