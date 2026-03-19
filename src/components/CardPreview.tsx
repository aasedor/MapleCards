'use client';

import React, { forwardRef } from 'react';

interface CardPreviewProps {
  card: {
    template: string;
    message: string;
    fromName: string;
    province: string;
    bilingual: boolean;
    stickers: string;
    video?: string;
    faceSwapImage?: string;
    backgroundImage?: string;
  };
}

const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(({ card }, ref) => {
  const hasVideo = !!card.video;
  const hasBackground = !!card.backgroundImage;
  const hasMedia = hasVideo || hasBackground || !!card.faceSwapImage;

  return (
    <div
      ref={ref}
      style={{
        width: '360px',
        height: '480px',
        backgroundColor: hasMedia ? '#000' : '#fff',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background image (static card design) */}
      {hasBackground && !card.faceSwapImage && (
        <img
          src={card.backgroundImage}
          alt=""
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Background video */}
      {hasVideo && !card.faceSwapImage && !hasBackground && (
        <video
          src={card.video}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Face-swapped image background */}
      {card.faceSwapImage && (
        <img
          src={card.faceSwapImage}
          alt="Your personalized card"
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Gradient overlay for readability */}
      {hasMedia && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* No-media state: elegant minimal design */}
      {!hasMedia && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(160deg, #faf8f3 0%, #f5f0e8 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Content overlay */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        flex: 1,
      }}>
        {/* Top: Template name pill */}
        <div style={{ position: 'absolute', top: '20px', left: '24px', right: '24px' }}>
          {card.template && (
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '10px',
                fontWeight: 'bold',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                backgroundColor: hasMedia ? 'rgba(255,255,255,0.2)' : 'rgba(192,57,43,0.1)',
                color: hasMedia ? 'rgba(255,255,255,0.9)' : 'var(--red, #c0392b)',
                backdropFilter: hasMedia ? 'blur(4px)' : 'none',
              }}
            >
              {card.template}
            </span>
          )}
        </div>

        {/* Message */}
        {card.message && (
          <p
            style={{
              fontSize: '17px',
              color: hasMedia ? '#fff' : '#1a1a1a',
              margin: '0 0 16px 0',
              fontStyle: 'italic',
              lineHeight: '1.6',
              fontFamily: 'var(--font-lora), Lora, serif',
              textShadow: hasMedia ? '0 1px 8px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            &ldquo;{card.message}&rdquo;
          </p>
        )}

        {/* Bilingual badge */}
        {card.bilingual && (
          <div style={{ marginBottom: '12px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '100px',
                fontSize: '10px',
                fontWeight: 'bold',
                backgroundColor: hasMedia ? 'rgba(255,255,255,0.15)' : 'rgba(192,57,43,0.08)',
                color: hasMedia ? 'rgba(255,255,255,0.8)' : 'var(--red, #c0392b)',
              }}
            >
              EN / FR
            </span>
          </div>
        )}

        {/* Footer divider + sender */}
        <div
          style={{
            borderTop: hasMedia ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.08)',
            paddingTop: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            {card.fromName && (
              <p style={{
                fontSize: '14px',
                color: hasMedia ? '#fff' : '#1a1a1a',
                margin: 0,
                fontWeight: 'bold',
              }}>
                {card.fromName}
              </p>
            )}
            <p style={{
              fontSize: '11px',
              color: hasMedia ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
              margin: '2px 0 0 0',
            }}>
              {card.province || 'Canada'}
            </p>
          </div>
          <span style={{
            fontSize: '20px',
            opacity: hasMedia ? 0.6 : 0.3,
          }}>
            🍁
          </span>
        </div>
      </div>
    </div>
  );
});

CardPreview.displayName = 'CardPreview';

export default CardPreview;
