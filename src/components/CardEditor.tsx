'use client';

import React, { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import CardPreview from './CardPreview';
import StarringYou from './StarringYou';
import Link from 'next/link';

interface CardTemplate {
  id: string;
  name: string;
  src: string;
  occasion: string;
  style: string;
  video?: string;
}

const CARD_TEMPLATES: CardTemplate[] = [
  // Birthday
  { id: 'bday-cake', name: 'Cake Risograph', src: '/cards/birthday/cake-risograph.jpg', occasion: 'Birthday', style: 'risograph' },
  { id: 'bday-bear', name: 'Bear Gouache', src: '/cards/birthday/bear-gouache.jpg', occasion: 'Birthday', style: 'gouache' },
  { id: 'bday-moose', name: 'Moose Linocut', src: '/cards/birthday/moose-linocut.jpg', occasion: 'Birthday', style: 'linocut' },
  { id: 'bday-balloons', name: 'Balloons', src: '/cards/birthday/balloons-midcentury.jpg', occasion: 'Birthday', style: 'midcentury' },
  { id: 'bday-loon', name: 'Loon Screenprint', src: '/cards/birthday/loon-screenprint.jpg', occasion: 'Birthday', style: 'screenprint' },
  { id: 'bday-party', name: 'Party Letterpress', src: '/cards/birthday/party-letterpress.jpg', occasion: 'Birthday', style: 'letterpress' },
  // Christmas
  { id: 'xmas-cabin', name: 'Cabin Gouache', src: '/cards/christmas/cabin-gouache.jpg', occasion: 'Christmas', style: 'gouache' },
  { id: 'xmas-fireplace', name: 'Fireplace', src: '/cards/christmas/fireplace-midcentury.jpg', occasion: 'Christmas', style: 'midcentury' },
  { id: 'xmas-hotchoc', name: 'Hot Chocolate', src: '/cards/christmas/hotchocolate-gouache.jpg', occasion: 'Christmas', style: 'gouache' },
  { id: 'xmas-mittens', name: 'Mittens', src: '/cards/christmas/mittens-screenprint.jpg', occasion: 'Christmas', style: 'screenprint' },
  { id: 'xmas-skating', name: 'Skating', src: '/cards/christmas/skating-risograph.jpg', occasion: 'Christmas', style: 'risograph' },
  { id: 'xmas-tree', name: 'Tree Linocut', src: '/cards/christmas/tree-linocut.jpg', occasion: 'Christmas', style: 'linocut' },
  // Thank You
  { id: 'ty-bouquet', name: 'Bouquet Gouache', src: '/cards/thank-you/bouquet-gouache.jpg', occasion: 'Thank You', style: 'gouache' },
  { id: 'ty-canoe', name: 'Canoe', src: '/cards/thank-you/canoe-screenprint.jpg', occasion: 'Thank You', style: 'screenprint' },
  { id: 'ty-bird', name: 'Bird Linocut', src: '/cards/thank-you/bird-linocut.jpg', occasion: 'Thank You', style: 'linocut' },
  { id: 'ty-garden', name: 'Garden', src: '/cards/thank-you/garden-letterpress.jpg', occasion: 'Thank You', style: 'letterpress' },
  { id: 'ty-syrup', name: 'Syrup', src: '/cards/thank-you/syrup-risograph.jpg', occasion: 'Thank You', style: 'risograph' },
  { id: 'ty-tea', name: 'Tea Midcentury', src: '/cards/thank-you/tea-midcentury.jpg', occasion: 'Thank You', style: 'midcentury' },
  // Video cards
  { id: 'vid-thonk', name: 'T-Honk You', src: '/videos/t-honk-thumb.jpg', occasion: 'Thank You', style: 'video', video: '/videos/t-honk.mp4' },
  { id: 'vid-beaver', name: 'Beaver Architect', src: '/videos/beaver-architect-thumb.jpg', occasion: 'Graduation', style: 'video', video: '/videos/beaver-architect.mp4' },
  { id: 'vid-curling', name: 'Curling Walk', src: '/videos/curling-walk-thumb.jpg', occasion: 'Retirement', style: 'video', video: '/videos/curling-walk.mp4' },
  { id: 'vid-mountie', name: 'Mountie Moose', src: '/videos/mountie-moose-thumb.jpg', occasion: 'Congratulations', style: 'video', video: '/videos/mountie-moose.mp4' },
  { id: 'vid-zamboni', name: 'Zamboni Drive-Thru', src: '/videos/zamboni-drive-thru-thumb.jpg', occasion: 'Just Because', style: 'video', video: '/videos/zamboni-drive-thru.mp4' },
  { id: 'vid-skookum', name: 'Skookum', src: '/videos/skookum-thumb.jpg', occasion: 'Encouragement', style: 'video', video: '/videos/skookum.mp4' },
  { id: 'vid-syrup', name: 'Maple Syrup IV', src: '/videos/syrup-iv-thumb.jpg', occasion: 'Get Well', style: 'video', video: '/videos/syrup-iv.mp4' },
  { id: 'vid-standoff', name: 'Apologetic Standoff', src: '/videos/apologetic-standoff-thumb.jpg', occasion: 'Apology', style: 'video', video: '/videos/apologetic-standoff.mp4' },
  { id: 'vid-bunny', name: 'Bunny Hug', src: '/videos/bunny-hug-thumb.jpg', occasion: 'Warm Wishes', style: 'video', video: '/videos/bunny-hug.mp4' },
];

const OCCASIONS = ['All', 'Birthday', 'Christmas', 'Thank You', 'Congratulations', 'Retirement', 'Get Well', 'Just Because', 'Encouragement', 'Graduation', 'Apology', 'Warm Wishes'];

const PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
];

