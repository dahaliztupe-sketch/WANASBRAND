'use client';

import { useState } from 'react';
import { Save, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { updateConciergeNotes } from '@/app/admin/actions';

interface NotesSectionProps {
  id: string;
  initialNotes: string;
}

export default function NotesSection({ id, initialNotes }: NotesSectionProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConciergeNotes(id, notes);
      toast.success('Concierge notes updated.');
    } catch (error) {
      toast.error('Failed to save notes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between border-b border-primary/5 pb-4">
        <h2 className="text-xs uppercase tracking-[0.3em] text-primary/40 font-bold flex items-center gap-3">
          <FileText size={16} />
          Concierge Notes
        </h2>
        <button
          onClick={handleSave}
          disabled={isSaving || notes === initialNotes}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-accent-primary hover:text-primary transition-colors disabled:opacity-30"
        >
          {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save Notes
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Record sizing preferences, special requests, or consultation details..."
        className="w-full h-48 bg-secondary border border-primary/5 p-6 text-sm text-primary leading-relaxed outline-none focus:border-accent-primary/30 transition-colors resize-none font-light italic"
      />
    </section>
  );
}
