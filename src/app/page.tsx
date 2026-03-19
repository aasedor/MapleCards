'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const OCCASION_CARDS = [
  { occasion: 'Birthday', cards: [
    { src: '/cards/birthday/cake-risograph.jpg', name: 'Cake Risograph' },
    { src: '/cards/birthday/bear-gouache.jpg', name: 'Bear Gouache' },
    { src: '/cards/birthday/moose-linocut.jpg', name: 'Moose Linocut' },
    { src: '/cards/birthday/balloons-midcentury.jpg', name: 'Balloons' },
    { src: '/cards/birthday/loon-screenprint.jpg', name: 'Loon Screenprint' },
    { src: '/cards/birthday/party-letterpress.jpg', name: 'Party Letterpress' },
  ]},
  { occasion: 'Christmas', cards: [
    { src: '/cards/christmas/cabin-gouache.jpg', name: 'Cabin Gouache' },
    { src: '/cards/christmas/fireplace-midcentury.jpg', name: 'Fireplace' },
    { src: '/cards/christmas/hotchocolate-gouache.jpg', name: 'Hot Chocolate' },
    { src: '/cards/christmas/mittens-screenprint.jpg', name: 'Mittens' },
    { src: '/cards/christmas/skating-risograph.jpg', name: 'Skating' },
    { src: '/cards/christmas/tree-linocut.jpg', name: 'Tree Linocut' },
  ]},
  { occasion: 'Thank You', cards: [
    { src: '/cards/thank-you/bouquet-gouache.jpg', name: 'Bouquet Gouache' },
    { src: '/cards/thank-you/canoe-screenprint.jpg', name: 'Canoe' },
    { src: '/cards/thank-you/bird-linocut.jpg', name: 'Bird Linocut' },
    { src: '/cards/thank-you/garden-letterpress.jpg', name: 'Garden' },
    { src: '/cards/thank-you/syrup-risograph.jpg', name: 'Syrup' },
    { src: '/cards/thank-you/tea-midcentury.jpg', name: 'Tea Midcentury' },
  ]},
];

const VIDEO_CARDS = [
  { src: '/videos/t-honk-thumb.jpg', name: 'T-Honk You Goose', video: '/videos/t-honk.mp4' },
  { src: '/videos/beaver-architect-thumb.jpg', name: 'Beaver Architect', video: '/videos/beaver-architect.mp4' },
  { src: '/videos/curling-walk-thumb.jpg', name: 'Curling Stone Walk', video: '/videos/curling-walk.mp4' },
  { src: '/videos/mountie-moose-thumb.jpg', name: 'Mountie Moose', video: '/videos/mountie-moose.mp4' },
  { src: '/videos/zamboni-drive-thru-thumb.jpg', name: 'Zamboni Drive-Thru', video: '/videos/zamboni-drive-thru.mp4' },
  { src: '/videos/skookum-thumb.jpg', name: 'Skookum Thumbs-Up', video: '/videos/skookum.mp4' },
];

const FEATURES = [
  { icon: '🎨', title: 'Handcrafted Designs', desc: 'Risograph, gouache, linocut & letterpress styles inspired by Canadian art' },
  { icon: '🎬', title: 'AI Video Cards', desc: 'Animated greeting cards powered by AI — watch your card come alive' },
  { icon: '🎭', title: 'Starring You', desc: 'Upload a selfie and star in your own animated card with AI face swap' },
  { icon: '🇨🇦', title: 'Truly Canadian', desc: 'Province-specific greetings, bilingual EN/FR, and pure Canadiana humour' },
  { icon: '📧', title: 'Instant Delivery', desc: 'Send beautiful cards by email in seconds — no stamps required' },
  { icon: '🍁', title: 'Every Occasion', desc: 'Birthday, thank you, Christmas, get well, retirement, and more' },
];

