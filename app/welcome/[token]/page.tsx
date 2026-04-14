'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Play, Heart, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

import { db } from '@/lib/firebase/client';

export default function WelcomePage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // This is a placeholder for actual verification logic
        // In a real app, you would verify the token against your backend
        if (!token) throw new Error('Invalid token');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setLoading(false);
      } catch (err) {
        setError('Invalid or expired token');
        setLoading(false);
        toast.error('Invalid or expired token');
      }
    };

    verifyToken();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-inverted text-inverted flex items-center justify-center">
        <Loader2 strokeWidth={1} className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-inverted text-inverted flex items-center justify-center p-6 text-center">
        <p className="text-xl font-serif italic">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-inverted text-inverted flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-2xl w-full space-y-12"
      >
        <div className="space-y-4">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[10px] uppercase tracking-[0.5em] text-accent-primary"
          >
            The Inner Circle
          </motion.span>
          <h1 className="font-serif text-5xl md:text-6xl italic">Welcome to WANAS</h1>
          <p className="text-inverted/60 font-light leading-relaxed tracking-wide text-lg">
            Your WANAS piece has arrived. You are now part of the Inner Circle, 
            a community for those who appreciate the art of intentional living.
          </p>
        </div>

        {/* Video Guide Placeholder */}
        <div className="relative aspect-video bg-primary/5 border border-primary/10 group cursor-pointer overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1594913785162-e6786b42dea3?q=80&w=1200&auto=format&fit=crop"
            alt="Fabric Care Guide"
            fill
            className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center bg-inverted/40 backdrop-blur-sm group-hover:bg-accent-primary transition-colors">
              <Play strokeWidth={1} className="w-6 h-6 fill-white" />
            </div>
            <span className="text-[10px] uppercase tracking-widest">Caring for your Silk & Linen</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          <div className="space-y-3">
            <Heart strokeWidth={1} className="w-5 h-5 mx-auto text-accent-primary" />
            <h3 className="text-xs uppercase tracking-widest">Handcrafted</h3>
            <p className="text-[10px] text-inverted/40 leading-relaxed">Each thread woven with intention in our Cairo atelier.</p>
          </div>
          <div className="space-y-3">
            <ShieldCheck strokeWidth={1} className="w-5 h-5 mx-auto text-accent-primary" />
            <h3 className="text-xs uppercase tracking-widest">Lifetime Care</h3>
            <p className="text-[10px] text-inverted/40 leading-relaxed">Complimentary restoration for all Inner Circle members.</p>
          </div>
          <div className="space-y-3">
            <Sparkles strokeWidth={1} className="w-5 h-5 mx-auto text-accent-primary" />
            <h3 className="text-xs uppercase tracking-widest">Exclusive Access</h3>
            <p className="text-[10px] text-inverted/40 leading-relaxed">First priority for our seasonal capsule releases.</p>
          </div>
        </div>

        <div className="pt-12">
          <button 
            onClick={() => router.push('/collections')}
            className="px-12 py-4 bg-primary text-primary text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary hover:text-inverted transition-all duration-700 shadow-xl"
          >
            Explore the Collection
          </button>
        </div>
        
        <p className="text-[8px] text-inverted/20 uppercase tracking-widest pt-12">
          Token ID: {token}
        </p>
      </motion.div>
    </div>
  );
}
