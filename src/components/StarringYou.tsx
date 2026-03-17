'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

const RED = '#c0392b';
const RED_DARK = '#8b1a1a';
const CREAM = '#faf8f3';
const FONT_UI = "var(--font-dm-sans), 'DM Sans', sans-serif";
const FONT_HEADLINE = "var(--font-playfair), 'Playfair Display', serif";

interface Character {
  id: string;
  name: string;
  svg: string;
  caption: string;
  cardText: string;
  faceX: number;
  faceY: number;
  faceRadius: number;
}

const CHARACTERS: Character[] = [
  {
    id: 'hockey-hero',
    name: 'Hockey Hero',
    svg: '/starring-you/hockey-hero.svg',
    caption: 'GOAL!',
    cardText: 'Happy Birthday, {name}!',
    faceX: 200, faceY: 105, faceRadius: 45,
  },
  {
    id: 'mountie',
    name: 'The Mountie',
    svg: '/starring-you/mountie.svg',
    caption: 'THE MOUNTIES ALWAYS GET THEIR MAN',
    cardText: 'Congratulations!',
    faceX: 200, faceY: 108, faceRadius: 42,
  },
  {
    id: 'zamboni',
    name: 'Zamboni Driver',
    svg: '/starring-you/zamboni.svg',
    caption: "WORLD'S GREATEST DAD",
    cardText: "Happy Father's Day!",
    faceX: 235, faceY: 145, faceRadius: 40,
  },
  {
    id: 'moose-rider',
    name: 'Moose Rider',
    svg: '/starring-you/moose-rider.svg',
    caption: 'LIVING THEIR BEST CANADIAN LIFE',
    cardText: 'Happy Birthday!',
    faceX: 200, faceY: 95, faceRadius: 40,
  },
  {
    id: 'lumberjack',
    name: 'Lumberjack',
    svg: '/starring-you/lumberjack.svg',
    caption: 'BUILT DIFFERENT',
    cardText: 'Congratulations!',
    faceX: 185, faceY: 108, faceRadius: 42,
  },
];

interface StarringYouProps {
  onSelect: (imageDataUrl: string) => void;
  recipientName: string;
}

