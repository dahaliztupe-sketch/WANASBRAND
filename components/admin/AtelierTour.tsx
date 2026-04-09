'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTourStore } from '@/store/useTourStore';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_STEPS = [
  { id: 'tour-sidebar', title: 'Atelier Portal', description: 'Navigate through your Atelier: Reservations, Products, Customers, and more.' },
  { id: 'tour-quick-actions', title: 'Creative Tools', description: 'Add new silhouettes or manage concierge requests instantly.' },
  { id: 'tour-stats', title: 'Atelier Pulse', description: 'Real-time metrics on revenue, conversion, and stock.' },
  { id: 'tour-funnel', title: 'Conversion Funnel', description: 'Visualize your clients journey from awareness to acquisition.' },
  { id: 'tour-recent', title: 'Recent Acquisitions', description: 'Monitor the latest reservations and their status.' },
];

export function AtelierTour() {
  const { isActive, currentStep, nextStep, prevStep, endTour } = useTourStore();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const updatePosition = () => {
      const element = document.querySelector(`[data-tour-id="${TOUR_STEPS[currentStep].id}"]`);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isActive, currentStep]);

  if (!isActive || !targetRect) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Backdrop with hole */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect 
              x={targetRect.x - 8} 
              y={targetRect.y - 8} 
              width={targetRect.width + 16} 
              height={targetRect.height + 16} 
              fill="black" 
              rx="4"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#tour-mask)" />
      </svg>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute p-6 bg-primary border border-primary/20 shadow-2xl w-80 pointer-events-auto"
        style={{
          top: targetRect.bottom + 20,
          left: targetRect.left,
        }}
      >
        <button onClick={endTour} className="absolute top-2 right-2 text-primary/50 hover:text-primary"><X size={16} /></button>
        <h3 className="font-serif text-xl text-primary mb-2">{step.title}</h3>
        <p className="text-sm text-primary/70 mb-6">{step.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-widest text-primary/40">{currentStep + 1} / {TOUR_STEPS.length}</span>
          <div className="flex gap-2">
            {currentStep > 0 && <button onClick={prevStep} className="p-2 border border-primary/20 hover:bg-primary/5"><ChevronLeft size={16} /></button>}
            <button 
              onClick={currentStep === TOUR_STEPS.length - 1 ? endTour : nextStep} 
              className="px-4 py-2 bg-inverted text-inverted text-xs uppercase tracking-widest"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
