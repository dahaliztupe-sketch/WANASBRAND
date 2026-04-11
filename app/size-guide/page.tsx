'use client';

import { RevealOnScroll } from '@/components/RevealOnScroll';
import { useTranslation } from '@/lib/hooks/useTranslation';

const sizeData = [
  { size: 'XS', bust: '82 / 32.3', waist: '64 / 25.2', hips: '88 / 34.6' },
  { size: 'S', bust: '86 / 33.9', waist: '68 / 26.8', hips: '92 / 36.2' },
  { size: 'M', bust: '90 / 35.4', waist: '72 / 28.3', hips: '96 / 37.8' },
  { size: 'L', bust: '94 / 37.0', waist: '76 / 29.9', hips: '100 / 39.4' },
  { size: 'XL', bust: '98 / 38.6', waist: '80 / 31.5', hips: '104 / 40.9' },
];

export default function SizeGuidePage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-primary text-primary py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <RevealOnScroll>
          <h1 className="text-5xl font-serif font-light mb-16 tracking-tight text-center">{t.sizeGuide.title}</h1>
          
          <div className="overflow-x-auto mb-12">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-start">{t.sizeGuide.size}</th>
                  <th className="py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-start">{t.sizeGuide.bust}</th>
                  <th className="py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-start">{t.sizeGuide.waist}</th>
                  <th className="py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-start">{t.sizeGuide.hips}</th>
                </tr>
              </thead>
              <tbody className="text-sm font-light text-primary/80">
                {sizeData.map((row) => (
                  <tr key={row.size} className="border-b border-primary/10 hover:bg-secondary/5 transition-colors">
                    <td className="py-6 font-medium text-primary text-start"><span dir="ltr">{row.size}</span></td>
                    <td className="py-6 text-start"><span dir="ltr">{row.bust}</span></td>
                    <td className="py-6 text-start"><span dir="ltr">{row.waist}</span></td>
                    <td className="py-6 text-start"><span dir="ltr">{row.hips}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-sm font-light text-primary/60 italic">
            {t.sizeGuide.bespoke}
          </p>
        </RevealOnScroll>
      </div>
    </div>
  );
}
