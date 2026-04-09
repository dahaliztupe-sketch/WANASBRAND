'use client';

import Link from 'next/link';
import { Home, ShoppingBag, Heart, Grid } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSelectionStore } from '@/store/useSelectionStore';
import { useEffect, useState } from 'react';

export function BottomNav() {
  const pathname = usePathname();
  const { openBag, items } = useSelectionStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Collections', href: '/collections', icon: Grid },
    { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { name: 'Bag', href: '#', icon: ShoppingBag, onClick: (e: React.MouseEvent) => { e.preventDefault(); openBag(); }, badge: totalItems },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-primary/95 backdrop-blur-md border-t border-primary/10 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          const content = (
            <>
              <div className="relative mb-1">
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                {mounted && item.badge !== undefined && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent-primary text-primary text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[9px] uppercase tracking-widest">{item.name}</span>
            </>
          );

          if (item.onClick) {
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-primary' : 'text-primary/50 hover:text-primary/80'} transition-colors`}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-primary' : 'text-primary/50 hover:text-primary/80'} transition-colors`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
