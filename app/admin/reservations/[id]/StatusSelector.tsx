'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { updateReservationStatus } from '@/app/admin/actions';
import { Reservation } from '@/types';

const STATUS_OPTIONS: { value: Reservation['status']; label: string }[] = [
  { value: 'pending_contact', label: 'New Request' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'deposit_paid', label: 'Confirmed (Deposit)' },
  { value: 'in_production', label: 'In Production' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

interface StatusSelectorProps {
  id: string;
  currentStatus: Reservation['status'];
}

export default function StatusSelector({ id, currentStatus }: StatusSelectorProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (newStatus: Reservation['status']) => {
    setIsUpdating(true);
    try {
      await updateReservationStatus(id, newStatus);
      setStatus(newStatus);
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative group">
      <select
        value={status}
        onChange={(e) => handleUpdate(e.target.value as Reservation['status'])}
        disabled={isUpdating}
        className="appearance-none bg-inverted text-inverted px-8 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-accent-primary transition-all cursor-pointer outline-none disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-secondary text-primary py-4">
            {opt.label}
          </option>
        ))}
      </select>
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-accent-primary/20 pointer-events-none">
          <Loader2 size={14} className="animate-spin text-inverted" />
        </div>
      )}
    </div>
  );
}
