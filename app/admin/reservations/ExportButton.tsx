'use client';

import { Reservation } from '@/types';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  reservations: Reservation[];
}

export default function ExportButton({ reservations }: ExportButtonProps) {
  const handleExport = () => {
    try {
      // Filter for confirmed reservations (deposit_paid, in_production, shipped, delivered)
      const confirmed = reservations.filter(res => 
        ['deposit_paid', 'in_production', 'shipped', 'delivered'].includes(res.status)
      );

      if (confirmed.length === 0) {
        toast.error('No confirmed reservations to export.');
        return;
      }

      const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Net Amount (EGP)', 'Status'];
      const rows = confirmed.map(res => [
        res.orderNumber || res.reservationNumber,
        new Date(res.createdAt).toLocaleDateString(),
        res.customerInfo.fullName,
        res.customerInfo.email,
        res.totalAmount,
        res.status.replace('_', ' ').toUpperCase()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `wanas_accounting_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${confirmed.length} records for accounting.`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to generate export.');
    }
  };

  return (
    <button
      onClick={handleUpdate}
      className="flex items-center gap-3 px-6 py-3 border border-primary/10 text-[10px] uppercase tracking-[0.3em] text-primary/60 hover:text-accent-primary hover:border-accent-primary transition-all group"
    >
      <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
      Download Records for Accounting
    </button>
  );

  function handleUpdate() {
    handleExport();
  }
}
