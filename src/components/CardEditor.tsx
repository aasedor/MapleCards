'use client';

import React, { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import CardPreview from './CardPreview';
import StarringYou from './StarringYou';
import Link from 'next/link';
import { useToast } from './ToastProvider';

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
  // Mother's Day
  { id: 'md-tulips', name: 'Tulips', src: '/cards/mothers-day/tulips-gouache.jpg', occasion: "Mother's Day", style: 'gouache' },
  { id: 'md-bear', name: 'Bear Cubs', src: '/cards/mothers-day/bear-cubs-risograph.jpg', occasion: "Mother's Day", style: 'risograph' },
  { id: 'md-garden', name: 'Garden', src: '/cards/mothers-day/garden-linocut.jpg', occasion: "Mother's Day", style: 'linocut' },
  { id: 'md-tea', name: 'Tea Time', src: '/cards/mothers-day/tea-time-screenprint.jpg', occasion: "Mother's Day", style: 'screenprint' },
  { id: 'md-canoe', name: 'Canoe Sunrise', src: '/cards/mothers-day/canoe-midcentury.jpg', occasion: "Mother's Day", style: 'midcentury' },
  { id: 'md-cardinal', name: 'Cardinal', src: '/cards/mothers-day/cardinal-letterpress.jpg', occasion: "Mother's Day", style: 'letterpress' },
  // Father's Day
  { id: 'fd-fishing', name: 'Fishing', src: '/cards/fathers-day/fishing-gouache.jpg', occasion: "Father's Day", style: 'gouache' },
  { id: 'fd-campfire', name: 'Campfire', src: '/cards/fathers-day/campfire-risograph.jpg', occasion: "Father's Day", style: 'risograph' },
  { id: 'fd-workshop', name: 'Workshop', src: '/cards/fathers-day/workshop-linocut.jpg', occasion: "Father's Day", style: 'linocut' },
  { id: 'fd-hockey', name: 'Hockey', src: '/cards/fathers-day/hockey-screenprint.jpg', occasion: "Father's Day", style: 'screenprint' },
  { id: 'fd-bbq', name: 'BBQ', src: '/cards/fathers-day/bbq-midcentury.jpg', occasion: "Father's Day", style: 'midcentury' },
  { id: 'fd-paddle', name: 'Canoe Paddle', src: '/cards/fathers-day/canoe-paddle-letterpress.jpg', occasion: "Father's Day", style: 'letterpress' },
  // Valentine's
  { id: 'val-birds', name: 'Lovebirds', src: '/cards/valentines/lovebirds-gouache.jpg', occasion: "Valentine's", style: 'gouache' },
  { id: 'val-lights', name: 'Northern Lights', src: '/cards/valentines/northern-lights-risograph.jpg', occasion: "Valentine's", style: 'risograph' },
  { id: 'val-cocoa', name: 'Hot Cocoa', src: '/cards/valentines/hot-cocoa-linocut.jpg', occasion: "Valentine's", style: 'linocut' },
  { id: 'val-heart', name: 'Maple Heart', src: '/cards/valentines/maple-heart-screenprint.jpg', occasion: "Valentine's", style: 'screenprint' },
  { id: 'val-skating', name: 'Skating', src: '/cards/valentines/skating-midcentury.jpg', occasion: "Valentine's", style: 'midcentury' },
  { id: 'val-cabin', name: 'Cabin', src: '/cards/valentines/cabin-letterpress.jpg', occasion: "Valentine's", style: 'letterpress' },
  // Graduation
  { id: 'grad-cap', name: 'Cap Toss', src: '/cards/graduation/cap-toss-gouache.jpg', occasion: 'Graduation', style: 'gouache' },
  { id: 'grad-owl', name: 'Wise Owl', src: '/cards/graduation/owl-risograph.jpg', occasion: 'Graduation', style: 'risograph' },
  { id: 'grad-mtn', name: 'Summit', src: '/cards/graduation/mountains-linocut.jpg', occasion: 'Graduation', style: 'linocut' },
  { id: 'grad-lib', name: 'Library', src: '/cards/graduation/library-screenprint.jpg', occasion: 'Graduation', style: 'screenprint' },
  { id: 'grad-compass', name: 'Compass', src: '/cards/graduation/compass-midcentury.jpg', occasion: 'Graduation', style: 'midcentury' },
  { id: 'grad-canoe', name: 'New Journey', src: '/cards/graduation/canoe-journey-letterpress.jpg', occasion: 'Graduation', style: 'letterpress' },
  // Sympathy
  { id: 'sym-lake', name: 'Peaceful Lake', src: '/cards/sympathy/peaceful-lake-gouache.jpg', occasion: 'Sympathy', style: 'gouache' },
  { id: 'sym-flowers', name: 'Wildflowers', src: '/cards/sympathy/wildflowers-risograph.jpg', occasion: 'Sympathy', style: 'risograph' },
  { id: 'sym-birch', name: 'Birch Grove', src: '/cards/sympathy/birch-grove-linocut.jpg', occasion: 'Sympathy', style: 'linocut' },
  { id: 'sym-star', name: 'Starlight', src: '/cards/sympathy/starlight-screenprint.jpg', occasion: 'Sympathy', style: 'screenprint' },
  { id: 'sym-bench', name: 'Garden Bench', src: '/cards/sympathy/garden-bench-midcentury.jpg', occasion: 'Sympathy', style: 'midcentury' },
  { id: 'sym-mist', name: 'Mountain Mist', src: '/cards/sympathy/mountain-mist-letterpress.jpg', occasion: 'Sympathy', style: 'letterpress' },
  // New Baby
  { id: 'nb-moose', name: 'Stork Moose', src: '/cards/new-baby/stork-moose-gouache.jpg', occasion: 'New Baby', style: 'gouache' },
  { id: 'nb-nursery', name: 'Nursery', src: '/cards/new-baby/nursery-risograph.jpg', occasion: 'New Baby', style: 'risograph' },
  { id: 'nb-duckling', name: 'Ducklings', src: '/cards/new-baby/duckling-linocut.jpg', occasion: 'New Baby', style: 'linocut' },
  { id: 'nb-knitted', name: 'Knitted', src: '/cards/new-baby/knitted-screenprint.jpg', occasion: 'New Baby', style: 'screenprint' },
  { id: 'nb-friends', name: 'Forest Friends', src: '/cards/new-baby/forest-friends-midcentury.jpg', occasion: 'New Baby', style: 'midcentury' },
  { id: 'nb-rainbow', name: 'Rainbow', src: '/cards/new-baby/rainbow-letterpress.jpg', occasion: 'New Baby', style: 'letterpress' },
  // Anniversary
  { id: 'ann-canoe', name: 'Sunset Canoe', src: '/cards/anniversary/sunset-canoe-gouache.jpg', occasion: 'Anniversary', style: 'gouache' },
  { id: 'ann-dance', name: 'Dancing', src: '/cards/anniversary/dancing-risograph.jpg', occasion: 'Anniversary', style: 'risograph' },
  { id: 'ann-wine', name: 'Wine Toast', src: '/cards/anniversary/wine-toast-linocut.jpg', occasion: 'Anniversary', style: 'linocut' },
  { id: 'ann-lock', name: 'Love Lock', src: '/cards/anniversary/love-lock-screenprint.jpg', occasion: 'Anniversary', style: 'screenprint' },
  { id: 'ann-fire', name: 'Cabin Fire', src: '/cards/anniversary/cabin-fire-midcentury.jpg', occasion: 'Anniversary', style: 'midcentury' },
  { id: 'ann-geese', name: 'Canada Geese', src: '/cards/anniversary/geese-letterpress.jpg', occasion: 'Anniversary', style: 'letterpress' },
  // Wedding
  { id: 'wed-venue', name: 'Lakeside', src: '/cards/wedding/venue-gouache.jpg', occasion: 'Wedding', style: 'gouache' },
  { id: 'wed-rings', name: 'Rings', src: '/cards/wedding/rings-risograph.jpg', occasion: 'Wedding', style: 'risograph' },
  { id: 'wed-bouquet', name: 'Bouquet', src: '/cards/wedding/bouquet-linocut.jpg', occasion: 'Wedding', style: 'linocut' },
  { id: 'wed-toast', name: 'Toast', src: '/cards/wedding/toast-screenprint.jpg', occasion: 'Wedding', style: 'screenprint' },
  { id: 'wed-barn', name: 'Barn', src: '/cards/wedding/barn-midcentury.jpg', occasion: 'Wedding', style: 'midcentury' },
  { id: 'wed-swans', name: 'Swans', src: '/cards/wedding/swans-letterpress.jpg', occasion: 'Wedding', style: 'letterpress' },
  // Congratulations
  { id: 'con-fireworks', name: 'Fireworks', src: '/cards/congratulations/fireworks-gouache.jpg', occasion: 'Congratulations', style: 'gouache' },
  { id: 'con-trophy', name: 'Trophy', src: '/cards/congratulations/trophy-risograph.jpg', occasion: 'Congratulations', style: 'risograph' },
  { id: 'con-champagne', name: 'Champagne', src: '/cards/congratulations/champagne-linocut.jpg', occasion: 'Congratulations', style: 'linocut' },
  { id: 'con-summit', name: 'Summit', src: '/cards/congratulations/summit-screenprint.jpg', occasion: 'Congratulations', style: 'screenprint' },
  { id: 'con-ribbon', name: 'Ribbon Cutting', src: '/cards/congratulations/ribbon-midcentury.jpg', occasion: 'Congratulations', style: 'midcentury' },
  { id: 'con-aurora', name: 'Aurora', src: '/cards/congratulations/northern-lights-letterpress.jpg', occasion: 'Congratulations', style: 'letterpress' },
  // Get Well
  { id: 'gw-soup', name: 'Soup', src: '/cards/get-well/soup-gouache.jpg', occasion: 'Get Well', style: 'gouache' },
  { id: 'gw-sunshine', name: 'Sunshine', src: '/cards/get-well/sunshine-risograph.jpg', occasion: 'Get Well', style: 'risograph' },
  { id: 'gw-garden', name: 'Healing Garden', src: '/cards/get-well/healing-garden-linocut.jpg', occasion: 'Get Well', style: 'linocut' },
  { id: 'gw-teddy', name: 'Teddy Bear', src: '/cards/get-well/teddy-screenprint.jpg', occasion: 'Get Well', style: 'screenprint' },
  { id: 'gw-rainbow', name: 'Rainbow', src: '/cards/get-well/rainbow-midcentury.jpg', occasion: 'Get Well', style: 'midcentury' },
  { id: 'gw-tea', name: 'Tea & Honey', src: '/cards/get-well/tea-honey-letterpress.jpg', occasion: 'Get Well', style: 'letterpress' },
  // Retirement
  { id: 'ret-hammock', name: 'Hammock', src: '/cards/retirement/hammock-gouache.jpg', occasion: 'Retirement', style: 'gouache' },
  { id: 'ret-fishing', name: 'Fishing', src: '/cards/retirement/fishing-boat-risograph.jpg', occasion: 'Retirement', style: 'risograph' },
  { id: 'ret-garden', name: 'Garden', src: '/cards/retirement/garden-linocut.jpg', occasion: 'Retirement', style: 'linocut' },
  { id: 'ret-roadtrip', name: 'Road Trip', src: '/cards/retirement/road-trip-screenprint.jpg', occasion: 'Retirement', style: 'screenprint' },
  { id: 'ret-golf', name: 'Golf', src: '/cards/retirement/golf-midcentury.jpg', occasion: 'Retirement', style: 'midcentury' },
  { id: 'ret-cabin', name: 'Cabin Porch', src: '/cards/retirement/rocking-chair-letterpress.jpg', occasion: 'Retirement', style: 'letterpress' },
  // Thinking of You / Just Because
  { id: 'toy-letter', name: 'Letter', src: '/cards/thinking-of-you/letter-gouache.jpg', occasion: 'Just Because', style: 'gouache' },
  { id: 'toy-window', name: 'Window Seat', src: '/cards/thinking-of-you/window-risograph.jpg', occasion: 'Just Because', style: 'risograph' },
  { id: 'toy-moon', name: 'Moonlight', src: '/cards/thinking-of-you/moonlight-linocut.jpg', occasion: 'Just Because', style: 'linocut' },
  { id: 'toy-wildflower', name: 'Wildflower', src: '/cards/thinking-of-you/wildflower-screenprint.jpg', occasion: 'Just Because', style: 'screenprint' },
  { id: 'toy-bridge', name: 'Covered Bridge', src: '/cards/thinking-of-you/bridge-midcentury.jpg', occasion: 'Just Because', style: 'midcentury' },
  { id: 'toy-songbird', name: 'Songbird', src: '/cards/thinking-of-you/songbird-letterpress.jpg', occasion: 'Just Because', style: 'letterpress' },
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

const OCCASIONS = ['All', 'Birthday', 'Christmas', 'Thank You', "Mother's Day", "Father's Day", "Valentine's", 'Anniversary', 'Wedding', 'Graduation', 'New Baby', 'Sympathy', 'Congratulations', 'Retirement', 'Get Well', 'Just Because', 'Encouragement', 'Apology', 'Warm Wishes'];

const PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
];

