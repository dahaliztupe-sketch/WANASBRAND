'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, Heart, MessageCircle, ShoppingBag, Zap,
  Clock, Share2, Loader2, AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageWrapper';
import type { LiveEvent } from '@/lib/services/live-shopping';

export default function LiveShoppingPage() {
  const { id } = useParams() as { id: string };
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [event, setEvent]     = useState<LiveEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [chat, setChat]       = useState<Array<{ id: string; name: string; message: string; time: string }>>([]);
  const [input, setInput]     = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      const { subscribeToEventUpdates } = await import('@/lib/services/live-shopping');
      unsubscribe = subscribeToEventUpdates(id, (ev) => {
        setEvent(ev);
        setLoading(false);
      });
    };

    init();
    return () => { unsubscribe?.(); };
  }, [id]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setChat(prev => [...prev, {
      id: Date.now().toString(),
      name: isAr ? 'أنتِ' : 'You',
      message: input,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-accent-primary mx-auto" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/40">
            {isAr ? 'جارٍ التحميل' : 'Loading'}
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-8 h-8 text-primary/20 mx-auto" strokeWidth={1} />
          <p className="font-serif text-2xl italic text-primary/60">
            {isAr ? 'الحدث غير متوفر' : 'Event not available'}
          </p>
          <Link href="/collections" className="text-[10px] uppercase tracking-widest text-accent-primary hover:underline">
            {isAr ? 'استكشفي التشكيلة' : 'Explore Collection'}
          </Link>
        </div>
      </div>
    );
  }

  const isLive = event.status === 'live';
  const isScheduled = event.status === 'scheduled';

  return (
    <div className="min-h-screen bg-inverted text-inverted" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-inverted/90 backdrop-blur-xl border-b border-inverted/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isLive && (
            <span className="flex items-center gap-1.5 bg-red-500 px-2 py-0.5 text-[9px] uppercase tracking-widest text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {isAr ? 'مباشر' : 'LIVE'}
            </span>
          )}
          {isScheduled && (
            <span className="flex items-center gap-1.5 bg-accent-primary/20 border border-accent-primary/30 px-2 py-0.5 text-[9px] uppercase tracking-widest text-accent-primary">
              <Clock className="w-3 h-3" />
              {isAr ? 'قريباً' : 'UPCOMING'}
            </span>
          )}
          <p className="text-xs font-medium">{event.title}</p>
        </div>
        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-1.5 text-[10px] text-inverted/50">
              <Eye className="w-3.5 h-3.5" />
              {event.viewerCount ?? 0}
            </div>
          )}
          <button className="text-inverted/40 hover:text-inverted transition-colors">
            <Share2 className="w-4 h-4" strokeWidth={1} />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-52px)]">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-black">
          {isLive ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full border-2 border-accent-primary/30 flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-accent-primary" strokeWidth={1} />
                </div>
                <p className="text-xs text-inverted/40 uppercase tracking-widest">
                  {isAr ? 'يُبث الآن مباشرةً' : 'Live stream active'}
                </p>
              </div>
            </div>
          ) : isScheduled ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-6 p-8">
                <p className="text-[10px] uppercase tracking-[0.4em] text-accent-primary">
                  {isAr ? 'موعد الحدث' : 'Event starts'}
                </p>
                <p className="font-serif text-3xl italic text-inverted/80">
                  {new Date(event.startTime).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                  })}
                </p>

                {!subscribed ? (
                  <button
                    onClick={() => setSubscribed(true)}
                    className="px-8 py-3 bg-accent-primary text-primary text-[10px] uppercase tracking-[0.3em] hover:bg-accent-hover transition-all"
                  >
                    {isAr ? 'أشعريني عند البدء' : 'Notify Me'}
                  </button>
                ) : (
                  <p className="text-[10px] text-green-400 uppercase tracking-widest">
                    {isAr ? '✓ سنُشعركِ عند البدء' : '✓ We\'ll notify you'}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-inverted/30 text-sm">{isAr ? 'انتهى الحدث' : 'Event ended'}</p>
            </div>
          )}

          {/* Product Highlights (floating) */}
          {isLive && Array.isArray(event.products) && event.products.slice(0, 3).length > 0 && (
            <div className="absolute bottom-4 start-4 space-y-2">
              {event.products.slice(0, 3).map((pid, i) => (
                <motion.div
                  key={pid as string}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-2 border border-inverted/10"
                >
                  <div className="w-10 h-10 bg-inverted/10 shrink-0" />
                  <div>
                    <p className="text-[10px] text-inverted/80 uppercase tracking-widest">
                      {isAr ? 'القطعة المعروضة' : 'Featured now'}
                    </p>
                    <Link
                      href={`/product/${pid as string}`}
                      className="text-[10px] text-accent-primary uppercase tracking-widest hover:underline"
                    >
                      {isAr ? 'احجزي الآن ←' : 'Reserve Now →'}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 border-s border-inverted/10 flex flex-col bg-inverted">
          {/* Event Info */}
          <div className="p-4 border-b border-inverted/10">
            <p className="font-serif text-base italic">{event.title}</p>
            <p className="text-[10px] text-inverted/40 mt-1 leading-relaxed line-clamp-2">{event.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-[10px] text-inverted/40">
                <Heart className="w-3 h-3" />
                <span>{event.subscriberCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-inverted/40">
                <Eye className="w-3 h-3" />
                <span>{event.viewerCount ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chat.length === 0 ? (
              <p className="text-[10px] text-inverted/20 text-center py-8 uppercase tracking-widest">
                {isAr ? 'كوني أول من يُعلّق' : 'Be the first to comment'}
              </p>
            ) : (
              <AnimatePresence>
                {chat.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-accent-primary/20 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[9px] text-accent-primary uppercase">{msg.name}</span>
                        <span className="text-[8px] text-inverted/20">{msg.time}</span>
                      </div>
                      <p className="text-[11px] text-inverted/70 mt-0.5">{msg.message}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-inverted/10 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isAr ? 'اكتبي رسالة...' : 'Say something...'}
              className="flex-1 bg-inverted/5 border border-inverted/10 px-3 py-2 text-xs focus:outline-none focus:border-accent-primary text-inverted placeholder:text-inverted/20 transition-colors"
            />
            <button
              type="submit"
              className="px-3 bg-accent-primary/20 text-accent-primary hover:bg-accent-primary hover:text-primary transition-all"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
