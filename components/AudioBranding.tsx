'use client';

import { useEffect } from 'react';

const ENTRY_CHIME_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'; // Gentle organic chime
const SUCCESS_TONE_URL = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'; // Sophisticated success tone

export function playEntryChime() {
  if (typeof window === 'undefined') return;
  
  const hasPlayed = sessionStorage.getItem('wanas_entry_chime_played');
  if (!hasPlayed) {
    const audio = new Audio(ENTRY_CHIME_URL);
    audio.volume = 0.15;
    audio.play().catch(() => {
      // Browsers often block autoplay without interaction
      // We'll try playing on the first click if it fails
      const playOnFirstClick = () => {
        audio.play();
        sessionStorage.setItem('wanas_entry_chime_played', 'true');
        window.removeEventListener('click', playOnFirstClick);
      };
      window.addEventListener('click', playOnFirstClick);
    });
    sessionStorage.setItem('wanas_entry_chime_played', 'true');
  }
}

export function playSuccessTone() {
  if (typeof window === 'undefined') return;
  const audio = new Audio(SUCCESS_TONE_URL);
  audio.volume = 0.2;
  audio.play().catch(e => console.error('Audio playback blocked', e));
}

export default function AudioBranding() {
  useEffect(() => {
    // We wait for the first user interaction to play the chime to comply with browser policies
    const handleFirstInteraction = () => {
      playEntryChime();
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('mousedown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  return null;
}
