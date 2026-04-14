'use client';

import { motion } from 'motion/react';

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-primary pt-32 px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Image Skeleton */}
        <div className="aspect-[4/5] bg-primary/5 relative overflow-hidden rounded-sm">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        {/* Info Skeleton */}
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="h-4 bg-primary/5 w-1/4 rounded-sm relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <div className="h-16 bg-primary/5 w-3/4 rounded-sm relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
          
          <div className="h-24 bg-primary/5 w-full rounded-sm relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="h-12 bg-primary/5 w-1/2 rounded-sm relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
