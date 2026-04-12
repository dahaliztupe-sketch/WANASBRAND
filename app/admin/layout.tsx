'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Home, Inbox, Tag, Users, LogOut, Menu, X, Settings, BarChart3, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

import { auth, db } from '@/lib/firebase/client';
import { useTourStore } from '@/store/useTourStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const startTour = useTourStore((state) => state.startTour);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth');
      } else {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsLoading(false);
          if (userDoc.data().tourStatus === 'pending') {
            startTour();
          }
        } else {
          router.push('/');
        }
      }
    });

    return () => unsubscribe();
  }, [router, startTour]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-pulse text-primary font-serif text-xl">Loading...</div>
      </div>
    );
  }

  const navigation = [
    { name: 'Overview', href: '/admin', icon: Home },
    { name: 'Reservations', href: '/admin/reservations', icon: Inbox },
    { name: 'Products', href: '/admin/products', icon: Tag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Insights', href: '/admin/insights', icon: BarChart3 },
    { name: 'Waitlist', href: '/admin/waitlist', icon: Clock },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    const currentNav = navigation.find(item => item.href === pathname || (item.href !== '/admin' && pathname.startsWith(item.href)));
    return currentNav ? currentNav.name : 'Dashboard';
  };

  return (
    <div className="dark min-h-screen bg-primary flex flex-col md:flex-row transition-colors duration-500 ease-in-out">
      {/* Mobile Header */}
      <div className="md:hidden bg-secondary text-primary p-4 flex justify-between items-center sticky top-0 z-50 border-b border-primary/10">
        <span className="font-serif text-xl tracking-widest uppercase">WANAS ATELIER</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu strokeWidth={1} size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-secondary text-primary flex flex-col z-40 transition-all duration-500 ease-in-out border-r border-primary/10
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:block border-b border-primary/10">
          <span className="font-serif text-2xl tracking-widest uppercase">WANAS</span>
          <div className="text-[10px] text-secondary/60 tracking-[0.3em] mt-1 uppercase font-bold">Atelier Portal</div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto" data-tour-id="tour-sidebar">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 ${
                  isActive 
                    ? 'bg-accent-primary text-primary shadow-sm' 
                    : 'text-secondary/70 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm tracking-wider font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-secondary/70 hover:bg-primary/5 hover:text-primary rounded-sm transition-colors"
          >
            <LogOut strokeWidth={1} size={18} />
            <span className="text-sm tracking-wider font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden md:flex h-20 bg-primary border-b border-primary/10 items-center justify-between px-8 sticky top-0 z-30 transition-colors duration-500">
          <h1 className="font-serif text-2xl text-primary">{getPageTitle()}</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs tracking-widest text-secondary/60 uppercase font-bold">{auth.currentUser?.email}</span>
          </div>
        </header>

        {/* Mobile Page Title */}
        <div className="md:hidden bg-primary border-b border-primary/10 p-4">
          <h1 className="font-serif text-xl text-primary">{getPageTitle()}</h1>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