const FONTS = [
  { id: 'lora', label: 'Lora', family: 'var(--font-lora), Lora, serif' },
  { id: 'playfair', label: 'Playfair', family: 'var(--font-playfair), Playfair Display, serif' },
  { id: 'dm-sans', label: 'DM Sans', family: 'var(--font-dm-sans), DM Sans, sans-serif' },
];

const TEXT_COLORS = [
  { id: 'auto', hex: '', label: 'Auto' },
  { id: 'white', hex: '#ffffff', label: 'White' },
  { id: 'dark', hex: '#1a1a1a', label: 'Dark' },
  { id: 'maple', hex: '#c0392b', label: 'Maple Red' },
  { id: 'forest', hex: '#2d6a4f', label: 'Forest' },
  { id: 'gold', hex: '#b8860b', label: 'Gold' },
];

type TabKey = 'designs' | 'starring-you';
type Step = 'pick' | 'customize';

const MESSAGE_POSITIONS = [
  { id: 'bottom', label: 'Bottom' },
  { id: 'center', label: 'Center' },
  { id: 'top', label: 'Top' },
];

const STICKER_OPTIONS = [
  { id: 'maple', emoji: '🍁', label: 'Maple Leaf' },
  { id: 'heart', emoji: '❤️', label: 'Heart' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'sparkle', emoji: '✨', label: 'Sparkle' },
  { id: 'gift', emoji: '🎁', label: 'Gift' },
  { id: 'balloon', emoji: '🎈', label: 'Balloon' },
  { id: 'cake', emoji: '🎂', label: 'Cake' },
  { id: 'confetti', emoji: '🎊', label: 'Confetti' },
  { id: 'flower', emoji: '🌸', label: 'Flower' },
  { id: 'snowflake', emoji: '❄️', label: 'Snowflake' },
  { id: 'moose', emoji: '🫎', label: 'Moose' },
  { id: 'beaver', emoji: '🦫', label: 'Beaver' },
];

