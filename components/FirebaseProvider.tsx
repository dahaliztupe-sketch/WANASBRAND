'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
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
    // Test Firestore connection
    async function testConnection() {
      // ... (نفس الكود السابق)
    }
    testConnection();

    // Listen to Auth State
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
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
