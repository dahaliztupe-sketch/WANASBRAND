'use client';

import { useEffect, useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

interface ModelViewerProps {
  src: string;
  poster?: string;
  alt?: string;
}

export default function ModelViewer({ src, poster, alt = "A 3D model of the product" }: ModelViewerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Dynamically import the model-viewer component only on the client side
    import('@google/model-viewer').then(() => {
      setIsMounted(true);
    });
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[400px] bg-secondary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] bg-secondary relative overflow-hidden">
      <model-viewer
        src={src}
        poster={poster}
        alt={alt}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        <div slot="progress-bar" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <button slot="ar-button" className="absolute bottom-4 right-4 bg-primary text-inverted px-4 py-2 text-xs uppercase tracking-widest">
          View in your space
        </button>
      </model-viewer>
    </div>
  );
}
