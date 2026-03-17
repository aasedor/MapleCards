'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import CardPreview from './CardPreview';
import StarringYou from './StarringYou';

const RED = '#c0392b';
const RED_DARK = '#8b1a1a';
const CREAM = '#faf8f3';
const FONT_UI = "var(--font-dm-sans), 'DM Sans', sans-serif";
const FONT_HEADLINE = "var(--font-playfair), 'Playfair Display', serif";

type CollectionKey = 'classic' | 'cpr' | 'botanicals' | 'cosy' | 'starring-you';

interface Template {
  name: string;
  emoji: string;
  image?: string;
}

const COLLECTIONS: Record<CollectionKey, { label: string; templates: Template[] }> = {
  classic: {
    label: 'Classic',
    templates: [
      { name: 'Canada Day', emoji: '🇨🇦' },
      { name: 'Fall Colours', emoji: '🍁' },
      { name: 'Hockey Night', emoji: '🏒' },
      { name: 'Northern Lights', emoji: '🌌' },
      { name: 'Canadian Winter', emoji: '❄️' },
      { name: 'Cottage Country', emoji: '🌊' },
    ],
  },
  cpr: {
    label: 'CPR Posters',
    templates: [
      { name: 'Canmore', emoji: '🏔️', image: '/cpr-cards/canmore.jpg' },
    ],
  },
  botanicals: {
    label: 'Canadian Botanicals',
    templates: [
      { name: 'Trillium', emoji: '🌸', image: '/botanicals/trillium.jpg' },
      { name: 'Prairie Crocus', emoji: '💜', image: '/botanicals/prairie-crocus.jpg' },
      { name: 'Pacific Dogwood', emoji: '🌼', image: '/botanicals/pacific-dogwood.jpg' },
      { name: 'Wild Rose', emoji: '🌹', image: '/botanicals/wild-rose.jpg' },
      { name: 'Fireweed', emoji: '🌺', image: '/botanicals/fireweed.jpg' },
      { name: 'Blue Flag Iris', emoji: '💙', image: '/botanicals/blue-flag-iris.jpg' },
      { name: 'Purple Violet', emoji: '🟣', image: '/botanicals/purple-violet.jpg' },
      { name: 'Mayflower', emoji: '🤍', image: '/botanicals/mayflower.jpg' },
    ],
  },
  cosy: {
    label: 'Cosy Canada',
    templates: [
      { name: 'Muskoka Chairs', emoji: '🪑', image: '/cosy-cards/muskoka-chairs.jpg' },
      { name: 'Log Cabin Stove', emoji: '🔥', image: '/cosy-cards/log-cabin-stove.jpg' },
      { name: 'Backyard Rink', emoji: '⛸️', image: '/cosy-cards/backyard-rink.jpg' },
      { name: 'Porch Swing Autumn', emoji: '🍂', image: '/cosy-cards/porch-swing-autumn.jpg' },
      { name: 'Kitchen Table Pie', emoji: '🥧', image: '/cosy-cards/kitchen-table-pie.jpg' },
      { name: 'Cottage Dock Sunset', emoji: '🌅', image: '/cosy-cards/cottage-dock-sunset.jpg' },
    ],
  },
  'starring-you': {
    label: 'Starring You',
    templates: [
      { name: 'Starring You', emoji: '🎭' },
    ],
  },
};

const OCCASIONS = [
  'Birthday', 'Canada Day', 'Thanksgiving', 'Just Because',
  'Christmas', 'New Year', 'Graduation', 'Congratulations',
  'New Baby', 'Sympathy', 'Thinking of You', "Mother's Day",
  "Valentine's", 'Wedding', 'Remembrance Day', "Father's Day",
  'Get Well', 'Thank You',
];

const OCCASION_COLLECTION: Record<string, CollectionKey> = {
  'Canada Day': 'cpr',
  'Remembrance Day': 'cpr',
  "Mother's Day": 'botanicals',
  "Valentine's": 'botanicals',
  'Thank You': 'botanicals',
  'Christmas': 'cosy',
  'Thanksgiving': 'cosy',
};

const PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec',
  'Saskatchewan', 'Yukon',
];

const STICKER_OPTIONS = ['🍁', '🐻', '🦫', '🦌', '🏒', '🌲'];

export default function CardEditor() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [activeCollection, setActiveCollection] = useState<CollectionKey>('classic');
  const [showAnimation, setShowAnimation] = useState(true);

  const [card, setCard] = useState({
    template: 'Canada Day',
    message: 'Happy Canadian holidays!',
    fromName: 'Your Friend',
    province: 'Ontario',
    bilingual: false,
    stickers: '🍁',
    image: undefined as string | undefined,
    occasion: undefined as string | undefined,
  });

  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
  });

  const handleCardChange = (field: string, value: unknown) => {
    setCard((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectTemplate = (t: Template) => {
    setCard((prev) => ({
      ...prev,
      template: t.name,
      image: t.image,
    }));
  };

  const selectOccasion = (occasion: string) => {
    handleCardChange('occasion', occasion);
    if (OCCASION_COLLECTION[occasion]) {
      const col = OCCASION_COLLECTION[occasion];
      setActiveCollection(col);
      const first = COLLECTIONS[col].templates[0];
      if (first) selectTemplate(first);
    }
  };

  const toggleSticker = (sticker: string) => {
    setCard((prev) => {
      const stickers = prev.stickers.includes(sticker)
        ? prev.stickers.replace(sticker, '')
        : prev.stickers + sticker;
      return { ...prev, stickers };
    });
  };

  const handleStarringYouSelect = (imageDataUrl: string) => {
    setCard((prev) => ({
      ...prev,
      template: 'Starring You',
      image: imageDataUrl,
    }));
  };

  const sendCard = async () => {
    if (!formData.recipientEmail.includes('@')) {
      alert('Please enter a valid email');
      return;
    }
    if (!card.message.trim() || !card.fromName.trim()) {
      alert('Please fill in message and from name');
      return;
    }

    setLoading(true);
    try {
      if (!previewRef.current) throw new Error('Preview not found');

      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#fff',
        scale: 2,
        useCORS: true,
      });
      const imageData = canvas.toDataURL('image/png');

      const response = await fetch('/api/send-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: card.template,
          message: card.message,
          fromName: card.fromName,
          province: card.province,
          bilingual: card.bilingual,
          stickers: card.stickers,
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName,
          imageData,
        }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      alert('Card sent successfully!');
      setFormData({ recipientEmail: '', recipientName: '' });
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to send card'}`);
    } finally {
      setLoading(false);
    }
  };

  const currentTemplates = COLLECTIONS[activeCollection].templates;
  const isStarringYou = activeCollection === 'starring-you';

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: CREAM }}>
      {/* Sidebar */}
      <div
        style={{
          width: '360px',
          backgroundColor: '#fff',
          borderRight: `3px solid ${RED}`,
          overflowY: 'auto',
          padding: '24px',
        }}
      >
        <h2 style={{ color: RED, margin: '0 0 20px 0', fontSize: '22px', fontFamily: FONT_HEADLINE }}>
          Create Card 🍁
        </h2>

        {/* Occasion Selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Occasion</label>
          <select
            value={card.occasion || ''}
            onChange={(e) => selectOccasion(e.target.value)}
            style={inputStyle}
          >
            <option value="">Choose an occasion...</option>
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Collection Tabs */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Collection</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {(Object.keys(COLLECTIONS) as CollectionKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveCollection(key)}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: FONT_UI,
                  border: activeCollection === key ? `2px solid ${RED}` : '2px solid #ddd',
                  backgroundColor: activeCollection === key ? RED : '#fff',
                  color: activeCollection === key ? '#fff' : '#333',
                  borderRadius: '0',
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                }}
              >
                {COLLECTIONS[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Picker or Starring You */}
        {isStarringYou ? (
          <StarringYou onSelect={handleStarringYouSelect} recipientName={formData.recipientName} />
        ) : (
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Template</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {currentTemplates.map((t) => (
                <button
                  key={t.name}
                  onClick={() => selectTemplate(t)}
                  style={{
                    padding: '10px',
                    border: card.template === t.name ? `3px solid ${RED}` : '2px solid #ddd',
                    backgroundColor: card.template === t.name ? '#fff' : CREAM,
                    borderRadius: '0',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: FONT_UI,
                    textAlign: 'center',
                    boxShadow: card.template === t.name ? `4px 4px 0 ${RED_DARK}` : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>{t.emoji}</div>
                  <div>{t.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Animation Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => setShowAnimation(!showAnimation)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: FONT_UI,
              border: `2px solid ${showAnimation ? RED : '#ddd'}`,
              backgroundColor: showAnimation ? RED : '#fff',
              color: showAnimation ? '#fff' : '#666',
              borderRadius: '0',
              cursor: 'pointer',
              boxShadow: showAnimation ? `3px 3px 0 ${RED_DARK}` : 'none',
            }}
          >
            {showAnimation ? '✨ Animations ON' : '✨ Animations OFF'}
          </button>
        </div>

        {/* Message */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Message</label>
          <textarea
            value={card.message}
            onChange={(e) => handleCardChange('message', e.target.value)}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="Your message here..."
          />
        </div>

        {/* From Name */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>From Name</label>
          <input
            type="text"
            value={card.fromName}
            onChange={(e) => handleCardChange('fromName', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Province */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Province</label>
          <select
            value={card.province}
            onChange={(e) => handleCardChange('province', e.target.value)}
            style={inputStyle}
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Stickers */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Stickers</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STICKER_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSticker(s)}
                style={{
                  width: '38px',
                  height: '38px',
                  fontSize: '18px',
                  border: card.stickers.includes(s) ? `2px solid ${RED}` : '2px solid #ddd',
                  backgroundColor: card.stickers.includes(s) ? '#fff' : CREAM,
                  borderRadius: '0',
                  cursor: 'pointer',
                  boxShadow: card.stickers.includes(s) ? `2px 2px 0 ${RED_DARK}` : 'none',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Bilingual Toggle */}
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="bilingual"
            checked={card.bilingual}
            onChange={(e) => handleCardChange('bilingual', e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="bilingual" style={{ fontWeight: 700, color: '#333', cursor: 'pointer', margin: 0, fontSize: '13px', fontFamily: FONT_UI }}>
            Bilingual (French/English) 🇨🇦
          </label>
        </div>

        {/* Recipient Email */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Recipient Email</label>
          <input
            type="email"
            value={formData.recipientEmail}
            onChange={(e) => handleFormChange('recipientEmail', e.target.value)}
            style={inputStyle}
            placeholder="recipient@example.com"
          />
        </div>

        {/* Recipient Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Recipient Name (optional)</label>
          <input
            type="text"
            value={formData.recipientName}
            onChange={(e) => handleFormChange('recipientName', e.target.value)}
            style={inputStyle}
            placeholder="John Doe"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={sendCard}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: RED,
            color: '#fff',
            border: 'none',
            borderRadius: '0',
            fontSize: '15px',
            fontWeight: 700,
            fontFamily: FONT_UI,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: `6px 6px 0 ${RED_DARK}`,
          }}
        >
          {loading ? 'Sending...' : 'Send Card'}
        </button>
      </div>

      {/* Preview Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          backgroundColor: CREAM,
        }}
      >
        <div style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))' }}>
          <CardPreview ref={previewRef} card={card} showAnimation={showAnimation} />
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: 700,
  color: '#333',
  fontSize: '13px',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: '2px solid #ddd',
  borderRadius: '0',
  boxSizing: 'border-box',
  fontSize: '14px',
  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
};
