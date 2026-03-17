#!/usr/bin/env node
/**
 * MapleCard — Animated Card Generator
 * Takes generated card images and animates them with Google Veo 2.
 *
 * USAGE:
 *   $env:GEMINI_API_KEY="your-key"
 *   node generate-animated-cards.mjs                      → all cards
 *   node generate-animated-cards.mjs --occasion=birthday  → single occasion
 *   node generate-animated-cards.mjs --dry                → preview what would be animated
 *
 * PREREQUISITES:
 *   Run generate-occasion-cards.mjs first to create the static images.
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
const OCCASION_FILTER = args.occasion || null;

// ─── MOTION PROMPTS ──────────────────────────────────────────────────────────
// Each card gets a subtle, tasteful motion prompt to animate the scene.
// Keep motions gentle — these are greeting cards, not action movies.

const MOTION_PROMPTS = {
  // Birthday
  'birthday/cake-risograph': 'Gentle flickering candle flames, subtle confetti drifting down slowly, warm ambient light',
  'birthday/bear-gouache': 'Bear gently swaying, candle flame flickering, leaves rustling softly in background',
  'birthday/moose-linocut': 'Candle flames gently flickering on antlers, subtle breathing motion',
  'birthday/balloons-midcentury': 'Balloons gently floating upward and swaying, clouds drifting slowly across sky',
  'birthday/loon-screenprint': 'Gentle water ripples, loon slowly gliding across lake, golden light shimmering on water',
  'birthday/party-letterpress': 'Streamers gently swaying in a breeze, subtle shimmer on metallic elements',

  // Christmas
  'christmas/cabin-gouache': 'Snow falling gently, smoke rising from chimney, warm light flickering in windows, stars twinkling',
  'christmas/skating-risograph': 'Figures gliding across ice, snow falling softly, gentle swaying of pine trees',
  'christmas/tree-linocut': 'Star on top gently glowing and pulsing, subtle twinkle on ornaments',
  'christmas/fireplace-midcentury': 'Fire crackling with gentle flames, cat breathing softly, warm flickering light on walls',
  'christmas/mittens-screenprint': 'Gentle snow falling around mittens, subtle steam rising as if just removed from warm hands',
  'christmas/hotchocolate-gouache': 'Steam rising gently from mugs, snow falling outside window, candlelight flickering',

  // Thank You
  'thank-you/bouquet-gouache': 'Flowers gently swaying as if in a breeze, petals slowly drifting, warm light shifting',
  'thank-you/syrup-risograph': 'Maple leaves gently falling and drifting, warm amber light shifting',
  'thank-you/tea-midcentury': 'Steam rising from tea cups, gentle breeze through garden, butterflies floating',
  'thank-you/bird-linocut': 'Chickadee gently hopping on branch, wings adjusting, pine needles swaying',
  'thank-you/canoe-screenprint': 'Water gently rippling, canoe slowly rocking, golden sunrise light spreading across lake',
  'thank-you/garden-letterpress': 'Roses gently swaying in breeze, a butterfly fluttering near the gate',

  // Mother's Day
  'mothers-day/flowers-gouache': 'Flowers gently swaying, petals slowly falling, warm light shifting across arrangement',
  'mothers-day/garden-risograph': 'Gentle breeze through garden, flowers swaying, butterflies floating between blooms',
  'mothers-day/hummingbird-linocut': 'Hummingbird wings buzzing rapidly, hovering motion, flower gently swaying',
  'mothers-day/teaset-midcentury': 'Steam rising from teapot, sunlight shifting through window, wildflowers swaying',

  // Father's Day
  'fathers-day/fishing-gouache': 'Morning mist drifting across lake, water gently rippling, fishing line swaying',
  'fathers-day/bbq-risograph': 'Smoke rising from grill, heat shimmer, gentle summer breeze',
  'fathers-day/workshop-linocut': 'Wood shavings gently curling, dust motes floating in sunbeam',
  'fathers-day/canoe-screenprint': 'Canoe gliding forward slowly, autumn leaves drifting on water, gentle paddle strokes',

  // Valentine's
  'valentines/loons-gouache': 'Loons gliding together on water, gentle ripples, mist slowly rising, sunrise light growing',
  'valentines/winterwalk-risograph': 'Snow falling gently, couple walking slowly, breath visible in cold air',
  'valentines/cabin-linocut': 'Heart-shaped smoke rising and drifting, snow falling gently, warm light pulsing in windows',
  'valentines/wildflower-screenprint': 'Flowers gently swaying, petals occasionally drifting free, subtle breeze',

  // Wedding
  'wedding/chairs-gouache': 'Sunset light slowly shifting golden, water gently rippling, wildflowers swaying in breeze',
  'wedding/bircharch-risograph': 'Dappled sunlight shifting through leaves, flower petals drifting down gently',
  'wedding/lakeside-linocut': 'Lanterns gently swaying, candlelight flickering, water reflecting the warm glow',
  'wedding/toast-midcentury': 'Champagne bubbles rising, sparkles twinkling and fading, gentle golden shimmer',

  // Graduation
  'graduation/cap-risograph': 'Graduation cap tumbling upward in slow motion, clouds drifting, subtle confetti',
  'graduation/books-gouache': 'Steam rising from coffee, maple leaf bookmark fluttering, page turning slightly',
  'graduation/campus-linocut': 'Flag gently waving, autumn leaves drifting down from trees',
  'graduation/openroad-screenprint': 'Clouds slowly moving, sunrise light gradually intensifying, road stretching into distance',

  // New Baby
  'new-baby/woodland-gouache': 'Baby animals gently moving, butterflies floating, wildflowers swaying in meadow breeze',
  'new-baby/moccasins-risograph': 'Soft light shifting gently, subtle warm glow',
  'new-baby/stork-linocut': 'Heron flying slowly across sky with gentle wingbeats, clouds drifting',

  // Get Well
  'get-well/soup-gouache': 'Steam rising from soup bowl, warm light shifting, rain gently falling outside window',
  'get-well/blanket-risograph': 'Rain drops sliding down window glass, steam rising from tea, cozy warm light',
  'get-well/sunflowers-linocut': 'Sunflowers gently swaying in breeze, butterfly fluttering between flowers',

  // Thinking of You
  'thinking-of-you/canoe-gouache': 'Mist slowly drifting across lake, water gently rippling, golden light spreading',
  'thinking-of-you/aurora-risograph': 'Northern lights slowly undulating and shifting colours across sky, stars twinkling',
  'thinking-of-you/trail-screenprint': 'Leaves gently falling from maples, dappled sunlight shifting on trail',

  // Just Because
  'just-because/beaver-gouache': 'Beaver gently holding flowers, stream water flowing, birch leaves rustling',
  'just-because/moose-linocut': 'Northern lights slowly shifting in background, moose breathing gently',
  'just-because/mountains-screenprint': 'Clouds slowly drifting past peaks, water gently rippling in lake',

  // Congratulations
  'congratulations/fireworks-gouache': 'Fireworks bursting and fading in sequence, reflections shimmering in canal water',
  'congratulations/champagne-risograph': 'Bubbles rising and popping, confetti slowly drifting down',
  'congratulations/summit-screenprint': 'Wind gently blowing, clouds moving past, hair and clothing rippling',

  // Canada Day
  'canada-day/fireworks-gouache': 'Fireworks bursting in red and white, reflections dancing on water, crowd silhouettes',
  'canada-day/parade-risograph': 'Flags waving, people slowly marching, bunting fluttering in breeze',
  'canada-day/flag-linocut': 'Flag waving majestically in wind, clouds drifting across blue sky',

  // Thanksgiving
  'thanksgiving/harvest-gouache': 'Golden light shifting through maple leaves, candle flames flickering on table',
  'thanksgiving/pumpkin-risograph': 'Autumn leaves gently falling, clouds drifting, warm light on barn',
  'thanksgiving/cornucopia-linocut': 'Subtle warm light pulsing, leaves gently settling',

  // New Year
  'new-year/midnight-gouache': 'Fireworks bursting against night sky, clock hands moving, city lights twinkling',
  'new-year/frozenlake-risograph': 'Fireworks reflecting in frozen lake, snow gently falling, northern lights shifting',
  'new-year/champagne-screenprint': 'Champagne cork popping in slow motion, bubbles and streamers exploding outward, stars sparkling',

  // Sympathy
  'sympathy/lake-gouache': 'Water gently rippling, twilight sky slowly shifting colours, peaceful stillness',
  'sympathy/candle-risograph': 'Candle flame gently flickering, rain drops slowly sliding down window',
  'sympathy/forest-linocut': 'Soft light filtering through canopy, leaves gently drifting down',

  // Remembrance Day
  'remembrance-day/poppies-gouache': 'Poppies gently swaying in breeze, sunset light slowly fading, solemn atmosphere',
  'remembrance-day/cenotaph-risograph': 'Autumn leaves slowly drifting past memorial, candlelight flickering',
  'remembrance-day/soldier-linocut': 'Dawn light slowly growing brighter, poppies swaying gently in foreground',
};

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎬 MapleCard — Animated Card Generator (Veo 2)\n');

  const cardsDir = path.join(__dirname, 'public', 'cards');
  if (!fs.existsSync(cardsDir)) {
    console.error('No cards found. Run generate-occasion-cards.mjs first.');
    process.exit(1);
  }

  // Find all card images
  const occasions = fs.readdirSync(cardsDir).filter(f =>
    fs.statSync(path.join(cardsDir, f)).isDirectory()
  );

  const toAnimate = [];
  for (const occasion of occasions) {
    if (OCCASION_FILTER && occasion !== OCCASION_FILTER) continue;
    const dir = path.join(cardsDir, occasion);
    const images = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
    for (const img of images) {
      const key = `${occasion}/${img.replace('.jpg', '')}`;
      const motionPrompt = MOTION_PROMPTS[key];
      if (!motionPrompt) {
        console.log(`   ⚠️  No motion prompt for ${key}, skipping`);
        continue;
      }
      const videoPath = path.join(dir, img.replace('.jpg', '.mp4'));
      if (fs.existsSync(videoPath)) {
        console.log(`   ⏭️  ${key} (video exists, skipping)`);
        continue;
      }
      toAnimate.push({
        key,
        imagePath: path.join(dir, img),
        videoPath,
        motionPrompt,
      });
    }
  }

  console.log(`   Cards to animate: ${toAnimate.length}`);
  console.log(`   Estimated time: ~${toAnimate.length * 2} minutes (polling)\n`);

  if (DRY_RUN) {
    for (const card of toAnimate) {
      console.log(`   🎬 ${card.key}`);
      console.log(`      Motion: ${card.motionPrompt.slice(0, 80)}...`);
    }
    console.log('\n✅ Dry run complete. Remove --dry to generate.');
    return;
  }

  let completed = 0;
  let failed = 0;

  for (const card of toAnimate) {
    try {
      console.log(`   🎬 ${card.key}...`);

      // Read the image
      const imageBytes = fs.readFileSync(card.imagePath);
      const base64Image = imageBytes.toString('base64');

      // Start video generation
      let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: card.motionPrompt,
        image: {
          imageBytes: base64Image,
          mimeType: 'image/jpeg',
        },
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
        downloadPath: card.videoPath,
      });

      console.log(`   ✅ ${card.key}`);
      completed++;

      // Delay between requests
      await new Promise(r => setTimeout(r, 5000));
    } catch (e) {
      console.error(`   ❌ ${card.key}: ${e.message}`);
      failed++;
      if (e.message.includes('429') || e.message.includes('RESOURCE_EXHAUSTED')) {
        console.log(`   ⏳ Rate limited, waiting 60s...`);
        await new Promise(r => setTimeout(r, 60000));
      } else {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }

  console.log(`\n🎬 Done! ${completed} animated, ${failed} failed.`);
  console.log(`   Videos saved alongside images in public/cards/`);
}

main();
