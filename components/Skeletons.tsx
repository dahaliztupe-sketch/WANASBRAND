'use client';

import { motion } from 'motion/react';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col items-start w-full">
      <div className="relative w-full aspect-[3/4] mb-8 bg-primary/5 overflow-hidden rounded-sm">
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
      <div className="h-8 bg-primary/5 w-3/4 mb-4 rounded-sm relative overflow-hidden">
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
      <div className="h-4 bg-primary/5 w-1/4 rounded-sm relative overflow-hidden">
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
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-8 w-full">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`flex flex-col items-start ${
          i % 3 === 0 ? 'md:col-span-6 md:col-start-1' :
          i % 3 === 1 ? 'md:col-span-4 md:col-start-8 md:mt-48' :
          'md:col-span-8 md:col-start-3 md:mt-32'
        }`}>
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}
