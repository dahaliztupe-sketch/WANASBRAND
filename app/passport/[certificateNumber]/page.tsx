import { db } from '@/lib/firebase/server';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import Image from 'next/image';

export const revalidate = 86400; // ISR: Cache for 24 hours

export default async function PassportPage({ params }: { params: Promise<{ certificateNumber: string }> }) {
  const { certificateNumber } = await params;
  
  if (!db) {
    console.error('Database not initialized');
    notFound();
  }

  const snapshot = await db.collection('passports').where('certificateNumber', '==', certificateNumber).limit(1).get();
  if (snapshot.empty) notFound();
  
  const passport = snapshot.docs[0].data();
  const qrDataUrl = await QRCode.toDataURL(`https://wanasbrand.com/passport/${passport.certificateNumber}`);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 relative print:bg-white print:p-0">
      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" style={{ backgroundImage: "url('/noise.png')" }} />
      
      <div className="max-w-3xl w-full bg-white p-12 md:p-20 shadow-2xl border border-[#D4AF37]/30 relative z-10 print:shadow-none print:border-none print:m-0">
        
        {/* Authenticity Seal (Animated) */}
        <div className="absolute top-12 right-12 w-24 h-24 print:hidden">
          <svg viewBox="0 0 100 100" className="animate-[spin_20s_linear_infinite] text-[#D4AF37]/80">
            <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
            <text fontSize="11" letterSpacing="2.5" className="uppercase font-serif fill-current">
              <textPath href="#circlePath">WANAS • ATELIER • AUTHENTICITY •</textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-2xl text-[#D4AF37]">W</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif text-center tracking-[0.2em] mb-2 text-gray-900">WANAS</h1>
        <p className="text-[10px] text-center tracking-[0.4em] text-gray-500 mb-16 uppercase">Digital Product Passport</p>
        
        <div className="space-y-10 font-sans text-gray-800">
          <div className="text-center">
            <h2 className="font-serif text-3xl mb-4">{passport.productName}</h2>
            <p className="font-mono text-sm tracking-widest text-gray-500">CERT NO. {passport.certificateNumber}</p>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Provenance</h3>
              <p className="text-sm leading-relaxed rtl:leading-[1.8]">Issued exclusively to <span className="font-serif italic text-lg">{passport.customerName}</span> on {passport.purchaseDate}.</p>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Materials</h3>
              <p className="text-sm leading-relaxed rtl:leading-[1.8]">{passport.materials}</p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8" />

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Craftsmanship & Care</h3>
            <p className="text-sm leading-relaxed rtl:leading-[1.8] mb-4">{passport.craftsmanship}</p>
            <p className="text-sm leading-relaxed rtl:leading-[1.8] text-gray-500 italic">{passport.careInstructions}</p>
          </div>
        </div>

        {/* Footer & QR */}
        <div className="mt-20 flex justify-between items-end">
          <div className="text-[9px] uppercase tracking-[0.3em] text-gray-400">
            <p>Atelier de Haute Couture</p>
            <p className="mt-1">Cairo, Egypt</p>
          </div>
          <div className="border border-[#D4AF37]/40 p-2 bg-white">
            <Image src={qrDataUrl} alt="Passport QR" width={80} height={80} className="w-20 h-20" />
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; }
          @page { margin: 2cm; }
          header, footer, .custom-cursor { display: none !important; }
        }
      `}} />
    </div>
  );
}
