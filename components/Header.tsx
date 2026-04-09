'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, X, Heart, Package, Sun, Moon } from 'lucide-react';
import { useSelectionStore } from '@/store/useSelectionStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc, collection, getDocs, where, query } from 'firebase/firestore';
import { User as UserType, Product } from '@/types';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export function Header() {
  const { items, openBag } = useSelectionStore();
  const { items: wishlistItems } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserType);
        }
      } else {
        setUser(null);
      }
    });

    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), where('status', '==', 'Published'));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    };
    fetchProducts();

    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-primary/70 border-b border-primary/5 transition-all duration-500" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-[1600px] mx-auto px-6 h-24 grid grid-cols-3 items-center w-full relative">
        {/* Left: User Icon */}
        <div className="flex items-center justify-start gap-6">
          <Link href="/account" className="group flex items-center gap-3 hover:text-accent-primary transition-colors">
            <User className="w-4 h-4" strokeWidth={1} />
            <span className="hidden md:block text-[9px] uppercase tracking-[0.3em] font-bold">Account</span>
          </Link>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link href="/" className="text-3xl md:text-4xl font-serif tracking-[0.4em] min-h-[44px] flex items-center text-primary hover:opacity-70 transition-opacity">
            WANAS
          </Link>
        </div>

        {/* Right: Search, Bag, and Theme Toggle */}
        <div className="flex gap-6 items-center justify-end text-primary">
          <button onClick={() => setIsSearchOpen(true)} className="group flex items-center gap-3 hover:text-accent-primary transition-colors">
            <span className="hidden md:block text-[9px] uppercase tracking-[0.3em] font-bold">Search</span>
            <Search className="w-4 h-4" strokeWidth={1} />
          </button>
          
          <button onClick={openBag} className="group flex items-center gap-3 hover:text-accent-primary transition-colors">
            <span className="hidden md:block text-[9px] uppercase tracking-[0.3em] font-bold">Bag</span>
            <div className="relative">
              <ShoppingBag className="w-4 h-4" strokeWidth={1} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-primary text-primary-foreground text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
          </button>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="p-2 hover:text-accent-primary transition-colors"
          >
            {mounted && (theme === 'dark' ? <Sun className="w-4 h-4" strokeWidth={1} /> : <Moon className="w-4 h-4" strokeWidth={1} />)}
          </button>
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
                      placeholder="DISCOVER THE COLLECTION..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-2xl md:text-4xl tracking-widest uppercase placeholder:text-primary/20 font-serif text-primary"
                    />
                  </div>
                  <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="p-4 hover:bg-primary/5 rounded-full transition-colors group flex items-center gap-3"
                  >
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold group-hover:text-accent-primary transition-colors">Close</span>
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
                      <p className="text-3xl font-serif text-primary/30 italic">&quot;No silhouettes found.&quot;</p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-primary/40 font-bold">Try adjusting your search terms</p>
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
