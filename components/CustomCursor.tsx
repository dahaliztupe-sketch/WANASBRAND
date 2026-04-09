'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  // Initialize state based on window object if available, otherwise default to true (mobile first)
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.matchMedia('(pointer: fine)').matches;
    }
    return true;
  });

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'a' || 
        target.tagName.toLowerCase() === 'button' || 
        target.closest('a') || 
        target.closest('button') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    if (isFinePointer) {
      window.addEventListener('mousemove', updateMousePosition);
      window.addEventListener('mouseover', handleMouseOver);
    }

    return () => {
      if (isFinePointer) {
        window.removeEventListener('mousemove', updateMousePosition);
        window.removeEventListener('mouseover', handleMouseOver);
      }
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 bg-accent-primary rounded-full pointer-events-none z-[9999] mix-blend-difference"
      animate={{
        x: mousePosition.x - 8,
        y: mousePosition.y - 8,
        scale: isHovering ? 2.5 : 1,
        opacity: isHovering ? 0.6 : 1
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 500, 
        damping: 28, 
        mass: 0.5 
      }}
    />
  );
}
