'use client';

import { Reservation } from '@/types';

interface TrackingTimelineProps {
  reservation: Reservation;
}

export function TrackingTimeline({ reservation }: TrackingTimelineProps) {
  const steps = ['pending_contact', 'deposit_paid', 'in_production', 'shipped', 'delivered'];
  const currentIndex = steps.indexOf(reservation.status);

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg text-primary">Reservation Tracking</h3>
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step} className={`flex flex-col items-center ${index <= currentIndex ? 'text-accent-primary' : 'text-primary/30'}`}>
            <div className={`w-4 h-4 rounded-full ${index <= currentIndex ? 'bg-accent-primary' : 'bg-primary/30'}`} />
            <span className="text-[10px] uppercase mt-2">{step.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
      {reservation.trackingNumber && (
        <p className="text-sm text-secondary">Tracking: {reservation.trackingNumber} ({reservation.shippingProvider})</p>
      )}
    </div>
  );
}
