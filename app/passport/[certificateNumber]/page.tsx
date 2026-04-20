import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import Image from 'next/image';

import { db } from '@/lib/firebase/server';

export const revalidate = 86400; // ISR: Cache for 24 hours

export async function generateMetadata({ params }: { params: Promise<{ certificateNumber: string }> }) {
  const { certificateNumber } = await params;
  return {
    title: `Digital Passport #${certificateNumber} | WANAS`,
    description: 'Authenticated digital product passport — verifying the provenance and craftsmanship of your WANAS piece.',
    robots: { index: false, follow: false },
  };
}

export default async function PassportPage({ params }: { params: Promise<{ certificateNumber: string }> }) {
  const { certificateNumber } = await params;

  if (!db) {
    console.error('[Passport] Database not initialized');
    notFound();
  }

  const snapshot = await db
    .collection('passports')
    .where('certificateNumber', '==', certificateNumber)
    .limit(1)
    .get();

  if (snapshot.empty) notFound();

  const passport = snapshot.docs[0]!.data();
  const qrDataUrl = await QRCode.toDataURL(
    `https://wanasbrand.com/passport/${passport.certificateNumber}`,
    { margin: 1, color: { dark: '#1A1A1A', light: '#FFFFFF' }, width: 160 }
  );

  const craftingSteps: string[] = Array.isArray(passport.craftingSteps)
    ? (passport.craftingSteps as string[])
    : [
        'Pattern drafting by master draper',
        'Hand-cut from selected fabric',
        'Assembly with French seams',
        'Hand-finishing and final pressing',
        'Quality inspection and authentication',
      ];

  const careItems: { icon: string; label: string }[] = [
    { icon: '🌊', label: passport.washInstruction ?? 'Dry clean only' },
    { icon: '🌡️', label: passport.ironInstruction ?? 'Low heat iron, inside out' },
    { icon: '🌿', label: 'Store in breathable garment bag' },
    { icon: '☀️', label: 'Keep away from direct sunlight' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 md:p-8 relative print:bg-white print:p-0">
      {/* Subtle Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: "url('/noise.png')" }}
      />

      <div className="max-w-3xl w-full bg-white shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-[#D4AF37]/20 relative z-10 print:shadow-none print:border-none">

        {/* Header Band */}
        <div className="bg-[#1A1A1A] px-12 py-8 flex items-center justify-between print:py-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#FDFBF7] tracking-[0.3em]">WANAS</h1>
            <p className="text-[8px] tracking-[0.5em] text-[#D4AF37] uppercase mt-1">
              Digital Product Passport
            </p>
          </div>

          {/* Spinning Authenticity Seal */}
          <div className="w-20 h-20 print:hidden relative">
            <svg viewBox="0 0 100 100" className="animate-[spin_25s_linear_infinite] text-[#D4AF37]/60 absolute inset-0">
              <path id="circlePath" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
              <text fontSize="10.5" letterSpacing="2.2" className="uppercase fill-current">
                <textPath href="#circlePath">WANAS • ATELIER • AUTHENTIQUE •</textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-xl text-[#D4AF37]">W</span>
            </div>
          </div>
        </div>

        <div className="px-8 md:px-16 py-12 space-y-12">

          {/* Product Identity */}
          <div className="text-center border-b border-[#D1C7B7]/40 pb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-3">
              {passport.productName as string}
            </h2>
            <p className="font-mono text-xs tracking-[0.3em] text-gray-400 uppercase">
              Certificate № {passport.certificateNumber as string}
            </p>
          </div>

          {/* Provenance & Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-[9px] uppercase tracking-[0.35em] text-[#D4AF37] mb-4 font-bold">
                Provenance
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">
                Issued exclusively to{' '}
                <span className="font-serif italic text-lg text-[#1A1A1A]">
                  {passport.customerName as string}
                </span>{' '}
                on{' '}
                <span className="font-medium">{passport.purchaseDate as string}</span>.
              </p>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                Handcrafted at the WANAS Atelier, Cairo, Egypt. Each piece is unique and
                individually authenticated before delivery.
              </p>
            </div>

            <div>
              <h3 className="text-[9px] uppercase tracking-[0.35em] text-[#D4AF37] mb-4 font-bold">
                Materials & Composition
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">
                {passport.materials as string}
              </p>
              {passport.fabricInfo && typeof passport.fabricInfo === 'object' && (
                <div className="mt-4 space-y-2">
                  {Object.entries(passport.fabricInfo as Record<string, number>).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-[9px] uppercase tracking-widest text-gray-400 w-24 shrink-0">
                        {key}
                      </span>
                      <div className="flex-1 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#D4AF37] rounded-full"
                          style={{ width: `${Math.min(100, Number(val))}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-gray-400 w-8 text-right">{val}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Craftsmanship Journey */}
          <div>
            <h3 className="text-[9px] uppercase tracking-[0.35em] text-[#D4AF37] mb-6 font-bold">
              The Making Of — Craftsmanship Journey
            </h3>
            {passport.craftsmanship && (
              <p className="text-sm leading-relaxed text-gray-700 mb-6">
                {passport.craftsmanship as string}
              </p>
            )}
            <ol className="space-y-3">
              {craftingSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-6 h-6 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[9px] font-bold text-[#D4AF37] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-600 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Care Instructions */}
          <div className="bg-[#FDFBF7] border border-[#D1C7B7]/30 p-8">
            <h3 className="text-[9px] uppercase tracking-[0.35em] text-[#D4AF37] mb-6 font-bold">
              Care & Preservation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {careItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
            {passport.careInstructions && (
              <p className="text-xs text-gray-400 italic mt-6 border-t border-gray-100 pt-4">
                {passport.careInstructions as string}
              </p>
            )}
          </div>

          {/* Sustainability Note */}
          <div className="flex items-start gap-4 py-6 border-t border-b border-[#D1C7B7]/30">
            <span className="text-2xl">🌿</span>
            <div>
              <h3 className="text-[9px] uppercase tracking-[0.35em] text-[#D4AF37] mb-2 font-bold">
                Our Commitment
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                WANAS is committed to responsible sourcing and minimal waste production.
                This garment was crafted using ethically sourced materials and small-batch
                manufacturing, reducing overproduction and its environmental impact.
              </p>
            </div>
          </div>

          {/* Footer: Signature + QR */}
          <div className="flex flex-col sm:flex-row justify-between items-end gap-8 pt-4">
            <div className="space-y-3">
              <div className="text-[9px] uppercase tracking-[0.3em] text-gray-300 space-y-1">
                <p>Atelier de Haute Couture</p>
                <p>Cairo, Egypt · Est. 2020</p>
                <p className="mt-3 text-[#D4AF37]">wanasbrand.com</p>
              </div>
              {/* Signature line */}
              <div className="w-40 border-t border-gray-200 pt-2">
                <p className="text-[8px] tracking-widest text-gray-300 uppercase">
                  Authenticated by Master Artisan
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 print:block">
              <div className="border border-[#D4AF37]/30 p-2 bg-white">
                <Image
                  src={qrDataUrl}
                  alt={`Passport QR for ${passport.certificateNumber}`}
                  width={80}
                  height={80}
                  className="w-20 h-20"
                />
              </div>
              <p className="text-[8px] tracking-widest text-gray-300 uppercase text-center">
                Scan to verify
              </p>
            </div>
          </div>

        </div>

        {/* Print Action */}
        <div className="px-8 md:px-16 py-6 border-t border-[#D1C7B7]/20 flex justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="text-[9px] uppercase tracking-[0.3em] text-gray-400 hover:text-[#D4AF37] transition-colors"
          >
            Print Certificate →
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { background: white; }
            @page { margin: 1.5cm; size: A4; }
            header, footer, nav, .custom-cursor { display: none !important; }
          }
        `
      }} />
    </div>
  );
}
