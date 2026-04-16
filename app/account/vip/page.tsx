'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Crown, Star, Gift, ShieldCheck, Sparkles } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase/client';

export default function VIPPage() {
  const [user, setUser] = useState<User & { loyaltyPoints?: number; tier?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...currentUser, ...userDoc.data() });
        } else {
          setUser(currentUser);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-t border-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center text-center px-4">
        <Crown className="w-16 h-16 text-primary/20 mb-6" strokeWidth={1} />
        <h1 className="text-3xl font-serif italic text-primary mb-4">Exclusive Access</h1>
        <p className="text-primary/60 max-w-md mb-8">Please sign in to view your WANAS VIP status and exclusive benefits.</p>
        <a href="/auth" className="px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-accent-primary transition-colors">
          Sign In
        </a>
      </div>
    );
  }

  const points = user.loyaltyPoints || 0;
  const tier = user.tier || 'Member';
  
  let nextTier = 'Silver';
  let pointsNeeded = 1000;
  let progress = 0;

  if (tier === 'Member') {
    nextTier = 'Silver';
    pointsNeeded = 1000;
    progress = (points / pointsNeeded) * 100;
  } else if (tier === 'Silver') {
    nextTier = 'Gold';
    pointsNeeded = 5000;
    progress = (points / pointsNeeded) * 100;
  } else if (tier === 'Gold') {
    nextTier = 'Platinum';
    pointsNeeded = 10000;
    progress = (points / pointsNeeded) * 100;
  } else {
    nextTier = 'Max Tier';
    pointsNeeded = points;
    progress = 100;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-primary/10 mb-6">
          <Crown className="w-8 h-8 text-accent-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif italic text-primary mb-4">WANAS Privilège</h1>
        <p className="text-primary/60 tracking-widest uppercase text-xs">Your Exclusive Membership</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 md:col-span-2 bg-secondary border border-primary/10 p-8 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary/50 mb-2">Current Status</p>
                <h2 className="text-3xl font-serif text-primary">{tier}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-primary/50 mb-2">Available Points</p>
                <p className="text-2xl font-mono text-primary">{points.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs text-primary/60">
                <span>{tier}</span>
                <span>{nextTier}</span>
              </div>
              <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-accent-primary"
                />
              </div>
              {tier !== 'Platinum' && (
                <p className="text-xs text-primary/50 text-center">
                  <bdi>{(pointsNeeded - points).toLocaleString()} points</bdi> away from {nextTier} status
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary text-primary-foreground p-8 flex flex-col justify-center items-center text-center invert dark:invert-0"
        >
          <Sparkles className="w-8 h-8 mb-4 text-accent-primary" strokeWidth={1} />
          <h3 className="text-xl font-serif italic mb-2">Redeem Points</h3>
          <p className="text-xs text-primary-foreground/70 mb-6">Use your points for exclusive rewards and early access.</p>
          <button className="px-6 py-2 border border-primary-foreground/20 text-xs uppercase tracking-widest hover:bg-primary-foreground hover:text-primary transition-colors">
            View Rewards
          </button>
        </motion.div>
      </div>

      <div className="space-y-8">
        <h3 className="text-xl font-serif italic text-primary text-center mb-8">Your Benefits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { icon: Star, title: 'Early Access', desc: 'Shop new collections before anyone else.' },
            { icon: Gift, title: 'Birthday Surprise', desc: 'A special gift curated just for you.' },
            { icon: ShieldCheck, title: 'Extended Care', desc: 'Complimentary repairs and maintenance.' },
          ].map((benefit, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="p-6 border border-primary/10 hover:border-primary/30 transition-colors text-center"
            >
              <benefit.icon className="w-6 h-6 mx-auto mb-4 text-accent-primary" strokeWidth={1} />
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">{benefit.title}</h4>
              <p className="text-xs text-primary/60">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
