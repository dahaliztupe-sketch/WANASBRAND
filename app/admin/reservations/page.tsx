import { getAdminReservations } from '@/app/admin/actions';
import { db } from '@/lib/firebase/server';

import ExportButton from './ExportButton';
import KanbanBoard from './KanbanBoard';

export const dynamic = 'force-dynamic';

export default async function ReservationsAdminPage() {
  if (!db) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-serif text-primary">Database Unavailable</h1>
        <p className="text-primary/60 mt-4">Please try again later.</p>
      </div>
    );
  }

  const reservations = await getAdminReservations();

  if (!reservations) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-primary/60">No reservations found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif text-primary">Reservation Command</h2>
          <p className="text-primary/40 text-xs uppercase tracking-widest mt-2">Manage the atelier workflow</p>
        </div>
        <ExportButton reservations={reservations} />
      </div>

      <KanbanBoard initialReservations={reservations} />
    </div>
  );
}
