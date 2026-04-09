'use client';

import { Reservation } from '@/types';
import { MessageCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppButtonProps {
  reservation: Reservation;
}

export default function WhatsAppButton({ reservation }: WhatsAppButtonProps) {
  const generateMessage = () => {
    const orderNumber = reservation.orderNumber || reservation.reservationNumber;
    const name = reservation.customerInfo.fullName;
    const handle = '@wanas.atelier'; // Example InstaPay handle

    return `✨ *WANAS Atelier* ✨\n\nOrder: #${orderNumber}\n\nHello ${name}, your selection is ready. To secure it, please transfer the deposit to our InstaPay: ${handle}.`;
  };

  const handleCopy = () => {
    const message = generateMessage();
    navigator.clipboard.writeText(message);
    toast.success('WhatsApp message copied to clipboard.');
  };

  const handleOpen = () => {
    const message = encodeURIComponent(generateMessage());
    const phone = reservation.customerInfo.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-3 px-6 py-4 border border-primary/10 text-[10px] uppercase tracking-[0.3em] text-primary/60 hover:text-accent-primary hover:border-accent-primary transition-all group"
      >
        <Copy size={14} className="group-hover:translate-y-0.5 transition-transform" />
        Copy WhatsApp Message
      </button>
      <button
        onClick={handleOpen}
        className="flex items-center gap-3 px-6 py-4 bg-emerald-500 text-white text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all group"
      >
        <MessageCircle size={14} className="group-hover:scale-110 transition-transform" />
        Open WhatsApp
      </button>
    </div>
  );
}
