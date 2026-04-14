'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'motion/react';

import { Reservation } from '@/types';

import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  reservations: Reservation[];
}

export function KanbanColumn({ id, title, reservations }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col w-full min-w-[320px] bg-inverted/[0.02] border border-primary/5 h-full min-h-[600px]">
      <div className="p-6 border-b border-primary/5 bg-primary flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
          {title}
        </h3>
        <span className="text-[10px] bg-inverted/5 text-primary/40 px-2 py-0.5 rounded-full font-mono">
          {reservations.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-4 space-y-4 transition-colors duration-300 ${
          isOver ? 'bg-accent-primary/5 ring-2 ring-accent-primary/20 ring-inset' : ''
        }`}
      >
        {reservations.map((reservation) => (
          <KanbanCard key={reservation.id} reservation={reservation} />
        ))}
        
        {reservations.length === 0 && (
          <div className="h-32 border border-dashed border-primary/10 flex items-center justify-center">
            <p className="text-[10px] uppercase tracking-widest text-primary/20">Empty Stage</p>
          </div>
        )}
      </div>
    </div>
  );
}
