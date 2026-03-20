#!/usr/bin/env node
/**
 * MapleCard — JibJab-Style Face Swap Video Generator
 * Generates funny Canadian-themed videos featuring a person prominently
 * so their face can be swapped via the face-swap API.
 *
 * USAGE:
 *   $env:GEMINI_API_KEY="your-key"
 *   node generate-jibjab-videos.mjs
 *   node generate-jibjab-videos.mjs --dry          → preview prompts only
 *   node generate-jibjab-videos.mjs --card=poutine-chef  → single card
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('Missing GEMINI_API_KEY. Set it: $env:GEMINI_API_KEY="your-key"');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; })
);
const DRY_RUN = args.dry === true;
const CARD_FILTER = args.card || null;

// ─── JIBJAB-STYLE FACE SWAP VIDEOS ──────────────────────────────────────────
// Key requirement: Each video features ONE person with their face clearly visible
// and prominently shown, so we can swap the user's face onto them.

const CARDS = [
  {
    id: 'poutine-chef',
    name: 'Poutine Chef',
    occasion: 'birthday',
    insideText: "This birthday deserves the full poutine treatment. Cheese curds, gravy, the works!",
    prompt: 'Medium shot of a single enthusiastic chef with a big smile facing the camera, wearing a white chef hat and apron, dramatically tossing cheese curds into the air above a massive steaming plate of poutine. The chef catches the curds one by one in the gravy. Warm rustic kitchen with copper pots and maple wood counters. The person has an exaggerated joyful expression. Clear face, well-lit, cinematic food photography lighting, shallow depth of field. The camera slowly pushes in on the chef as they proudly present their creation.',
  },
  {
    id: 'hockey-celly',
    name: 'Hockey Celly',
    occasion: 'congratulations',
    insideText: "GOOOOAL! That's how you celebrate a win! Congratulations, superstar!",
    prompt: 'Medium shot of a single hockey player in a red and white Canada jersey with their helmet off, face clearly visible, performing an over-the-top ridiculous goal celebration on an ice rink. They do a big fist pump, then slide on their knees across the ice with arms wide open, huge grin on their face, then stand up and do a little victory dance. Bright arena lights, ice spray, crowd blur in background. Clear face throughout, cinematic slow motion moments, dynamic camera following the celebration.',
  },
  {
    id: 'sorry-dance',
    name: 'Sorry Dance',
    occasion: 'apology',
    insideText: "Sorry, sorry, SO sorry! Here's my official apology dance. Are we good now?",
    prompt: 'Medium shot of a single person in a cozy red plaid flannel shirt, face clearly visible and well-lit, performing an increasingly elaborate and funny apologetic dance. They start with hands clasped in a pleading sorry gesture, then transition into an exaggerated ballroom-style solo dance with dramatic arm flourishes, spinning around with a sheepish apologetic grin. Snowy Canadian porch of a log cabin with string lights. The person maintains eye contact with camera, warm golden lighting, cinematic handheld camera.',
  },
  {
    id: 'tims-dash',
    name: "Timmies Dash",
    occasion: 'thank-you',
    insideText: "You're worth running through a blizzard for. Thanks a double-double!",
    prompt: 'Tracking shot of a single person in a puffy winter parka running dramatically in slow motion through falling snow, face clearly visible with an expression of intense determination, clutching two large coffees. They leap over a snowbank, nearly slip on ice but recover gracefully, coffee held triumphantly overhead without spilling a drop. Snowy Canadian city street with cars and storefronts. Clear face throughout, cinematic slow motion, dramatic hero-run lighting, breath visible in cold air.',
  },
  {
    id: 'ice-fishing-hero',
    name: 'Ice Fishing Hero',
    occasion: 'retirement',
    insideText: "Time to sit back, relax, and reel in the good life. Happy retirement!",
    prompt: 'Medium shot of a single person in a thick winter coat and toque sitting on a bucket beside an ice fishing hole on a frozen lake, face clearly visible. They get a bite, stand up excitedly, and pull out a comically tiny fish on the line. They hold the tiny fish up to the camera with a massive proud grin as if they caught a world record. Then they do a victory fist pump. Frozen Canadian lake with pine trees in background, bright winter sun, cinematic shallow depth of field, clear face well-lit throughout.',
  },
  {
    id: 'snow-angel-pro',
    name: 'Snow Angel Pro',
    occasion: 'just-because',
    insideText: "No reason needed. Just felt like making something beautiful. Like you!",
    prompt: 'Wide shot transitioning to overhead drone view of a single person in a bright red winter jacket, face clearly visible, dramatically throwing themselves backwards into fresh pristine snow to make a snow angel. They move their arms and legs with theatrical Olympic-gymnast precision, huge smile on their face. Camera pulls up to reveal the snow angel is perfect and enormous. Then the person sits up, looks at camera, and gives a proud thumbs up with snow in their hair. Bright sunny winter day, sparkling snow crystals, blue sky, cinematic aerial transition.',
  },
  {
    id: 'syrup-chug',
    name: 'Syrup Power-Up',
    occasion: 'get-well',
    insideText: "Forget medicine — pure Canadian maple syrup will fix anything. Get well soon!",
    prompt: 'Medium close-up of a single person looking tired and sick wrapped in a cozy blanket on a couch, face clearly visible. Someone hands them a bottle of maple syrup. They take a big swig straight from the bottle. Instantly their eyes light up, they throw off the blanket, stand up with newfound energy, flex their muscles dramatically with a huge grin, and do a little energized dance. The transformation from sick to superhero is comically fast. Warm cozy Canadian living room, fireplace in background, cinematic warm lighting, clear face throughout the transformation.',
  },
  {
    id: 'polar-plunge',
    name: 'Polar Plunge',
    occasion: 'birthday',
    insideText: "Another year, another reason to take the plunge! Happy birthday, you brave soul!",
    prompt: 'Medium shot of a single person in a bathing suit and a birthday party hat standing at the edge of a hole cut in a frozen lake, face clearly visible with a nervous excited expression. They count down with fingers (3, 2, 1), then do a dramatic cannonball jump into the icy water. Camera catches the splash, then the person surfaces with a huge shocked gasp and laughing face, giving a shaky thumbs up to camera. Frozen Canadian lake with snow and pine trees, bright sunny day, cinematic slow-motion splash, clear face well-lit before and after the plunge.',
  },
];

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🍁 MapleCard — JibJab-Style Face Swap Video Generator (Veo 2)\n');

  const outDir = path.join(__dirname, 'public', 'videos');
  fs.mkdirSync(outDir, { recursive: true });

  const filtered = CARD_FILTER
    ? CARDS.filter(c => c.id === CARD_FILTER)
    : CARDS;

  console.log(`   Videos to generate: ${filtered.length}\n`);

  if (DRY_RUN) {
    for (const card of filtered) {
      console.log(`   🎬 ${card.id} (${card.occasion})`);
      console.log(`      "${card.name}"`);
      console.log(`      ${card.prompt.slice(0, 120)}...\n`);
    }
    console.log('✅ Dry run complete. Remove --dry to generate.');
    return;
  }

  let completed = 0;
  let failed = 0;

  for (const card of filtered) {
    const videoPath = path.join(outDir, `${card.id}.mp4`);

    if (fs.existsSync(videoPath)) {
      console.log(`   ⏭️  ${card.id} (exists, skipping)`);
      completed++;
      continue;
    }

    try {
      console.log(`   🎬 ${card.id} — "${card.name}"...`);

      // Start video generation
      let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: card.prompt,
        config: {
          aspectRatio: '9:16',
          numberOfVideos: 1,
        },
      });

      // Poll until done
      let pollCount = 0;
      while (!operation.done) {
        pollCount++;
        if (pollCount > 60) throw new Error('Timeout after 10 minutes of polling');
        process.stdout.write(`      polling (${pollCount})...\r`);
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      // Download the video
      const video = operation.response.generatedVideos[0];
      await ai.files.download({
        file: video.video,
        downloadPath: videoPath,
      });

      console.log(`   ✅ ${card.id}`);
      completed++;

      // Delay between requests to avoid rate limits
      await new Promise(r => setTimeout(r, 7000));
    } catch (e) {
      console.error(`   ❌ ${card.id}: ${e.message}`);
      failed++;
      if (e.message.includes('429') || e.message.includes('RESOURCE_EXHAUSTED')) {
        console.log(`   ⏳ Rate limited, waiting 60s...`);
        await new Promise(r => setTimeout(r, 60000));
      } else {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }

  console.log(`\n🍁 Done! ${completed} generated, ${failed} failed.`);
  console.log(`   Videos saved to public/videos/`);
}

main();
