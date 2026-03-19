import { NextRequest, NextResponse } from 'next/server';
import Client from 'magic-hour';
import fs from 'fs';
import path from 'path';

interface Scene {
  id: string;
  template: string;
  thumbnail: string;
  duration: number;
}

let clientInstance: InstanceType<typeof Client> | null = null;
function getMagicHour() {
  if (!clientInstance) {
    clientInstance = new Client({ token: process.env.MAGIC_HOUR_API_KEY });
  }
  return clientInstance;
}

function loadScenes(): Scene[] {
  const scenesPath = path.join(process.cwd(), 'public', 'veo-templates', 'scenes.json');
  return JSON.parse(fs.readFileSync(scenesPath, 'utf-8'));
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MAGIC_HOUR_API_KEY) {
      return NextResponse.json(
        { error: 'Face swap service not configured. Set MAGIC_HOUR_API_KEY.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { sceneId, userPhotoBase64 } = body as {
      sceneId?: string;
      userPhotoBase64?: string;
    };

    if (!sceneId || !userPhotoBase64) {
      return NextResponse.json(
        { error: 'Missing required fields: sceneId and userPhotoBase64' },
        { status: 400 }
      );
    }

    // Validate scene exists
    const scenes = loadScenes();
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) {
      return NextResponse.json(
        { error: `Unknown scene: ${sceneId}` },
        { status: 400 }
      );
    }

    const client = getMagicHour();

    // Upload the scene thumbnail (target face) from local filesystem
    const thumbnailPath = path.join(process.cwd(), 'public', scene.thumbnail);

    // Upload the user photo (base64 → File with name for extension detection)
    const raw = userPhotoBase64.replace(/^data:image\/\w+;base64,/, '');
    const photoBuffer = Buffer.from(raw, 'base64');
    const photoFile = new File([photoBuffer], 'selfie.jpg', { type: 'image/jpeg' });

    // Upload both assets via SDK
    const [targetAsset, sourceAsset] = await Promise.all([
      client.v1.files.uploadFile(thumbnailPath),
      client.v1.files.uploadFile(photoFile),
    ]);

    // Photo face swap (5 credits, seconds to complete)
    const result = await client.v1.faceSwapPhoto.generate(
      {
        assets: {
          sourceFilePath: sourceAsset,
          targetFilePath: targetAsset,
        },
        name: `MapleCard-${sceneId}`,
      },
      {
        waitForCompletion: true,
      }
    );

    // Extract download URL
    console.log('Face swap photo result:', JSON.stringify(result, null, 2));
    const downloads = result.downloads ?? [];
    if (downloads.length === 0) {
      throw new Error('No download URL returned from face swap');
    }

    // Return both the swapped image and the original video
    return NextResponse.json({
      imageUrl: downloads[0].url,
      videoUrl: scene.template,
    });
  } catch (error) {
    console.error('Starring You error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Face swap failed' },
      { status: 500 }
    );
  }
}
