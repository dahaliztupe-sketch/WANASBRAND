'use client';
import Image from 'next/image';

interface OptimizedProductImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

/**
 * مكون صورة محسّن يستخدم next/image مع إعدادات الأداء المثلى.
 */
export function OptimizedProductImage({ src, alt, width, height, priority = false }: OptimizedProductImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4=`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      priority={priority}
      referrerPolicy="no-referrer"
    />
  );
}
