'use client';

import { motion } from 'motion/react';

export function DigitalCertificate({ reservationId, orderNumber }: { reservationId: string, orderNumber: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-accent-primary/20 p-8 bg-inverted/50 backdrop-blur-sm"
    >
      <h2 className="font-serif text-2xl italic text-inverted mb-4">Certificate of Authenticity</h2>
      <p className="text-inverted/60 text-xs uppercase tracking-widest mb-8">
        This document certifies that your WANAS piece, order {orderNumber}, is an authentic creation from our Cairo atelier.
      </p>
      <div className="font-mono text-[10px] text-inverted/40">
        ID: {reservationId}
      </div>
    </motion.div>
  );
}
