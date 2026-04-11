'use client';

import dynamic from 'next/dynamic';

const ARViewer = dynamic(() => import('./ARViewer'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/95 backdrop-blur-xl">
      <div className="flex flex-col items-center gap-4 text-secondary/50">
        <div className="w-12 h-[1px] bg-secondary/20 overflow-hidden">
          <div className="h-full bg-accent-primary animate-pulse w-full origin-left" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] font-light">Loading Experience</p>
      </div>
    </div>
  )
});

interface ARViewerWrapperProps {
  modelUrl: string;
  onClose: () => void;
}

export default function ARViewerWrapper({ modelUrl, onClose }: ARViewerWrapperProps) {
  return <ARViewer modelUrl={modelUrl} onClose={onClose} />;
}
