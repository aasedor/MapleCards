/**
 * Cutout Animation Engine
 * JibJab-style face cutout + cartoon body animation.
 *
 * Pipeline:
 *   1. Detect face landmarks with face-api.js
 *   2. Crop & stylize face (posterize, cartoon eyes/mouth)
 *   3. Create open/closed mouth variants
 *   4. Composite stylized head onto animated body template
 *   5. Animate with mouth flap driven by audio amplitude
 *   6. Record as video via MediaRecorder
 */

// ─── FACE STYLIZER ──────────────────────────────────────────────────────────

export interface FaceCutout {
  /** Stylized face with mouth closed */
  closedMouth: HTMLCanvasElement;
  /** Stylized face with mouth open */
  openMouth: HTMLCanvasElement;
  /** Face width for scaling */
  width: number;
  /** Face height for scaling */
  height: number;
}

/**
 * Posterize an image: reduce colors to N levels per channel
 * for a flat, crude, comedic look.
 */
function posterize(ctx: CanvasRenderingContext2D, levels: number = 5) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  const step = 255 / (levels - 1);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);     // R
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step); // G
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step); // B
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Boost saturation and contrast for cartoon effect
 */
function cartoonFilter(ctx: CanvasRenderingContext2D) {
  // Use CSS filters via a temp canvas
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // Increase contrast and saturation
  ctx.filter = 'contrast(1.4) saturate(1.5) brightness(1.05)';
  ctx.drawImage(ctx.canvas, 0, 0, w, h);
  ctx.filter = 'none';
}

/**
 * Draw cartoon-style outline around the face
 */
