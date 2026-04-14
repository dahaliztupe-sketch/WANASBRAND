'use client';

import React from 'react';
import Image from 'next/image';
import { useDraggable } from '@dnd-kit/core';
import Link from 'next/link';
import { Calendar, User, DollarSign, ChevronRight } from 'lucide-react';

import { Reservation } from '@/types';

interface KanbanCardProps {
  reservation: Reservation;
}

export function KanbanCard({ reservation }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: reservation.id,
    data: {
      reservation,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-primary p-5 border border-primary/5 shadow-sm hover:border-accent-primary/30 transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">
          {reservation.reservationNumber}
        </span>
        <Link 
          href={`/admin/reservations/${reservation.id}`}
          className="text-primary/20 hover:text-accent-primary transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ChevronRight strokeWidth={1} size={14} />
        </Link>
      </div>

      <h4 className="font-serif text-sm text-primary mb-4 line-clamp-1">
        {reservation.customerInfo.fullName}
      </h4>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-primary/40 uppercase tracking-widest">
          <Calendar strokeWidth={1} size={10} />
          {new Date(reservation.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-primary/40 uppercase tracking-widest">
          <DollarSign strokeWidth={1} size={10} />
          ${reservation.totalAmount.toLocaleString()}
        </div>
      </div>

      <div className="mt-4 flex -space-x-2 overflow-hidden">
        {reservation.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="inline-block h-6 w-6 rounded-full ring-2 ring-primary bg-inverted/5 overflow-hidden relative">
            <Image 
              src={item.image} 
              alt="" 
              fill
              className="object-cover grayscale" 
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
        {reservation.items.length > 3 && (
          <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-inverted text-[8px] text-inverted ring-2 ring-primary">
            +{reservation.items.length - 3}
          </div>
        )}
      </div>
    </div>
  );
}
