import { headers } from 'next/headers';

import DatabaseUnavailable from '@/components/DatabaseUnavailable';

import ExportButton from './ExportButton';
import KanbanBoard from './KanbanBoard';

export const dynamic = 'force-dynamic';

async function getReservations() {
  const host = (await headers()).get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  try {
    const res = await fetch(`${baseUrl}/api/admin/reservations`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      if (res.status === 503) return null; // Database not configured
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in getReservations:', error);
    return null;
  }
}

export default async function ReservationsAdminPage() {
  const reservations = await getReservations();

  if (!reservations) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <DatabaseUnavailable />
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