export default function StarringYou({ onSelect, recipientName }: StarringYouProps) {
  const [selectedChar, setSelectedChar] = useState<Character>(CHARACTERS[0]);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceApiRef = useRef<typeof import('face-api.js') | null>(null);

  // Load face-api.js models
  useEffect(() => {
    let cancelled = false;
    async function loadModels() {
      try {
        const faceapi = await import('face-api.js');
        faceApiRef.current = faceapi;
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        if (!cancelled) setModelsLoaded(true);
      } catch {
        if (!cancelled) setError('Could not load face detection models. Upload will crop centre instead.');
        if (!cancelled) setModelsLoaded(true); // allow fallback
      }
    }
    loadModels();
    return () => { cancelled = true; };
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      // Detect face or fallback to centre crop
      let cropX = img.width / 2;
      let cropY = img.height / 2;
      let cropSize = Math.min(img.width, img.height) * 0.5;

      const faceapi = faceApiRef.current;
      if (faceapi) {
        try {
          const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
          if (detection) {
            const box = detection.detection.box;
            cropX = box.x + box.width / 2;
            cropY = box.y + box.height / 2;
            cropSize = Math.max(box.width, box.height) * 1.05;
          }
        } catch {
          // fallback to centre
        }
      }

      // Crop face into circle using canvas
      const size = 200;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      // Draw circular clip
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw cropped face
      const sx = cropX - cropSize / 2;
      const sy = cropY - cropSize / 2;
      ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);

      const faceDataUrl = canvas.toDataURL('image/png');
      setFaceImage(faceDataUrl);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setProcessing(false);
    }
  }, []);

  const generateCard = useCallback(async () => {
    if (!faceImage) return;
    setProcessing(true);

    try {
      // Compose: SVG background + face overlay → canvas → data URL
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 500;
      const ctx = canvas.getContext('2d')!;

      // Draw white background
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 400, 500);

      // Load and draw SVG
      const svgImg = new Image();
      svgImg.crossOrigin = 'anonymous';
      svgImg.src = selectedChar.svg;
      await new Promise<void>((resolve) => {
        svgImg.onload = () => resolve();
        svgImg.onerror = () => resolve(); // continue even if SVG fails
      });
      ctx.drawImage(svgImg, 0, 0, 400, 500);

      // Draw face in the hole
      const faceImg = new Image();
      faceImg.src = faceImage;
      await new Promise<void>((resolve) => { faceImg.onload = () => resolve(); });

      const r = selectedChar.faceRadius;
      ctx.save();
      ctx.beginPath();
      ctx.arc(selectedChar.faceX, selectedChar.faceY, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(faceImg, selectedChar.faceX - r, selectedChar.faceY - r, r * 2, r * 2);
      ctx.restore();

      // Add caption text
      const name = recipientName || 'Friend';
      const text = selectedChar.cardText.replace('{name}', name);
      ctx.fillStyle = RED;
      ctx.font = "bold 18px 'Playfair Display', serif";
      ctx.textAlign = 'center';
      ctx.fillText(text, 200, 480);

      const dataUrl = canvas.toDataURL('image/png');
      onSelect(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate card');
    } finally {
      setProcessing(false);
    }
  }, [faceImage, selectedChar, recipientName, onSelect]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#333', fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        Starring You
      </label>

      {/* Character picker */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        {CHARACTERS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setSelectedChar(ch)}
            style={{
              padding: '8px',
              border: selectedChar.id === ch.id ? `3px solid ${RED}` : '2px solid #ddd',
              backgroundColor: selectedChar.id === ch.id ? '#fff' : CREAM,
              borderRadius: '0',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: FONT_UI,
              textAlign: 'center',
              boxShadow: selectedChar.id === ch.id ? `4px 4px 0 ${RED_DARK}` : 'none',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontFamily: FONT_HEADLINE, fontSize: '10px', color: RED, marginBottom: '2px' }}>
              {ch.caption}
            </div>
            <div>{ch.name}</div>
          </button>
        ))}
      </div>

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#fff',
          color: RED,
          border: `2px solid ${RED}`,
          borderRadius: '0',
          fontSize: '13px',
          fontWeight: 700,
          fontFamily: FONT_UI,
          cursor: processing ? 'not-allowed' : 'pointer',
          marginBottom: '10px',
          boxShadow: `4px 4px 0 ${RED_DARK}`,
        }}
      >
        {processing ? 'Processing...' : faceImage ? 'Change Photo' : 'Upload a Photo'}
      </button>

      {/* Status */}
      {!modelsLoaded && !error && (
        <p style={{ fontSize: '11px', color: '#999', margin: '0 0 8px 0' }}>Loading face detection...</p>
      )}
      {error && (
        <p style={{ fontSize: '11px', color: RED, margin: '0 0 8px 0' }}>{error}</p>
      )}

      {/* Face preview */}
      {faceImage && (
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <img
            src={faceImage}
            alt="Detected face"
            style={{ width: '80px', height: '80px', borderRadius: '50%', border: `3px solid ${RED}` }}
          />
          <p style={{ fontSize: '11px', color: '#666', margin: '4px 0 0 0' }}>Face detected</p>
        </div>
      )}

      {/* Use this card button */}
      {faceImage && (
        <button
          onClick={generateCard}
          disabled={processing}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: RED,
            color: '#fff',
            border: 'none',
            borderRadius: '0',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: FONT_UI,
            cursor: processing ? 'not-allowed' : 'pointer',
            boxShadow: `4px 4px 0 ${RED_DARK}`,
          }}
        >
          {processing ? 'Generating...' : 'Use This as My Card'}
        </button>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
