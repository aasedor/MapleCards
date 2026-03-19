'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface Scene {
  id: string;
  name: string;
  caption: string;
  occasion: string;
  insideText: string;
  thumbnail: string;
  template: string;
  duration: number;
}

interface StarringYouProps {
  isPremium: boolean;
  onUpgradeClick: () => void;
  onVideoReady: (videoUrl: string, message: string, imageUrl?: string) => void;
}

export default function StarringYou({
  isPremium,
  onUpgradeClick,
  onVideoReady,
}: StarringYouProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [faceBase64, setFaceBase64] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faceApiRef = useRef<typeof import('face-api.js') | null>(null);

  // Load scenes config
  useEffect(() => {
    fetch('/veo-templates/scenes.json')
      .then((r) => r.json())
      .then((data: Scene[]) => {
        setScenes(data);
        if (data.length > 0) setSelectedScene(data[0]);
      })
      .catch(() => setError('Failed to load scenes'));
  }, []);

  // Load face-api.js models
  useEffect(() => {
    let cancelled = false;
    async function loadModels() {
      try {
        const faceapi = await import('face-api.js');
        faceApiRef.current = faceapi;
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        if (!cancelled) setModelsLoaded(true);
      } catch {
        if (!cancelled) {
          setModelsLoaded(true); // allow without detection
        }
      }
    }
    loadModels();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setProcessing(true);
      setError(null);
      setResultVideoUrl(null);

      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.src = url;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
        });

        // Detect face
        const faceapi = faceApiRef.current;
        let cropX = img.width / 2;
        let cropY = img.height / 2;
        let cropSize = Math.min(img.width, img.height) * 0.6;

        if (faceapi) {
          const detection = await faceapi.detectSingleFace(
            img,
            new faceapi.TinyFaceDetectorOptions()
          );
          if (!detection) {
            setError('No face detected. Please upload a clear front-facing photo.');
            URL.revokeObjectURL(url);
            setProcessing(false);
            return;
          }
          const box = detection.box;
          cropX = box.x + box.width / 2;
          cropY = box.y + box.height / 2;
          cropSize = Math.max(box.width, box.height) * 1.4;
        }

        // Crop face into circle for preview
        const previewSize = 120;
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = previewSize;
        previewCanvas.height = previewSize;
        const pCtx = previewCanvas.getContext('2d')!;
        pCtx.beginPath();
        pCtx.arc(previewSize / 2, previewSize / 2, previewSize / 2, 0, Math.PI * 2);
        pCtx.closePath();
        pCtx.clip();
        const sx = cropX - cropSize / 2;
        const sy = cropY - cropSize / 2;
        pCtx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, previewSize, previewSize);
        setFacePreview(previewCanvas.toDataURL('image/png'));

        // Full image for the API (resized to max 1024px)
        const fullCanvas = document.createElement('canvas');
        const maxDim = 1024;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        fullCanvas.width = img.width * scale;
        fullCanvas.height = img.height * scale;
        const fCtx = fullCanvas.getContext('2d')!;
        fCtx.drawImage(img, 0, 0, fullCanvas.width, fullCanvas.height);
        setFaceBase64(fullCanvas.toDataURL('image/jpeg', 0.9));

        URL.revokeObjectURL(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process image');
      } finally {
        setProcessing(false);
      }
    },
    []
  );

  const startSwap = useCallback(async () => {
    if (!faceBase64 || !selectedScene) return;
    setSwapping(true);
    setError(null);
    setResultVideoUrl(null);

    try {
      const res = await fetch('/api/starring-you', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: selectedScene.id,
          userPhotoBase64: faceBase64,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResultVideoUrl(data.imageUrl);
      onVideoReady(data.videoUrl, selectedScene.insideText, data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Face swap failed');
    } finally {
      setSwapping(false);
    }
  }, [faceBase64, selectedScene, onVideoReady]);

  const resetPhoto = () => {
    setFacePreview(null);
    setFaceBase64(null);
    setResultVideoUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Premium gate
  if (!isPremium) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎭</div>
        <h3 style={{ margin: '0 0 8px', color: '#333', fontSize: '18px', fontWeight: 'bold' }}>
          Starring You
        </h3>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.5 }}>
          Upload your photo and star in your own animated greeting card! Face swap powered by AI.
        </p>
        <button
          onClick={onUpgradeClick}
          style={{
            padding: '12px 24px',
            backgroundColor: '#DC143C',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Scene Picker */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '13px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          Choose a Scene
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => {
                setSelectedScene(scene);
                setResultVideoUrl(null);
              }}
              style={{
                padding: '10px 8px',
                border:
                  selectedScene?.id === scene.id
                    ? '2px solid #DC143C'
                    : '2px solid #ddd',
                backgroundColor:
                  selectedScene?.id === scene.id ? '#fff' : '#fafafa',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎬</div>
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{scene.name}</div>
              <div
                style={{
                  fontSize: '9px',
                  color: '#DC143C',
                  marginTop: '2px',
                  fontWeight: 'bold',
                  letterSpacing: '0.3px',
                }}
              >
                {scene.caption}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Photo */}
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
          disabled={processing || !modelsLoaded || !selectedScene}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#fff',
            color: '#DC143C',
            border: '2px solid #DC143C',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor:
              processing || !modelsLoaded || !selectedScene
                ? 'not-allowed'
                : 'pointer',
            marginBottom: '12px',
          }}
        >
          {!modelsLoaded
            ? 'Loading face detection...'
            : processing
              ? 'Detecting face...'
              : '📷 Upload Your Photo'}
        </button>
      )}

      {/* Face Preview */}
      {facePreview && !resultVideoUrl && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            padding: '12px',
            border: '2px solid #eee',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
          }}
        >
          <img
            src={facePreview}
            alt="Your face"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '3px solid #DC143C',
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
                    backgroundColor: '#DC143C',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Create My Card
                </button>
                <button
                  onClick={resetPhoto}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#fff',
                    color: '#999',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  color: '#DC143C',
                  fontWeight: 'bold',
                  fontSize: '13px',
                }}
              >
                Creating your card... 🍁
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result Video */}
      {resultVideoUrl && (
        <div style={{ marginBottom: '12px' }}>
          <img
            src={resultVideoUrl}
            alt="Your face-swapped card"
            style={{
              width: '100%',
              borderRadius: '8px',
              border: '2px solid #DC143C',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              onClick={resetPhoto}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#fff',
                color: '#DC143C',
                border: '2px solid #DC143C',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize: '12px', color: '#DC143C', margin: '8px 0 0', fontWeight: 'bold' }}>
          {error}
        </p>
      )}
    </div>
  );
}
