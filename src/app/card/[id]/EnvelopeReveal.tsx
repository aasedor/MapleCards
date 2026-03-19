'use client';

import React, { useState } from 'react';

interface EnvelopeRevealProps {
  fromName?: string | null;
  children: React.ReactNode;
}

export default function EnvelopeReveal({ fromName, children }: EnvelopeRevealProps) {
  const [opened, setOpened] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleOpen = () => {
    setAnimating(true);
    setTimeout(() => {
      setOpened(true);
    }, 800);
  };

  if (opened) {
    return <>{children}</>;
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-6">
      {/* Envelope */}
      <div
        onClick={handleOpen}
        className="cursor-pointer select-none"
        style={{
          width: '320px',
          height: '220px',
          position: 'relative',
          perspective: '800px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Envelope body */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(145deg, #f5f0e8 0%, #ede5d8 100%)',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Bottom flap triangle */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'linear-gradient(to bottom right, transparent 49.5%, #e8e0d5 50%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'linear-gradient(to bottom left, transparent 49.5%, #e8e0d5 50%)',
              pointerEvents: 'none',
            }}
          />

          {/* Wax seal */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #e74c3c, #8b1a1a)',
              boxShadow: '0 2px 8px rgba(139,26,26,0.4), inset 0 1px 2px rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <span style={{ fontSize: '22px', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }}>🍁</span>
          </div>
        </div>

        {/* Top flap */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            transformOrigin: 'top center',
            transform: animating ? 'rotateX(180deg)' : 'rotateX(0deg)',
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: animating ? 0 : 3,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, #f5f0e8 0%, #ede5d8 100%)',
              borderRadius: '8px 8px 0 0',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
        </div>
      </div>

      {/* Text below envelope */}
      <div className="text-center">
        <p
          className="text-lg font-bold mb-1"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            color: '#1a1a1a',
          }}
        >
          You&apos;ve received a card{fromName ? ` from ${fromName}` : ''}!
        </p>
        <p
          className="text-sm mb-4"
          style={{ color: 'rgba(0,0,0,0.45)' }}
        >
          Tap the envelope to open
        </p>

        {!animating && (
          <button
            onClick={handleOpen}
            className="px-6 py-3 rounded-full text-sm font-bold cursor-pointer border-none transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{
              backgroundColor: '#c0392b',
              color: '#fff',
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            }}
          >
            Open Card
          </button>
        )}
      </div>
    </div>
  );
}
