'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Star, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

import FeaturedProducts from '@/components/FeaturedProducts';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Product } from '@/types';

export default function HomeClient({ featuredProductsPromise }: { featuredProductsPromise: Promise<Product[]> }) {
  const { t, language } = useTranslation();

  return (
    <main className="min-h-screen bg-primary text-primary overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-gradient">
        <div className="absolute inset-0 linen-texture pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-24 pb-12">
          
          {/* Left Side: Massive Typography */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-12 z-20"
          >
            <span className="text-[10px] uppercase tracking-[0.8em] text-accent-primary font-bold block">
              {t.home.hero.subtitle}
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-[11rem] font-serif text-primary tracking-tighter leading-[0.85] whitespace-pre-line mix-blend-difference dark:mix-blend-normal">
              {t.home.hero.titleLine1} <br /> <span className="italic text-accent-primary">{t.home.hero.titleLine2}</span> <br /> {t.home.hero.titleLine3}
            </h1>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="flex flex-col sm:flex-row items-start gap-8 pt-8"
            >
              <Link 
                href="/collections"
                className="group relative px-12 py-5 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.4em] font-bold overflow-hidden transition-all hover:bg-accent-primary hover:text-white invert dark:invert-0"
              >
                <span className="relative z-10">{t.home.hero.explore}</span>
              </Link>
              <Link 
                href="/reserve"
                className="px-12 py-5 border border-primary/20 text-primary text-[10px] uppercase tracking-[0.4em] font-bold backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:invert dark:hover:invert-0 transition-all"
              >
                {t.home.hero.privateViewing}
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side: Overlapping Images */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
            className="lg:col-span-5 relative h-[60vh] lg:h-[80vh] w-full hidden md:block"
          >
            <div className="absolute top-0 right-0 w-[80%] h-[90%] bg-secondary overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1974&auto=format&fit=crop"
                alt="Editorial Fashion"
                fill
                className="object-cover object-top"
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 50vw"
                referrerPolicy="no-referrer"
              />
            </div>
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 1.5, delay: 1 }}
              className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-primary p-2 shadow-2xl"
            >
              <div className="relative w-full h-full bg-secondary overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=2026&auto=format&fit=crop"
                  alt="Detail Shot"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-6 md:left-12 flex flex-col items-center gap-4"
        >
          <span className="text-[8px] uppercase tracking-[0.4em] text-primary/40 rotate-90 origin-left translate-y-8">{t.home.hero.scroll}</span>
          <div className="w-px h-24 bg-gradient-to-b from-primary/20 to-transparent mt-8" />
        </motion.div>
      </section>

      {/* Featured Collection */}
      <section className="py-32 px-6 bg-secondary/30">
        <RevealOnScroll className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary/40 font-bold">{t.home.featured.season}</span>
              <h2 className="text-4xl md:text-5xl font-serif text-primary">{t.home.featured.title}</h2>
            </div>
            <Link 
              href="/collections"
              className="text-xs uppercase tracking-widest font-bold border-b border-primary pb-2 hover:text-accent-primary hover:border-accent-primary transition-all"
            >
              {t.home.featured.viewAll}
            </Link>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`flex flex-col items-start ${
                  i === 0 ? 'md:col-span-6 md:col-start-1' :
                  i === 1 ? 'md:col-span-4 md:col-start-8 md:mt-48' :
                  'md:col-span-8 md:col-start-3 md:mt-32'
                }`}>
                  <div className={`w-full ${
                    i === 0 ? 'aspect-[3/4]' :
                    i === 1 ? 'aspect-[4/5]' :
                    'aspect-[16/9]'
                  } mb-8 bg-primary/5 animate-pulse rounded-sm`}></div>
                  <div className="h-6 bg-primary/5 animate-pulse rounded-sm w-3/4 mb-2"></div>
                  <div className="h-4 bg-primary/5 animate-pulse rounded-sm w-1/4"></div>
                </div>
              ))}
            </div>
          }>
            <FeaturedProducts featuredProductsPromise={featuredProductsPromise} />
          </Suspense>
        </RevealOnScroll>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 bg-primary">
        <RevealOnScroll className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.4em] text-accent-primary font-bold">{t.home.philosophy.subtitle}</span>
              <h2 className="text-4xl md:text-6xl font-serif text-primary leading-tight">
                {t.home.philosophy.titleLine1} <span className="italic">{t.home.philosophy.titleLine2}</span> <br />
                {t.home.philosophy.titleLine3} <br />
                {t.home.philosophy.titleLine4}
              </h2>
            </div>
            <p className="text-primary/60 font-sans leading-relaxed max-w-md">
              {t.home.philosophy.description}
            </p>
            <div className="grid grid-cols-2 gap-12 pt-8">
              <div className="space-y-4">
                <Star strokeWidth={1} className="w-6 h-6 text-accent-primary" />
                <h3 className="text-xs uppercase tracking-widest font-bold">{t.home.philosophy.qualityTitle}</h3>
                <p className="text-xs text-primary/40 leading-relaxed font-sans">{t.home.philosophy.qualityDesc}</p>
              </div>
              <div className="space-y-4">
                <ShieldCheck strokeWidth={1} className="w-6 h-6 text-accent-primary" />
                <h3 className="text-xs uppercase tracking-widest font-bold">{t.home.philosophy.authTitle}</h3>
                <p className="text-xs text-primary/40 leading-relaxed font-sans">{t.home.philosophy.authDesc}</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/5] bg-secondary overflow-hidden group">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
              alt="Craftsmanship"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
              referrerPolicy="no-referrer"
            />
          </div>
        </RevealOnScroll>
      </section>

      {/* Style Quiz Promo Section */}
      <section className="relative py-24 px-6 overflow-hidden bg-secondary">
        <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1400&auto=format&fit=crop)' }} />
        <RevealOnScroll className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-accent-primary mb-6">
            <Sparkles size={14} strokeWidth={1.5} />
            <span className="text-[9px] uppercase tracking-[0.5em] font-bold">Style Profile</span>
            <Sparkles size={14} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-primary mb-6 leading-tight">
            {language === 'ar' ? 'اكتشفي أسلوبك الخاص' : 'Discover Your Signature Style'}
          </h2>
          <p className="text-primary/60 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-10">
            {language === 'ar'
              ? 'أجيبي على بضعة أسئلة وسنختار لك القطع الأكثر انسجاماً مع روحك وأناقتك'
              : 'Answer a few questions and let us curate the perfect pieces for your unique aesthetic'
            }
          </p>
          <Link
            href="/style-quiz"
            className="inline-flex items-center gap-3 py-4 px-10 bg-primary text-inverted text-[10px] uppercase tracking-[0.4em] hover:bg-accent-primary transition-colors duration-500 group"
          >
            {language === 'ar' ? 'ابدئي الاختبار' : 'Take the Quiz'}
            <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </RevealOnScroll>
      </section>

      {/* Concierge Section */}
      <section className="relative py-48 px-6 bg-primary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2000&auto=format&fit=crop"
            alt="Atelier Background"
            fill
            className="object-cover grayscale"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary" />

        <RevealOnScroll className="relative z-10 max-w-4xl mx-auto text-center space-y-16">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-px h-24 bg-accent-primary/50" />
            <span className="text-[10px] uppercase tracking-[0.6em] text-accent-primary font-bold">{t.home.concierge.subtitle}</span>
          </div>
          
          <div className="space-y-8">
            <h2 className="text-5xl md:text-8xl font-serif leading-[1.1] text-primary">
              {t.home.concierge.titleLine1} <br />
              <span className="italic text-accent-primary">{t.home.concierge.titleLine2}</span> {t.home.concierge.titleLine3}
            </h2>
            <p className="text-primary/60 font-sans leading-relaxed text-lg max-w-2xl mx-auto">
              {t.home.concierge.description}
            </p>
          </div>

          <div className="pt-8">
            <Link 
              href="/reserve"
              className="group relative inline-flex items-center justify-center px-16 py-6 bg-transparent border border-primary/20 text-primary text-[10px] uppercase tracking-[0.4em] font-bold overflow-hidden transition-all hover:border-primary"
            >
              <span className="absolute inset-0 w-0 bg-primary transition-all duration-[800ms] ease-out group-hover:w-full" />
              <span className="relative z-10 group-hover:text-primary-foreground group-hover:invert dark:group-hover:invert-0 transition-colors duration-500">
                {t.home.concierge.book}
              </span>
            </Link>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}
