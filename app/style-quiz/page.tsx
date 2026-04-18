'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, RotateCcw, Sparkles, MessageCircle } from 'lucide-react';

import { useTranslation } from '@/lib/hooks/useTranslation';
import { getProducts } from '@/lib/services/product.service';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useQuickViewStore } from '@/store/useQuickViewStore';
import { useLanguageStore } from '@/lib/store/useLanguageStore';

interface StyleQuizTranslations {
  title: string;
  subtitle: string;
  next: string;
  back: string;
  seeResults: string;
  restart: string;
  resultsTitle: string;
  resultsSubtitle: string;
  noResults: string;
  viewProduct: string;
  contactConcierge: string;
  questions: {
    occasion: { title: string; subtitle: string; options: Record<string, string> };
    palette: { title: string; subtitle: string; options: Record<string, string> };
    silhouette: { title: string; subtitle: string; options: Record<string, string> };
    budget: { title: string; subtitle: string; options: Record<string, string> };
  };
}

type OccasionKey = 'wedding' | 'formal' | 'casual' | 'party';
type PaletteKey = 'neutral' | 'earth' | 'jewel' | 'warm';
type SilhouetteKey = 'fitted' | 'flowy' | 'structured' | 'dramatic';
type BudgetKey = 'under5k' | 'range5to10' | 'range10to20' | 'above20k';

interface QuizAnswers {
  occasion: OccasionKey | null;
  palette: PaletteKey | null;
  silhouette: SilhouetteKey | null;
  budget: BudgetKey | null;
}

const BUDGET_RANGES: Record<BudgetKey, [number, number]> = {
  under5k:     [0, 5000],
  range5to10:  [5000, 10000],
  range10to20: [10000, 20000],
  above20k:    [20000, Infinity],
};

const OCCASION_KEYWORDS: Record<OccasionKey, string[]> = {
  wedding:  ['فستان', 'dress', 'gown', 'wedding', 'زفاف', 'engagement'],
  formal:   ['suit', 'formal', 'رسمي', 'blazer', 'classic'],
  casual:   ['casual', 'everyday', 'يومي', 'linen', 'cotton'],
  party:    ['party', 'festive', 'evening', 'سهرة', 'حفلة'],
};

const PALETTE_KEYWORDS: Record<PaletteKey, string[]> = {
  neutral: ['white', 'cream', 'beige', 'ivory', 'أبيض', 'كريمي', 'بيج'],
  earth:   ['black', 'khaki', 'brown', 'tan', 'أسود', 'بني', 'كاكي'],
  jewel:   ['blue', 'green', 'purple', 'teal', 'أزرق', 'أخضر', 'بنفسجي'],
  warm:    ['gold', 'orange', 'red', 'rust', 'ذهبي', 'برتقالي', 'أحمر'],
};

function scoreProduct(product: Product, answers: QuizAnswers): number {
  let score = 0;
  const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();

  if (answers.occasion) {
    const keywords = OCCASION_KEYWORDS[answers.occasion];
    if (keywords.some(k => text.includes(k.toLowerCase()))) score += 3;
  }

  if (answers.palette) {
    const keywords = PALETTE_KEYWORDS[answers.palette];
    if (keywords.some(k => text.includes(k.toLowerCase()))) score += 2;
  }

  if (answers.silhouette) {
    const silhouetteMap: Record<SilhouetteKey, string[]> = {
      fitted:     ['fitted', 'bodycon', 'structured', 'tailored'],
      flowy:      ['flowy', 'flowing', 'maxi', 'chiffon', 'silk', 'منسابة'],
      structured: ['structured', 'classic', 'formal', 'كلاسيكي'],
      dramatic:   ['dramatic', 'statement', 'bold', 'مبهر'],
    };
    if (silhouetteMap[answers.silhouette].some(k => text.includes(k))) score += 2;
  }

  if (answers.budget) {
    const [min, max] = BUDGET_RANGES[answers.budget];
    if (product.price >= min && product.price <= max) score += 4;
    else if (product.price < min * 1.3 && product.price > max * 0.7) score += 1;
  }

  return score;
}

const QUIZ_STEPS = ['occasion', 'palette', 'silhouette', 'budget'] as const;
type QuizStep = typeof QUIZ_STEPS[number];

