import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'WANAS Fashion House';
export const size = {
  width: 192,
  height: 192,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 120,
          background: '#1A1416',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F4EFE6',
          fontFamily: 'serif',
          fontWeight: 'bold',
        }}
      >
        W
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
