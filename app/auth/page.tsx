'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged 
} from 'firebase/auth';
import { motion } from 'motion/react';
import { Mail, Lock, Phone, ArrowRight, Loader2, Sparkles, Moon } from 'lucide-react';
import { toast } from 'sonner';

import { auth } from '@/lib/firebase/client';
import { syncUserToFirestore } from '@/lib/firebase/user';
import { useSelectionStore } from '@/store/useSelectionStore';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const syncWithCloud = useSelectionStore((state) => state.syncWithCloud);
  const { t, locale } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        try {
          await syncUserToFirestore(user);
          
          // Sync Cart
          await syncWithCloud(user.uid);
          
          // Get ID token and create session
          const idToken = await user.getIdToken();
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.isAdmin) {
              router.push('/admin');
            } else {
              router.push('/account');
            }
          } else {
            router.push('/account');
          }
        } catch (error) {
          console.error('Session error:', error);
          router.push('/account');
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router, syncWithCloud]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await syncUserToFirestore(result.user);
      toast.success(t.auth.welcomeWanasToast);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t.auth.googleFailToast;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await syncUserToFirestore(result.user);
        toast.success(t.auth.welcomeBackToast);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await syncUserToFirestore(result.user);
        toast.success(t.auth.welcomeWanasToast);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t.auth.authFailToast;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-primary">
      {/* Left: Mesh Gradient Section */}
      <div className="hidden md:flex md:w-1/2 relative h-screen overflow-hidden animate-mesh items-center justify-center">
        <div className="absolute inset-0 bg-inverted/5 backdrop-blur-[1px]" />
        <div className="relative z-10 flex flex-col items-center justify-center text-primary p-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-8xl font-serif mb-8 tracking-tighter">WANAS</h1>
            <div className="w-24 h-[1px] bg-inverted/20 mx-auto mb-10" />
            <p className="text-xs uppercase tracking-[0.6em] font-light text-primary/60">
              {t.auth.digitalAtelier}
            </p>
          </motion.div>
        </div>
        
        {/* Decorative Line Art */}
        <div className="absolute top-12 left-12">
          <Sparkles strokeWidth={1} className="w-6 h-6 text-primary/10 stroke-[1px]" />
        </div>
        <div className="absolute bottom-12 right-12">
          <Moon strokeWidth={1} className="w-6 h-6 text-primary/10 stroke-[1px]" />
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-24">
        <div className="w-full max-md">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-serif text-primary mb-4 tracking-wide">
              {isLogin ? t.auth.welcomeBack : t.auth.joinWanas}
            </h2>
            <p className="text-primary/50 font-light text-sm tracking-wide">
              {isLogin ? t.auth.signInDesc : t.auth.signUpDesc}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-accent-primary transition-colors" />
                <input
                  type="email"
                  placeholder={t.auth.emailAddress}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-inverted/5 border-none px-12 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all placeholder:text-primary/20"
                />
              </div>
              <div className="relative group">
                <Lock strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-accent-primary transition-colors" />
                <input
                  type="password"
                  placeholder={t.auth.password}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-inverted/5 border-none px-12 py-4 text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all placeholder:text-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-inverted text-inverted py-4 uppercase tracking-[0.2em] text-xs hover:bg-accent-primary transition-all duration-500 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? (
                <Loader2 strokeWidth={1} className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? t.auth.signIn : t.auth.createAccount}
                  <ArrowRight strokeWidth={1} className={`w-4 h-4 transition-transform ${locale === 'ar' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-primary px-4 text-primary/30">{t.auth.orContinueWith}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-3 border border-primary/10 py-4 hover:bg-inverted/5 transition-colors text-xs uppercase tracking-widest disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t.auth.google}
            </button>
            <button
              disabled={loading}
              className="flex items-center justify-center gap-3 border border-primary/10 py-4 hover:bg-inverted/5 transition-colors text-xs uppercase tracking-widest disabled:opacity-50"
            >
              <Phone strokeWidth={1} className="w-4 h-4" />
              {t.auth.phone}
            </button>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs uppercase tracking-widest text-primary/50 hover:text-accent-primary transition-colors"
            >
              {isLogin ? t.auth.noAccount : t.auth.alreadyMember}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
