'use client';

import { motion } from 'motion/react';

import { useTranslation } from '@/lib/hooks/useTranslation';

export function DigitalCertificate({ reservationId, reservationNumber }: { reservationId: string, reservationNumber: string }) {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-accent-primary/20 p-8 bg-inverted/50 backdrop-blur-sm"
    >
      <h2 className="font-serif text-2xl italic text-inverted mb-4">{t.digitalCertificate.title}</h2>
      <p className="text-inverted/60 text-xs uppercase tracking-widest mb-8">
        {t.digitalCertificate.description.replace('{reservationNumber}', reservationNumber)}
      </p>
      <div className="font-mono text-[10px] text-inverted/40">
        {t.digitalCertificate.id.replace('{reservationId}', reservationId)}
      </div>
    </motion.div>
  );
}
