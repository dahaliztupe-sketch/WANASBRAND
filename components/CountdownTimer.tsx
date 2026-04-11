'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface CountdownTimerProps {
  expiresAt: string;
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('15:00');
  const { t } = useTranslation();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        return '00:00';
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Use a timeout to avoid synchronous setState in effect
    const timeout = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 0);

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, [expiresAt]);

  return (
    <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-accent-primary animate-pulse">
      <Clock strokeWidth={1} className="w-3 h-3" />
      <span>{t.common.shared.countdown.replace('{time}', timeLeft)}</span>
    </div>
  );
}
