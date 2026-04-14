import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'WANAS | Luxury Handcrafted Fashion';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        background: '#FDFBF7',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Subtle Texture/Noise Overlay Simulation */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }} />

        {/* Golden Thread Accent */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: 0, 
          width: '100%', 
          height: '1px', 
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', 
          opacity: 0.6 
        }} />
        
        {/* Monogram */}
        <svg width="140" height="140" viewBox="0 0 120 120" fill="none" style={{ zIndex: 10, marginBottom: '40px' }}>
          <path d="M30 30 L45 90 L60 45 L75 90 L90 30" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 60 C 35 20, 55 110, 70 60 C 80 30, 90 20, 105 50" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        
        {/* Wordmark */}
        <div style={{
          fontSize: 72,
          fontFamily: 'serif',
          letterSpacing: '0.4em',
          color: '#1A1A1A',
          zIndex: 10,
          fontWeight: 400,
          textTransform: 'uppercase',
        }}>
          WANAS
        </div>
        
        <div style={{
          fontSize: 20,
          letterSpacing: '0.6em',
          color: '#D4AF37',
          marginTop: '30px',
          textTransform: 'uppercase',
          zIndex: 10,
          fontWeight: 600,
        }}>
          Handcrafted Excellence
        </div>
      </div>
    ),
    { ...size }
  );
}
