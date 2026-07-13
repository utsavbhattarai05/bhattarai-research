import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt     = 'Dr. Dhruba Prasad Bhattarai | Research & Publications';
export const size    = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #5c2a00 100%)',
          fontFamily: 'serif',
          padding: '60px',
        }}
      >
        {/* decorative top line */}
        <div style={{ display: 'flex', width: '100%', height: '4px', background: '#c9a96e', marginBottom: '48px', borderRadius: '2px' }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            flex: 1,
          }}
        >
          <p
            style={{
              fontSize: '22px',
              color: '#c9a96e',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              margin: '0 0 20px 0',
            }}
          >
            ध्रुव प्रसाद भट्टराई
          </p>

          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '0 0 12px 0',
              lineHeight: 1.1,
            }}
          >
            Dr. Dhruba Prasad Bhattarai
          </h1>

          <p
            style={{
              fontSize: '28px',
              color: '#d4a96e',
              margin: '0 0 32px 0',
            }}
          >
            Researcher · Scholar · Folk Literature
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {['लोक साहित्य', 'Folk Literature', 'Nepal', 'Cultural Studies'].map((tag) => (
              <span
                key={tag}
                style={{
                  background: 'rgba(201,169,110,0.15)',
                  border: '1px solid rgba(201,169,110,0.4)',
                  color: '#c9a96e',
                  borderRadius: '999px',
                  padding: '6px 18px',
                  fontSize: '18px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* decorative bottom line */}
        <div style={{ display: 'flex', width: '100%', height: '4px', background: '#c9a96e', marginTop: '48px', borderRadius: '2px' }} />

        <p style={{ color: '#9a7d5a', fontSize: '18px', marginTop: '16px', letterSpacing: '1px' }}>
          dhrubabhattarai.com.np
        </p>
      </div>
    ),
    { ...size }
  );
}