function VideoCardPreview({ src, video, name }: { src: string; video: string; name: string }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (hovered && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [hovered]);

  return (
    <div
      className="relative rounded-lg overflow-hidden cursor-pointer group"
      style={{ aspectRatio: '9/16' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <video
        ref={videoRef}
        src={video}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: hovered ? 1 : 0 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white text-sm font-bold drop-shadow-lg">{name}</p>
      </div>
      <div
        className="absolute top-3 right-3 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center transition-transform duration-300"
        style={{ transform: hovered ? 'scale(1.1)' : 'scale(1)' }}
      >
        <span className="text-sm">{hovered ? '⏸' : '▶'}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeOccasion, setActiveOccasion] = useState(0);

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-maple/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍁</span>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', color: 'var(--red)' }}>
              MapleCard
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#cards" className="text-sm font-medium text-foreground/70 hover:text-maple transition-colors">Cards</a>
            <a href="#video-cards" className="text-sm font-medium text-foreground/70 hover:text-maple transition-colors">Video Cards</a>
            <a href="#features" className="text-sm font-medium text-foreground/70 hover:text-maple transition-colors">Features</a>
          </div>
          <Link
            href="/create"
            className="bg-maple text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-maple-dark transition-colors"
          >
            Create a Card
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Floating maple leaves background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="absolute text-6xl" style={{
              top: `${15 + i * 15}%`,
              left: `${10 + i * 16}%`,
              transform: `rotate(${i * 45}deg)`,
            }}>🍁</span>
          ))}
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <div className="inline-block mb-6 px-4 py-1.5 bg-maple/10 rounded-full">
            <span className="text-sm font-medium text-maple">Now with AI video cards & face swap</span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif' }}
          >
            Send a card<br />
            <span className="text-maple">worth keeping.</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontFamily: 'var(--font-lora), Lora, serif' }}>
            Beautiful Canadian greeting cards — handcrafted designs, AI video animations,
            and face swap magic. Bilingual, province-specific, and delivered by email in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/create"
              className="bg-maple text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-maple-dark transition-all hover:shadow-lg hover:shadow-maple/20 hover:-translate-y-0.5"
            >
              Create Your Card
            </Link>
            <a
              href="#cards"
              className="bg-white text-foreground px-8 py-4 rounded-full text-lg font-bold border-2 border-foreground/10 hover:border-maple/30 transition-all hover:-translate-y-0.5"
            >
              Browse Designs
            </a>
          </div>

          {/* Hero card showcase — 5 tilted cards */}
          <div className="flex justify-center items-end gap-3 md:gap-5 max-w-3xl mx-auto">
            {[
              { src: '/cards/birthday/cake-risograph.jpg', rotate: -8, y: 20 },
              { src: '/cards/christmas/cabin-gouache.jpg', rotate: -3, y: 5 },
              { src: '/cards/thank-you/bouquet-gouache.jpg', rotate: 0, y: 0 },
              { src: '/cards/birthday/moose-linocut.jpg', rotate: 4, y: 8 },
              { src: '/cards/christmas/mittens-screenprint.jpg', rotate: 9, y: 24 },
            ].map((card, i) => (
              <div
                key={i}
                className="w-28 md:w-40 rounded-lg overflow-hidden shadow-xl transition-transform duration-300 hover:-translate-y-3 hover:shadow-2xl"
                style={{
                  transform: `rotate(${card.rotate}deg) translateY(${card.y}px)`,
                  aspectRatio: '3/4',
                }}
              >
                <img src={card.src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Card Gallery Section */}
      <section id="cards" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif' }}>
              Cards for every occasion
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Handcrafted in risograph, gouache, linocut, and letterpress styles — each one inspired by Canadian art and culture.
            </p>
          </div>

          {/* Occasion tabs */}
          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            {OCCASION_CARDS.map((group, idx) => (
              <button
                key={group.occasion}
                onClick={() => setActiveOccasion(idx)}
                className="px-5 py-2.5 rounded-full text-sm font-bold transition-all"
                style={{
                  backgroundColor: activeOccasion === idx ? 'var(--red)' : 'transparent',
                  color: activeOccasion === idx ? 'white' : 'var(--foreground)',
                  border: activeOccasion === idx ? '2px solid var(--red)' : '2px solid rgba(0,0,0,0.1)',
                }}
              >
                {group.occasion}
              </button>
            ))}
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {OCCASION_CARDS[activeOccasion].cards.map((card, idx) => (
              <Link href="/create" key={idx}>
                <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group" style={{ aspectRatio: '3/4' }}>
                  <img
                    src={card.src}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-xs text-center text-foreground/50 mt-2 font-medium">{card.name}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/create"
              className="inline-block text-maple font-bold text-sm hover:underline"
            >
              See all designs &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Video Cards Section */}
      <section id="video-cards" className="py-20 px-6 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-3 py-1 bg-maple/10 rounded-full">
              <span className="text-xs font-bold text-maple uppercase tracking-wider">New</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif' }}>
              AI Video Cards
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Animated greeting cards brought to life with AI. Hover to preview — each one tells a uniquely Canadian story.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {VIDEO_CARDS.map((card, idx) => (
              <Link href="/create" key={idx}>
                <VideoCardPreview src={card.src} video={card.video} name={card.name} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Starring You Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-cream rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="inline-block mb-4 px-3 py-1 bg-maple/10 rounded-full">
                <span className="text-xs font-bold text-maple uppercase tracking-wider">Premium</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif' }}>
                Star in your<br />own card
              </h2>
              <p className="text-foreground/60 mb-6 leading-relaxed">
                Upload a selfie and our AI face swap puts you (or anyone) right into the animated card.
                It&apos;s like JibJab, but Canadian.
              </p>
              <Link
                href="/create"
                className="inline-block bg-maple text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-maple-dark transition-colors"
              >
                Try Starring You
              </Link>
            </div>
            <div className="flex gap-3">
              {['hockey-hero', 'mountie', 'zamboni'].map((char) => (
                <div key={char} className="w-24 h-32 bg-white rounded-xl shadow-md overflow-hidden flex items-center justify-center">
                  <img src={`/starring-you/${char}.svg`} alt={char} className="w-20 h-28 object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif' }}>
              Why MapleCard?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-foreground/60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif' }}>
            Ready to send<br />something special?
          </h2>
          <p className="text-foreground/60 mb-8 text-lg">
            Create a beautiful, uniquely Canadian greeting card in under a minute.
          </p>
          <Link
            href="/create"
            className="inline-block bg-maple text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-maple-dark transition-all hover:shadow-lg hover:shadow-maple/20 hover:-translate-y-0.5"
          >
            Create Your Card — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-foreground/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍁</span>
            <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', color: 'var(--red)' }}>
              MapleCard
            </span>
          </div>
          <p className="text-xs text-foreground/40">
            Made with love in Canada. Cards generated with AI, delivered with heart.
          </p>
        </div>
      </footer>
    </div>
  );
}
