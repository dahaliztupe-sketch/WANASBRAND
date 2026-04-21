'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, ShoppingBag, Heart } from 'lucide-react';

interface SocialProofItem {
  id: string;
  type: 'purchase' | 'viewing' | 'wishlist';
  message: string;
  messageAr: string;
  location?: string;
  timeAgo: string;
}

const SAMPLE_EVENTS: SocialProofItem[] = [
  { id: '1', type: 'purchase',  message: 'Someone from Cairo just reserved', messageAr: 'عميلة من القاهرة حجزت للتو',   location: 'القاهرة',     timeAgo: 'منذ دقيقتين' },
  { id: '2', type: 'viewing',   message: '12 people viewing this now',        messageAr: '١٢ شخصاً يشاهدون هذا الآن',   location: '',            timeAgo: 'الآن'         },
  { id: '3', type: 'purchase',  message: 'Someone from Alexandria just reserved', messageAr: 'عميلة من الإسكندرية حجزت للتو', location: 'الإسكندرية', timeAgo: 'منذ ٥ دقائق' },
  { id: '4', type: 'wishlist',  message: '8 people have wishlisted this',     messageAr: '٨ عميلات أضفنه للمفضلة',      location: '',            timeAgo: 'اليوم'        },
  { id: '5', type: 'purchase',  message: 'Someone from Dubai just reserved',  messageAr: 'عميلة من دبي حجزت للتو',      location: 'دبي',         timeAgo: 'منذ ساعة'     },
];

interface SocialProofProps {
  productId?: string;
  viewerCount?: number;
  language?: 'ar' | 'en';
  showViewerCount?: boolean;
}

export function SocialProofBanner({ productId: _productId, viewerCount = 0, language = 'ar', showViewerCount = true }: SocialProofProps) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const events = SAMPLE_EVENTS;

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % events.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [events.length]);

  const event = events[current]!;

  const icons = {
    purchase: <ShoppingBag className="w-3 h-3 text-[#D4AF37]" />,
    viewing:  <Eye className="w-3 h-3 text-blue-400" />,
    wishlist: <Heart className="w-3 h-3 text-rose-400" />,
  };

  return (
    <div className="space-y-2">
      {showViewerCount && viewerCount > 1 && (
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
          </span>
          <p className="text-[9px] text-primary/50 uppercase tracking-widest">
            {language === 'ar' ? `${viewerCount} يشاهدون الآن` : `${viewerCount} viewing now`}
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 py-2 border-s-2 border-accent-primary/30 ps-3"
          >
            {icons[event.type]}
            <p className="text-[10px] text-primary/60">
              {language === 'ar' ? event.messageAr : event.message}
            </p>
            <span className="text-[9px] text-primary/30 ms-auto shrink-0">{event.timeAgo}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ViewerPulse({ count, language = 'ar' }: { count: number; language?: 'ar' | 'en' }) {
  if (count < 2) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1">
        {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full bg-gradient-to-br from-accent-primary/60 to-accent-hover border border-primary"
            style={{ zIndex: 5 - i }}
          />
        ))}
      </div>
      <p className="text-[9px] text-primary/50 uppercase tracking-widest">
        {language === 'ar'
          ? `${count > 5 ? `+${count}` : count} يشاهدون الآن`
          : `${count > 5 ? `+${count}` : count} viewing`}
      </p>
    </div>
  );
}

export function LowStockBadge({ stock, language = 'ar' }: { stock: number; language?: 'ar' | 'en' }) {
  if (stock > 5) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9px] uppercase tracking-widest ${
        stock <= 1
          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
          : stock <= 3
          ? 'bg-orange-400/10 text-orange-400 border border-orange-400/20'
          : 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
      }`}
    >
      <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
      {language === 'ar'
        ? stock <= 1 ? 'آخر قطعة!' : stock <= 3 ? `${stock} قطع متبقية` : `${stock} قطع فقط`
        : stock <= 1 ? 'Last piece!' : stock <= 3 ? `Only ${stock} left` : `Only ${stock} remaining`}
    </motion.div>
  );
}

export function UrgencyTimer({ hours = 24, language = 'ar' }: { hours?: number; language?: 'ar' | 'en' }) {
  const [timeLeft, setTimeLeft] = useState(hours * 3600);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      <p className="text-[9px] uppercase tracking-widest text-primary/50">
        {language === 'ar' ? 'العرض ينتهي خلال:' : 'Offer ends in:'}
      </p>
      <div className="flex items-center gap-1 font-mono text-xs text-accent-primary">
        <span>{pad(h)}</span>
        <span className="opacity-50">:</span>
        <span>{pad(m)}</span>
        <span className="opacity-50">:</span>
        <span>{pad(s)}</span>
      </div>
    </div>
  );
}