export default function CardEditor() {
  const previewRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('designs');
  const [step, setStep] = useState<Step>('pick');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);
  const [isPremium] = useState(true);

  // AI suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [activeStickers, setActiveStickers] = useState<string[]>([]);

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
    font: 'lora',
    textColor: '',
    messagePosition: 'bottom' as 'top' | 'center' | 'bottom',
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
        "Mother's Day": 'Happy Mother\'s Day to the most amazing mum. Love you to the Rockies and back!',
        "Father's Day": 'Happy Father\'s Day, Dad! You\'re a real beaut. Thanks for everything.',
        "Valentine's": 'You\'re my favourite person in all of Canada. Happy Valentine\'s Day!',
        'Sympathy': 'Thinking of you during this difficult time. Sending love and warmth.',
        'New Baby': 'Welcome to the world, little one! Congratulations to the new parents!',
        'Anniversary': 'Here\'s to another year of love and adventure together. Happy anniversary!',
        'Wedding': 'Congratulations on your beautiful wedding! Wishing you a lifetime of joy!',
      };
      handleCardChange('message', defaults[t.occasion] || 'Thinking of you!');
    }
    setSuggestions([]);
    setShareUrl(null);
    setStep('customize');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please upload an image file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCard((prev) => ({
        ...prev,
        template: 'My Photo',
        backgroundImage: dataUrl,
        video: undefined,
        faceSwapImage: undefined,
      }));
      setSelectedTemplate({ id: 'custom-photo', name: 'My Photo', src: dataUrl, occasion: 'Just Because', style: 'photo' });
      if (!card.message) {
        handleCardChange('message', 'Thinking of you!');
      }
      setSuggestions([]);
      setShareUrl(null);
      setActiveStickers([]);
      setStep('customize');
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
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
    toast('Premium plans coming soon! For now, all features are unlocked.', 'info');
  }, [toast]);

  const filteredTemplates = CARD_TEMPLATES.filter(
    (t) => selectedOccasion === 'All' || t.occasion === selectedOccasion
  );

  const downloadCard = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, { backgroundColor: '#fff', scale: 2 });
      const link = document.createElement('a');
      link.download = `maplecard-${card.template || 'card'}.png`.replace(/\s+/g, '-').toLowerCase();
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast('Card downloaded successfully!', 'success');
    } catch (error) {
      toast(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const suggestMessages = async () => {
    const occasion = selectedTemplate?.occasion || 'General';
    setSuggestLoading(true);
    setSuggestions([]);
    try {
      const response = await fetch('/api/suggest-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion,
          recipientName: formData.recipientName || undefined,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      toast(`Could not get suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setSuggestLoading(false);
    }
  };

  const shareCard = async () => {
    if (!card.message.trim()) {
      toast('Add a message before sharing', 'error');
      return;
    }
    setSharing(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: card.template,
          message: card.message,
          fromName: card.fromName,
          province: card.province,
          bilingual: card.bilingual,
          backgroundImage: card.backgroundImage,
          video: card.video,
          font: card.font,
          textColor: card.textColor,
          stickers: card.stickers,
          messagePosition: card.messagePosition,
        }),
      });
      const data = await res.json();
      if (data.shareUrl) {
        setShareUrl(data.shareUrl);
        await navigator.clipboard.writeText(data.shareUrl);
        toast('Link copied to clipboard!', 'success');
      } else {
        toast(data.error || 'Failed to create share link', 'error');
      }
    } catch {
      toast('Failed to create share link', 'error');
    } finally {
      setSharing(false);
    }
  };

  const sendCard = async () => {
    if (!formData.recipientEmail.includes('@')) {
      toast('Please enter a valid email', 'error');
      return;
    }
    if (!card.message.trim() || !card.fromName.trim()) {
      toast('Please fill in message and from name', 'error');
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
          ...(scheduledDate ? { scheduledAt: new Date(scheduledDate).toISOString() } : {}),
        }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      toast(scheduledDate ? 'Card scheduled!' : 'Card sent successfully!', 'success');
      setScheduledDate('');
      setFormData({ recipientEmail: '', recipientName: '' });
    } catch (error) {
      toast(`Error: ${error instanceof Error ? error.message : 'Failed to send card'}`, 'error');
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
            onClick={() => { setStep('pick'); setSelectedTemplate(null); setSuggestions([]); }}
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

              {/* Hidden photo upload input */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Template grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Upload your own photo card */}
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="text-left group bg-transparent border-none p-0 cursor-pointer"
                >
                  <div
                    className="rounded-xl overflow-hidden border-2 border-dashed border-foreground/20 hover:border-maple/50 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center gap-2"
                    style={{ aspectRatio: '3/4', backgroundColor: 'rgba(192,57,43,0.03)' }}
                  >
                    <span className="text-3xl">📷</span>
                    <span className="text-xs font-bold text-foreground/50 text-center px-3">Upload Your Photo</span>
                  </div>
                  <p className="text-xs text-foreground/50 mt-2 font-medium">Custom Photo</p>
                  <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--red)' }}>ANY OCCASION</p>
                </button>
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
          <div className="w-full lg:w-[400px] bg-white border-r border-foreground/5 overflow-y-auto p-6 shrink-0">
            <h2 className="text-lg font-black mb-6" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif' }}>
              Customize your card
            </h2>

            {/* Message */}
            <div className="mb-4">
              <label className="block mb-1.5 text-xs font-bold text-foreground/70 uppercase tracking-wider">Message</label>
              <textarea
                value={card.message}
                onChange={(e) => handleCardChange('message', e.target.value)}
                className="w-full min-h-[100px] p-3 border-2 border-foreground/10 rounded-xl text-sm focus:border-maple focus:outline-none transition-colors resize-none"
                style={{ fontFamily: (FONTS.find(f => f.id === card.font) || FONTS[0]).family, boxSizing: 'border-box' }}
                placeholder="Your message here..."
              />

              {/* Suggest Messages button */}
              <button
                onClick={suggestMessages}
                disabled={suggestLoading}
                className="mt-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'rgba(192,57,43,0.08)',
                  color: 'var(--red)',
                }}
              >
                {suggestLoading ? 'Thinking...' : '✨ Suggest with AI'}
              </button>

              {/* AI Suggestion chips */}
              {suggestions.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        handleCardChange('message', s);
                        setSuggestions([]);
                      }}
                      className="text-left px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer border border-foreground/10 hover:border-maple/40 hover:bg-maple/5 bg-white"
                      style={{
                        fontFamily: 'var(--font-lora), Lora, serif',
                        fontStyle: 'italic',
                        lineHeight: '1.5',
                      }}
                    >
                      &ldquo;{s}&rdquo;
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font picker */}
            <div className="mb-4">
              <label className="block mb-1.5 text-xs font-bold text-foreground/70 uppercase tracking-wider">Font</label>
              <div className="flex gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleCardChange('font', f.id)}
                    className="flex-1 py-2 px-2 rounded-lg text-xs font-medium cursor-pointer transition-all border-2"
                    style={{
                      fontFamily: f.family,
                      borderColor: card.font === f.id ? 'var(--red)' : 'rgba(0,0,0,0.08)',
                      backgroundColor: card.font === f.id ? 'rgba(192,57,43,0.05)' : 'white',
                      color: card.font === f.id ? 'var(--red)' : 'var(--foreground)',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text color picker */}
            <div className="mb-5">
              <label className="block mb-1.5 text-xs font-bold text-foreground/70 uppercase tracking-wider">Text Color</label>
              <div className="flex gap-2 items-center">
                {TEXT_COLORS.map((c) => {
                  const hasMedia = !!card.video || !!card.backgroundImage || !!card.faceSwapImage;
                  const autoColor = hasMedia ? '#ffffff' : '#1a1a1a';
                  const effectiveColor = card.textColor || autoColor;
                  const isSelected = c.hex === '' ? !card.textColor : c.hex === card.textColor;
                  const displayHex = c.hex || autoColor;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleCardChange('textColor', c.hex)}
                      title={c.label}
                      className="w-7 h-7 rounded-full cursor-pointer transition-all border-2 shrink-0"
                      style={{
                        backgroundColor: displayHex,
                        borderColor: isSelected ? 'var(--red)' : 'rgba(0,0,0,0.15)',
                        boxShadow: isSelected ? '0 0 0 2px rgba(192,57,43,0.3)' : 'none',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Message position */}
            <div className="mb-4">
              <label className="block mb-1.5 text-xs font-bold text-foreground/70 uppercase tracking-wider">Message Position</label>
              <div className="flex gap-2">
                {MESSAGE_POSITIONS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleCardChange('messagePosition', p.id)}
                    className="flex-1 py-2 px-2 rounded-lg text-xs font-medium cursor-pointer transition-all border-2"
                    style={{
                      borderColor: card.messagePosition === p.id ? 'var(--red)' : 'rgba(0,0,0,0.08)',
                      backgroundColor: card.messagePosition === p.id ? 'rgba(192,57,43,0.05)' : 'white',
                      color: card.messagePosition === p.id ? 'var(--red)' : 'var(--foreground)',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sticker picker */}
            <div className="mb-5">
              <label className="block mb-1.5 text-xs font-bold text-foreground/70 uppercase tracking-wider">Stickers</label>
              <div className="flex flex-wrap gap-1.5">
                {STICKER_OPTIONS.map((s) => {
                  const isActive = activeStickers.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveStickers((prev) =>
                          isActive ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                        );
                        handleCardChange('stickers', (isActive
                          ? activeStickers.filter((id) => id !== s.id)
                          : [...activeStickers, s.id]
                        ).join(','));
                      }}
                      title={s.label}
                      className="w-9 h-9 rounded-lg cursor-pointer transition-all text-lg flex items-center justify-center border-2"
                      style={{
                        borderColor: isActive ? 'var(--red)' : 'rgba(0,0,0,0.08)',
                        backgroundColor: isActive ? 'rgba(192,57,43,0.08)' : 'white',
                      }}
                    >
                      {s.emoji}
                    </button>
                  );
                })}
              </div>
              {activeStickers.length > 0 && (
                <button
                  onClick={() => { setActiveStickers([]); handleCardChange('stickers', ''); }}
                  className="mt-1 text-xs text-foreground/40 hover:text-foreground/60 bg-transparent border-none cursor-pointer"
                >
                  Clear stickers
                </button>
              )}
            </div>

            {/* From Name */}
            <div className="mb-4">
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

            {/* Schedule send */}
            <div className="mb-5">
              <label className="block mb-1.5 text-xs font-bold text-foreground/70 uppercase tracking-wider">Schedule (optional)</label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full p-3 border-2 border-foreground/10 rounded-xl text-sm focus:border-maple focus:outline-none transition-colors bg-white"
                style={{ boxSizing: 'border-box' }}
              />
              {scheduledDate && (
                <button
                  onClick={() => setScheduledDate('')}
                  className="mt-1 text-xs text-foreground/40 hover:text-foreground/60 bg-transparent border-none cursor-pointer"
                >
                  Clear — send immediately instead
                </button>
              )}
            </div>

            {/* Action buttons */}
            <button
              onClick={sendCard}
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              style={{ backgroundColor: 'var(--red)' }}
            >
              {loading ? (scheduledDate ? 'Scheduling...' : 'Sending...') : (scheduledDate ? 'Schedule Card' : 'Send Card')}
            </button>

            <div className="flex gap-2">
              <button
                onClick={shareCard}
                disabled={sharing}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border-2 border-foreground/10 bg-white hover:border-maple/30"
                style={{ color: 'var(--foreground)' }}
              >
                {sharing ? 'Creating...' : shareUrl ? 'Link Copied!' : 'Share Link'}
              </button>
              <button
                onClick={downloadCard}
                disabled={downloading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border-2 border-foreground/10 bg-white hover:border-maple/30"
                style={{ color: 'var(--foreground)' }}
              >
                {downloading ? '...' : 'Download'}
              </button>
            </div>

            {shareUrl && (
              <div className="mt-2 p-2.5 bg-cream rounded-lg">
                <p className="text-[11px] text-foreground/50 mb-1 font-bold uppercase tracking-wider">Shareable link</p>
                <p className="text-xs text-maple font-medium break-all">{shareUrl}</p>
              </div>
            )}
          </div>

          {/* Preview area */}
          <div className="flex-1 flex items-center justify-center p-6 md:p-12" style={{ backgroundColor: 'var(--cream-dark, #f0ebe3)' }}>
            <div style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }}>
              <CardPreview ref={previewRef} card={{ ...card, textColor: card.textColor || (!!card.video || !!card.backgroundImage || !!card.faceSwapImage ? '#ffffff' : '#1a1a1a') }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
