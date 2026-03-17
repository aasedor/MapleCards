'use client';

import React, { forwardRef } from 'react';
import './animations.css';

interface CardPreviewProps {
  card: {
    template: string;
    message: string;
    fromName: string;
    province: string;
    bilingual: boolean;
    stickers: string;
    image?: string;
    occasion?: string;
  };
  showAnimation?: boolean;
}

const RED = '#c0392b';
const RED_DARK = '#8b1a1a';
const CREAM = '#faf8f3';

const TEMPLATE_EMOJI: Record<string, string> = {
  'Canada Day': '🇨🇦',
  'Fall Colours': '🍁',
  'Hockey Night': '🏒',
  'Northern Lights': '🌌',
  'Canadian Winter': '❄️',
  'Cottage Country': '🌊',
  'Canmore': '🏔️',
  'Trillium': '🌸',
  'Prairie Crocus': '💜',
  'Pacific Dogwood': '🌼',
  'Wild Rose': '🌹',
  'Fireweed': '🌺',
  'Blue Flag Iris': '💙',
  'Purple Violet': '🟣',
  'Mayflower': '🤍',
  'Muskoka Chairs': '🪑',
  'Log Cabin Stove': '🔥',
  'Backyard Rink': '⛸️',
  'Porch Swing Autumn': '🍂',
  'Kitchen Table Pie': '🥧',
  'Cottage Dock Sunset': '🌅',
  'Starring You': '🎭',
};

// Animation mapping
type AnimationType = 'leaves' | 'snow' | 'confetti' | 'aurora' | 'fireworks' | 'petals' | 'candle' | 'stars' | null;

const OCCASION_ANIMATION: Record<string, AnimationType> = {
  'Birthday': 'leaves',
  'Canada Day': 'fireworks',
  'Thanksgiving': 'leaves',
  'Just Because': 'stars',
  'Christmas': 'snow',
  'New Year': 'fireworks',
  'Graduation': 'confetti',
  'Congratulations': 'confetti',
  'New Baby': 'confetti',
  'Sympathy': 'aurora',
  'Thinking of You': 'aurora',
  "Mother's Day": 'petals',
  "Valentine's": 'petals',
  'Wedding': 'petals',
  'Remembrance Day': 'candle',
  "Father's Day": 'stars',
  'Get Well': 'stars',
  'Thank You': 'petals',
};

const TEMPLATE_ANIMATION: Record<string, AnimationType> = {
  'Canada Day': 'fireworks',
  'Fall Colours': 'leaves',
  'Hockey Night': 'confetti',
  'Northern Lights': 'aurora',
  'Canadian Winter': 'snow',
  'Cottage Country': 'stars',
  'Canmore': 'stars',
  'Trillium': 'petals',
  'Prairie Crocus': 'petals',
  'Pacific Dogwood': 'petals',
  'Wild Rose': 'petals',
  'Fireweed': 'petals',
  'Blue Flag Iris': 'petals',
  'Purple Violet': 'petals',
  'Mayflower': 'petals',
  'Muskoka Chairs': 'stars',
  'Log Cabin Stove': 'candle',
  'Backyard Rink': 'snow',
  'Porch Swing Autumn': 'leaves',
  'Kitchen Table Pie': 'stars',
  'Cottage Dock Sunset': 'stars',
  'Starring You': 'confetti',
};

function getAnimation(template: string, occasion?: string): AnimationType {
  if (occasion && OCCASION_ANIMATION[occasion]) return OCCASION_ANIMATION[occasion];
  return TEMPLATE_ANIMATION[template] || 'leaves';
}

function renderAnimationOverlay(type: AnimationType): React.ReactNode {
  if (!type) return null;

  switch (type) {
    case 'leaves':
      return (
        <div className="mc-anim-layer">
          {Array.from({ length: 12 }, (_, i) => <div key={i} className="mc-leaf" />)}
        </div>
      );
    case 'snow':
      return (
        <div className="mc-anim-layer">
          {Array.from({ length: 15 }, (_, i) => <div key={i} className="mc-snowflake" />)}
        </div>
      );
    case 'confetti':
      return (
        <div className="mc-anim-layer">
          {Array.from({ length: 20 }, (_, i) => <div key={i} className="mc-confetti-piece" />)}
        </div>
      );
    case 'aurora':
      return (
        <div className="mc-anim-layer">
          {Array.from({ length: 3 }, (_, i) => <div key={i} className="mc-aurora-band" />)}
        </div>
      );
    case 'fireworks':
      return (
        <div className="mc-anim-layer">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="mc-firework-group">
              {Array.from({ length: 8 }, (_, j) => <div key={j} className="mc-firework" />)}
            </div>
          ))}
        </div>
      );
    case 'petals':
      return (
        <div className="mc-anim-layer">
          {Array.from({ length: 10 }, (_, i) => <div key={i} className="mc-petal" />)}
        </div>
      );
    case 'candle':
      return (
        <div className="mc-anim-layer">
          <div className="mc-candle">
            <div className="mc-candle-glow" />
            <div className="mc-candle-flame" />
            <div className="mc-candle-body" />
          </div>
        </div>
      );
    case 'stars':
      return (
        <div className="mc-anim-layer">
          {Array.from({ length: 15 }, (_, i) => <div key={i} className="mc-star" />)}
        </div>
      );
  }
}

