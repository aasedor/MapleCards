'use client';

import React, { forwardRef } from 'react';

const FONT_MAP: Record<string, string> = {
  'lora': 'var(--font-lora), Lora, serif',
  'playfair': 'var(--font-playfair), Playfair Display, serif',
  'dm-sans': 'var(--font-dm-sans), DM Sans, sans-serif',
};

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
    font?: string;
    textColor?: string;
    messagePosition?: 'top' | 'center' | 'bottom';
  };
}

const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(({ card }, ref) => {
  const hasVideo = !!card.video;
  const hasBackground = !!card.backgroundImage;
  const hasMedia = hasVideo || hasBackground || !!card.faceSwapImage;
  const messageFont = FONT_MAP[card.font || 'lora'] || FONT_MAP['lora'];
  const textColor = card.textColor || (hasMedia ? '#fff' : '#1a1a1a');
  const msgPos = card.messagePosition || 'bottom';
  const justifyContent = msgPos === 'top' ? 'flex-start' : msgPos === 'center' ? 'center' : 'flex-end';

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
            background: msgPos === 'top'
              ? 'linear-gradient(to top, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)'
              : msgPos === 'center'
              ? 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 100%)'
              : 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)',
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

      {/* Sticker overlays */}
      {card.stickers && card.stickers.split(',').filter(Boolean).map((stickerId, idx) => {
        const STICKER_MAP: Record<string, string> = {
          maple: '🍁', heart: '❤️', star: '⭐', sparkle: '✨', gift: '🎁',
          balloon: '🎈', cake: '🎂', confetti: '🎊', flower: '🌸',
          snowflake: '❄️', moose: '🫎', beaver: '🦫',
        };
        const emoji = STICKER_MAP[stickerId] || '🍁';
        // Deterministic positions based on sticker index
        const positions = [
          { top: '8%', right: '8%', rotate: 15, size: 32 },
          { top: '12%', right: '22%', rotate: -10, size: 26 },
          { top: '6%', left: '8%', rotate: -20, size: 28 },
          { top: '18%', left: '18%', rotate: 8, size: 24 },
          { top: '5%', right: '40%', rotate: 25, size: 22 },
          { top: '22%', right: '10%', rotate: -5, size: 30 },
          { top: '15%', left: '35%', rotate: 12, size: 20 },
          { top: '3%', left: '48%', rotate: -15, size: 26 },
          { top: '25%', left: '5%', rotate: 18, size: 24 },
          { top: '10%', right: '55%', rotate: -22, size: 22 },
          { top: '20%', right: '35%', rotate: 7, size: 28 },
          { top: '28%', left: '28%', rotate: -12, size: 20 },
        ];
        const pos = positions[idx % positions.length];
        const { rotate: r, size: s, ...cssPos } = pos;
        return (
          <span
            key={`${stickerId}-${idx}`}
            style={{
              position: 'absolute',
              zIndex: 2,
              fontSize: `${s}px`,
              transform: `rotate(${r}deg)`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              pointerEvents: 'none',
              ...cssPos,
            }}
          >
            {emoji}
          </span>
        );
      })}

      {/* Content overlay */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent,
        flex: 1,
        paddingTop: msgPos === 'top' ? '48px' : '24px',
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
              color: textColor,
              margin: '0 0 16px 0',
              fontStyle: 'italic',
              lineHeight: '1.6',
              fontFamily: messageFont,
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
                color: textColor,
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
