'use client';

import { useEffect } from 'react';
import { useAudioBranding } from '@/lib/hooks/useAudioBranding';

const SUCCESS_TONE_URL = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'; // Sophisticated success tone

export function playSuccessTone() {
  if (typeof window === 'undefined') return;
  const audio = new Audio(SUCCESS_TONE_URL);
  audio.volume = 0.2;
  audio.play().catch(e => console.error('Audio playback blocked', e));
}

export default function AudioBranding() {
  useAudioBranding();
  return null;
}
