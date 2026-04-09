'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { toast } from 'sonner';

interface StyleProfileQuizProps {
  onClose: () => void;
}

export default function StyleProfileQuiz({ onClose }: StyleProfileQuizProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ preferredColors: [] as string[], preferredSilhouettes: [] as string[] });

  const saveProfile = async (skipped = false) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        styleProfile: skipped ? { skipped: true } : { ...profile, lastQuizDate: new Date().toISOString() }
      });
      toast.success(skipped ? 'Quiz skipped' : 'Style profile saved');
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 backdrop-blur-sm p-4">
      <div className="bg-secondary w-full max-w-md p-8 rounded-sm border border-primary/10 shadow-2xl relative">
        <button onClick={() => saveProfile(true)} className="absolute top-4 right-4 text-primary/50 hover:text-primary"><X size={20} /></button>
        
        <h2 className="font-serif text-2xl text-primary mb-6">Discover Your WANAS Style</h2>
        
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-secondary">What are your preferred colors?</p>
            {['Earth Tones', 'Monochrome', 'Bold'].map(color => (
              <button key={color} onClick={() => { setProfile(p => ({...p, preferredColors: [color]})); setStep(2); }} className="block w-full p-3 border border-primary/10 hover:bg-primary/5 text-left">{color}</button>
            ))}
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-secondary">What are your preferred silhouettes?</p>
            {['Tailored', 'Oversized', 'Flowy'].map(s => (
              <button key={s} onClick={() => { setProfile(p => ({...p, preferredSilhouettes: [s]})); saveProfile(); }} className="block w-full p-3 border border-primary/10 hover:bg-primary/5 text-left">{s}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
