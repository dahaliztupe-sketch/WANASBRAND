'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

import { db, auth } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';

const COLUMNS = ['Pending Contact', 'Deposit Paid', 'In Production', 'Shipped', 'Delivered'];

function SortableCard({ reservation }: { reservation: Record<string, unknown> }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: reservation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleNotesChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    await updateDoc(doc(db, 'reservations', reservation.id), { notes: e.target.value });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-primary border border-primary/10 text-xs text-primary shadow-sm hover:border-accent-primary transition-colors"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mb-2">
        <div className="font-bold">#{reservation.reservationNumber || reservation.id.slice(0, 8)}</div>
        <div>{reservation.customerInfo?.fullName || 'Unknown Customer'}</div>
        <div className="text-secondary/60">EGP {reservation.totalAmount?.toLocaleString()}</div>
      </div>
      <textarea
        defaultValue={reservation.notes || ''}
        onBlur={handleNotesChange}
        placeholder="Add concierge notes..."
        className="w-full mt-2 p-2 bg-secondary/50 border border-primary/5 text-[10px] resize-none focus:outline-none focus:border-accent-primary"
        rows={3}
      />
      <div className="mt-2 text-[10px] text-secondary/40">
        {reservation.createdAt?.toDate ? new Date(reservation.createdAt.toDate()).toLocaleDateString() : 'N/A'}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const [reservations, setReservations] = useState<Record<string, unknown>[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      setReservations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reservations', auth));
    return () => unsubscribe();
  }, []);

  const handleDragEnd = async (event: Record<string, unknown>) => {
    const { active, over } = event as { active: { id: string }, over: { id: string } | null };
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      const overReservation = reservations.find(r => r.id === overId);
      
      // If dropped on a column, update status
      if (COLUMNS.includes(overId)) {
        await updateDoc(doc(db, 'reservations', activeId), { status: overId });
      } else if (overReservation) {
        // If dropped on a card, update status to match that card's status
        await updateDoc(doc(db, 'reservations', activeId), { status: overReservation.status });
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-5 gap-4">
        {COLUMNS.map((col) => (
          <div key={col} className="bg-secondary p-4 rounded-sm border border-primary/5">
            <h3 className="text-xs uppercase tracking-widest font-bold mb-4 text-primary/60">{col}</h3>
            <SortableContext items={reservations.filter(r => r.status === col).map(r => r.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 min-h-[200px]">
                {reservations.filter(r => r.status === col).map((res) => (
                  <SortableCard key={res.id} reservation={res} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
