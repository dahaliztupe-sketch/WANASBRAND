import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary/30">
      <Loader2 strokeWidth={1} className="w-12 h-12 animate-spin mb-6 stroke-[1px]" />
      <p className="text-xs uppercase tracking-[0.2em]">Synchronizing Atelier Data...</p>
    </div>
  );
}
