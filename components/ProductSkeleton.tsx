'use client';

export function ProductSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 animate-pulse">
      <div className="relative w-full aspect-[3/4] bg-primary/5 overflow-hidden rounded-sm">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      </div>
      <div className="space-y-3 w-full flex flex-col items-center">
        <div className="h-5 bg-primary/5 w-3/4 rounded-sm" />
        <div className="h-3 bg-primary/5 w-1/4 rounded-sm" />
      </div>
    </div>
  );
}
