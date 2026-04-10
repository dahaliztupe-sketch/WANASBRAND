'use client';

import { X, View } from 'lucide-react';
import { motion } from 'motion/react';

// Import model-viewer only on client side to avoid SSR issues
if (typeof window !== 'undefined') {
  import('@google/model-viewer');
}

interface ARViewerProps {
  modelUrl: string;
  onClose: () => void;
}

export default function ARViewer({ modelUrl, onClose }: ARViewerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/95 backdrop-blur-xl"
    >
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 z-10 p-2 text-secondary/50 hover:text-secondary transition-colors rounded-full bg-primary/10 hover:bg-primary/20"
      >
        <X strokeWidth={1} size={28} />
      </button>

      <div className="w-full h-full relative max-w-5xl mx-auto flex flex-col items-center justify-center p-4 md:p-12">
        {/* @ts-ignore - model-viewer is a custom element */}
        <model-viewer
          src={modelUrl}
          alt="WANAS 3D Product Model"
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          camera-controls
          auto-rotate
          rotation-per-second="30deg"
          interaction-prompt="none"
          shadow-intensity="1.5"
          shadow-softness="1"
          exposure="1"
          environment-image="neutral"
          camera-orbit="0deg 75deg 105%"
          min-camera-orbit="auto auto auto"
          max-camera-orbit="auto auto 150%"
          style={{ width: '100%', height: '100%', outline: 'none' }}
        >
          <div slot="progress-bar" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-secondary/50">
            <div className="w-12 h-[1px] bg-secondary/20 overflow-hidden">
              <div className="h-full bg-accent-primary animate-pulse w-full origin-left" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-light">Preparing 3D Model</p>
          </div>

          <button 
            slot="ar-button" 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-4 bg-accent-primary text-inverted text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-accent-primary/90 transition-all"
          >
            <View size={16} strokeWidth={1.5} />
            View in Your Space
          </button>
        </model-viewer>
      </div>
    </motion.div>
  );
}
