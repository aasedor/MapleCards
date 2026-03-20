'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  createFaceCutout,
  renderAnimation,
  recordAnimation,
  CUTOUT_TEMPLATES,
  type FaceCutout,
  type BodyTemplate,
} from '@/lib/cutout-engine';

const RED = '#c0392b';
const CREAM = '#faf8f3';
const FONT_UI = "var(--font-dm-sans), 'DM Sans', sans-serif";

interface CutoutCardCreatorProps {
  onCardReady: (videoBlob: Blob, message: string, thumbnailUrl: string) => void;
}

export default function CutoutCardCreator({ onCardReady }: CutoutCardCreatorProps) {
  const [step, setStep] = useState<'template' | 'upload' | 'preview'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<BodyTemplate | null>(null);
  const [faceCutout, setFaceCutout] = useState<FaceCutout | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceApiRef = useRef<typeof import('face-api.js') | null>(null);
  const animRef = useRef<{ stop: () => void } | null>(null);

  // Load face-api.js models
  useEffect(() => {
    let cancelled = false;
    async function loadModels() {
      try {
        const faceapi = await import('face-api.js');
        faceApiRef.current = faceapi;
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        ]);
        if (!cancelled) setModelsLoaded(true);
      } catch {
        if (!cancelled) setModelsLoaded(true); // allow without detection
      }
    }
    loadModels();
    return () => { cancelled = true; };
  }, []);

  // Start animation when we have face + template + canvas
  useEffect(() => {
    if (step !== 'preview' || !faceCutout || !selectedTemplate || !canvasRef.current) return;

    // Stop previous animation
    animRef.current?.stop();

    const anim = renderAnimation(canvasRef.current, {
      faceCutout,
      template: selectedTemplate,
      duration: 4,
      fps: 24,
      message: selectedTemplate.defaultMessage,
    });
    animRef.current = anim;

    return () => { anim.stop(); };
  }, [step, faceCutout, selectedTemplate]);

  const handleSelectTemplate = (template: BodyTemplate) => {
    setSelectedTemplate(template);
    setStep('upload');
    setFaceCutout(null);
    setFacePreview(null);
    setError(null);
  };

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

      const faceapi = faceApiRef.current;
      if (!faceapi) throw new Error('Face detection not ready');

      // Create stylized face cutout
      const cutout = await createFaceCutout(img, faceapi);
      if (!cutout) {
        setError('No face detected. Please upload a clear, front-facing photo.');
        URL.revokeObjectURL(url);
        setProcessing(false);
        return;
      }

      setFaceCutout(cutout);
      setFacePreview(cutout.closedMouth.toDataURL('image/png'));
      URL.revokeObjectURL(url);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleRecord = useCallback(async () => {
    if (!canvasRef.current || !faceCutout || !selectedTemplate) return;
    setRecording(true);

    try {
      const blob = await recordAnimation(canvasRef.current, 6000);
      const thumbnailUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      onCardReady(blob, selectedTemplate.defaultMessage, thumbnailUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recording failed');
    } finally {
      setRecording(false);
    }
  }, [faceCutout, selectedTemplate, onCardReady]);

  return (
    <div style={{ fontFamily: FONT_UI }}>
      {/* Step 1: Choose template */}
      {step === 'template' && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
            Choose Your Animation
          </h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            Pick a funny animation template, then upload your face!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {CUTOUT_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                style={{
                  padding: '16px 12px',
                  border: '2px solid rgba(0,0,0,0.08)',
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = RED;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '100%',
                  height: '80px',
                  borderRadius: '8px',
                  backgroundColor: t.background,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '32px' }}>
                    {t.occasion === 'Birthday' ? '🎂' :
                     t.occasion === 'Congratulations' ? '🏒' :
                     t.occasion === 'Apology' ? '🙏' :
                     t.occasion === 'Thank You' ? '☕' :
                     t.occasion === 'Get Well' ? '🍁' :
                     t.occasion === 'Retirement' ? '🎖️' : '🍁'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px 0' }}>{t.name}</p>
                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: RED, margin: 0 }}>
                  {t.occasion}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Upload face */}
      {step === 'upload' && selectedTemplate && (
        <div>
          <button
            onClick={() => setStep('template')}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              fontSize: '12px',
              cursor: 'pointer',
              marginBottom: '12px',
              padding: 0,
            }}
          >
            &larr; Back to templates
          </button>

          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
            Upload Your Face
          </h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
            <strong>{selectedTemplate.name}</strong> — {selectedTemplate.occasion}
          </p>
          <p style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
            Upload a clear, front-facing photo. We&apos;ll cartoon-ify your face and animate it!
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={processing || !modelsLoaded}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: RED,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: FONT_UI,
              cursor: processing || !modelsLoaded ? 'not-allowed' : 'pointer',
              opacity: processing || !modelsLoaded ? 0.6 : 1,
            }}
          >
            {!modelsLoaded ? 'Loading face detection...' : processing ? 'Detecting & stylizing face...' : '📸 Upload Your Photo'}
          </button>

          {error && (
            <p style={{ fontSize: '12px', color: RED, marginTop: '8px' }}>{error}</p>
          )}
        </div>
      )}

      {/* Step 3: Preview & record */}
      {step === 'preview' && faceCutout && selectedTemplate && (
        <div>
          <button
            onClick={() => { setStep('upload'); animRef.current?.stop(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              fontSize: '12px',
              cursor: 'pointer',
              marginBottom: '12px',
              padding: 0,
            }}
          >
            &larr; Change photo
          </button>

          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
            {selectedTemplate.name} Preview
          </h3>

          {/* Face preview */}
          {facePreview && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <img
                src={facePreview}
                alt="Your cartoon face"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: `2px solid ${RED}`,
                }}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>Your cartoon face cutout</span>
            </div>
          )}

          {/* Animation canvas */}
          <div style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid rgba(0,0,0,0.1)',
            marginBottom: '12px',
          }}>
            <canvas
              ref={canvasRef}
              style={{ width: '100%', display: 'block' }}
            />
          </div>

          <button
            onClick={handleRecord}
            disabled={recording}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: RED,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: FONT_UI,
              cursor: recording ? 'not-allowed' : 'pointer',
              opacity: recording ? 0.6 : 1,
            }}
          >
            {recording ? 'Recording animation...' : '🎬 Use This Animation'}
          </button>

          <p style={{ fontSize: '11px', color: '#999', marginTop: '8px', textAlign: 'center' }}>
            Records a 6-second animation video for your card
          </p>

          {error && (
            <p style={{ fontSize: '12px', color: RED, marginTop: '8px' }}>{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
