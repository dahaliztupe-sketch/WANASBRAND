import { getAdminReservationById, updateConciergeNotes, updateReservationStatus } from '@/app/admin/actions';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle, Copy, Save, Shield, User, MapPin, Phone, Mail, Package, Clock, DollarSign, Gift } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import WhatsAppButton from './WhatsAppButton';
import NotesSection from './NotesSection';
import StatusSelector from './StatusSelector';

export const dynamic = 'force-dynamic';

export default async function ReservationDetailsAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reservation = await getAdminReservationById(id);

  if (!reservation) notFound();

  return (
    <div className="space-y-12 pb-24">
      <Link 
        href="/admin/reservations" 
        className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-primary/40 hover:text-accent-primary transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Command Board
      </Link>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-12 border-b border-primary/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-serif text-primary tracking-wide italic">
              Order #{reservation.orderNumber}
            </h1>
            {reservation.totalAmount > 10000 && (
              <span className="bg-accent-primary/10 text-accent-primary text-[10px] uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-accent-primary/20">
                High Value Client
              </span>
            )}
          </div>
          <div className="flex items-center gap-6 text-xs text-primary/40 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              {new Date(reservation.createdAt).toLocaleString()}
            </div>
            <div className="w-1 h-1 rounded-full bg-primary/10" />
            <div className="flex items-center gap-2">
              <Shield size={14} />
              PII Decrypted (Admin Only)
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <WhatsAppButton reservation={reservation} />
          <StatusSelector id={reservation.id} currentStatus={reservation.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          {/* Items Section */}
          <section className="space-y-8">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary/40 font-bold flex items-center gap-3">
              <Package size={16} />
              Selection Details
            </h2>
            <div className="space-y-6">
              {reservation.items.map((item, idx) => (
                <div key={idx} className="flex gap-8 p-6 bg-secondary border border-primary/5 group">
                  <div className="relative w-32 h-40 bg-primary/5 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-serif text-primary">{item.productName}</h3>
                        <p className="text-[10px] uppercase tracking-widest text-primary/40 mt-1">{item.variant.sku}</p>
                      </div>
                      <p className="text-lg font-serif text-primary">EGP {item.priceAtPurchase.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-8 pt-4 border-t border-primary/5">
                      <div>
                        <span className="text-[8px] uppercase tracking-widest text-primary/30 block mb-1">Size</span>
                        <span className="text-sm text-primary">{item.variant.size}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase tracking-widest text-primary/30 block mb-1">Color</span>
                        <span className="text-sm text-primary">{item.variant.color}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase tracking-widest text-primary/30 block mb-1">Qty</span>
                        <span className="text-sm text-primary">{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Gifting Section */}
          {reservation.giftingDetails?.isGift && (
            <section className="space-y-8 p-10 bg-accent-primary/5 border-2 border-accent-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Gift size={120} strokeWidth={0.5} />
              </div>
              <h2 className="text-xs uppercase tracking-[0.4em] text-accent-primary font-bold flex items-center gap-3">
                <Gift size={16} />
                Gifting Suite
              </h2>
              <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-accent-primary/60 block mb-2">Recipient Name</span>
                    <p className="text-lg font-serif text-primary">{reservation.giftingDetails.recipientName}</p>
                  </div>
                </div>
                <div className="bg-secondary/50 p-8 border border-accent-primary/10">
                  <span className="text-[8px] uppercase tracking-widest text-accent-primary/60 block mb-4">Handwritten Message for Packing Team</span>
                  <p className="text-2xl font-serif text-primary italic leading-relaxed text-center py-4">
                    &ldquo;{reservation.giftingDetails.giftNote}&rdquo;
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Notes Section */}
          <NotesSection id={reservation.id} initialNotes={reservation.conciergeNotes || ''} />
        </div>

        <aside className="space-y-12">
          {/* Customer Profile */}
          <section className="space-y-8 bg-secondary p-8 border border-primary/5">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary/40 font-bold border-b border-primary/5 pb-4 flex items-center gap-3">
              <User size={16} />
              Customer Profile
            </h2>
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-widest text-primary/30">Full Name</span>
                <p className="text-sm text-primary font-medium">{reservation.customerInfo.fullName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-widest text-primary/30">Email Address</span>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Mail size={14} className="text-primary/30" />
                  {reservation.customerInfo.email}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-widest text-primary/30">Phone Number</span>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Phone size={14} className="text-primary/30" />
                  {reservation.customerInfo.phone}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-widest text-primary/30">Shipping Address</span>
                <div className="flex items-start gap-2 text-sm text-primary leading-relaxed">
                  <MapPin size={14} className="text-primary/30 mt-1 shrink-0" />
                  {reservation.customerInfo.address}, {reservation.customerInfo.city}
                </div>
              </div>
            </div>
          </section>

          {/* Financials */}
          <section className="space-y-8 bg-secondary p-8 border border-primary/5">
            <h2 className="text-xs uppercase tracking-[0.3em] text-primary/40 font-bold border-b border-primary/5 pb-4 flex items-center gap-3">
              <DollarSign size={16} />
              Financials
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-primary/60">
                <span>Subtotal</span>
                <span>EGP {reservation.financials.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-primary/60">
                <span>VAT (14%)</span>
                <span>EGP {reservation.financials.vat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-primary/60">
                <span>Shipping</span>
                <span>EGP {reservation.financials.shippingFee.toLocaleString()}</span>
              </div>
              <div className="h-[1px] bg-primary/5 w-full my-4" />
              <div className="flex justify-between text-xl font-serif text-primary">
                <span>Total</span>
                <span>EGP {reservation.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
