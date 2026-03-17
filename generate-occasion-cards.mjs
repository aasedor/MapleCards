#!/usr/bin/env node
/**
 * MapleCard — Occasion Card Generator
 * Uses Google Imagen 4 via @google/genai to generate occasion-specific greeting cards.
 *
 * USAGE:
 *   $env:GEMINI_API_KEY="your-key"
 *   node generate-occasion-cards.mjs                      → all tiers
 *   node generate-occasion-cards.mjs --tier=1             → tier 1 only
 *   node generate-occasion-cards.mjs --occasion=birthday  → single occasion
 *   node generate-occasion-cards.mjs --dry                → preview prompts only
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
const TIER_FILTER = args.tier ? parseInt(args.tier) : null;
const OCCASION_FILTER = args.occasion || null;

// ─── PROMPTS ─────────────────────────────────────────────────────────────────
// Each prompt specifies a real art technique to avoid the "AI look".
// No text/words in any image — the card overlay handles messaging.

const OCCASIONS = [
  // ═══ TIER 1 — 6 cards each ═══
  {
    occasion: 'birthday', tier: 1, cards: [
      { name: 'cake-risograph', prompt: 'Risograph print illustration of a layered birthday cake with tall candles, bold limited colour palette of coral pink, teal, and gold on cream paper, visible ink grain texture, slight colour misregistration, celebratory confetti dots, no text no words no letters' },
      { name: 'bear-gouache', prompt: 'Hand-painted gouache illustration of a friendly black bear wearing a small party hat, holding a cupcake with a single candle, warm forest background with birch trees, opaque brushstrokes visible, folk art style, no text no words no letters' },
      { name: 'moose-linocut', prompt: 'Bold linocut block print of a majestic moose with enormous antlers decorated with small birthday candles, deep navy ink on cream paper, strong carved lines, woodblock aesthetic, no text no words no letters' },
      { name: 'balloons-midcentury', prompt: 'Mid-century modern illustration of colourful balloons floating over a Canadian lake landscape with pine trees, geometric stylized shapes, warm retro 1960s colour palette of mustard yellow, burnt orange, olive green, teal, no text no words no letters' },
      { name: 'loon-screenprint', prompt: 'Screen print style illustration of a common loon on a calm lake at golden hour, flat colour layers in navy, gold, forest green, and cream, visible halftone dots, vintage poster aesthetic, no text no words no letters' },
      { name: 'party-letterpress', prompt: 'Vintage letterpress style birthday party scene with streamers and bunting, debossed texture on thick cotton paper, two-colour printing in deep red and gold, fine line engraving details, no text no words no letters' },
    ]
  },
  {
    occasion: 'christmas', tier: 1, cards: [
      { name: 'cabin-gouache', prompt: 'Hand-painted gouache illustration of a cozy log cabin in deep Canadian snow at night, warm golden light glowing from windows, snow-laden spruce trees, smoke rising from chimney, starry sky, thick opaque brushstrokes, no text no words no letters' },
      { name: 'skating-risograph', prompt: 'Risograph print of people ice skating on a frozen pond surrounded by snow-covered pines, limited colour palette of red, navy blue, and white on cream paper, visible grain texture, playful folk art figures, no text no words no letters' },
      { name: 'tree-linocut', prompt: 'Linocut block print of a decorated Christmas tree with a bright star on top, bold carved lines, deep green and red ink on cream paper, ornaments rendered as simple geometric shapes, woodcut folk art style, no text no words no letters' },
      { name: 'fireplace-midcentury', prompt: 'Mid-century modern illustration of a stone fireplace with hanging stockings, crackling fire, a cat curled on a rug, geometric stylized shapes, warm retro palette of burnt orange, forest green, cream, and burgundy, no text no words no letters' },
      { name: 'mittens-screenprint', prompt: 'Screen print illustration of a pair of hand-knit Canadian mittens with maple leaf pattern, flat colour layers in red, white, and navy, slight registration offset, cozy winter aesthetic, no text no words no letters' },
      { name: 'hotchocolate-gouache', prompt: 'Hand-painted gouache illustration of two mugs of hot chocolate with marshmallows on a wooden table by a frosted window, snow falling outside, warm candlelight, thick painterly brushstrokes, hygge atmosphere, no text no words no letters' },
    ]
  },
  {
    occasion: 'thank-you', tier: 1, cards: [
      { name: 'bouquet-gouache', prompt: 'Hand-painted gouache illustration of a wild Canadian flower bouquet in a mason jar, lupins, fireweed, black-eyed susans, thick opaque brushstrokes on warm cream background, folk art botanical style, no text no words no letters' },
      { name: 'syrup-risograph', prompt: 'Risograph print of a glass bottle of maple syrup with a red ribbon, autumn maple leaves scattered around, limited palette of amber, deep red, and brown on cream paper, ink grain texture visible, no text no words no letters' },
      { name: 'tea-midcentury', prompt: 'Mid-century modern illustration of a tea set with cookies on a table overlooking a Canadian garden, geometric shapes, retro colour palette of teal, mustard, coral, and cream, warm and inviting, no text no words no letters' },
      { name: 'bird-linocut', prompt: 'Linocut block print of a chickadee carrying a small envelope in its beak, perched on a pine branch, bold carved lines, two-colour print in navy and rust on cream paper, no text no words no letters' },
      { name: 'canoe-screenprint', prompt: 'Screen print style illustration of a red canoe on a glassy Canadian lake at sunrise, flat colour layers in warm gold, deep teal, forest green, and red, vintage travel poster aesthetic, no text no words no letters' },
      { name: 'garden-letterpress', prompt: 'Vintage letterpress illustration of a wooden garden gate covered in climbing roses, leading to a cottage garden, fine engraved line work, two-colour print in sage green and dusty rose on cotton paper, no text no words no letters' },
    ]
  },

  // ═══ TIER 2 — 4 cards each ═══
  {
    occasion: 'mothers-day', tier: 2, cards: [
      { name: 'flowers-gouache', prompt: 'Hand-painted gouache illustration of a lush peony and lilac arrangement in a vintage ceramic vase, soft pinks, lavenders, and creams, thick brushstrokes on warm background, romantic botanical style, no text no words no letters' },
      { name: 'garden-risograph', prompt: 'Risograph print of a woman tending a cottage garden full of hollyhocks and delphiniums, limited palette of rose pink, sage green, and gold, ink grain texture, warm nostalgic feeling, no text no words no letters' },
      { name: 'hummingbird-linocut', prompt: 'Linocut block print of a ruby-throated hummingbird hovering at a trumpet vine flower, bold carved lines, emerald green and ruby red ink on cream paper, natural elegance, no text no words no letters' },
      { name: 'teaset-midcentury', prompt: 'Mid-century modern illustration of a beautiful china tea set with wildflowers on a sunlit table, geometric shapes, soft retro palette of blush pink, sage, gold, and cream, warm afternoon light, no text no words no letters' },
    ]
  },
  {
    occasion: 'fathers-day', tier: 2, cards: [
      { name: 'fishing-gouache', prompt: 'Hand-painted gouache illustration of a fishing rod and tackle box on a wooden dock at a Canadian lake, morning mist, pine trees reflected in still water, warm earthy tones, painterly brushstrokes, no text no words no letters' },
      { name: 'bbq-risograph', prompt: 'Risograph print of a backyard BBQ scene with a charcoal grill, cold beverages, and Muskoka chairs, limited palette of charcoal, red, and amber on cream paper, summer vibes, ink grain texture, no text no words no letters' },
      { name: 'workshop-linocut', prompt: 'Linocut block print of a woodworking workshop with hand tools, wood shavings, a half-built birdhouse on workbench, bold carved lines, warm brown and navy ink on cream paper, no text no words no letters' },
      { name: 'canoe-screenprint', prompt: 'Screen print illustration of a father and child paddling a red canoe through autumn-coloured Canadian wilderness, flat colour layers in rust, gold, forest green, and navy, nostalgic warmth, no text no words no letters' },
    ]
  },
  {
    occasion: 'valentines', tier: 2, cards: [
      { name: 'loons-gouache', prompt: 'Hand-painted gouache illustration of two common loons swimming together on a misty lake at dawn, their reflections mirrored in still water, soft pinks and golds of sunrise, romantic and serene, no text no words no letters' },
      { name: 'winterwalk-risograph', prompt: 'Risograph print of a couple walking hand-in-hand through a snowy birch forest, limited palette of soft pink, warm grey, and gold, ink grain texture on cream paper, gentle romantic mood, no text no words no letters' },
      { name: 'cabin-linocut', prompt: 'Linocut block print of a cozy cabin with heart-shaped smoke rising from the chimney, snow on the roof, warm light in windows, carved lines in deep red and charcoal on cream paper, no text no words no letters' },
      { name: 'wildflower-screenprint', prompt: 'Screen print illustration of a heart shape made entirely of Canadian wildflowers — trilliums, fireweed, lupins, wild roses — flat colour layers in pinks, purples, and greens on cream, no text no words no letters' },
    ]
  },
  {
    occasion: 'wedding', tier: 2, cards: [
      { name: 'chairs-gouache', prompt: 'Hand-painted gouache illustration of two Muskoka chairs side by side on a dock overlooking a calm lake at sunset, intertwined wildflowers draped over armrests, golden warm light, romantic atmosphere, no text no words no letters' },
      { name: 'bircharch-risograph', prompt: 'Risograph print of a wedding arch made of birch branches and white wildflowers in a forest clearing, dappled sunlight, limited palette of sage green, blush pink, and gold on cream paper, no text no words no letters' },
      { name: 'lakeside-linocut', prompt: 'Linocut block print of a lakeside ceremony scene with lanterns hanging from pine trees, mountains in background, bold carved lines, navy and gold ink on cream paper, elegant simplicity, no text no words no letters' },
      { name: 'toast-midcentury', prompt: 'Mid-century modern illustration of two champagne glasses clinking with sparkles, geometric art deco style, limited palette of gold, cream, and soft pink, celebratory and elegant, no text no words no letters' },
    ]
  },
  {
    occasion: 'graduation', tier: 2, cards: [
      { name: 'cap-risograph', prompt: 'Risograph print of a graduation cap with a maple leaf pinned to it, tossed in the air against a blue sky, limited palette of navy, red, and gold on cream paper, celebratory ink grain texture, no text no words no letters' },
      { name: 'books-gouache', prompt: 'Hand-painted gouache illustration of a stack of books with autumn maple leaves as bookmarks, a warm cup of coffee beside them, cozy study atmosphere, rich warm colours, no text no words no letters' },
      { name: 'campus-linocut', prompt: 'Linocut block print of a collegiate bell tower with Canadian flag, autumn trees in foreground, bold carved lines, navy and burnt orange ink on cream paper, dignified and warm, no text no words no letters' },
      { name: 'openroad-screenprint', prompt: 'Screen print illustration of an open road stretching through Canadian Rockies with a sunrise ahead, flat colour layers in gold, teal, and warm grey, sense of possibility and adventure, no text no words no letters' },
    ]
  },

  // ═══ TIER 3 — 3 cards each ═══
  {
    occasion: 'new-baby', tier: 3, cards: [
      { name: 'woodland-gouache', prompt: 'Hand-painted gouache illustration of adorable Canadian woodland baby animals — a fox kit, baby bunny, and fawn — gathered in a meadow of wildflowers, soft pastel tones, gentle and whimsical nursery art style, no text no words no letters' },
      { name: 'moccasins-risograph', prompt: 'Risograph print of tiny beaded baby moccasins beside a small stuffed moose toy, limited palette of soft yellow, mint green, and warm grey on cream paper, tender and delicate, no text no words no letters' },
      { name: 'stork-linocut', prompt: 'Linocut block print of a great blue heron flying over Canadian mountain peaks carrying a small bundle, bold elegant lines, soft blue and gold ink on cream paper, whimsical and sweet, no text no words no letters' },
    ]
  },
  {
    occasion: 'get-well', tier: 3, cards: [
      { name: 'soup-gouache', prompt: 'Hand-painted gouache illustration of a steaming bowl of soup with fresh bread on a wooden table, a cozy knit blanket draped nearby, warm golden light from a window, comforting and nurturing, no text no words no letters' },
      { name: 'blanket-risograph', prompt: 'Risograph print of a cozy reading nook with a plaid blanket, hot tea, and a stack of books by a rainy window, limited palette of warm amber, soft blue, and cream, comforting mood, no text no words no letters' },
      { name: 'sunflowers-linocut', prompt: 'Linocut block print of tall sunflowers in a garden with a butterfly visiting, bold carved lines, cheerful yellow and green ink on cream paper, uplifting and bright, no text no words no letters' },
    ]
  },
  {
    occasion: 'thinking-of-you', tier: 3, cards: [
      { name: 'canoe-gouache', prompt: 'Hand-painted gouache illustration of a lone red canoe tied to a dock on a misty Canadian lake at dawn, soft blues and golds, reflective and peaceful atmosphere, painterly brushstrokes, no text no words no letters' },
      { name: 'aurora-risograph', prompt: 'Risograph print of northern lights dancing over a snowy boreal forest, limited palette of emerald green, purple, and navy on dark paper, ethereal ink grain texture, contemplative mood, no text no words no letters' },
      { name: 'trail-screenprint', prompt: 'Screen print illustration of an autumn hiking trail through a Canadian maple forest, flat colour layers in rich amber, crimson, gold, and brown, peaceful solitude, no text no words no letters' },
    ]
  },
  {
    occasion: 'just-because', tier: 3, cards: [
      { name: 'beaver-gouache', prompt: 'Hand-painted gouache illustration of a cheerful beaver holding a bouquet of wildflowers, standing by a stream with birch trees, whimsical folk art style, warm earthy tones, endearing expression, no text no words no letters' },
      { name: 'moose-linocut', prompt: 'Linocut block print portrait of a dignified moose with magnificent antlers, forest background with subtle northern lights, bold carved lines, deep green and amber ink on cream paper, no text no words no letters' },
      { name: 'mountains-screenprint', prompt: 'Screen print illustration of a panoramic Canadian Rocky Mountain vista with a turquoise lake, flat colour layers in teal, warm grey, and gold, vintage national park poster aesthetic, no text no words no letters' },
    ]
  },
  {
    occasion: 'congratulations', tier: 3, cards: [
      { name: 'fireworks-gouache', prompt: 'Hand-painted gouache illustration of fireworks bursting over Parliament Hill in Ottawa reflected in the Rideau Canal, bold expressive brushstrokes, deep navy sky with bursts of gold, red, and white, no text no words no letters' },
      { name: 'champagne-risograph', prompt: 'Risograph print of champagne glasses with effervescent bubbles and scattered confetti, limited palette of gold, coral pink, and navy on cream paper, celebratory and elegant, no text no words no letters' },
      { name: 'summit-screenprint', prompt: 'Screen print illustration of a hiker at a mountain summit with arms raised in triumph, vast Canadian landscape stretching below, flat colour layers in warm gold, teal, and charcoal, triumphant feeling, no text no words no letters' },
    ]
  },

  // ═══ TIER 4 — 3 cards each ═══
  {
    occasion: 'canada-day', tier: 4, cards: [
      { name: 'fireworks-gouache', prompt: 'Hand-painted gouache illustration of spectacular fireworks over a Canadian city skyline reflected in water, red and white bursts against deep blue sky, bold painterly strokes, patriotic and jubilant, no text no words no letters' },
      { name: 'parade-risograph', prompt: 'Risograph print of a small-town Canada Day parade with maple leaf flags, bunting, and marching band, limited palette of red, white, and navy on cream paper, nostalgic community celebration, no text no words no letters' },
      { name: 'flag-linocut', prompt: 'Linocut block print of a Canadian flag waving proudly against a bright blue sky with cumulus clouds, bold carved lines, vibrant red and white ink, strong and dignified, no text no words no letters' },
    ]
  },
  {
    occasion: 'thanksgiving', tier: 4, cards: [
      { name: 'harvest-gouache', prompt: 'Hand-painted gouache illustration of a rustic harvest table set outdoors with pumpkins, gourds, autumn leaves, and warm bread, golden afternoon light through maple trees, abundance and warmth, no text no words no letters' },
      { name: 'pumpkin-risograph', prompt: 'Risograph print of a pumpkin patch with a red barn in the background, autumn foliage in full colour, limited palette of burnt orange, deep red, and olive on cream paper, harvest season warmth, no text no words no letters' },
      { name: 'cornucopia-linocut', prompt: 'Linocut block print of a cornucopia overflowing with Canadian autumn harvest — apples, squash, corn, cranberries, maple leaves — bold carved lines, warm amber and burgundy ink on cream, no text no words no letters' },
    ]
  },
  {
    occasion: 'new-year', tier: 4, cards: [
      { name: 'midnight-gouache', prompt: 'Hand-painted gouache illustration of a midnight cityscape with fireworks and a clock striking twelve, bold brushstrokes, deep navy and gold palette with pops of silver, festive and hopeful, no text no words no letters' },
      { name: 'frozenlake-risograph', prompt: 'Risograph print of fireworks reflected in a frozen Canadian lake surrounded by snow-covered pines, limited palette of navy, gold, and silver on dark blue paper, magical winter night, no text no words no letters' },
      { name: 'champagne-screenprint', prompt: 'Screen print illustration of champagne popping with an explosion of stars and streamers, flat colour layers in gold, black, and white, art deco inspired, celebratory energy, no text no words no letters' },
    ]
  },
  {
    occasion: 'sympathy', tier: 4, cards: [
      { name: 'lake-gouache', prompt: 'Hand-painted gouache illustration of a quiet lake at twilight with a single canoe on shore, soft muted blues and lavenders, gentle and contemplative, a sense of peace and stillness, no text no words no letters' },
      { name: 'candle-risograph', prompt: 'Risograph print of a single lit candle in a window with rain on the glass, limited palette of warm amber, soft grey, and cream, gentle and reverent mood, no text no words no letters' },
      { name: 'forest-linocut', prompt: 'Linocut block print of a serene autumn forest path with light filtering through the canopy, bold carved lines, muted gold and deep green ink on cream paper, peaceful and meditative, no text no words no letters' },
    ]
  },
  {
    occasion: 'remembrance-day', tier: 4, cards: [
      { name: 'poppies-gouache', prompt: 'Hand-painted gouache illustration of a field of red poppies at sunset with a silhouetted cross memorial in the distance, deep reds and warm golds, respectful and solemn, Flanders fields inspired, no text no words no letters' },
      { name: 'cenotaph-risograph', prompt: 'Risograph print of a cenotaph memorial wreath with red poppies and autumn leaves at its base, limited palette of deep red, charcoal, and gold on cream paper, dignified and respectful, no text no words no letters' },
      { name: 'soldier-linocut', prompt: 'Linocut block print silhouette of a lone soldier standing at attention at dawn, poppy flowers in foreground, bold carved lines, deep crimson and black ink on cream paper, solemn tribute, no text no words no letters' },
    ]
  },
];

// ─── GOOGLE IMAGEN 4 API ─────────────────────────────────────────────────────

async function generateImage(prompt, filepath) {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: { numberOfImages: 1, aspectRatio: '3:4' },
  });

  const img = response.generatedImages[0];
  const buf = Buffer.from(img.image.imageBytes, 'base64');
  fs.writeFileSync(filepath, buf);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🍁 MapleCard — Occasion Card Generator (Imagen 4 via fal.ai)\n');

  const filtered = OCCASIONS.filter(o => {
    if (TIER_FILTER && o.tier !== TIER_FILTER) return false;
    if (OCCASION_FILTER && o.occasion !== OCCASION_FILTER) return false;
    return true;
  });

  const totalCards = filtered.reduce((sum, o) => sum + o.cards.length, 0);
  const estimatedCost = (totalCards * 0.04).toFixed(2);
  console.log(`   Occasions: ${filtered.length}`);
  console.log(`   Cards: ${totalCards}`);
  console.log(`   Estimated cost: ~$${estimatedCost}\n`);

  if (DRY_RUN) {
    for (const o of filtered) {
      console.log(`\n📁 ${o.occasion} (tier ${o.tier})`);
      for (const c of o.cards) {
        console.log(`   🖼️  ${c.name}`);
        console.log(`       ${c.prompt.slice(0, 120)}...`);
      }
    }
    console.log('\n✅ Dry run complete. Remove --dry to generate.');
    return;
  }

  let completed = 0;
  let failed = 0;

  for (const o of filtered) {
    const dir = path.join(__dirname, 'public', 'cards', o.occasion);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`\n📁 ${o.occasion} (tier ${o.tier})`);

    for (const c of o.cards) {
      const filepath = path.join(dir, `${c.name}.jpg`);

      // Skip if already exists
      if (fs.existsSync(filepath)) {
        console.log(`   ⏭️  ${c.name} (exists, skipping)`);
        completed++;
        continue;
      }

      try {
        console.log(`   🎨 ${c.name}...`);
        await generateImage(c.prompt, filepath);
        console.log(`   ✅ ${c.name}`);
        completed++;

        // Delay to avoid rate limits (~10 req/min)
        await new Promise(r => setTimeout(r, 8000));
      } catch (e) {
        console.error(`   ❌ ${c.name}: ${e.message}`);
        failed++;
        // Wait longer on error (rate limit)
        if (e.message.includes('429') || e.message.includes('RESOURCE_EXHAUSTED')) {
          console.log(`   ⏳ Rate limited, waiting 30s...`);
          await new Promise(r => setTimeout(r, 30000));
        } else {
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    }
  }

  console.log(`\n🍁 Done! ${completed} generated, ${failed} failed.`);
  console.log(`   Images saved to public/cards/`);
}

main();
