'use client';

export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="w-full aspect-[3/4] bg-inverted/5" />
      <div className="space-y-3">
        <div className="h-4 bg-inverted/5 w-3/4" />
        <div className="h-3 bg-inverted/5 w-1/2" />
        <div className="h-3 bg-inverted/5 w-1/4" />
      </div>
    </div>
  );
}
