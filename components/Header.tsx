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
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-primary/80 border-b border-primary/5" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-7xl mx-auto px-6 h-20 grid grid-cols-3 items-center w-full relative">
        {/* Left: User Icon */}
        <div className="flex items-center justify-start">
          <Link href="/account" className="p-2 hover:text-primary transition-colors">
            <User className="w-5 h-5" strokeWidth={1.5} />
          </Link>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link href="/" className="text-2xl md:text-3xl font-serif font-medium tracking-[0.3em] min-h-[44px] flex items-center text-primary">
            WANAS
          </Link>
        </div>

        {/* Right: Search and Theme Toggle */}
        <div className="flex gap-1 md:gap-4 items-center justify-end text-primary/70">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 hover:text-primary transition-colors">
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="p-2 hover:text-primary transition-colors"
          >
            {mounted && (theme === 'dark' ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />)}
          </button>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 bg-primary z-[110] flex flex-col items-center pt-20 px-6"
              style={{ paddingTop: 'calc(env(safe-area-inset-top) + 5rem)' }}
            >
              <div className="max-w-3xl mx-auto w-full flex items-center gap-4 mb-12 border-b border-primary/10 pb-4">
                <Search strokeWidth={1} className="w-6 h-6 text-primary/30" />
                <input
                  autoFocus
                  type="text"
                  placeholder="SEARCH THE COLLECTION..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-lg tracking-widest uppercase placeholder:text-primary/20 font-serif"
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-primary/5 rounded-full transition-colors"
                >
                  <X strokeWidth={1} className="w-6 h-6 text-primary" />
                </button>
              </div>
              
              <div className="max-w-3xl mx-auto w-full space-y-6 overflow-y-auto pb-20 scrollbar-hide">
                {filteredProducts.map(product => (
                  <Link 
                    key={product.id} 
                    href={`/product/${product.slug}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-6 p-4 hover:bg-secondary/50 transition-all group"
                  >
                    <div className="relative w-20 h-24 bg-secondary rounded-sm overflow-hidden">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/20"><Package strokeWidth={1} size={32} /></div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-serif tracking-wide text-primary">{product.name}</h4>
                      <p className="text-xs uppercase tracking-[0.2em] text-primary/50 mt-1">{product.category}</p>
                      <p className="text-sm font-medium text-accent-primary mt-2">{product.price} EGP</p>
                    </div>
                  </Link>
                ))}
                {searchQuery && filteredProducts.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-lg font-serif text-primary/50 italic">&quot;No silhouettes found matching your search.&quot;</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
