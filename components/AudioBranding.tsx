'use client';

import { useEffect, useRef } from 'react';

import { useAudioStore } from '@/lib/store/useAudioStore';

const SUCCESS_TONE_URL = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3';

export function playSuccessTone() {
  if (typeof window === 'undefined') return;
  const audio = new Audio(SUCCESS_TONE_URL);
  audio.volume = 0.2;
  audio.play().catch(e => console.error('Audio playback blocked', e));
}

export default function AudioBranding() {
  const audioContext = useRef<AudioContext | null>(null);
  const isMuted = useAudioStore((state) => state.isMuted);

  useEffect(() => {
    // Initialize AudioContext in a suspended state
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContext.current.suspend();

    const resumeAudio = () => {
      if (audioContext.current?.state === 'suspended') {
        audioContext.current.resume();
      }
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
    };

    document.addEventListener('click', resumeAudio);
    document.addEventListener('keydown', resumeAudio);

    return () => {
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
      audioContext.current?.close();
    };
  }, []);

  useEffect(() => {
    if (audioContext.current) {
      if (isMuted) {
        audioContext.current.suspend();
      } else if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }
    }
  }, [isMuted]);

  return null;
}
