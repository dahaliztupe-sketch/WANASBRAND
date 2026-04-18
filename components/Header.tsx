'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Search, X, Package, Sun, Moon, Globe, Heart } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { doc, getDoc, collection, getDocs, where, query } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useLanguageStore } from '@/lib/store/useLanguageStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { User as UserType, Product } from '@/types';

import { Logo } from './Logo';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [, setUser] = useState<UserType | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const { theme, setTheme } = useTheme();
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguageStore();
  const { items: wishlistItems } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserType);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users/' + firebaseUser.uid, auth);
        }
      } else {
        setUser(null);
      }
    });

    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('status', '==', 'Published'));
        const snapshot = await getDocs(q);
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'products', auth);
      }
    };
    fetchProducts();

    return () => unsubscribe();
  }, []);

  const normalizeArabic = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFC')
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[أإآا]/g, 'ا')
      .replace(/[ىئ]/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/^ال/, '')
      .replace(/\s+ال/g, ' ')
      .trim();
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    const normalizedQuery = normalizeArabic(searchQuery);
    return products.filter(p => {
      const normalizedName = normalizeArabic(p.name);
      const normalizedCategory = normalizeArabic(p.category);
      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedCategory.includes(normalizedQuery) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, products]);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-primary/70 border-b border-primary/5 transition-all duration-500" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-[1600px] mx-auto px-6 h-24 grid grid-cols-3 items-center w-full relative">
        {/* Left: User Icon */}
        <div className="flex items-center justify-start min-w-[48px]">
          <Suspense fallback={<div className="w-8 h-8" />}>
            <Link href="/account" className="p-2 hover:text-accent-primary transition-colors" aria-label={t.nav.account}>
              <User className="w-4 h-4" strokeWidth={1} />
            </Link>
          </Suspense>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link href="/" className="min-h-[44px] flex items-center hover:opacity-70 transition-opacity">
            <Logo className="h-16 w-auto text-primary" />
          </Link>
        </div>

        {/* Right: Search, Wishlist, Language, and Theme Toggle */}
        <div className="flex gap-4 items-center justify-end text-primary min-w-[120px]">
          <Suspense fallback={<div className="w-24 h-8" />}>
            <button 
              onClick={() => setIsSearchOpen(true)} 
              className="p-2 hover:text-accent-primary transition-colors"
              aria-label={t.nav.search}
            >
              <Search className="w-4 h-4" strokeWidth={1} />
            </button>

            <Link href="/account/wishlist" className="p-2 hover:text-accent-primary transition-colors relative" aria-label="Wishlist">
              <Heart className="w-4 h-4" strokeWidth={1} />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -end-0.5 bg-accent-primary text-primary text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                  {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                </span>
              )}
            </Link>

            <div className="w-8 h-8 flex items-center justify-center">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="p-2 hover:text-accent-primary transition-colors flex items-center"
                aria-label={mounted ? (language === 'en' ? t.nav.switch_to_arabic : t.nav.switch_to_english) : t.nav.switch_language}
              >
                <Globe className="w-4 h-4" strokeWidth={1} />
              </button>
            </div>
            
            <div className="w-8 h-8 flex items-center justify-center">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                className="p-2 hover:text-accent-primary transition-colors"
                aria-label={mounted ? (theme === 'dark' ? t.nav.switch_to_light : t.nav.switch_to_dark) : t.nav.switch_theme}
              >
                {mounted ? (theme === 'dark' ? <Sun className="w-4 h-4" strokeWidth={1} /> : <Moon className="w-4 h-4" strokeWidth={1} />) : <div className="w-4 h-4" />}
              </button>
            </div>
          </Suspense>
        </div>

        {/* Search Overlay - Editorial */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
              exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
              transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 bg-primary/95 backdrop-blur-3xl z-[110] flex flex-col pt-20 px-6"
              style={{ paddingTop: 'calc(env(safe-area-inset-top) + 5rem)' }}
            >
              <div className="max-w-[1400px] mx-auto w-full flex flex-col h-full">
                <div className="flex items-center justify-between mb-16 border-b border-primary/10 pb-8">
                  <div className="flex items-center gap-6 flex-1">
                    <Search strokeWidth={1} className="w-8 h-8 text-accent-primary" />
                    <input
                      autoFocus
                      type="text"
                      placeholder={t.nav.search_placeholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-2xl md:text-4xl tracking-widest uppercase placeholder:text-primary/20 font-serif text-primary"
                    />
                  </div>
                  <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="p-4 hover:bg-primary/5 rounded-full transition-colors group flex items-center gap-3"
                  >
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold group-hover:text-accent-primary transition-colors">{t.nav.close}</span>
                    <X strokeWidth={1} className="w-6 h-6 text-primary group-hover:text-accent-primary transition-colors" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {filteredProducts.map((product, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        key={product.id}
                      >
                        <Link 
                          href={`/product/${product.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex flex-col gap-6 group"
                        >
                          <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-700">
                            {product.images?.[0] ? (
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary/20"><Package strokeWidth={1} size={32} /></div>
                            )}
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <h4 className="text-2xl font-serif tracking-tight text-primary group-hover:text-accent-primary transition-colors">{product.name}</h4>
                              <p className="text-[9px] uppercase tracking-[0.3em] text-primary/50 mt-2 font-bold">{product.category}</p>
                            </div>
                            <p className="text-[10px] font-bold tracking-widest text-primary">{product.price} EGP</p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  {searchQuery && filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 space-y-6">
                      <p className="text-3xl font-serif text-primary/30 italic">&quot;{t.nav.no_results}&quot;</p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-primary/40 font-bold">{t.nav.try_adjusting}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
