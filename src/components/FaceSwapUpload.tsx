'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

const RED = '#c0392b';
const RED_DARK = '#8b1a1a';
const CREAM = '#faf8f3';
const FONT_UI = "var(--font-dm-sans), 'DM Sans', sans-serif";

interface FaceSwapUploadProps {
  videoId: string;
  onSwapComplete: (swappedVideoUrl: string) => void;
}

export default function FaceSwapUpload({ videoId, onSwapComplete }: FaceSwapUploadProps) {
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faceApiRef = useRef<typeof import('face-api.js') | null>(null);

  // Load face-api.js models for face validation
  useEffect(() => {
    let cancelled = false;
    async function loadModels() {
      try {
        const faceapi = await import('face-api.js');
        faceApiRef.current = faceapi;
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        if (!cancelled) setModelsLoaded(true);
      } catch {
        if (!cancelled) setModelsLoaded(true); // allow without detection
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

      // Validate face exists
      const faceapi = faceApiRef.current;
      if (faceapi) {
        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions());
        if (!detection) {
          setError('No face detected. Please upload a clear photo of your face.');
          URL.revokeObjectURL(url);
          setProcessing(false);
          return;
        }
      }

      // Create a reasonably sized face image for the API
      const canvas = document.createElement('canvas');
      const maxSize = 512;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setFacePreview(dataUrl);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setProcessing(false);
    }
  }, []);

  const startSwap = useCallback(async () => {
    if (!facePreview) return;
    setSwapping(true);
    setError(null);
    setProgress('Sending to face swap service...');

    try {
      const response = await fetch('/api/face-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: facePreview,
          videoId,
        }),
      });

      setProgress('Processing video (this may take 30-60 seconds)...');

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      onSwapComplete(result.videoUrl);
      setProgress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Face swap failed');
      setProgress('');
    } finally {
      setSwapping(false);
    }
  }, [facePreview, videoId, onSwapComplete]);

  return (
    <div style={{
      marginTop: '12px',
      padding: '16px',
      border: `2px solid ${RED}`,
      backgroundColor: CREAM,
    }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontWeight: 700,
        color: RED,
        fontSize: '12px',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        fontFamily: FONT_UI,
      }}>
        Swap Your Face Into This Video
      </label>

      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0', lineHeight: 1.4 }}>
        Upload a clear photo of your face and we&apos;ll swap it onto the person in the video.
      </p>

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {!facePreview && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={processing || !modelsLoaded}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#fff',
            color: RED,
            border: `2px solid ${RED}`,
            borderRadius: '0',
            fontSize: '12px',
            fontWeight: 700,
            fontFamily: FONT_UI,
            cursor: processing || !modelsLoaded ? 'not-allowed' : 'pointer',
            boxShadow: `3px 3px 0 ${RED_DARK}`,
          }}
        >
          {!modelsLoaded ? 'Loading...' : processing ? 'Detecting face...' : 'Upload Your Photo'}
        </button>
      )}

      {/* Face preview + swap button */}
      {facePreview && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={facePreview}
            alt="Your face"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'cover',
              border: `2px solid ${RED}`,
            }}
          />
          <div style={{ flex: 1 }}>
            {!swapping ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={startSwap}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: RED,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: FONT_UI,
                    cursor: 'pointer',
                    boxShadow: `3px 3px 0 ${RED_DARK}`,
                  }}
                >
                  Swap My Face
                </button>
                <button
                  onClick={() => {
                    setFacePreview(null);
                    setError(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#fff',
                    color: '#999',
                    border: '2px solid #ddd',
                    borderRadius: '0',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: FONT_UI,
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: RED, fontWeight: 700, fontFamily: FONT_UI }}>
                {progress}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize: '11px', color: RED, margin: '8px 0 0 0', fontFamily: FONT_UI }}>
          {error}
        </p>
      )}
    </div>
  );
}
