'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

import { db, auth } from '@/lib/firebase/client';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface StyleProfileQuizProps {
  onClose: () => void;
}

export default function StyleProfileQuiz({ onClose }: StyleProfileQuizProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ preferredColors: [] as string[], preferredSilhouettes: [] as string[] });
  const { t } = useTranslation();

  const saveProfile = async (skipped = false) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        styleProfile: skipped ? { skipped: true } : { ...profile, lastQuizDate: new Date().toISOString() }
      });
      toast.success(skipped ? t.styleProfileQuiz.messages.skipped : t.styleProfileQuiz.messages.saved);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t.styleProfileQuiz.messages.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 backdrop-blur-sm p-4">
      <div className="bg-secondary w-full max-w-md p-8 rounded-sm border border-primary/10 shadow-2xl relative">
        <button onClick={() => saveProfile(true)} className="absolute top-4 right-4 text-primary/50 hover:text-primary"><X size={20} /></button>
        
        <h2 className="font-serif text-2xl text-primary mb-6">{t.styleProfileQuiz.title}</h2>
        
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-secondary">{t.styleProfileQuiz.colorsQuestion}</p>
            {[
              { key: 'earthTones', label: t.styleProfileQuiz.colors.earthTones },
              { key: 'monochrome', label: t.styleProfileQuiz.colors.monochrome },
              { key: 'bold', label: t.styleProfileQuiz.colors.bold },
            ].map(color => (
              <button key={color.key} onClick={() => { setProfile(p => ({...p, preferredColors: [color.label]})); setStep(2); }} className="block w-full p-3 border border-primary/10 hover:bg-primary/5 text-left">{color.label}</button>
            ))}
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-secondary">{t.styleProfileQuiz.silhouettesQuestion}</p>
            {[
              { key: 'tailored', label: t.styleProfileQuiz.silhouettes.tailored },
              { key: 'oversized', label: t.styleProfileQuiz.silhouettes.oversized },
              { key: 'flowy', label: t.styleProfileQuiz.silhouettes.flowy },
            ].map(s => (
              <button key={s.key} onClick={() => { setProfile(p => ({...p, preferredSilhouettes: [s.label]})); saveProfile(); }} className="block w-full p-3 border border-primary/10 hover:bg-primary/5 text-left">{s.label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