// Segment emoji properly using Intl.Segmenter
function segmentEmoji(str: string): string[] {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter().segment(str)].map(s => s.segment);
  }
  return [...str];
}

const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(({ card, showAnimation = true }, ref) => {
  const emoji = TEMPLATE_EMOJI[card.template] || '🍁';
  const hasImage = !!card.image;
  const animationType = getAnimation(card.template, card.occasion);

  return (
    <div
      ref={ref}
      style={{
        width: '400px',
        height: '500px',
        backgroundColor: hasImage ? '#000' : '#fff',
        border: `4px solid ${RED}`,
        borderRadius: '0',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      {hasImage && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${card.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Gradient overlay for readability on images */}
      {hasImage && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Background gradient for non-image cards */}
      {!hasImage && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: `linear-gradient(135deg, ${CREAM} 0%, #fff 50%, ${CREAM} 100%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Animation overlay */}
      {showAnimation && renderAnimationOverlay(animationType)}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {!hasImage && <div style={{ fontSize: '56px', marginBottom: '8px' }}>{emoji}</div>}
          <p
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', serif",
              fontSize: '13px',
              color: hasImage ? '#fff' : RED,
              margin: '0',
              fontWeight: 900,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textShadow: hasImage ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            {card.template?.toUpperCase()}
          </p>
        </div>

        {/* Message */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p
            style={{
              fontFamily: "var(--font-lora), 'Lora', serif",
              fontSize: '18px',
              color: hasImage ? '#fff' : '#333',
              margin: '0',
              fontStyle: 'italic',
              textAlign: 'center',
              lineHeight: 1.6,
              textShadow: hasImage ? '0 1px 4px rgba(0,0,0,0.6)' : 'none',
            }}
          >
            &ldquo;{card.message}&rdquo;
          </p>
        </div>

        {/* Stickers row */}
        {card.stickers && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px', fontSize: '24px' }}>
            {segmentEmoji(card.stickers).map((sticker, idx) => (
              <span key={idx}>{sticker}</span>
            ))}
          </div>
        )}

        {/* Bilingual badge */}
        {card.bilingual && (
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span
              style={{
                backgroundColor: RED,
                color: 'white',
                padding: '4px 14px',
                borderRadius: '0',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                boxShadow: `3px 3px 0 ${RED_DARK}`,
              }}
            >
              BILINGUE / BILINGUAL
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: hasImage ? '2px solid rgba(255,255,255,0.3)' : `2px solid ${RED}`,
          padding: '12px 30px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 3,
          backgroundColor: hasImage ? 'rgba(0,0,0,0.4)' : 'transparent',
        }}
      >
        <p style={{ fontSize: '11px', color: hasImage ? 'rgba(255,255,255,0.7)' : '#999', margin: '0 0 3px 0', fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}>
          {card.province ? `From ${card.province}` : 'From Canada'}
        </p>
        <p
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            fontSize: '15px',
            color: hasImage ? '#fff' : '#1a1a1a',
            margin: '0',
            fontWeight: 700,
          }}
        >
          From {card.fromName}
        </p>
      </div>

      {/* Decorative maple leaf corners (non-image cards only) */}
      {!hasImage && (
        <>
          <div style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '18px', opacity: 0.3, zIndex: 3 }}>
            🍁
          </div>
          <div style={{ position: 'absolute', bottom: '8px', left: '10px', fontSize: '18px', opacity: 0.3, zIndex: 3 }}>
            🍁
          </div>
        </>
      )}
    </div>
  );
});

CardPreview.displayName = 'CardPreview';

export default CardPreview;
