'use client';

import React, { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

import { Reservation } from '@/types';
import { db } from '@/lib/firebase/client';

import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';


interface KanbanBoardProps {
  reservations: Reservation[];
  onStatusChange: (id: string, newStatus: Reservation['status']) => void;
}

const columns = [
  { id: 'pending_contact', title: 'New Reservations' },
  { id: 'contacted', title: 'In Consultation' },
  { id: 'deposit_paid', title: 'Deposit Confirmed' },
  { id: 'shipped', title: 'In Transit' },
];

export function KanbanBoard({ reservations, onStatusChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveReservation(active.data.current?.reservation);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveReservation(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const reservation = active.data.current?.reservation as Reservation;
    if (reservation.status !== overId) {
      try {
        const reservationRef = doc(db, 'reservations', activeId);
        const status = overId as Reservation['status'];
        await updateDoc(reservationRef, { status });
        onStatusChange(activeId, status);
        toast.success(`Reservation moved to ${overId.replace('_', ' ')}.`);

        if (status === 'deposit_paid' || status === 'shipped') {
          // Trigger status update email
          await fetch('/api/send-status-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: reservation.customerInfo.email || '',
              reservationNumber: reservation.reservationNumber,
              status: status,
              customerName: reservation.customerInfo.fullName
            }),
          });
          
          toast.info(`${status === 'deposit_paid' ? 'Confirmation' : 'Shipping'} email sent.`);
        }
      } catch {
        toast.error('Failed to update reservation status.');
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            reservations={reservations.filter((r) => r.status === column.id)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeId && activeReservation ? (
          <div className="w-[320px] rotate-3 scale-105 shadow-2xl">
            <KanbanCard reservation={activeReservation} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
