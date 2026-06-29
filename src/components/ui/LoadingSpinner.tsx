'use client';

export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      {/* Book with flipping pages */}
      <div className="flex items-center">
        {/* Spine */}
        <div style={{
          width: '5px',
          height: '44px',
          background: '#8B1A1A',
          borderRadius: '2px 0 0 2px',
          flexShrink: 0,
        }} />
        {/* Left page — flips first */}
        <div style={{
          width: '22px',
          height: '34px',
          border: '2px solid #8B1A1A',
          borderRight: 'none',
          borderRadius: '3px 0 0 3px',
          transformOrigin: 'right center',
          animation: 'pageFlipLeft 1.6s ease-in-out infinite',
        }} />
        {/* Right page — flips second */}
        <div style={{
          width: '22px',
          height: '34px',
          border: '2px solid #8B1A1A',
          borderLeft: 'none',
          borderRadius: '0 3px 3px 0',
          transformOrigin: 'left center',
          animation: 'pageFlipRight 1.6s ease-in-out infinite',
          animationDelay: '0.4s',
        }} />
      </div>

      <p style={{ fontSize: '12px', color: '#8B1A1A', letterSpacing: '0.08em' }}>
        {text}
      </p>

      <style>{`
        @keyframes pageFlipLeft {
          0%, 100% { transform: scaleX(1); opacity: 1; }
          40%, 60% { transform: scaleX(0); opacity: 0.2; }
        }
        @keyframes pageFlipRight {
          0%, 100% { transform: scaleX(1); opacity: 1; }
          40%, 60% { transform: scaleX(0); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