export default function StyleQuizPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const isRTL = language === 'ar';
  const { open: openQuickView } = useQuickViewStore();

  const qt = t.styleQuiz as unknown as StyleQuizTranslations;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({ occasion: null, palette: null, silhouette: null, budget: null });
  const [showResults, setShowResults] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const currentStep = QUIZ_STEPS[step] as QuizStep;

  const handleSelect = (key: QuizStep, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < QUIZ_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      computeResults();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({ occasion: null, palette: null, silhouette: null, budget: null });
    setShowResults(false);
    setRecommendedProducts([]);
  };

  const computeResults = async () => {
    setLoading(true);
    let products = allProducts;
    if (products.length === 0) {
      const result = await getProducts(100);
      products = result?.products ?? [];
      setAllProducts(products);
    }

    const scored = products
      .map(p => ({ product: p, score: scoreProduct(p, answers) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(s => s.product);

    setRecommendedProducts(scored);
    setShowResults(true);
    setLoading(false);
  };

  const currentAnswer = answers[currentStep as keyof QuizAnswers];
  const questionKeys = qt.questions[currentStep as keyof typeof qt.questions];
  const optionKeys = Object.keys(questionKeys.options) as string[];

  const progressPct = ((step) / QUIZ_STEPS.length) * 100;

  return (
    <main className="min-h-screen bg-primary text-primary">
      {/* Hero */}
      <section className="relative h-[40vh] flex items-end pb-16 px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1400&auto=format&fit=crop)' }}
        />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-10 max-w-3xl">
          <p className="text-[9px] uppercase tracking-[0.5em] text-accent-primary mb-3 font-bold">WANAS · Style Profile</p>
          <h1 className="font-serif text-5xl md:text-6xl text-inverted leading-tight">{qt.title}</h1>
          <p className="text-inverted/70 text-sm mt-3">{qt.subtitle}</p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-20">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Progress */}
              <div className="mb-12">
                <div className="flex justify-between text-[9px] uppercase tracking-widest text-primary/40 mb-3 font-bold">
                  <span>{step + 1} / {QUIZ_STEPS.length}</span>
                  <span>{Math.round(((step + 1) / QUIZ_STEPS.length) * 100)}%</span>
                </div>
                <div className="h-px bg-primary/10 w-full relative">
                  <motion.div
                    className="h-px bg-accent-primary absolute top-0 start-0"
                    initial={{ width: `${progressPct}%` }}
                    animate={{ width: `${((step + 1) / QUIZ_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </div>
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 30 : -30 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <h2 className="font-serif text-4xl mb-3">{questionKeys.title}</h2>
                  <p className="text-sm text-primary/50 mb-10">{questionKeys.subtitle}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {optionKeys.map((optionKey) => {
                      const label = (questionKeys.options as Record<string, string>)[optionKey];
                      const isSelected = currentAnswer === optionKey;
                      return (
                        <motion.button
                          key={optionKey}
                          onClick={() => handleSelect(currentStep, optionKey)}
                          whileTap={{ scale: 0.98 }}
                          className={`p-5 text-start border transition-all duration-300 ${
                            isSelected
                              ? 'border-accent-primary bg-accent-primary/5 text-primary'
                              : 'border-primary/10 text-primary/70 hover:border-primary/30 hover:text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                              isSelected ? 'border-accent-primary bg-accent-primary' : 'border-primary/30'
                            }`} />
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className={`flex mt-12 gap-4 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
                {step > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-primary/50 hover:text-primary transition-colors py-3 px-6 border border-primary/10 hover:border-primary/30"
                  >
                    {isRTL ? <ArrowRight size={14} strokeWidth={1.5} /> : <ArrowLeft size={14} strokeWidth={1.5} />}
                    {qt.back}
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!currentAnswer || loading}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] bg-primary text-inverted py-3 px-8 hover:bg-accent-primary transition-colors disabled:opacity-30"
                >
                  {loading ? (
                    <span className="animate-pulse">{qt.seeResults}...</span>
                  ) : step === QUIZ_STEPS.length - 1 ? (
                    <><Sparkles size={14} strokeWidth={1.5} /> {qt.seeResults}</>
                  ) : (
                    <>{qt.next} {isRTL ? <ArrowLeft size={14} strokeWidth={1.5} /> : <ArrowRight size={14} strokeWidth={1.5} />}</>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Results header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 text-accent-primary mb-4">
                  <Sparkles size={14} strokeWidth={1.5} />
                  <span className="text-[9px] uppercase tracking-[0.5em] font-bold">{qt.resultsTitle}</span>
                  <Sparkles size={14} strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-4xl mb-3">{qt.resultsSubtitle}</h2>
              </div>

              {recommendedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
                  {recommendedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <div
                        className="relative aspect-[3/4] overflow-hidden mb-4 cursor-pointer"
                        onClick={() => openQuickView(product)}
                      >
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary" />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                        <div className="absolute bottom-0 inset-x-0 py-3 bg-primary/80 backdrop-blur-sm text-center opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-500">
                          <span className="text-[9px] uppercase tracking-[0.4em] text-inverted font-bold">{qt.viewProduct}</span>
                        </div>
                      </div>
                      <h3 className="font-serif text-2xl mb-1">{product.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-primary/40 mb-2">{product.category}</p>
                      <p className="text-accent-primary text-[10px] uppercase tracking-widest font-bold">{formatPrice(product.price)}</p>
                      <Link
                        href={`/product/${product.slug}`}
                        className="mt-3 inline-flex items-center gap-2 text-[9px] uppercase tracking-widest text-primary/50 hover:text-primary transition-colors"
                      >
                        {qt.viewProduct}
                        {isRTL ? <ArrowLeft size={10} /> : <ArrowRight size={10} />}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border border-primary/10 mb-16">
                  <p className="text-primary/50 text-sm mb-6">{qt.noResults}</p>
                  <Link
                    href="/concierge"
                    className="inline-flex items-center gap-2 py-3 px-8 bg-primary text-inverted text-[10px] uppercase tracking-[0.3em]"
                  >
                    <MessageCircle size={14} strokeWidth={1.5} />
                    {qt.contactConcierge}
                  </Link>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center justify-center gap-2 py-3 px-8 border border-primary/10 text-[10px] uppercase tracking-[0.3em] text-primary/60 hover:border-primary/30 hover:text-primary transition-all"
                >
                  <RotateCcw size={13} strokeWidth={1.5} />
                  {qt.restart}
                </button>
                <Link
                  href="/collections"
                  className="inline-flex items-center justify-center gap-2 py-3 px-8 bg-primary text-inverted text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-colors"
                >
                  View All Collections
                  {isRTL ? <ArrowLeft size={13} strokeWidth={1.5} /> : <ArrowRight size={13} strokeWidth={1.5} />}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
