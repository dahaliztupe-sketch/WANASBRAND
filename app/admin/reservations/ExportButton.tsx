'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Reservation } from '@/types';

interface ExportButtonProps {
  reservations: Reservation[];
}

const escapeCSV = (value: unknown): string => {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export default function ExportButton({ reservations }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExportAccounting = () => {
    try {
      setExporting(true);
      const confirmed = reservations.filter((res) =>
        ['deposit_paid', 'in_production', 'shipped', 'delivered'].includes(res.status)
      );

      if (confirmed.length === 0) {
        toast.error('No confirmed reservations to export.');
        return;
      }

      const headers = [
        'Reservation No.',
        'Date',
        'Customer Name',
        'Email',
        'City',
        'Payment Method',
        'Subtotal (EGP)',
        'VAT (EGP)',
        'Shipping (EGP)',
        'Total (EGP)',
        'Status',
        'Items Count',
        'Products',
      ];

      const rows = confirmed.map((res) => [
        res.reservationNumber,
        new Date(res.createdAt).toLocaleDateString('en-GB'),
        res.customerInfo.fullName,
        res.customerInfo.email ?? '',
        res.customerInfo.city ?? '',
        res.customerInfo.contactMethod,
        res.financials?.subtotal ?? res.totalAmount,
        res.financials?.vat ?? 0,
        res.financials?.shippingFee ?? 0,
        res.financials?.total ?? res.totalAmount,
        res.status.replace(/_/g, ' ').toUpperCase(),
        res.items.length,
        res.items.map((i) => `${i.productName} (×${i.quantity})`).join(' | '),
      ]);

      const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map((row) => row.map(escapeCSV).join(',')),
      ].join('\n');

      downloadCSV(csvContent, `wanas_accounting_${todayISO()}.csv`);
      toast.success(`Exported ${confirmed.length} reservations for accounting.`);
    } catch (error) {
      console.error('[CSV Export] Error:', error);
      toast.error('Failed to generate export.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportFull = () => {
    try {
      setExporting(true);

      if (reservations.length === 0) {
        toast.error('No reservations to export.');
        return;
      }

      const headers = [
        'Reservation No.',
        'Date',
        'Status',
        'Customer Name',
        'Email',
        'City',
        'Contact Method',
        'Items',
        'Total (EGP)',
        'Tracking No.',
        'Shipping Provider',
        'Concierge Notes',
      ];

      const rows = reservations.map((res) => [
        res.reservationNumber,
        new Date(res.createdAt).toLocaleDateString('en-GB'),
        res.status.replace(/_/g, ' ').toUpperCase(),
        res.customerInfo.fullName,
        res.customerInfo.email ?? '',
        res.customerInfo.city ?? '',
        res.customerInfo.contactMethod,
        res.items.map((i) => `${i.productName} [${i.variant.size}/${i.variant.color}] ×${i.quantity}`).join(' | '),
        res.financials?.total ?? res.totalAmount,
        res.trackingNumber ?? '',
        res.shippingProvider ?? '',
        res.conciergeNotes ?? '',
      ]);

      const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map((row) => row.map(escapeCSV).join(',')),
      ].join('\n');

      downloadCSV(csvContent, `wanas_reservations_full_${todayISO()}.csv`);
      toast.success(`Exported all ${reservations.length} reservations.`);
    } catch (error) {
      console.error('[CSV Export Full] Error:', error);
      toast.error('Failed to generate export.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={handleExportAccounting}
        disabled={exporting}
        className="flex items-center gap-3 px-6 py-3 border border-primary/10 text-[10px] uppercase tracking-[0.3em] text-primary/60 hover:text-accent-primary hover:border-accent-primary transition-all group disabled:opacity-40"
      >
        <Download
          size={14}
          className="group-hover:translate-y-0.5 transition-transform"
        />
        Accounting Export
      </button>

      <button
        onClick={handleExportFull}
        disabled={exporting}
        className="flex items-center gap-3 px-6 py-3 border border-primary/10 text-[10px] uppercase tracking-[0.3em] text-primary/60 hover:text-accent-primary hover:border-accent-primary transition-all group disabled:opacity-40"
      >
        <FileText
          size={14}
          className="group-hover:translate-y-0.5 transition-transform"
        />
        Full Export
      </button>
    </div>
  );
}

function downloadCSV(content: string, filename: string) {
  const bom = '\uFEFF'; // UTF-8 BOM for proper Arabic rendering in Excel
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0] ?? 'export';
}
