'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="text-[10px] tracking-[0.2em] uppercase opacity-0" aria-label="Toggle Theme">
        NIGHT
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="text-[10px] tracking-[0.2em] uppercase text-primary hover:text-accent-primary transition-all duration-500 ease-in-out"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? 'DAY' : 'NIGHT'}
    </button>
  );
}
