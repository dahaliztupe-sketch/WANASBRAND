import { getAdminReservations } from '@/app/admin/actions';
import KanbanBoard from './KanbanBoard';
import { Download } from 'lucide-react';
import ExportButton from './ExportButton';

export const dynamic = 'force-dynamic';

export default async function ReservationsAdminPage() {
  const reservations = await getAdminReservations();

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
