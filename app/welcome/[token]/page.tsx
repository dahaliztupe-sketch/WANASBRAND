'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Play, Heart, ShieldCheck, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo';

interface VerifyResponse {
  valid: boolean;
  error?: string;
  customerName?: string;
  reservationId?: string;
}

export default function WelcomePage() {
  const params  = useParams();
  const token   = params.token as string;
  const router  = useRouter();
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setError('رابط غير صالح'); setLoading(false); return; }

      try {
        const res = await fetch('/api/welcome/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data: VerifyResponse = await res.json();

        if (!data.valid) {
          const messages: Record<string, string> = {
            'Token already used':   'تم استخدام هذا الرابط من قبل',
            'Token expired':        'انتهت صلاحية هذا الرابط',
            'Token not found':      'الرابط غير صالح',
          };
          throw new Error(messages[data.error ?? ''] ?? 'رابط غير صالح');
        }

        setCustomerName(data.customerName ?? null);
        setVerified(true);
        toast.success('مرحباً بكِ في الدائرة الداخلية ✨');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'رابط غير صالح';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-inverted text-inverted flex flex-col items-center justify-center gap-6">
        <Loader2 strokeWidth={1} className="w-8 h-8 animate-spin text-accent-primary" />
        <p className="text-[10px] uppercase tracking-[0.4em] text-inverted/40 animate-pulse">
          جارٍ التحقق من دعوتكِ
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-inverted text-inverted flex flex-col items-center justify-center p-6 text-center gap-6">
        <Logo className="w-20 h-auto opacity-60" animated={false} />
        <div className="space-y-3">
          <p className="font-serif text-2xl italic text-inverted/70">{error}</p>
          <p className="text-xs text-inverted/40 tracking-wide">
            إذا كنتِ تعتقدين أن هذا خطأ، تواصلي معنا عبر واتساب
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-8 py-3 border border-inverted/20 text-[10px] uppercase tracking-[0.3em] hover:bg-inverted/10 transition-all"
        >
          العودة للأتيليه
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-inverted text-inverted flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full space-y-14"
      >
        {/* Logo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Logo className="w-28 h-auto mx-auto" />
        </motion.div>

        {/* Verified badge */}
        {verified && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-green-400">
              تم التحقق بنجاح
            </span>
          </motion.div>
        )}

        {/* Headline */}
        <div className="space-y-4">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[10px] uppercase tracking-[0.5em] text-accent-primary"
          >
            The Inner Circle — الدائرة الداخلية
          </motion.span>
          <h1 className="font-serif text-4xl md:text-6xl italic leading-tight">
            {customerName ? `أهلاً بكِ، ${customerName}` : 'مرحباً بكِ في وناس'}
          </h1>
          <p className="text-inverted/50 font-light leading-loose tracking-wide text-base max-w-lg mx-auto">
            قطعتكِ من أتيليه وناس تحمل معها عضويتكِ في الدائرة الداخلية — 
            مجتمع من تقدّر فن الأناقة المتأنية.
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="relative aspect-video border border-inverted/10 group cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-inverted/5 to-accent-primary/5" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 rounded-full border border-accent-primary/30 flex items-center justify-center bg-inverted/10 backdrop-blur-sm hover:bg-accent-primary transition-all duration-500"
            >
              <Play strokeWidth={1} className="w-6 h-6 fill-current" />
            </motion.div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-inverted/40">
              دليل العناية بقطعتكِ
            </span>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4">
          {[
            { icon: Heart, title: 'حرفية يدوية', body: 'كل غرزة تُحاك بإتقان في أتيليه القاهرة.' },
            { icon: ShieldCheck, title: 'عناية مدى الحياة', body: 'ترميم مجاني لأعضاء الدائرة الداخلية.' },
            { icon: Sparkles, title: 'وصول حصري', body: 'أولوية الحجز في الإصدارات الموسمية المحدودة.' },
          ].map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
              className="space-y-3"
            >
              <Icon strokeWidth={1} className="w-5 h-5 mx-auto text-accent-primary" />
              <h3 className="text-xs uppercase tracking-[0.2em]">{title}</h3>
              <p className="text-[10px] text-inverted/40 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="pt-6 space-y-4"
        >
          <button
            onClick={() => router.push('/collections')}
            className="px-12 py-4 bg-accent-primary text-primary text-[10px] uppercase tracking-[0.3em] hover:bg-accent-hover transition-all duration-500 shadow-[0_4px_24px_rgba(212,175,55,0.3)]"
          >
            استكشفي التشكيلة
          </button>
          <p className="text-[9px] text-inverted/20 uppercase tracking-widest">
            أتيليه وناس — حيث تلتقي الحرفية بالأناقة
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
