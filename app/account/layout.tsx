'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Package, 
  Heart, 
  RotateCcw, 
  LogOut, 
  User,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const navItems = [
  { name: 'Overview', href: '/account', icon: LayoutDashboard },
  { name: 'My Collection', href: '/account/orders', icon: Package },
  { name: 'The Vault', href: '/account/wishlist', icon: Heart },
  { name: 'Atelier Services', href: '/account/returns', icon: RotateCcw },
  { name: 'Settings', href: '/account/settings', icon: User },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully.');
      router.push('/');
    } catch (error) {
      toast.error('Failed to sign out.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                <User strokeWidth={1} className="w-6 h-6 stroke-[1.5px]" />
              </div>
              <div>
                <h2 className="font-serif text-xl text-primary truncate max-w-[180px]">
                  {user?.displayName || 'Guest'}
                </h2>
                <p className="text-xs text-primary/40 truncate max-w-[180px]">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="h-[1px] bg-inverted/5 w-full" />
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between group px-4 py-3 text-sm uppercase tracking-widest transition-all duration-300 ${
                    isActive 
                      ? 'bg-inverted text-inverted' 
                      : 'text-primary/60 hover:text-primary hover:bg-inverted/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon className={`w-4 h-4 stroke-[1.5px] ${isActive ? 'text-accent-primary' : 'text-primary/30 group-hover:text-accent-primary'}`} />
                    {item.name}
                  </div>
                  <ChevronRight strokeWidth={1} className={`w-3 h-3 transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                </Link>
              );
            })}
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 px-4 py-3 text-sm uppercase tracking-widest text-primary/40 hover:text-red-500 hover:bg-red-50 transition-all duration-300 mt-8"
            >
              <LogOut strokeWidth={1} className="w-4 h-4 stroke-[1.5px]" />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
