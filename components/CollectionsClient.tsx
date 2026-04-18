'use client';

import { useState, useMemo, use } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import ProductCard from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/ProductSkeleton';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { Product } from '@/types';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { getProducts } from '@/lib/services/product.service';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';
import { auth } from '@/lib/firebase/client';

type SortOption = 'newest' | 'price_asc' | 'price_desc';

interface FilterState {
  category: string | null;
  size: string | null;
  sort: SortOption;
  priceMax: number | null;
}

function ProductGridFiltered({
  initialProductsPromise,
  filters,
  viewMode,
}: {
  initialProductsPromise: Promise<{ products: Product[]; lastDocId: string | null }>;
  filters: FilterState;
  viewMode: 'grid' | 'model';
}) {
  const initialData = use(initialProductsPromise);
  const [allProducts, setAllProducts] = useState<Product[]>(initialData.products);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(initialData.lastDocId);
  const [hasMore, setHasMore] = useState(initialData.products.length >= 12);
  const { t } = useTranslation();

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }
    if (filters.size) {
      result = result.filter((p) =>
        p.variants?.some((v) => v.size === filters.size && v.stock > 0)
      );
    }
    if (filters.priceMax !== null) {
      result = result.filter((p) => p.price <= (filters.priceMax as number));
    }
    if (filters.sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [allProducts, filters]);

  const loadMore = async () => {
    if (!lastCreatedAt || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await getProducts(12, lastCreatedAt);
      if (data) {
        setAllProducts((prev) => [...prev, ...data.products]);
        setLastCreatedAt(data.lastVisible);
        if (data.products.length < 12) setHasMore(false);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products', auth);
    } finally {
      setLoadingMore(false);
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center max-w-2xl mx-auto">
        <h3 className="font-serif text-3xl text-primary mb-4 italic">{t.productGrid.emptyTitle}</h3>
        <p className="text-primary/60 font-light leading-relaxed tracking-wide">
          {t.productGrid.emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="popLayout">
        <div className={`grid gap-y-32 gap-x-8 w-full ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-12' : 'grid-cols-1 md:grid-cols-2'}`}>
          {filtered.map((product, idx) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: (idx % 6) * 0.05 }}
              className={viewMode === 'grid' ? `group flex flex-col items-start cursor-pointer ${
                idx % 3 === 0 ? 'md:col-span-6 md:col-start-1' :
                idx % 3 === 1 ? 'md:col-span-4 md:col-start-8 md:mt-48' :
                'md:col-span-8 md:col-start-3 md:mt-32'
              }` : 'group flex flex-col items-center cursor-pointer'}
            >
              <ProductCard product={product} viewMode={viewMode} idx={idx} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-24 px-12 py-4 border border-primary/20 text-[10px] uppercase tracking-[0.3em] text-primary/60 hover:border-accent-primary hover:text-accent-primary transition-all duration-300 disabled:opacity-50"
        >
          {loadingMore ? t.productGrid.loading : t.productGrid.loadMore}
        </button>
      )}
    </div>
  );
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CATEGORIES = ['Dresses', 'Abayas', 'Sets', 'Tops', 'Skirts', 'Outerwear', 'Accessories'];
const SORT_OPTIONS: { value: SortOption; label: string; labelAr: string }[] = [
  { value: 'newest', label: 'Newest', labelAr: 'الأحدث' },
  { value: 'price_asc', label: 'Price: Low to High', labelAr: 'السعر: من الأقل' },
  { value: 'price_desc', label: 'Price: High to Low', labelAr: 'السعر: من الأعلى' },
];

export default function CollectionsClient({
  initialProductsPromise,
}: {
  initialProductsPromise: Promise<{ products: Product[]; lastDocId: string | null }>;
}) {
  const [viewMode, setViewMode] = useState<'grid' | 'model'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    size: null,
    sort: 'newest',
    priceMax: null,
  });
  const [openDropdown, setOpenDropdown] = useState<'category' | 'size' | 'sort' | null>(null);
  const { t, language } = useTranslation();

  const activeFiltersCount = [filters.category, filters.size, filters.priceMax !== null ? 1 : null].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ category: null, size: null, sort: 'newest', priceMax: null });
    setOpenDropdown(null);
  };

  const toggleDropdown = (name: typeof openDropdown) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-primary">
      <section className="pt-48 pb-24 px-6 text-center max-w-6xl mx-auto">
        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-serif tracking-tighter break-words whitespace-normal text-balance leading-[0.85] text-primary mix-blend-difference dark:mix-blend-normal">
          {t.collections.titleLine1} <br />
          <span className="italic text-accent-primary">{t.collections.titleLine2}</span>
        </h1>
        <p className="text-primary/50 text-[10px] uppercase tracking-[0.6em] mt-12 font-bold">
          {t.collections.subtitle}
        </p>
      </section>

      <div className="sticky top-20 z-40 bg-primary/95 backdrop-blur-md border-y border-primary/5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-[10px] uppercase tracking-widest text-primary/70 h-14">
          <div className="flex items-center gap-2 md:gap-6">
            <SlidersHorizontal strokeWidth={1} className="w-4 h-4 text-primary/40 flex-shrink-0" />

            {/* Category */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('category')}
                className={`flex items-center gap-1.5 hover:text-primary transition-colors min-h-[44px] px-2 ${filters.category ? 'text-accent-primary' : ''}`}
              >
                {filters.category ?? t.collections.filters.category}
                <ChevronDown strokeWidth={1} className={`w-3 h-3 transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openDropdown === 'category' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full start-0 mt-1 bg-secondary border border-primary/10 shadow-xl min-w-[160px] z-50"
                  >
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setFilters((f) => ({ ...f, category: f.category === cat ? null : cat })); setOpenDropdown(null); }}
                        className={`w-full text-start px-4 py-3 text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-colors ${filters.category === cat ? 'text-accent-primary' : 'text-primary'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Size */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('size')}
                className={`flex items-center gap-1.5 hover:text-primary transition-colors min-h-[44px] px-2 ${filters.size ? 'text-accent-primary' : ''}`}
              >
                {filters.size ?? t.collections.filters.size}
                <ChevronDown strokeWidth={1} className={`w-3 h-3 transition-transform ${openDropdown === 'size' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openDropdown === 'size' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full start-0 mt-1 bg-secondary border border-primary/10 shadow-xl z-50"
                  >
                    <div className="grid grid-cols-3 gap-1 p-2">
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setFilters((f) => ({ ...f, size: f.size === s ? null : s })); setOpenDropdown(null); }}
                          className={`px-3 py-2 text-[10px] uppercase tracking-widest border transition-colors ${filters.size === s ? 'border-accent-primary text-accent-primary bg-accent-primary/5' : 'border-primary/10 text-primary hover:border-primary/30'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort */}
            <div className="relative hidden md:block">
              <button
                onClick={() => toggleDropdown('sort')}
                className="flex items-center gap-1.5 hover:text-primary transition-colors min-h-[44px] px-2"
              >
                {SORT_OPTIONS.find((o) => o.value === filters.sort)?.[language === 'ar' ? 'labelAr' : 'label'] ?? t.collections.filters.sortBy}
                <ChevronDown strokeWidth={1} className={`w-3 h-3 transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openDropdown === 'sort' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full start-0 mt-1 bg-secondary border border-primary/10 shadow-xl min-w-[200px] z-50"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setFilters((f) => ({ ...f, sort: opt.value })); setOpenDropdown(null); }}
                        className={`w-full text-start px-4 py-3 text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-colors ${filters.sort === opt.value ? 'text-accent-primary' : 'text-primary'}`}
                      >
                        {language === 'ar' ? opt.labelAr : opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear filters */}
            <AnimatePresence>
              {activeFiltersCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-accent-primary hover:text-accent-hover transition-colors min-h-[44px] px-2"
                >
                  <X strokeWidth={1.5} className="w-3 h-3" />
                  <span className="hidden sm:inline">Clear ({activeFiltersCount})</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 border-e border-primary/10 pe-4 me-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`transition-colors min-h-[44px] px-2 ${viewMode === 'grid' ? 'text-primary' : 'text-primary/30'}`}
                aria-label="Switch to Grid View"
              >
                {t.collections.view.grid}
              </button>
              <button
                onClick={() => setViewMode('model')}
                className={`transition-colors min-h-[44px] px-2 ${viewMode === 'model' ? 'text-primary' : 'text-primary/30'}`}
                aria-label="Switch to Model View"
              >
                {t.collections.view.model}
              </button>
            </div>
            <div className="hidden lg:flex items-center min-h-[44px] text-primary/40">
              {t.collections.showingAll}
            </div>
          </div>
        </div>

        {/* Close dropdown on outside click */}
        {openDropdown && (
          <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
        )}
      </div>

      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <ProductGridFiltered
          initialProductsPromise={initialProductsPromise}
          filters={filters}
          viewMode={viewMode}
        />
      </section>
    </div>
  );
}