function drawOutline(
  ctx: CanvasRenderingContext2D,
  jawPoints: { x: number; y: number }[],
  color: string = '#1a1a1a',
  lineWidth: number = 3,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (jawPoints.length > 0) {
    ctx.moveTo(jawPoints[0].x, jawPoints[0].y);
    for (let i = 1; i < jawPoints.length; i++) {
      ctx.lineTo(jawPoints[i].x, jawPoints[i].y);
    }
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw simple cartoon eyes
 */
function drawCartoonEyes(
  ctx: CanvasRenderingContext2D,
  leftEye: { x: number; y: number },
  rightEye: { x: number; y: number },
  eyeScale: number,
) {
  for (const eye of [leftEye, rightEye]) {
    // White of eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(eye.x, eye.y, 12 * eyeScale, 10 * eyeScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2 * eyeScale;
    ctx.stroke();

    // Pupil
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(eye.x + 1 * eyeScale, eye.y + 1 * eyeScale, 5 * eyeScale, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eye.x - 1 * eyeScale, eye.y - 2 * eyeScale, 2 * eyeScale, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw simple mouth - closed state
 */
function drawMouthClosed(
  ctx: CanvasRenderingContext2D,
  mouthCenter: { x: number; y: number },
  mouthWidth: number,
) {
  ctx.save();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // Simple curved smile line
  ctx.moveTo(mouthCenter.x - mouthWidth / 2, mouthCenter.y);
  ctx.quadraticCurveTo(mouthCenter.x, mouthCenter.y + mouthWidth * 0.25, mouthCenter.x + mouthWidth / 2, mouthCenter.y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw simple mouth - open state
 */
function drawMouthOpen(
  ctx: CanvasRenderingContext2D,
  mouthCenter: { x: number; y: number },
  mouthWidth: number,
) {
  ctx.save();
  // Open mouth oval
  ctx.fillStyle = '#2a1a1a';
  ctx.beginPath();
  ctx.ellipse(mouthCenter.x, mouthCenter.y, mouthWidth / 2, mouthWidth * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Tongue hint
  ctx.fillStyle = '#cc5555';
  ctx.beginPath();
  ctx.ellipse(mouthCenter.x, mouthCenter.y + mouthWidth * 0.15, mouthWidth * 0.25, mouthWidth * 0.12, 0, 0, Math.PI);
  ctx.fill();
  ctx.restore();
}

/**
 * Create a face cutout from a photo using face-api.js landmarks.
 * Returns two canvases: one with mouth closed, one open.
 */
export async function createFaceCutout(
  img: HTMLImageElement,
  faceapi: typeof import('face-api.js'),
): Promise<FaceCutout | null> {
  // Detect face with landmarks
  const detection = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  if (!detection) return null;

  const { landmarks, detection: det } = detection;
  const box = det.box;

  // Expand the crop area around the face
  const padding = 0.35;
  const cropX = Math.max(0, box.x - box.width * padding);
  const cropY = Math.max(0, box.y - box.height * padding * 0.8);
  const cropW = Math.min(img.width - cropX, box.width * (1 + padding * 2));
  const cropH = Math.min(img.height - cropY, box.height * (1 + padding * 2));

  const outW = 300;
  const outH = Math.round((cropH / cropW) * outW);
  const scale = outW / cropW;

  // Get landmark positions scaled to output
  const jawline = landmarks.getJawOutline().map(p => ({
    x: (p.x - cropX) * scale,
    y: (p.y - cropY) * scale,
  }));
  const leftEyeCenter = average(landmarks.getLeftEye().map(p => ({
    x: (p.x - cropX) * scale,
    y: (p.y - cropY) * scale,
  })));
  const rightEyeCenter = average(landmarks.getRightEye().map(p => ({
    x: (p.x - cropX) * scale,
    y: (p.y - cropY) * scale,
  })));
  const mouthPts = landmarks.getMouth().map(p => ({
    x: (p.x - cropX) * scale,
    y: (p.y - cropY) * scale,
  }));
  const mouthCenter = average(mouthPts);

  const eyeDistance = Math.hypot(rightEyeCenter.x - leftEyeCenter.x, rightEyeCenter.y - leftEyeCenter.y);
  const eyeScale = eyeDistance / 80;
  const mouthWidth = eyeDistance * 0.55;

  // Helper: create one variant
  function createVariant(mouthState: 'open' | 'closed'): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d')!;

    // Draw cropped face
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

    // Posterize for flat cartoon look
    posterize(ctx, 6);

    // Create oval mask for the face shape
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    const cx = outW / 2;
    const cy = outH * 0.48;
    ctx.ellipse(cx, cy, outW * 0.44, outH * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw face outline
    ctx.save();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, outW * 0.44, outH * 0.46, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Cover the original mouth area with skin-toned patch
    const skinColor = getSkinColor(ctx, mouthCenter);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(mouthCenter.x, mouthCenter.y, mouthWidth * 0.7, mouthWidth * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw cartoon eyes over the original eyes
    const eyeBgColor = skinColor;
    for (const eye of [leftEyeCenter, rightEyeCenter]) {
      ctx.fillStyle = eyeBgColor;
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y, 16 * eyeScale, 14 * eyeScale, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    drawCartoonEyes(ctx, leftEyeCenter, rightEyeCenter, eyeScale);

    // Draw mouth
    if (mouthState === 'closed') {
      drawMouthClosed(ctx, mouthCenter, mouthWidth);
    } else {
      drawMouthOpen(ctx, mouthCenter, mouthWidth);
    }

    return canvas;
  }

  return {
    closedMouth: createVariant('closed'),
    openMouth: createVariant('open'),
    width: outW,
    height: outH,
  };
}

function average(points: { x: number; y: number }[]): { x: number; y: number } {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function getSkinColor(ctx: CanvasRenderingContext2D, point: { x: number; y: number }): string {
  // Sample a few pixels around the point to get average skin color
  const samples: number[][] = [];
  for (let dx = -5; dx <= 5; dx += 5) {
    for (let dy = -10; dy <= -5; dy += 5) {
      const px = Math.round(point.x + dx);
      const py = Math.round(point.y + dy);
      if (px >= 0 && px < ctx.canvas.width && py >= 0 && py < ctx.canvas.height) {
        const d = ctx.getImageData(px, py, 1, 1).data;
        samples.push([d[0], d[1], d[2]]);
      }
    }
  }
  if (samples.length === 0) return '#ddb896';
  const avg = samples.reduce((a, s) => [a[0] + s[0], a[1] + s[1], a[2] + s[2]], [0, 0, 0])
    .map(v => Math.round(v / samples.length));
  return `rgb(${avg[0]},${avg[1]},${avg[2]})`;
}

// ─── BODY TEMPLATES ──────────────────────────────────────────────────────────

export interface BodyTemplate {
  id: string;
  name: string;
  occasion: string;
  /** Background color or gradient */
  background: string;
  /** Width/height of the animation canvas */
  width: number;
  height: number;
  /** Body image (pre-drawn or SVG path) */
  bodyImage?: string;
  /** Where to place the head (center x, center y, scale) */
  headPosition: { x: number; y: number; scale: number };
  /** Animation keyframes: body movement over time */
  bodyAnimation: BodyKeyframe[];
  /** Default message text */
  defaultMessage: string;
  /** Optional audio script for TTS */
  ttsScript?: string;
}

export interface BodyKeyframe {
  time: number; // 0-1 normalized
  headX: number;
  headY: number;
  headRotation: number; // degrees
  bodyX: number;
  bodyY: number;
  bodyRotation: number;
}

// ─── ANIMATION RENDERER ──────────────────────────────────────────────────────

export interface AnimationOptions {
  faceCutout: FaceCutout;
  template: BodyTemplate;
  /** Duration in seconds */
  duration: number;
  /** Frames per second */
  fps: number;
  /** Optional audio buffer for mouth sync */
  audioBuffer?: AudioBuffer;
  /** Message text overlay */
  message?: string;
  /** Sender name */
  fromName?: string;
}

/**
 * Render a complete cutout animation to a canvas element.
 * Returns a function to stop the animation.
 */
export function renderAnimation(
  canvas: HTMLCanvasElement,
  options: AnimationOptions,
): { stop: () => void; getAudioRms: () => number } {
  const { faceCutout, template, duration, fps } = options;
  const ctx = canvas.getContext('2d')!;
  canvas.width = template.width;
  canvas.height = template.height;

  let animFrame: number | null = null;
  let startTime = 0;
  let currentRms = 0;

  // Pre-compute audio RMS values if audio provided
  let rmsData: Float32Array | null = null;
  if (options.audioBuffer) {
    rmsData = computeRmsTimeline(options.audioBuffer, fps, duration);
  }

  function interpolateKeyframes(t: number): BodyKeyframe {
    const kf = template.bodyAnimation;
    if (kf.length === 0) return { time: t, headX: 0, headY: 0, headRotation: 0, bodyX: 0, bodyY: 0, bodyRotation: 0 };
    if (kf.length === 1) return kf[0];

    // Find the two keyframes to interpolate between
    let i = 0;
    while (i < kf.length - 1 && kf[i + 1].time <= t) i++;
    if (i >= kf.length - 1) return kf[kf.length - 1];

    const a = kf[i];
    const b = kf[i + 1];
    const range = b.time - a.time;
    const f = range === 0 ? 0 : (t - a.time) / range;
    // Ease in-out
    const ease = f * f * (3 - 2 * f);

    return {
      time: t,
      headX: a.headX + (b.headX - a.headX) * ease,
      headY: a.headY + (b.headY - a.headY) * ease,
      headRotation: a.headRotation + (b.headRotation - a.headRotation) * ease,
      bodyX: a.bodyX + (b.bodyX - a.bodyX) * ease,
      bodyY: a.bodyY + (b.bodyY - a.bodyY) * ease,
      bodyRotation: a.bodyRotation + (b.bodyRotation - a.bodyRotation) * ease,
    };
  }

  function drawFrame(elapsed: number) {
    const t = (elapsed % duration) / duration; // Loop

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = template.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get interpolated keyframe
    const kf = interpolateKeyframes(t);

    // Determine mouth state from audio RMS
    const frameIdx = Math.floor(t * fps * duration);
    const rms = rmsData ? rmsData[Math.min(frameIdx, rmsData.length - 1)] : 0;
    currentRms = rms;
    const mouthOpen = rms > 0.15; // threshold for mouth open

    // Draw body (simple colored rectangle/shape as placeholder)
    ctx.save();
    const bodyCx = canvas.width / 2 + kf.bodyX;
    const bodyCy = canvas.height * 0.65 + kf.bodyY;
    ctx.translate(bodyCx, bodyCy);
    ctx.rotate((kf.bodyRotation * Math.PI) / 180);

    // Simple body shape
    ctx.fillStyle = '#c0392b'; // Red flannel body
    ctx.beginPath();
    // Torso
    ctx.roundRect(-60, -20, 120, 140, 12);
    ctx.fill();
    // Arms
    ctx.fillStyle = '#a93226';
    ctx.beginPath();
    ctx.roundRect(-80, 0, 30, 80, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(50, 0, 30, 80, 8);
    ctx.fill();

    ctx.restore();

    // Draw head
    ctx.save();
    const headCx = canvas.width / 2 + kf.headX + template.headPosition.x;
    const headCy = canvas.height * 0.3 + kf.headY + template.headPosition.y;
    ctx.translate(headCx, headCy);
    ctx.rotate((kf.headRotation * Math.PI) / 180);
    const s = template.headPosition.scale;

    const face = mouthOpen ? faceCutout.openMouth : faceCutout.closedMouth;
    ctx.drawImage(face, -faceCutout.width * s / 2, -faceCutout.height * s / 2, faceCutout.width * s, faceCutout.height * s);
    ctx.restore();

    // Draw message text at bottom
    if (options.message) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 16px Lora, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Word wrap
      const words = options.message.split(' ');
      let line = '';
      let y = canvas.height - 55;
      for (const word of words) {
        const test = line + (line ? ' ' : '') + word;
        if (ctx.measureText(test).width > canvas.width - 40) {
          ctx.fillText(line, canvas.width / 2, y);
          line = word;
          y += 22;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, canvas.width / 2, y);

      // From name
      if (options.fromName) {
        ctx.font = 'bold 12px DM Sans, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(`— ${options.fromName}`, canvas.width / 2, canvas.height - 12);
      }
      ctx.restore();
    }
  }

  function loop(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) / 1000;
    drawFrame(elapsed);
    animFrame = requestAnimationFrame(loop);
  }

  animFrame = requestAnimationFrame(loop);

  return {
    stop: () => {
      if (animFrame !== null) cancelAnimationFrame(animFrame);
    },
    getAudioRms: () => currentRms,
  };
}

/**
 * Compute RMS values for each frame of audio
 */
function computeRmsTimeline(buffer: AudioBuffer, fps: number, duration: number): Float32Array {
  const totalFrames = Math.ceil(fps * duration);
  const rms = new Float32Array(totalFrames);
  const channel = buffer.getChannelData(0);
  const samplesPerFrame = Math.floor(buffer.sampleRate / fps);

  for (let f = 0; f < totalFrames; f++) {
    const start = f * samplesPerFrame;
    const end = Math.min(start + samplesPerFrame, channel.length);
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += channel[i] * channel[i];
    }
    rms[f] = Math.sqrt(sum / (end - start || 1));
  }

  return rms;
}

// ─── VIDEO RECORDER ──────────────────────────────────────────────────────────

/**
 * Record a canvas animation as a video blob.
 */
export async function recordAnimation(
  canvas: HTMLCanvasElement,
  durationMs: number,
  audioElement?: HTMLAudioElement,
): Promise<Blob> {
  const stream = canvas.captureStream(24);

  // Mix in audio if available
  if (audioElement) {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audioElement);
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    source.connect(audioCtx.destination);
    for (const track of dest.stream.getAudioTracks()) {
      stream.addTrack(track);
    }
  }

  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2_500_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'video/webm' }));
    };
    recorder.start();
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play();
    }
    setTimeout(() => recorder.stop(), durationMs);
  });
}

// ─── PREDEFINED TEMPLATES ────────────────────────────────────────────────────

export const CUTOUT_TEMPLATES: BodyTemplate[] = [
  {
    id: 'dancing-lumberjack',
    name: 'Dancing Lumberjack',
    occasion: 'Birthday',
    background: '#2d6a4f',
    width: 400,
    height: 600,
    headPosition: { x: 0, y: -20, scale: 0.7 },
    defaultMessage: 'Happy Birthday, ya hoser! Time to cut loose!',
    ttsScript: 'Happy Birthday ya hoser! Time to cut loose and celebrate!',
    bodyAnimation: [
      { time: 0.0, headX: 0, headY: 0, headRotation: 0, bodyX: 0, bodyY: 0, bodyRotation: 0 },
      { time: 0.15, headX: -8, headY: -15, headRotation: -5, bodyX: -10, bodyY: -20, bodyRotation: -3 },
      { time: 0.3, headX: 8, headY: 0, headRotation: 5, bodyX: 10, bodyY: 0, bodyRotation: 3 },
      { time: 0.45, headX: -8, headY: -15, headRotation: -5, bodyX: -10, bodyY: -20, bodyRotation: -3 },
      { time: 0.6, headX: 8, headY: 0, headRotation: 5, bodyX: 10, bodyY: 0, bodyRotation: 3 },
      { time: 0.75, headX: 0, headY: -25, headRotation: 0, bodyX: 0, bodyY: -30, bodyRotation: 0 },
      { time: 0.9, headX: 0, headY: 0, headRotation: 0, bodyX: 0, bodyY: 0, bodyRotation: 0 },
      { time: 1.0, headX: 0, headY: 0, headRotation: 0, bodyX: 0, bodyY: 0, bodyRotation: 0 },
    ],
  },
  {
    id: 'hockey-dancer',
    name: 'Hockey Celly Dance',
    occasion: 'Congratulations',
    background: '#1a3a5c',
    width: 400,
    height: 600,
    headPosition: { x: 0, y: -15, scale: 0.7 },
    defaultMessage: 'GOAL! Massive congratulations, superstar!',
    ttsScript: 'GOAL! GOAL! GOAL! Massive congratulations superstar! What a beauty!',
    bodyAnimation: [
      { time: 0.0, headX: 0, headY: 0, headRotation: 0, bodyX: 0, bodyY: 0, bodyRotation: 0 },
      { time: 0.1, headX: -30, headY: -10, headRotation: -8, bodyX: -30, bodyY: -10, bodyRotation: -5 },
      { time: 0.2, headX: 0, headY: -30, headRotation: 0, bodyX: 0, bodyY: -25, bodyRotation: 0 },
      { time: 0.3, headX: 30, headY: -10, headRotation: 8, bodyX: 30, bodyY: -10, bodyRotation: 5 },
      { time: 0.5, headX: 0, headY: -40, headRotation: 0, bodyX: 0, bodyY: -35, bodyRotation: 0 },
      { time: 0.65, headX: -20, headY: 0, headRotation: -10, bodyX: -20, bodyY: 0, bodyRotation: -8 },
      { time: 0.8, headX: 20, headY: -20, headRotation: 10, bodyX: 20, bodyY: -15, bodyRotation: 8 },
      { time: 1.0, headX: 0, headY: 0, headRotation: 0, bodyX: 0, bodyY: 0, bodyRotation: 0 },
    ],
  },
  {
    id: 'sorry-shuffler',
    name: 'Sorry Shuffle',
    occasion: 'Apology',
    background: '#8b4513',
    width: 400,
    height: 600,
    headPosition: { x: 0, y: -18, scale: 0.7 },
    defaultMessage: 'Sorry, sorry, SO sorry! Please forgive me, eh?',
    ttsScript: "Sorry, sorry, SO sorry! I'm doing my sorry dance. Please forgive me, eh?",
    bodyAnimation: [
      { time: 0.0, headX: 0, headY: 0, headRotation: -15, bodyX: 0, bodyY: 0, bodyRotation: -10 },
      { time: 0.2, headX: 0, headY: -10, headRotation: 15, bodyX: 5, bodyY: -8, bodyRotation: 10 },
      { time: 0.4, headX: -5, headY: 0, headRotation: -20, bodyX: -5, bodyY: 0, bodyRotation: -12 },
      { time: 0.6, headX: 5, headY: -10, headRotation: 20, bodyX: 5, bodyY: -8, bodyRotation: 12 },
      { time: 0.8, headX: 0, headY: -5, headRotation: -10, bodyX: 0, bodyY: -5, bodyRotation: -5 },
      { time: 1.0, headX: 0, headY: 0, headRotation: -15, bodyX: 0, bodyY: 0, bodyRotation: -10 },
    ],
  },
  {
    id: 'coffee-runner',
    name: 'Timmies Run',
    occasion: 'Thank You',
    background: '#4a1a0a',
    width: 400,
    height: 600,
    headPosition: { x: 0, y: -20, scale: 0.65 },
    defaultMessage: "You're worth running through a blizzard for. Thanks a double-double!",
    ttsScript: "You're worth running through a blizzard for! Thanks a double double! You're the best!",
    bodyAnimation: [
      { time: 0.0, headX: -20, headY: 0, headRotation: -3, bodyX: -20, bodyY: 0, bodyRotation: -2 },
      { time: 0.15, headX: -10, headY: -15, headRotation: 2, bodyX: -10, bodyY: -12, bodyRotation: 2 },
      { time: 0.3, headX: 0, headY: 0, headRotation: -3, bodyX: 0, bodyY: 0, bodyRotation: -2 },
      { time: 0.45, headX: 10, headY: -15, headRotation: 2, bodyX: 10, bodyY: -12, bodyRotation: 2 },
      { time: 0.6, headX: 20, headY: 0, headRotation: -3, bodyX: 20, bodyY: 0, bodyRotation: -2 },
      { time: 0.75, headX: 10, headY: -20, headRotation: 3, bodyX: 10, bodyY: -15, bodyRotation: 3 },
      { time: 0.9, headX: -10, headY: -5, headRotation: -2, bodyX: -10, bodyY: -3, bodyRotation: -1 },
      { time: 1.0, headX: -20, headY: 0, headRotation: -3, bodyX: -20, bodyY: 0, bodyRotation: -2 },
    ],
  },
  {
    id: 'syrup-sipper',
    name: 'Syrup Power-Up',
    occasion: 'Get Well',
    background: '#6b3a1f',
    width: 400,
    height: 600,
    headPosition: { x: 0, y: -15, scale: 0.7 },
    defaultMessage: 'Forget medicine — pure Canadian maple syrup will fix anything!',
    ttsScript: 'Forget medicine! Pure Canadian maple syrup will fix anything! Chug chug chug! Feel the power!',
    bodyAnimation: [
      { time: 0.0, headX: 0, headY: 5, headRotation: -5, bodyX: 0, bodyY: 5, bodyRotation: -3 },
      { time: 0.3, headX: 0, headY: -5, headRotation: 15, bodyX: 0, bodyY: 0, bodyRotation: 5 },
      { time: 0.5, headX: 0, headY: -5, headRotation: 20, bodyX: 0, bodyY: -5, bodyRotation: 8 },
      { time: 0.7, headX: 0, headY: -30, headRotation: 0, bodyX: 0, bodyY: -25, bodyRotation: 0 },
      { time: 0.85, headX: -15, headY: -20, headRotation: -10, bodyX: -15, bodyY: -15, bodyRotation: -5 },
      { time: 1.0, headX: 15, headY: -20, headRotation: 10, bodyX: 15, bodyY: -15, bodyRotation: 5 },
    ],
  },
  {
    id: 'mountie-salute',
    name: 'Mountie Salute',
    occasion: 'Retirement',
    background: '#1a1a3a',
    width: 400,
    height: 600,
    headPosition: { x: 0, y: -20, scale: 0.7 },
    defaultMessage: 'At ease, soldier. You earned this retirement!',
    ttsScript: "At ease soldier! After all those years of service, you've earned this retirement! Now go enjoy yourself!",
    bodyAnimation: [
      { time: 0.0, headX: 0, headY: 0, headRotation: 0, bodyX: 0, bodyY: 0, bodyRotation: 0 },
      { time: 0.3, headX: 0, headY: -5, headRotation: 2, bodyX: 0, bodyY: -3, bodyRotation: 1 },
      { time: 0.5, headX: 0, headY: 0, headRotation: 0, bodyX: 0, bodyY: 0, bodyRotation: 0 },
      { time: 0.7, headX: 0, headY: -3, headRotation: -2, bodyX: 0, bodyY: -2, bodyRotation: -1 },
      { time: 1.0, headX: 0, headY: 0, headRotation: 0, bodyX: 0, bodyY: 0, bodyRotation: 0 },
    ],
  },
];
