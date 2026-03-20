#!/usr/bin/env node
/**
 * Generate thumbnail images for JibJab-style face swap video cards.
 * Uses Google Imagen 4 to create eye-catching thumbnails.
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('Missing GEMINI_API_KEY');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const THUMBS = [
  {
    id: 'poutine-chef',
    prompt: 'Funny cartoon illustration of a chef dramatically tossing cheese curds in the air over a giant plate of poutine, wearing a white chef hat, bright warm kitchen, Canadian food art, playful vibrant colors, bold outlines, poster style, 3:4 portrait aspect ratio',
  },
  {
    id: 'hockey-celly',
    prompt: 'Funny cartoon illustration of a hockey player in a red Canada jersey sliding on knees across ice doing a dramatic goal celebration with arms wide, bright arena lights, ice spray, playful vibrant colors, bold outlines, poster style, 3:4 portrait aspect ratio',
  },
  {
    id: 'sorry-dance',
    prompt: 'Funny cartoon illustration of a person in red plaid flannel shirt doing an elaborate apologetic dance with hands clasped and sheepish grin, snowy cabin porch with string lights, playful vibrant colors, bold outlines, poster style, 3:4 portrait aspect ratio',
  },
  {
    id: 'tims-dash',
    prompt: 'Funny cartoon illustration of a person in winter parka running dramatically through snow holding two large coffees overhead, determination on face, snowy Canadian street, playful vibrant colors, bold outlines, poster style, 3:4 portrait aspect ratio',
  },
  {
    id: 'ice-fishing-hero',
    prompt: 'Funny cartoon illustration of a person in winter coat proudly holding up a comically tiny fish from an ice fishing hole on a frozen lake, huge proud grin, pine trees in background, playful vibrant colors, bold outlines, poster style, 3:4 portrait aspect ratio',
  },
  {
    id: 'snow-angel-pro',
    prompt: 'Funny cartoon illustration of a person in bright red jacket lying in snow making a perfect snow angel with a huge smile, overhead view, sparkling white snow, blue sky, playful vibrant colors, bold outlines, poster style, 3:4 portrait aspect ratio',
  },
  {
    id: 'syrup-chug',
    prompt: 'Funny cartoon illustration of a person chugging maple syrup straight from the bottle with a supercharged glowing aura of energy around them, cozy living room with fireplace, playful vibrant colors, bold outlines, poster style, 3:4 portrait aspect ratio',
  },
  {
    id: 'polar-plunge',
    prompt: 'Funny cartoon illustration of a person in a birthday hat doing a dramatic cannonball jump into a hole in a frozen lake, big splash, pine trees and snow around, shocked excited expression, playful vibrant colors, bold outlines, poster style, 3:4 portrait aspect ratio',
  },
];

async function main() {
  console.log('🍁 Generating JibJab thumbnail images\n');

  const outDir = path.join(__dirname, 'public', 'videos');
  let completed = 0;

  for (const thumb of THUMBS) {
    const outPath = path.join(outDir, `${thumb.id}-thumb.jpg`);
    if (fs.existsSync(outPath)) {
      console.log(`   ⏭️  ${thumb.id}-thumb.jpg (exists)`);
      completed++;
      continue;
    }

    try {
      console.log(`   🎨 ${thumb.id}-thumb.jpg...`);

      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-preview-05-20',
        prompt: thumb.prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });

      const imgBytes = response.generatedImages[0].image.imageBytes;
      fs.writeFileSync(outPath, Buffer.from(imgBytes, 'base64'));
      console.log(`   ✅ ${thumb.id}-thumb.jpg`);
      completed++;

      // Rate limit: 10 req/min for free tier
      await new Promise(r => setTimeout(r, 7000));
    } catch (e) {
      console.error(`   ❌ ${thumb.id}: ${e.message}`);
      if (e.message.includes('429')) {
        console.log('   ⏳ Rate limited, waiting 30s...');
        await new Promise(r => setTimeout(r, 30000));
      }
    }
  }

  console.log(`\n✅ Done! ${completed}/${THUMBS.length} thumbnails generated.`);
}

main();
