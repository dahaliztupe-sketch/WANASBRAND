'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary border-t border-primary/5 pt-20 pb-10 px-6 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="text-2xl font-serif font-medium tracking-[0.3em] text-primary">
              WANAS
            </Link>
            <p className="text-secondary text-sm leading-relaxed max-w-xs">
              A digital atelier curated for the modern woman who finds beauty in quiet moments and tactile luxury.
            </p>
            <div className="flex gap-4 items-center">
              <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#"} target="_blank" rel="noopener noreferrer" className="text-secondary/60 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" strokeWidth={1} />
              </a>
              <a href={process.env.NEXT_PUBLIC_FACEBOOK_URL || "#"} target="_blank" rel="noopener noreferrer" className="text-secondary/60 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" strokeWidth={1} />
              </a>
              <a href={process.env.NEXT_PUBLIC_TWITTER_URL || "#"} target="_blank" rel="noopener noreferrer" className="text-secondary/60 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" strokeWidth={1} />
              </a>
              <div className="ml-2 border-l border-primary/10 pl-4">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Column 2: Client Services */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-primary">Client Services</h4>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-secondary hover:text-primary text-sm transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-secondary hover:text-primary text-sm transition-colors">FAQ</Link></li>
              <li><Link href="/size-guide" className="text-secondary hover:text-primary text-sm transition-colors">Size Guide</Link></li>
              <li><Link href="/returns" className="text-secondary hover:text-primary text-sm transition-colors">Returns</Link></li>
            </ul>
          </div>

          {/* Column 3: About WANAS */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-primary">The Atelier</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-secondary hover:text-primary text-sm transition-colors">Our Story</Link></li>
              <li><button onClick={(e) => { e.preventDefault(); toast('This exclusive feature is being curated for you.'); }} className="text-secondary hover:text-primary text-sm transition-colors">Careers</button></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-primary">Newsletter</h4>
            <p className="text-secondary text-sm leading-relaxed">
              Join the WANAS Inner Circle for exclusive access to new collections and stories.
            </p>
            <form className="relative" onSubmit={(e) => { e.preventDefault(); toast('Thank you for subscribing to the WANAS Inner Circle.'); }}>
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                required
                className="w-full bg-primary/5 border-none px-4 py-3 text-[10px] tracking-widest uppercase focus:ring-1 focus:ring-accent-primary outline-none transition-all text-primary"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-accent-primary transition-colors">
                <ArrowRight strokeWidth={1} className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-10 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-secondary/40">
            © {currentYear} WANAS ATELIER. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-secondary/40">
            DESIGNED FOR THE MODERN ATELIER.
          </p>
        </div>
      </div>
    </footer>
  );
}