type TabKey = 'designs' | 'starring-you';
type Step = 'pick' | 'customize';

export default function CardEditor() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('designs');
  const [step, setStep] = useState<Step>('pick');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);
  const [isPremium] = useState(true);

  const [card, setCard] = useState({
    template: '',
    message: '',
    fromName: '',
    province: 'Ontario',
    bilingual: false,
    stickers: '',
    video: undefined as string | undefined,
    faceSwapImage: undefined as string | undefined,
    backgroundImage: undefined as string | undefined,
  });

  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
  });

  const handleCardChange = (field: string, value: any) => {
    setCard((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectTemplate = (t: CardTemplate) => {
    setSelectedTemplate(t);
    setCard((prev) => ({
      ...prev,
      template: t.name,
      video: t.video,
      backgroundImage: t.video ? undefined : t.src,
      faceSwapImage: undefined,
    }));
    if (!card.message) {
      const defaults: Record<string, string> = {
        'Birthday': 'Wishing you the happiest of birthdays, eh!',
        'Christmas': 'Merry Christmas from the True North!',
        'Thank You': 'Thanks a million — you really are a beauty!',
        'Congratulations': 'Way to go! Massive congratulations!',
        'Retirement': 'Time to kick back and enjoy the good life!',
        'Get Well': 'Sending maple-syrup-strength healing vibes!',
        'Just Because': 'No reason needed — just thinking of you!',
        'Encouragement': 'You\'ve got this. Go get \'em!',
        'Graduation': 'A dam good job! Congratulations, grad!',
        'Apology': 'Sorry about the kerfuffle. Let\'s make up, eh?',
        'Warm Wishes': 'Sending a massive bunny hug your way!',
      };
      handleCardChange('message', defaults[t.occasion] || 'Thinking of you!');
    }
    setStep('customize');
  };

  const handleVideoReady = useCallback((videoUrl: string, message: string, imageUrl?: string) => {
    setCard((prev) => ({
      ...prev,
      template: 'Starring You',
      message,
      video: videoUrl,
      faceSwapImage: imageUrl,
      backgroundImage: undefined,
    }));
    setStep('customize');
  }, []);

  const handleUpgradeClick = useCallback(() => {
    alert('Premium plans coming soon! For now, all features are unlocked.');
  }, []);

  const filteredTemplates = CARD_TEMPLATES.filter(
    (t) => selectedOccasion === 'All' || t.occasion === selectedOccasion
  );

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
      const canvas = await html2canvas(previewRef.current, { backgroundColor: '#fff', scale: 2 });
      const imageData = canvas.toDataURL('image/png');

      const response = await fetch('/api/send-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...card,
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

  return (
    <div className="min-h-screen bg-cream" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
      {/* Top bar */}
      <div className="bg-white border-b border-foreground/5 px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-xl">🍁</span>
          <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', color: 'var(--red)' }}>
            MapleCard
          </span>
        </Link>
        {step === 'customize' && (
          <button
            onClick={() => { setStep('pick'); setSelectedTemplate(null); }}
            className="text-sm text-foreground/50 hover:text-foreground transition-colors cursor-pointer bg-transparent border-none"
          >
            &larr; Back to designs
          </button>
        )}
      </div>

      {/* Step 1: Pick a design */}
      {step === 'pick' && (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {([
              { key: 'designs' as TabKey, label: 'Card Designs' },
              { key: 'starring-you' as TabKey, label: 'Starring You' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: activeTab === tab.key ? 'var(--red)' : 'white',
                  color: activeTab === tab.key ? 'white' : 'var(--foreground)',
                  border: activeTab === tab.key ? '2px solid var(--red)' : '2px solid rgba(0,0,0,0.08)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'designs' && (
            <>
              <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif' }}>
                Choose a design
              </h1>
              <p className="text-foreground/50 mb-6 text-sm">Pick a card, then customize it with your message.</p>

              {/* Occasion filter */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4">
                {OCCASIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => setSelectedOccasion(o)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: selectedOccasion === o ? 'var(--foreground)' : 'white',
                      color: selectedOccasion === o ? 'white' : 'var(--foreground)',
                      border: '1.5px solid',
                      borderColor: selectedOccasion === o ? 'var(--foreground)' : 'rgba(0,0,0,0.08)',
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>

              {/* Template grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t)}
                    className="text-left group bg-transparent border-none p-0 cursor-pointer"
                  >
                    <div
                      className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
                      style={{ aspectRatio: '3/4' }}
                    >
                      <img src={t.src} alt={t.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      {t.video && (
                        <div className="absolute top-2 right-2 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center">
                          <span className="text-[10px]">▶</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-foreground/50 mt-2 font-medium truncate">{t.name}</p>
                    <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--red)' }}>{t.occasion}</p>
                  </button>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-20 text-foreground/30">
                  <p className="text-4xl mb-4">🍁</p>
                  <p className="font-medium">No cards for this occasion yet — more coming soon!</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'starring-you' && (
            <div className="max-w-lg">
              <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif' }}>
                Star in your card
              </h1>
              <p className="text-foreground/50 mb-6 text-sm">Pick a scene, upload your photo, and our AI puts you in the card.</p>
              <StarringYou
                isPremium={isPremium}
                onUpgradeClick={handleUpgradeClick}
                onVideoReady={handleVideoReady}
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Customize */}
      {step === 'customize' && (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)]">
          {/* Sidebar form */}
          <div className="w-full lg:w-[380px] bg-white border-r border-foreground/5 overflow-y-auto p-6 shrink-0">
            <h2 className="text-lg font-black mb-6" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif' }}>
              Customize your card
            </h2>

            {/* Message */}
            <div className="mb-5">
              <label className="block mb-1.5 text-xs font-bold text-foreground/70 uppercase tracking-wider">Message</label>
              <textarea
                value={card.message}
                onChange={(e) => handleCardChange('message', e.target.value)}
                className="w-full min-h-[100px] p-3 border-2 border-foreground/10 rounded-xl text-sm focus:border-maple focus:outline-none transition-colors resize-none"
                style={{ fontFamily: 'var(--font-lora), Lora, serif', boxSizing: 'border-box' }}
                placeholder="Your message here..."
              />
            </div>

            {/* From Name */}
            <div className="mb-5">
              <label className="block mb-1.5 text-xs font-bold text-foreground/70 uppercase tracking-wider">From</label>
              <input
                type="text"
                value={card.fromName}
                onChange={(e) => handleCardChange('fromName', e.target.value)}
                className="w-full p-3 border-2 border-foreground/10 rounded-xl text-sm focus:border-maple focus:outline-none transition-colors"
                style={{ boxSizing: 'border-box' }}
                placeholder="Your name"
              />
            </div>

            {/* Province */}
            <div className="mb-5">
              <label className="block mb-1.5 text-xs font-bold text-foreground/70 uppercase tracking-wider">Province</label>
              <select
                value={card.province}
                onChange={(e) => handleCardChange('province', e.target.value)}
                className="w-full p-3 border-2 border-foreground/10 rounded-xl text-sm focus:border-maple focus:outline-none transition-colors bg-white"
                style={{ boxSizing: 'border-box' }}
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Bilingual */}
            <div className="mb-6 flex items-center gap-3">
              <input
                type="checkbox"
                id="bilingual"
                checked={card.bilingual}
                onChange={(e) => handleCardChange('bilingual', e.target.checked)}
                className="w-5 h-5 cursor-pointer"
                style={{ accentColor: 'var(--red)' }}
              />
              <label htmlFor="bilingual" className="text-sm font-medium cursor-pointer">
                Bilingual (French/English)
              </label>
            </div>

            <hr className="border-foreground/5 my-6" />

            {/* Recipient */}
            <h3 className="text-sm font-bold mb-4 text-foreground/70">Send to</h3>

            <div className="mb-4">
              <label className="block mb-1.5 text-xs font-bold text-foreground/70 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => handleFormChange('recipientEmail', e.target.value)}
                className="w-full p-3 border-2 border-foreground/10 rounded-xl text-sm focus:border-maple focus:outline-none transition-colors"
                style={{ boxSizing: 'border-box' }}
                placeholder="friend@example.com"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-1.5 text-xs font-bold text-foreground/70 uppercase tracking-wider">Name (optional)</label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => handleFormChange('recipientName', e.target.value)}
                className="w-full p-3 border-2 border-foreground/10 rounded-xl text-sm focus:border-maple focus:outline-none transition-colors"
                style={{ boxSizing: 'border-box' }}
                placeholder="Their name"
              />
            </div>

            <button
              onClick={sendCard}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--red)' }}
            >
              {loading ? 'Sending...' : 'Send Card'}
            </button>
          </div>

          {/* Preview area */}
          <div className="flex-1 flex items-center justify-center p-6 md:p-12" style={{ backgroundColor: 'var(--cream-dark, #f0ebe3)' }}>
            <div style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }}>
              <CardPreview ref={previewRef} card={card} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
