'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase/client';

import StyleProfileQuiz from './StyleProfileQuiz';

interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthReady: false,
});

export const useAuth = () => useContext(AuthContext);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    // 1. Stale-While-Revalidate: Read from cookie for immediate FCP
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('firebase-user='))?.split('=')[1];
    if (userCookie) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userCookie));
        setUser(parsedUser as User);
        setIsAuthReady(true);
      } catch {
        console.error('Failed to parse user cookie');
      }
    }

    // Test Firestore connection
    async function testConnection() {
      // ... (نفس الكود السابق)
    }
    testConnection();

    // Listen to Auth State
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      // Update cookie for next visit
      if (currentUser) {
        const userData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL
        };
        document.cookie = `firebase-user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=31536000; SameSite=Lax`;
      } else {
        document.cookie = 'firebase-user=; path=/; max-age=0';
      }
      
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (!userData.styleProfile) {
            setShowQuiz(true);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthReady }}>
      {children}
      {showQuiz && <StyleProfileQuiz onClose={() => setShowQuiz(false)} />}
    </AuthContext.Provider>
  );
}
