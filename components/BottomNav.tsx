'use client';

import Link from 'next/link';
import { Home, ShoppingBag, Heart, Grid } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQueryState, parseAsBoolean } from 'nuqs';

import { useSelectionStore } from '@/store/useSelectionStore';
import { useTranslation } from '@/lib/hooks/useTranslation';


export function BottomNav() {
  const pathname = usePathname();
  const { items } = useSelectionStore();
  const [, setIsBagOpen] = useQueryState('bag', parseAsBoolean.withDefault(false));
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { name: t.nav.home, href: '/', icon: Home },
    { name: t.nav.collections, href: '/collections', icon: Grid },
    { name: t.nav.wishlist, href: '/account/wishlist', icon: Heart },
    { name: t.nav.bag, href: '?bag=true', icon: ShoppingBag, onClick: (e: React.MouseEvent) => { e.preventDefault(); setIsBagOpen(true); }, badge: totalItems },
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
                  <span className="absolute -top-1.5 -end-1.5 bg-accent-primary text-primary text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
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
