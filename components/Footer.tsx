'use client';

import Link from 'next/link';
import { Instagram, Facebook, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

import { useAudioStore } from '@/lib/store/useAudioStore';
import { useTranslation } from '@/lib/hooks/useTranslation';

import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t, language } = useTranslation();
  const { isMuted, toggleMute } = useAudioStore();

  return (
    <footer className="bg-primary border-t border-primary/10 pt-32 pb-12 px-6 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24 mb-32">
          {/* Column 1: Brand (Takes up more space) */}
          <div className="md:col-span-12 lg:col-span-5 space-y-8">
            <Link href="/" className="block hover:opacity-70 transition-opacity">
              <Logo className="w-40 h-auto text-primary" />
            </Link>
            <p className="text-primary/60 text-lg leading-loose font-light max-w-md font-sans">
              {t.nav.brand_desc}
            </p>
            <div className="flex gap-8 items-center pt-4">
              <a 
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary/40 hover:text-accent-primary transition-colors flex items-center gap-3 group"
                aria-label="Follow WANAS on Instagram"
              >
                <Instagram className="w-5 h-5" strokeWidth={1} />
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-0 group-hover:opacity-100 transition-opacity">{t.nav.social.instagram}</span>
              </a>
              <a 
                href={process.env.NEXT_PUBLIC_FACEBOOK_URL || "#"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary/40 hover:text-accent-primary transition-colors flex items-center gap-3 group"
                aria-label="Follow WANAS on Facebook"
              >
                <Facebook className="w-5 h-5" strokeWidth={1} />
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-0 group-hover:opacity-100 transition-opacity">{t.nav.social.facebook}</span>
              </a>
              <div className="ms-auto flex items-center gap-4">
                <button onClick={toggleMute} className="text-primary/40 hover:text-accent-primary transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" strokeWidth={1} /> : <Volume2 className="w-5 h-5" strokeWidth={1} />}
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Column 2: Client Services */}
          <div className="md:col-span-4 lg:col-span-2 space-y-8 lg:ml-auto">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary/40">{t.nav.client_services}</h4>
            <ul className="space-y-6">
              <li><Link href="/contact" className="text-primary/80 hover:text-accent-primary text-sm tracking-wide transition-colors">{t.nav.contact}</Link></li>
              <li><Link href="/faq" className="text-primary/80 hover:text-accent-primary text-sm tracking-wide transition-colors">{t.nav.faq}</Link></li>
              <li><Link href="/size-guide" className="text-primary/80 hover:text-accent-primary text-sm tracking-wide transition-colors">{t.nav.size_guide}</Link></li>
              <li><Link href="/style-quiz" className="text-primary/80 hover:text-accent-primary text-sm tracking-wide transition-colors">{language === 'ar' ? 'اكتشفي أسلوبك' : 'Style Quiz'}</Link></li>
              <li><Link href="/returns" className="text-primary/80 hover:text-accent-primary text-sm tracking-wide transition-colors">{t.nav.returns}</Link></li>
            </ul>
          </div>

          {/* Column 3: About WANAS */}
          <div className="md:col-span-4 lg:col-span-2 space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary/40">{t.nav.the_atelier}</h4>
            <ul className="space-y-6">
              <li><Link href="/about" className="text-primary/80 hover:text-accent-primary text-sm tracking-wide transition-colors">{t.nav.our_story}</Link></li>
              <li><button onClick={(e) => { e.preventDefault(); toast('This exclusive feature is being curated for you.'); }} className="text-primary/80 hover:text-accent-primary text-sm tracking-wide transition-colors">{t.nav.careers}</button></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="md:col-span-4 lg:col-span-3 space-y-8">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary/40">{t.nav.inner_circle}</h4>
            <p className="text-primary/60 text-sm leading-loose font-light">
              {t.nav.newsletter_desc}
            </p>
            <form className="relative group" onSubmit={(e) => { e.preventDefault(); toast('Thank you for subscribing to the WANAS Inner Circle.'); }}>
              <input 
                type="email" 
                placeholder={t.nav.email_address}
                required
                className="w-full bg-transparent border-b border-primary/20 px-0 py-4 text-[10px] tracking-[0.3em] uppercase focus:border-accent-primary outline-none transition-colors text-primary placeholder:text-primary/30"
              />
              <button 
                type="submit" 
                className="absolute end-0 top-1/2 -translate-y-1/2 text-primary/40 group-hover:text-accent-primary transition-colors"
                aria-label="Subscribe to newsletter"
              >
                <ArrowRight strokeWidth={1} className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-12 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] uppercase tracking-[0.4em] text-primary/40 font-bold">
            © {currentYear} WANAS ATELIER. {t.nav.all_rights}
          </p>
          <p className="text-[9px] uppercase tracking-[0.4em] text-primary/40 font-bold">
            {t.nav.designed_for}
          </p>
        </div>
      </div>
    </footer>
  );
}
