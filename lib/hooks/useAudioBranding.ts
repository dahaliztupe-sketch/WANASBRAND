'use client';

import { useEffect, useRef, useState } from 'react';

export function useAudioBranding() {
  const [hasPlayed, setHasPlayed] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize AudioContext in a suspended state
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtxRef.current = new AudioContextClass();

    const playChime = async () => {
      if (hasPlayed || !audioCtxRef.current) return;

      try {
        // Resume the context upon user gesture
        if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }

        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Luxury chime sound design (soft, resonant bell)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.5);

        // Envelope for a smooth, elegant fade
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1); // Soft attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3); // Long, luxurious decay

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 3);

        setHasPlayed(true);
        cleanup();
      } catch (e) {
        console.error("Audio branding failed to play", e);
      }
    };

    const cleanup = () => {
      document.removeEventListener('click', playChime);
      document.removeEventListener('touchstart', playChime);
      document.removeEventListener('keydown', playChime);
    };

    // Listen for the first transient activation
    document.addEventListener('click', playChime, { once: true });
    document.addEventListener('touchstart', playChime, { once: true });
    document.addEventListener('keydown', playChime, { once: true });

    return cleanup;
  }, [hasPlayed]);

  return { hasPlayed };
}
