import { NextRequest, NextResponse } from 'next/server';

const MAGIC_HOUR_BASE = 'https://api.magichour.ai/v1';

// Video cards that support face swapping (person visible in the video)
const SWAPPABLE_CARDS: Record<string, { path: string; duration: number }> = {
  'mountie-moose': { path: '/videos/mountie-moose.mp4', duration: 15 },
  'curling-walk': { path: '/videos/curling-walk.mp4', duration: 15 },
};

function getApiKey() {
  return process.env.MAGIC_HOUR_API_KEY;
}

async function magicHourFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${MAGIC_HOUR_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MagicHour API ${res.status}: ${body}`);
  }
  return res.json();
}

// Upload a base64 image to MagicHour and return the file_path
async function uploadImage(base64Data: string): Promise<string> {
  // Strip data URI prefix to get raw base64
  const raw = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(raw, 'base64');

  // 1. Get a presigned upload URL
  const { items } = await magicHourFetch('/files/upload-urls', {
    method: 'POST',
    body: JSON.stringify({
      items: [{ type: 'image', extension: 'jpg' }],
    }),
  });

  const { upload_url, file_path } = items[0];

  // 2. PUT the image bytes to the presigned URL
  const uploadRes = await fetch(upload_url, {
    method: 'PUT',
    body: buffer,
    headers: { 'Content-Type': 'image/jpeg' },
  });
  if (!uploadRes.ok) {
    throw new Error(`Failed to upload image: ${uploadRes.status}`);
  }

  return file_path;
}

// Upload a video from a public URL to MagicHour and return the file_path
async function uploadVideoFromUrl(videoUrl: string): Promise<string> {
  // Download the video first
  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) throw new Error(`Failed to fetch video: ${videoRes.status}`);
  const videoBuffer = Buffer.from(await videoRes.arrayBuffer());

  // Get presigned URL
  const { items } = await magicHourFetch('/files/upload-urls', {
    method: 'POST',
    body: JSON.stringify({
      items: [{ type: 'video', extension: 'mp4' }],
    }),
  });

  const { upload_url, file_path } = items[0];

  // Upload
  const uploadRes = await fetch(upload_url, {
    method: 'PUT',
    body: videoBuffer,
    headers: { 'Content-Type': 'video/mp4' },
  });
  if (!uploadRes.ok) {
    throw new Error(`Failed to upload video: ${uploadRes.status}`);
  }

  return file_path;
}

export async function POST(request: NextRequest) {
  try {
    if (!getApiKey()) {
      return NextResponse.json(
        { error: 'Face swap service not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { image, videoId } = body as { image?: string; videoId?: string };

    if (!image || !videoId) {
      return NextResponse.json(
        { error: 'Missing required fields: image and videoId' },
        { status: 400 }
      );
    }

    const cardInfo = SWAPPABLE_CARDS[videoId];
    if (!cardInfo) {
      return NextResponse.json(
        { error: `Video "${videoId}" does not support face swap` },
        { status: 400 }
      );
    }

    // Build the public URL for the source video
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const videoUrl = `${protocol}://${host}${cardInfo.path}`;

    // Upload face image and video to MagicHour
    const [imagePath, videoPath] = await Promise.all([
      uploadImage(image),
      uploadVideoFromUrl(videoUrl),
    ]);

    // Start the face swap job
    const job = await magicHourFetch('/face-swap', {
      method: 'POST',
      body: JSON.stringify({
        name: `MapleCard-${videoId}`,
        start_seconds: 0,
        end_seconds: cardInfo.duration,
        assets: {
          video_source: 'file',
          video_file_path: videoPath,
          image_file_path: imagePath,
        },
      }),
    });

    const projectId = job.id;

    // Poll for completion (max ~3 minutes)
    let status = 'queued';
    let downloads: { url: string }[] = [];
    for (let i = 0; i < 36; i++) {
      await new Promise((r) => setTimeout(r, 5000));

      const project = await magicHourFetch(`/video-projects/${projectId}`);
      status = project.status;

      if (status === 'complete') {
        downloads = project.downloads || [];
        break;
      }
      if (status === 'error' || status === 'canceled') {
        const errMsg = project.error?.message || 'Face swap failed';
        throw new Error(errMsg);
      }
    }

    if (status !== 'complete') {
      throw new Error('Face swap timed out after 3 minutes');
    }

    if (downloads.length === 0) {
      throw new Error('No download URL returned');
    }

    return NextResponse.json({ videoUrl: downloads[0].url });
  } catch (error) {
    console.error('Face swap error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Face swap failed' },
      { status: 500 }
    );
  }
}
