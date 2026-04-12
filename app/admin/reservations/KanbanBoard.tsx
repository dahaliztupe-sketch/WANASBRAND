'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Reservation } from '@/types';
import { updateReservationStatus } from '@/app/admin/actions';
import { toast } from 'sonner';
import { Package, User, DollarSign, ChevronRight, AlertCircle, Gift, Eye, EyeOff, Bot } from 'lucide-react';
import Link from 'next/link';
import { useLanguageStore } from '@/lib/store/useLanguageStore';
import { db, auth } from '@/lib/firebase/client';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/utils/firestoreError';

const COLUMNS = [
  { id: 'pending_contact', title: 'New Requests' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'deposit_paid', title: 'Confirmed (Deposit)' },
  { id: 'in_production', title: 'In Production' },
  { id: 'shipped', title: 'Shipped' },
];

interface KanbanBoardProps {
  initialReservations: Reservation[];
}

export default function KanbanBoard({ initialReservations }: KanbanBoardProps) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const { language } = useLanguageStore();

  useEffect(() => {
    // Real-time listener for active reservations
    const q = query(
      collection(db, 'reservations'),
      where('status', 'in', ['pending_contact', 'contacted', 'deposit_paid', 'in_production']),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeReservations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];
      
      // We keep any 'shipped' items that are currently in local state (e.g., just dragged there)
      // but we update the active ones from the server.
      setReservations(prev => {
        const shippedLocally = prev.filter(r => r.status === 'shipped');
        return [...activeReservations, ...shippedLocally];
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reservations', auth);
    });

    return () => unsubscribe();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as Reservation['status'];
    const reservationId = draggableId;
    const reservationToUpdate = reservations.find(r => r.id === reservationId);

    // Optimistic Update
    const updatedReservations = reservations.map(res => 
      res.id === reservationId ? { ...res, status: newStatus } : res
    );
    setReservations(updatedReservations);

    try {
      const clientUpdatedAt = reservationToUpdate?.updatedAt 
        ? new Date(reservationToUpdate.updatedAt).getTime() 
        : 0;
        
      await updateReservationStatus(reservationId, newStatus, clientUpdatedAt);
      
      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
      // Revert on error
      setReservations(reservations);
    }
  };

  const getColumnItems = (columnId: string) => {
    return reservations.filter(res => res.status === columnId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[calc(100vh-200px)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {COLUMNS.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-primary/40 font-bold">
                {column.title}
              </h3>
              <span className="text-[10px] bg-primary/5 px-2 py-0.5 rounded-full text-primary/40">
                {getColumnItems(column.id).length}
              </span>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 p-2 rounded-sm transition-colors duration-300 ${snapshot.isDraggingOver ? 'bg-accent-primary/5' : 'bg-transparent'}`}
                >
                  <div className="space-y-4">
                    {getColumnItems(column.id).map((res, index) => (
                      <Draggable key={res.id} draggableId={res.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-secondary border p-5 shadow-sm group hover:border-accent-primary/30 transition-all ${
                              res.giftingDetails?.isGift 
                                ? 'border-accent-primary/20 shadow-[0_0_15px_rgba(212,165,165,0.1)]' 
                                : 'border-primary/5'
                            } ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl z-50' : ''}`}
                          >
                            <div className="space-y-4">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] uppercase tracking-widest text-primary/40 font-bold">
                                    #<bdi>{res.orderNumber || res.reservationNumber}</bdi>
                                  </span>
                                  {res.giftingDetails?.isGift && (
                                    <Gift size={12} className="text-accent-primary animate-pulse" />
                                  )}
                                </div>
                                {res.totalAmount > 10000 && (
                                  <span className="flex items-center gap-1 text-[8px] uppercase tracking-widest bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded-full animate-pulse">
                                    <AlertCircle size={8} /> High Value
                                  </span>
                                )}
                              </div>

                              <div>
                                <h4 className="text-sm font-serif text-primary group-hover:text-accent-primary transition-colors">
                                  {res.customerInfo.fullName}
                                </h4>
                                <p className="text-[10px] text-primary/40 uppercase tracking-widest mt-1">
                                  {res.items.length} {res.items.length === 1 ? 'Piece' : 'Pieces'}
                                </p>
                                {res.items.some(item => item.recommendedByAI) && (
                                  <div className="mt-2 inline-flex items-center gap-1 bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded-sm text-[8px] uppercase tracking-widest">
                                    <Bot size={10} /> AI Recommended
                                  </div>
                                )}
                              </div>

                              {res.giftingDetails?.isGift && res.giftingDetails.giftNote && (
                                <div className="p-2 bg-accent-primary/5 border-l-2 border-accent-primary italic text-[10px] text-primary/60 line-clamp-2">
                                  &quot;{res.giftingDetails.giftNote}&quot;
                                </div>
                              )}

                              <div className="flex justify-between items-center pt-4 border-t border-primary/5">
                                <span className="text-sm font-serif text-primary">
                                  <bdi>EGP {res.totalAmount.toLocaleString()}</bdi>
                                </span>
                                <Link 
                                  href={`/admin/reservations/${res.id}`}
                                  className="text-[10px] uppercase tracking-widest text-accent-primary hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  Details <ChevronRight size={10} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
