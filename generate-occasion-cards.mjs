#!/usr/bin/env node
/**
 * MapleCard — Occasion Card Generator
 * Generates greeting card images for new occasions using Google Imagen 4.
 *
 * USAGE:
 *   node generate-occasion-cards.mjs                       → all occasions
 *   node generate-occasion-cards.mjs --occasion=valentines  → single occasion
 *   node generate-occasion-cards.mjs --dry                  → preview prompts only
 *   node generate-occasion-cards.mjs --model=fast           → cheaper/faster
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('\n  No API key. export GEMINI_API_KEY="..."');
  process.exit(1);
}

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; })
);

const MODELS = {
  fast:     'imagen-4.0-fast-generate-001',
  standard: 'imagen-4.0-generate-001',
  ultra:    'imagen-4.0-ultra-generate-001',
};
const MODEL = MODELS[args.model || 'standard'];
const DRY = !!args.dry;

const ai = new GoogleGenAI({ apiKey: API_KEY });

const STYLES = [
  { id: 'gouache', desc: 'warm gouache painting on textured cream paper, soft visible brushstrokes' },
  { id: 'risograph', desc: 'risograph print with slight color misregistration, limited palette, halftone dots visible' },
  { id: 'linocut', desc: 'bold linocut block print, strong black outlines, hand-carved texture' },
  { id: 'screenprint', desc: 'vintage screenprint poster, flat color layers, retro graphic design' },
  { id: 'midcentury', desc: '1950s-60s mid-century modern illustration, atomic age geometric shapes, warm palette' },
  { id: 'letterpress', desc: 'elegant letterpress printed card, deep debossed text feeling, classic typography' },
];

const OCCASIONS = {
  'mothers-day': {
    folder: 'mothers-day',
    cards: [
      { name: 'tulips', subject: 'a bouquet of tulips in a mason jar on a kitchen windowsill with a Canadian landscape outside' },
      { name: 'bear-cubs', subject: 'a mother bear with two cubs walking through a spring wildflower meadow in the Canadian Rockies' },
      { name: 'garden', subject: 'a cozy cottage garden with hummingbirds and lupins, a watering can with a heart tag' },
      { name: 'tea-time', subject: 'an elegant tea set with wildflowers, Canadian blueberry scones on a lace tablecloth' },
      { name: 'canoe', subject: 'a mother and child paddling a red canoe on a calm misty lake at sunrise' },
      { name: 'cardinal', subject: 'a bright red cardinal perched on a blooming cherry blossom branch, soft spring morning' },
    ],
  },
  'fathers-day': {
    folder: 'fathers-day',
    cards: [
      { name: 'fishing', subject: 'a father and child fishing from a wooden dock on a Canadian lake, tackle box and thermos nearby' },
      { name: 'campfire', subject: 'a father tending a campfire with camping gear, northern pines, and a starry sky' },
      { name: 'workshop', subject: 'a cozy workshop with woodworking tools, a birdhouse project half-finished, sawdust on the bench' },
      { name: 'hockey', subject: 'a hockey stick and puck on frozen pond ice, winter trees and warm cabin light in background' },
      { name: 'bbq', subject: 'a classic Canadian backyard BBQ scene with a plaid apron, burgers, and a cold drink' },
      { name: 'canoe-paddle', subject: 'a handcrafted wooden canoe paddle leaning against a red canoe by a lakeside dock' },
    ],
  },
  'valentines': {
    folder: 'valentines',
    cards: [
      { name: 'lovebirds', subject: 'two chickadees sitting together on a snowy branch with a heart-shaped snowflake' },
      { name: 'northern-lights', subject: 'northern lights forming a heart shape over a snow-covered Canadian landscape' },
      { name: 'hot-cocoa', subject: 'two mugs of hot chocolate with marshmallow hearts, cozy blanket and fireplace' },
      { name: 'maple-heart', subject: 'a maple leaf shaped like a heart, autumn colors, scattered fall leaves' },
      { name: 'skating', subject: 'a couple ice skating hand-in-hand on a frozen lake under string lights' },
      { name: 'cabin', subject: 'a cozy snow-covered cabin with a heart wreath on the door, smoke from chimney' },
    ],
  },
  'graduation': {
    folder: 'graduation',
    cards: [
      { name: 'cap-toss', subject: 'graduation caps tossed in the air against a bright blue sky with maple leaves falling' },
      { name: 'owl', subject: 'a wise great horned owl wearing a tiny graduation cap, perched on stacked books' },
      { name: 'mountains', subject: 'a trail leading up to a mountain summit with a flag at the top, sunrise, achievement' },
      { name: 'library', subject: 'a grand university library with stained glass, stacked books, and a diploma scroll' },
      { name: 'compass', subject: 'a vintage brass compass on an old map of Canada, pointing to new adventures' },
      { name: 'canoe-journey', subject: 'an empty canoe at a fork in a river, beautiful untouched wilderness ahead' },
    ],
  },
  'sympathy': {
    folder: 'sympathy',
    cards: [
      { name: 'peaceful-lake', subject: 'a serene misty lake at dawn with a single loon, soft golden light through pines' },
      { name: 'wildflowers', subject: 'a gentle field of wildflowers with a single white butterfly, soft diffused light' },
      { name: 'birch-grove', subject: 'a quiet birch tree grove with dappled sunlight, peaceful and contemplative' },
      { name: 'starlight', subject: 'a single bright star in a twilight sky over a calm ocean, lighthouse in distance' },
      { name: 'garden-bench', subject: 'an empty garden bench under a weeping willow, soft light, peace lilies nearby' },
      { name: 'mountain-mist', subject: 'distant mountains fading into gentle mist layers, sunrise, quiet solitude' },
    ],
  },
  'new-baby': {
    folder: 'new-baby',
    cards: [
      { name: 'stork-moose', subject: 'a friendly Canadian moose carrying a baby bundle in its antlers, cheerful forest scene' },
      { name: 'nursery', subject: 'a cozy nursery with a rocking chair, stuffed beaver toy, maple leaf mobile, warm light' },
      { name: 'duckling', subject: 'a mother duck with a line of tiny ducklings crossing a Canadian country road' },
      { name: 'knitted', subject: 'tiny knitted baby booties and a little toque on a soft blanket with a teddy bear' },
      { name: 'forest-friends', subject: 'woodland baby animals (fawn, bunny, fox kit) gathered around a cradle in a forest clearing' },
      { name: 'rainbow', subject: 'a bright rainbow over a peaceful Canadian countryside, little wooden birdhouse' },
    ],
  },
  'anniversary': {
    folder: 'anniversary',
    cards: [
      { name: 'sunset-canoe', subject: 'a couple in a canoe watching a golden sunset over a perfectly still Canadian lake' },
      { name: 'dancing', subject: 'two silhouettes dancing under string lights on a deck overlooking mountains' },
      { name: 'wine-toast', subject: 'two wine glasses clinking with a Niagara vineyard landscape in golden hour' },
      { name: 'love-lock', subject: 'a heart-shaped lock on a bridge railing with a waterfall in the background' },
      { name: 'cabin-fire', subject: 'two Muskoka chairs by a fire pit, starry sky, cozy cabin with warm windows' },
      { name: 'geese', subject: 'a pair of Canada geese flying together over autumn-colored forest, lifetime bond' },
    ],
  },
  'wedding': {
    folder: 'wedding',
    cards: [
      { name: 'venue', subject: 'a beautiful lakeside wedding arch decorated with wildflowers, Rocky Mountains backdrop' },
      { name: 'rings', subject: 'two wedding rings on a maple leaf, soft bokeh background with warm light' },
      { name: 'bouquet', subject: 'a lush wedding bouquet with peonies, ferns, and Canadian wildflowers, ribbon detail' },
      { name: 'toast', subject: 'champagne glasses under a tent with twinkling lights, elegant celebration' },
      { name: 'barn', subject: 'a charming red barn wedding venue with string lights, wildflower meadow, sunset' },
      { name: 'swans', subject: 'two trumpeter swans forming a heart shape on a calm Canadian lake at golden hour' },
    ],
  },
  'congratulations': {
    folder: 'congratulations',
    cards: [
      { name: 'fireworks', subject: 'spectacular fireworks over Niagara Falls, celebration, vibrant colors in night sky' },
      { name: 'trophy', subject: 'a gleaming gold trophy on a pedestal with confetti falling, maple leaf confetti pieces' },
      { name: 'champagne', subject: 'champagne bottle popping with golden sparkles, celebration, festive atmosphere' },
      { name: 'summit', subject: 'a person standing triumphantly on a mountain peak in the Canadian Rockies, arms raised, sunrise' },
      { name: 'ribbon', subject: 'a grand ribbon-cutting ceremony with red ribbon and golden scissors, confetti, celebration' },
      { name: 'northern-lights', subject: 'spectacular northern lights display in purple and green over a Canadian celebration bonfire' },
    ],
  },
  'get-well': {
    folder: 'get-well',
    cards: [
      { name: 'soup', subject: 'a steaming bowl of homemade chicken soup with a cozy blanket and hot tea, warm kitchen' },
      { name: 'sunshine', subject: 'bright sunshine breaking through clouds over a field of sunflowers, hope and warmth' },
      { name: 'healing-garden', subject: 'a peaceful healing garden with lavender, butterflies, and a gentle waterfall' },
      { name: 'teddy', subject: 'a cute teddy bear in a tiny toque holding a heart, sitting by a window with sunshine' },
      { name: 'rainbow', subject: 'a vibrant rainbow over a spring meadow after rain, Canadian countryside, promise of better days' },
      { name: 'tea-honey', subject: 'a warm cup of tea with honey and lemon, cozy blanket, stack of books, healing vibes' },
    ],
  },
  'retirement': {
    folder: 'retirement',
    cards: [
      { name: 'hammock', subject: 'a hammock strung between two pine trees by a Canadian lake, straw hat, perfect relaxation' },
      { name: 'fishing-boat', subject: 'a peaceful fishing boat on a glassy lake at dawn, retirement bliss, no hurry' },
      { name: 'garden', subject: 'a lush retirement garden with raised beds, tomatoes, flowers, gardening tools, sunny day' },
      { name: 'road-trip', subject: 'a vintage camper van on the Trans-Canada Highway, mountains ahead, freedom and adventure' },
      { name: 'golf', subject: 'a beautiful golf course in the Canadian Rockies, perfect day, clubs and cart on green' },
      { name: 'rocking-chair', subject: 'a cozy rocking chair on a cabin porch overlooking mountains, cup of coffee, peaceful sunset' },
    ],
  },
  'thinking-of-you': {
    folder: 'thinking-of-you',
    cards: [
      { name: 'letter', subject: 'a handwritten letter on vintage paper with a pressed flower, warm candlelight' },
      { name: 'window', subject: 'a cozy window seat with rain outside, a warm cup of tea, a book, thinking of someone' },
      { name: 'moonlight', subject: 'a full moon reflecting on a still Canadian lake, peaceful night, deep connection' },
      { name: 'wildflower', subject: 'a single beautiful wildflower growing in a crack, resilience and beauty, sunshine' },
      { name: 'bridge', subject: 'a charming covered bridge in autumn colors, connecting two sides, Canadian countryside' },
      { name: 'songbird', subject: 'a beautiful songbird singing on a branch at golden hour, musical notes suggested in light' },
    ],
  },
};

async function generateCard(occasion, card, style) {
  const folder = path.join(__dirname, 'public', 'cards', OCCASIONS[occasion].folder);
  const filename = `${card.name}-${style.id}.jpg`;
  const filepath = path.join(folder, filename);

  if (fs.existsSync(filepath)) {
    console.log(`  SKIP ${filename} (exists)`);
    return;
  }

  const prompt = `A beautiful greeting card illustration in ${style.desc} style. Subject: ${card.subject}. Vertical portrait orientation (3:4 ratio). No text, no words, no letters. Rich detail, warm inviting mood. Canadian-themed.`;

  if (DRY) {
    console.log(`  [DRY] ${filename}`);
    console.log(`         ${prompt.slice(0, 120)}...`);
    return;
  }

  console.log(`  Generating ${filename}...`);

  try {
    const response = await ai.models.generateImages({
      model: MODEL,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '3:4',
        outputMimeType: 'image/jpeg',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const imageData = response.generatedImages[0].image.imageBytes;
      fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));
      console.log(`  OK ${filename}`);
    } else {
      console.log(`  EMPTY ${filename} (no image returned)`);
    }
  } catch (err) {
    console.error(`  FAIL ${filename}: ${err.message}`);
  }

  // Rate limit: wait 7s between requests (10 req/min limit)
  await new Promise(r => setTimeout(r, 7000));
}

async function main() {
  const targetOccasion = args.occasion;
  const occasions = targetOccasion
    ? { [targetOccasion]: OCCASIONS[targetOccasion] }
    : OCCASIONS;

  if (targetOccasion && !OCCASIONS[targetOccasion]) {
    console.error(`Unknown occasion: ${targetOccasion}`);
    console.error(`Available: ${Object.keys(OCCASIONS).join(', ')}`);
    process.exit(1);
  }

  let total = 0;
  for (const [name, occ] of Object.entries(occasions)) {
    console.log(`\n=== ${name.toUpperCase()} ===`);
    const folder = path.join(__dirname, 'public', 'cards', occ.folder);
    fs.mkdirSync(folder, { recursive: true });

    for (let i = 0; i < occ.cards.length; i++) {
      const card = occ.cards[i];
      const style = STYLES[i % STYLES.length];
      await generateCard(name, card, style);
      total++;
    }
  }

  console.log(`\nDone. ${total} cards processed.`);
  if (!DRY) {
    console.log('Update CARD_TEMPLATES in CardEditor.tsx to include new cards.');
  }
}

main().catch(console.error);
