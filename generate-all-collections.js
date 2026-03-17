#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  MapleCard — Full Collection Generator                              ║
 * ║  Powered by Google Imagen 4                                         ║
 * ║                                                                     ║
 * ║  4 Collections:                                                     ║
 * ║    1. CPR Posters  (1930s–40s silkscreen railway travel poster)     ║
 * ║    2. Group of Seven  (bold post-impressionist oil painting)        ║
 * ║    3. Vintage Winter Wonderland  (1950s–60s greeting card warmth)   ║
 * ║    4. Mid-Century Tourism  (1950s–70s Parks Canada poster)          ║
 * ║                                                                     ║
 * ║  Locations:                                                         ║
 * ║    Major cities + smaller towns (Canmore, Lunenburg, Stratford,    ║
 * ║    Tofino, Niagara-on-the-Lake, London ON) + all 13 provinces      ║
 * ║                                                                     ║
 * ║  Multiple scene variants per location                               ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * SETUP:
 *   npm install @google/genai
 *   export GEMINI_API_KEY="your_key_from_aistudio.google.com"
 *
 * USAGE:
 *   node generate-all-collections.js                              → all cards, all collections
 *   node generate-all-collections.js --collection=cpr            → CPR posters only
 *   node generate-all-collections.js --collection=group7         → Group of Seven only
 *   node generate-all-collections.js --collection=winter         → Winter Wonderland only
 *   node generate-all-collections.js --collection=tourism        → Mid-Century Tourism only
 *   node generate-all-collections.js --set=cities                → cities only (all collections)
 *   node generate-all-collections.js --set=towns                 → small towns only
 *   node generate-all-collections.js --set=provinces             → provinces only
 *   node generate-all-collections.js --card=canmore              → single location, all collections
 *   node generate-all-collections.js --card=canmore --collection=cpr  → single + single collection
 *   node generate-all-collections.js --model=ultra               → best quality ($0.06/img)
 *   node generate-all-collections.js --count=2                   → 2 variants per card
 *   node generate-all-collections.js --card=lunenburg --dry      → preview prompts only
 *
 * COST ESTIMATE (4 variants per card, standard model $0.04):
 *   Single location, 4 collections  →  ~$0.64
 *   All cities (10), 1 collection   →  ~$1.60
 *   All towns (6), 1 collection     →  ~$0.96
 *   All provinces (13), 1 collection → ~$2.08
 *   Full run (all, all collections) →  ~$18.56
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── API KEY ──────────────────────────────────────────────────────────────────

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('\n❌  No API key found.');
  console.error('    export GEMINI_API_KEY="your_key_here"');
  console.error('    Get one free at: aistudio.google.com → Get API key\n');
  process.exit(1);
}

// ─── CLI ARGS ─────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; })
);

// ─── MODELS ───────────────────────────────────────────────────────────────────

const MODELS = {
  fast:     'imagen-4.0-fast-generate-001',   // $0.02/img  fast iteration
  standard: 'imagen-4.0-generate-001',        // $0.04/img  flagship (default)
  ultra:    'imagen-4.0-ultra-generate-001',  // $0.06/img  highest fidelity
};
const MODEL   = MODELS[args.model || 'standard'];
const COUNT   = Math.min(4, Math.max(1, parseInt(args.count || '4')));
const DRY_RUN = args.dry === true;
const OUT_DIR = path.join(__dirname, 'output');
if (!DRY_RUN) fs.mkdirSync(OUT_DIR, { recursive: true });

// ═══════════════════════════════════════════════════════════════════════════════
// COLLECTION 1 — CPR POSTER
// Authentic 1930s–40s silkscreen lithograph railway poster aesthetic.
// The Banff card proved the recipe: flat colour, 5-layer depth, couple viewed
// from behind, cream border, red script + amber block type.
// ═══════════════════════════════════════════════════════════════════════════════

const CPR_STYLE = `
Authentic vintage Canadian Pacific Railway travel poster,
1930s–1940s painterly silkscreen lithograph illustration.
Flat colour zones with soft hand-rendered brushwork transitions between tones.
Rich warm palette: burnt amber and orange rock faces, turquoise-teal rivers and lakes,
deep forest green spruce trees, warm golden sunlight, pale cream-yellow sky.
5-layer atmospheric depth: dark detailed foreground → warm lit mid-ground with main subject
→ dense tree belt → pale blue-grey hazy distant background → warm cream-yellow sky.
Cream parchment poster border with thin elegant double-rule frame.
Portrait 2:3 aspect ratio. Highly detailed, beautiful painterly composition.
`.trim().replace(/\s+/g, ' ');

const CPR_TYPOGRAPHY = `
Cream-coloured bottom panel with poster typography:
main destination name in large elegant red-brown italic cursive script font,
subtitle in bold amber-brown block capitals with wide letter-spacing.
Precise accurate legible typography, correct spelling, vintage poster lettering style.
`.trim().replace(/\s+/g, ' ');

// ═══════════════════════════════════════════════════════════════════════════════
// COLLECTION 2 — GROUP OF SEVEN
// Bold post-impressionist oil painting style inspired by Tom Thomson,
// Lawren Harris, A.Y. Jackson, J.E.H. MacDonald. Thick brushwork, vivid colour,
// silhouetted trees, dramatic skies, emotional landscape. No people.
// ═══════════════════════════════════════════════════════════════════════════════

const G7_STYLE = `
Canadian Group of Seven oil painting style, post-impressionist landscape art,
1920s–1930s. Thick expressive impasto brushwork with visible paint texture.
Bold flat colour zones for sky and water inspired by Tom Thomson's Jack Pine.
Vivid heightened palette: blazing autumn reds and oranges, deep viridian greens,
cerulean and cobalt blues, burnt ochre and vermilion, rich teal and turquoise.
Strong silhouetted dark foreground elements (pine trees, rock outcrops, shoreline)
against vivid sky in the manner of Thomson and Harris. No people.
Dramatic emotional composition conveying the spiritual force of the Canadian wilderness.
Heavily textured paint surface, visible brushwork direction following landscape forms.
Square or slightly horizontal canvas composition. Museum-quality fine art painting.
`.trim().replace(/\s+/g, ' ');

const G7_TYPOGRAPHY = `
Artwork title card at bottom: location name in elegant serif font on cream background,
small text reading "Canada" below. Clean museum label aesthetic.
`.trim().replace(/\s+/g, ' ');

// ═══════════════════════════════════════════════════════════════════════════════
// COLLECTION 3 — VINTAGE WINTER WONDERLAND
// 1950s–60s Canadian greeting card illustration aesthetic. Soft gouache or
// watercolour, warm palette of deep red, forest green, navy and gold.
// Cosy domestic and outdoor scenes. Nostalgic, warm, specifically Canadian.
// Perfect for boomers — this is the visual language of their childhood cards.
// ═══════════════════════════════════════════════════════════════════════════════

const WINTER_STYLE = `
1950s Canadian greeting card illustration, vintage mid-century style.
Warm gouache or watercolour illustration technique, slightly textured paper.
Rich nostalgic palette: deep forest green, Christmas red, warm cream and ivory,
gold and amber, navy midnight blue, soft warm white snow.
Cosy warm scenes of Canadian winter life with glowing amber windows and lanterns.
Charming illustrative style with gentle outlines and flat tonal shading.
Snow depicted as soft rounded forms, warm light spilling from windows onto snow.
Figures in 1950s winter fashion: wool coats, fur-trim hats, scarves, mittens.
Friendly warm atmosphere, nostalgic mid-century charm. Landscape 3:2 aspect ratio.
`.trim().replace(/\s+/g, ' ');

const WINTER_TYPOGRAPHY = `
Decorative greeting card lettering at top or bottom:
location name in warm red rounded hand-lettered font,
season or greeting in elegant italic below.
Mid-century card typography with festive charm.
`.trim().replace(/\s+/g, ' ');

// ═══════════════════════════════════════════════════════════════════════════════
// COLLECTION 4 — MID-CENTURY TOURISM POSTER
// 1950s–70s Parks Canada and provincial tourism poster aesthetic.
// Cleaner and more graphic than CPR — bold flat colour, confident sans-serif type,
// wholesome outdoor recreation, family summer scenes. More accessible warmth
// than CPR's grand railway drama. Think: family canoe trip, hiking, fishing.
// ═══════════════════════════════════════════════════════════════════════════════

const TOURISM_STYLE = `
1950s–1970s Canadian provincial tourism poster, Parks Canada graphic design style.
Clean bold graphic illustration with confident flat colour areas.
Bright optimistic summer palette: clear sky blue, forest green, lake turquoise,
warm golden yellow, warm white. Strong graphic shapes.
Wholesome outdoor recreation scenes: canoeing, hiking, fishing, camping, swimming.
Figures in 1950s–60s outdoor clothing: plaid shirts, canvas shorts, sun hats.
Clean graphic lines, friendly accessible composition, optimistic summer feeling.
National Park sign aesthetic with strong typography areas.
Portrait or landscape 2:3 aspect ratio. Crisp graphic poster art style.
`.trim().replace(/\s+/g, ' ');

const TOURISM_TYPOGRAPHY = `
Clean bold poster typography:
location name in large confident sans-serif capitals,
"CANADA" or province name in smaller caps below,
"VISIT" or tagline above in coloured banner. 1960s tourism poster lettering.
`.trim().replace(/\s+/g, ' ');

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATIONS — MAJOR CITIES
// Each location has multiple scene variants per collection.
// ═══════════════════════════════════════════════════════════════════════════════

const LOCATIONS = {

  // ─── MAJOR CITIES ────────────────────────────────────────────────────────────

  banff: {
    group: 'cities',
    label: 'Banff',
    province: 'Alberta',
    tagline_cpr: 'IN THE CANADIAN ROCKIES',
    tagline_tourism: 'BANFF NATIONAL PARK',
    // Research: Canada's first national park (1885), Fairmont Banff Springs Hotel (1888),
    // Bow River, Cave and Basin, Lake Louise, Sulphur Mountain, Hoodoos.
    // The Banff Springs Hotel was called "Castle in the Rockies" in CPR promotional material.
    scenes: {
      cpr: [
        // Scene 1: Classic — the gold standard prompt that produced the reference image
        `Fairmont Banff Springs Hotel château nestled in deep forested Bow Valley,
        dramatic amber and burnt-orange Rocky Mountain peaks towering both sides,
        white glacial snow streaking upper cliffs, pale blue hazy mountains in far distance,
        turquoise Bow River winding through valley floor left of centre,
        dense dark green spruce forest covering all slopes,
        warm golden afternoon light from upper left illuminating amber rock faces,
        couple seated on rocky outcrop lower right foreground viewed from behind,
        woman in yellow blouse man in white shirt, gazing at hotel and valley.`,
        // Scene 2: Cave and Basin hot spring pools
        `Banff's sulphur hot spring pools steaming gently in mountain meadow at dawn,
        amber and rose Rocky Mountain peaks glowing in first light above,
        turquoise geothermal pool in foreground with rising mist,
        Bow Valley forest stretching both sides,
        couple in 1940s bathrobes on pool terrace foreground viewed from behind,
        pale cream-yellow dawn sky warming above distant peaks.`,
        // Scene 3: Icefields Parkway viewpoint with hoodoos
        `Dramatic Banff hoodoos — tall eroded sandstone columns — in warm amber afternoon light,
        Bow River valley spread below, mountains in every direction,
        dense spruce forest filling slopes, snow-capped peaks beyond,
        couple standing on rocky viewpoint foreground viewed from behind,
        layered atmospheric depth with five distinct mountain ranges fading to hazy blue.`,
      ],
      group7: [
        // Oil painting: Bow Lake with reflection, autumn colours
        `Bow Lake mirror-still at autumn peak, brilliant red and orange larches reflected perfectly,
        dark spruce forest framing both sides, snow-capped peaks above,
        lone twisted pine silhouetted on rocky shore foreground in Thomson style,
        vivid cerulean sky with billowing white clouds catching light,
        thick impasto brushwork, blazing vermilion and orange foliage.`,
        // Oil painting: Storm over the Rockies
        `Storm clouds rolling over Banff's front ranges, dramatic dark purple and grey sky,
        shafts of golden light breaking through to illuminate amber rock faces below,
        turbulent spruce trees in wind on rocky foreground ledge,
        jagged silhouetted peaks against violet storm sky in Harris style,
        emotional charged atmosphere, dark foreground rock against luminous sky.`,
      ],
      winter: [
        // Cosy: skating on frozen Bow River, Banff Springs in background
        `Cosy 1950s winter scene: families skating on frozen Bow River at dusk,
        Fairmont Banff Springs Hotel glowing amber in background,
        snow-covered spruce trees lining both banks,
        figures in colourful 1950s winter coats and scarves on ice,
        warm amber lantern light reflecting on snow, deep blue winter sky above.`,
        // Cosy: horse-drawn sleigh through Banff townsite
        `Horse-drawn sleigh carrying wrapped-up 1950s family through snow-covered Banff townsite,
        Rocky Mountain peaks against deep blue winter sky,
        glowing shopfronts and warm windows on either side of snowy street,
        two black horses with bells, happy family waving from sleigh,
        soft warm golden light on snow, deep forest green spruce trees.`,
      ],
      tourism: [
        // Parks Canada: hikers at Lake Louise
        `Bold 1960s tourism poster: couple in plaid hiking shirts at Lake Louise,
        impossibly blue-green glacial lake in mid-ground,
        Victoria Glacier white and clean above, towering rocky peaks both sides,
        Chateau Lake Louise in distance right,
        crisp graphic flat colour style, confident bold composition.`,
        // Parks Canada: canoe on Vermilion Lakes
        `Bright 1960s tourism scene: family in red canoe on Vermilion Lakes,
        Mount Rundle dramatic layered peak reflection in still water,
        clear sky blue above, forest green shoreline,
        man in plaid shirt paddling, woman and child in sun hats,
        clean graphic poster style, optimistic summer feeling.`,
      ],
    },
  },

  calgary: {
    group: 'cities',
    label: 'Calgary',
    province: 'Alberta',
    tagline_cpr: 'GATEWAY TO THE ROCKIES',
    tagline_tourism: 'HEART OF THE WEST',
    // Research: CPR founded Calgary (1875 NWMP fort, 1883 railway town), Stampede since 1912,
    // Chinook arch cloud phenomenon, Peace Bridge by Santiago Calatrava,
    // Wonderland sculpture by Jaume Plensa (floating head), East Village,
    // Reader Rock Garden (oldest heritage garden in Calgary), National Music Centre (Studio Bell).
    scenes: {
      cpr: [
        // Scene 1: Cowboy on foothills with mountains
        `Wide Alberta foothills valley at golden harvest hour,
        vast golden wheat fields filling foreground rippling in warm light,
        cowboy on horseback silhouette on grassy ridge right foreground viewed from behind,
        dramatic chinook arch cloud band sweeping across brilliant blue sky,
        distant snow-capped Rocky Mountain peaks on horizon left,
        rolling amber foothills in mid-ground,
        couple standing on hill left foreground viewed from behind gazing at mountains.`,
        // Scene 2: Calgary Stampede — chuckwagon and grandstand
        `Calgary Stampede chuckwagon race at sunset, dust rising in amber light,
        four horse teams thundering around track with colourful wagons,
        1940s rodeo crowd in grandstand left,
        Alberta blue sky turning amber and rose at horizon,
        Rocky Mountain silhouette in far distance through warm haze,
        couple in 1940s western dress on rail foreground viewed from behind.`,
        // Scene 3: Peace Bridge over Bow River, downtown skyline
        `Calgary Peace Bridge elegant red-and-white tubular arch spanning Bow River,
        downtown Calgary towers silhouette against amber sunset sky,
        cottonwood trees blazing yellow along river banks,
        Rocky Mountains hazy blue on horizon right,
        couple on riverbank foreground viewed from behind watching sunset over city.`,
      ],
      group7: [
        // Thomson-style: foothills autumn
        `Sweeping Alberta foothills in peak autumn, rolling golden hills and red aspen groves,
        dramatic chinook arch sky — half blue, half amber — split across composition,
        dark sienna and ochre grassland foreground with fence posts,
        distant snow-capped Rockies on horizon, thick impasto brushwork.`,
        // Harris-style: prairie storm
        `Storm front approaching across Alberta prairie, massive dark purple cloud tower,
        golden stubble field in sharp foreground contrast against dark sky,
        shafts of light breaking through clouds to illuminate distant field,
        simplified bold forms in Lawren Harris geometric abstract style.`,
      ],
      winter: [
        // Stampede parade in winter — wait, Stampede is summer — use Winter Festival
        `Cosy 1955 winter scene: Calgary family on outdoor skating rink at dusk,
        mounted RCMP officer in scarlet uniform watching from horseback,
        snow-covered Rocky Mountains glowing in last light on horizon,
        warm amber lanterns around rink, families in colourful winter coats,
        deep blue Alberta winter sky, city lights just beginning to twinkle.`,
        // Christmas in the Beltline
        `Warm 1950s Calgary Christmas Eve scene: family arriving at lit church in snowstorm,
        horse-drawn sleigh pulling up to stone church with golden windows,
        snow-laden spruce trees lining street,
        warm amber light pouring from open church doors onto fresh snow,
        Rocky Mountain silhouette barely visible through snowfall behind.`,
      ],
      tourism: [
        // Stampede poster
        `Bold 1965 tourism poster: cowboy on bucking bronco at Calgary Stampede,
        crowd of cheering spectators in background,
        bright red grandstand, blue Alberta sky,
        "Calgary Stampede" in large western lettering, flat graphic colour.`,
        // Foothills hiking
        `Bright 1960s scene: family hiking on Alberta foothills trail,
        Rolling golden hills leading to distant Rocky Mountain wall,
        man in plaid shirt, woman in capri pants, two children,
        wildflowers in foreground, clear blue sky, graphic poster style.`,
      ],
    },
  },

  vancouver: {
    group: 'cities',
    label: 'Vancouver',
    province: 'British Columbia',
    tagline_cpr: "CANADA'S PACIFIC GATEWAY",
    tagline_tourism: 'GATEWAY TO THE PACIFIC',
    // Research: Lions Gate Bridge (1938), Stanley Park (1888), totem poles at Brockton Point,
    // Gastown steam clock (1977), Granville Island Public Market (1979), Capilano Suspension Bridge,
    // Vancouver Lookout, English Bay, Siwash Rock in Stanley Park.
    scenes: {
      cpr: [
        // Scene 1: Lions Gate Bridge
        `Lions Gate Bridge amber suspension towers and cables spanning Burrard Inlet,
        fresh-snow North Shore mountains dramatically framed through bridge cables,
        Stanley Park dense dark Douglas fir forest filling entire left foreground,
        downtown Vancouver skyline hazy in distance right,
        dark blue-grey inlet water below with freighter,
        dramatic clouds with shafts of warm light illuminating amber bridge,
        couple on Stanley Park seawall foreground viewed from behind gazing at bridge.`,
        // Scene 2: Totem poles at Brockton Point, Stanley Park
        `Three tall First Nations totem poles at Stanley Park Brockton Point in morning light,
        North Shore mountains snow-capped and brilliant across Burrard Inlet,
        Stanley Park forest dense dark green framing scene,
        calm inlet water reflecting mountains and blue sky,
        couple walking on path foreground viewed from behind towards totems.`,
        // Scene 3: English Bay at sunset
        `English Bay sunset view: brilliant crimson and gold sky over Strait of Georgia,
        freighter silhouettes on dark water, North Shore mountains in last light,
        golden sandy beach foreground with driftwood logs,
        dark silhouetted palm trees and beach people strolling,
        couple seated on driftwood log foreground viewed from behind watching sunset.`,
      ],
      group7: [
        // Emily Carr-style: dark forest
        `Dense ancient Douglas fir forest, towering trunks spiral upward into cathedral canopy,
        shafts of pale green-grey light filtering through high branches,
        deep viridian and emerald moss-covered forest floor,
        Emily Carr-inspired swirling sky glimpsed above through branches,
        powerful overwhelming forest presence, oil-on-canvas texture.`,
        // Thomson-style: Howe Sound
        `Howe Sound at peak autumn seen from above, fiord flanked by dark forested mountains,
        brilliant red and orange maple trees on lower slopes,
        deep blue fiord water perfectly calm, small fishing boat,
        heavy impasto sky in Turner and Thomson style, thick cloud drama.`,
      ],
      winter: [
        // Christmas in Vancouver: Gastown steam clock in snow
        `Rare Vancouver snowfall: Gastown steam clock puffing gentle clouds in falling snow,
        gas-lamp decorated Victorian streetscape with warm glowing shop windows,
        cobblestone street lightly dusted with snow, 1950s-dressed shoppers,
        warm amber light spilling from bookshop and bakery,
        harbour visible at end of street in blue winter light.`,
        // Skiing at Grouse Mountain
        `Grouse Mountain ski lodge glowing warmly at 1950s dusk,
        happy skiers in bright colourful snowsuits returning to lit log lodge,
        Vancouver city lights sparkling far below through clearing clouds,
        snow-laden pine trees framing scene,
        family in 1950s ski fashions by outdoor fire pit.`,
      ],
      tourism: [
        // Stanley Park totem poles and harbour
        `Bold 1960s tourism poster: Stanley Park totem poles in foreground,
        Lions Gate Bridge and North Shore mountains behind,
        clear blue sky, Burrard Inlet deep blue-green,
        couple in summer clothes at base of totems,
        clean graphic flat colour, confident composition.`,
        // Granville Island and false creek
        `Bright 1965 tourism scene: False Creek with sailboats,
        Granville Island Public Market building in background,
        North Shore mountains rising beyond,
        family on dock with picnic basket,
        clear graphic style, vivid blue and green palette.`,
      ],
    },
  },

  toronto: {
    group: 'cities',
    label: 'Toronto',
    province: 'Ontario',
    tagline_cpr: 'ON LAKE ONTARIO',
    tagline_tourism: 'THE QUEEN CITY',
    // Research: CN Tower (1976), Distillery District (Gooderham & Worts 1832), Scarborough Bluffs
    // (90m chalk cliffs), Toronto Islands, Kensington Market, Bata Shoe Museum,
    // Hockey Hall of Fame, Evergreen Brick Works, Casa Loma castle (1914),
    // Flatiron / Gooderham Building.
    scenes: {
      cpr: [
        // Scene 1: CN Tower sunset reflection
        `CN Tower silhouette against spectacular crimson and amber sunset sky,
        layered clouds in vivid red orange gold,
        tower and city skyline perfectly reflected in Lake Ontario below,
        autumn maple trees blazing red and orange lining waterfront both sides,
        couple on lakeshore rocky outcrop foreground viewed from behind watching sunset,
        sailboat on golden reflected lake, warm amber light bathing everything.`,
        // Scene 2: Scarborough Bluffs
        `Scarborough Bluffs dramatic white and cream chalk cliffs 90 metres tall,
        Lake Ontario deep blue-grey stretching to horizon beyond,
        amber autumn forest crowning clifftop in warm afternoon light,
        couple on beach foreground viewed from behind gazing up at towering bluffs,
        natural layers of sediment in cliff face visible, golden warm light.`,
        // Scene 3: Casa Loma castle at autumn dusk
        `Casa Loma romantic castle turrets and towers against deep amber dusk sky,
        maple trees in peak autumn blaze of red and orange framing castle on hill,
        illuminated stained glass windows glowing amber from within,
        ivy-covered stone walls in warm gold light,
        couple on garden path foreground viewed from behind gazing at castle.`,
      ],
      group7: [
        // Thomson: Toronto Islands in autumn
        `Toronto Islands group in peak October, brilliant red and yellow maples,
        city skyline faint silhouette across shimmering grey-blue lake,
        dark pine foreground with wind-blown branches à la The West Wind,
        heavy impasto autumn sky in golds and blue-greys.`,
        // Varley-influenced: Lake Ontario storm
        `Lake Ontario in November storm, vast dark blue-grey lake churned to white-caps,
        stripped bare birch trees on rocky shore foreground in turbulent wind,
        city lights faint in stormy distance, dramatic dark sky with breaking light,
        Varley-inspired emotional coastal composition.`,
      ],
      winter: [
        // Nathan Phillips Square skating rink
        `Toronto's Nathan Phillips Square outdoor rink at 1960s Christmas,
        skaters in colourful coats circling rink, City Hall arches above,
        decorated Christmas tree in centre of rink,
        warm amber light on snow around rink,
        family arriving with skates over shoulders.`,
        // Kensington Market in snow
        `Kensington Market at 1955 Christmas: colourful Victorian shopfronts in snow,
        fruit and vegetable stalls outside with covered awnings,
        string lights and Christmas wreaths decorating storefronts,
        shoppers in winter coats carrying baskets, horse and cart on street,
        warm glowing windows, gently falling snow.`,
      ],
      tourism: [
        // Islands ferry poster
        `Bright 1965 tourism poster: Toronto Island ferry on Lake Ontario,
        CN Tower not yet built — 1950s Toronto skyline in background,
        summer crowd on ferry deck in sun hats,
        deep blue lake, clear sky, graphic flat colour.`,
        // Distillery District
        `Bold 1960s poster: Gooderham Flatiron Building corner perspective,
        St. James Cathedral spire visible behind,
        horse-drawn dray in Victorian cobblestone street,
        amber brick buildings in warm autumn light, graphic style.`,
      ],
    },
  },

  montreal: {
    group: 'cities',
    label: 'Montréal',
    province: 'Québec',
    tagline_cpr: 'LA MÉTROPOLE DU CANADA',
    tagline_tourism: 'VILLE LUMIÈRE DU CANADA',
    // Research: Mont Royal cross (1643 Maisonneuve vow, illuminated 1924), Vieux-Montréal,
    // Gibeau Orange Julep giant orange ball drive-in (1945), Leonard Cohen mural (21 storeys),
    // Square Victoria Paris Métro entrance (only one outside France), Notre-Dame Basilica (1829),
    // Le Plateau spiral staircases, St. Joseph's Oratory (Brother André), Oratoire dome.
    scenes: {
      cpr: [
        // Scene 1: Mont Royal illuminated cross
        `Grand view through stone Art Deco archway framing Mont Royal at dusk,
        illuminated cross on Mont Royal hill glowing amber against deep violet sky,
        Montréal city lights twinkling below the hill,
        couple in 1940s formal dress viewed from behind on stone terrace within arch,
        man in dark suit woman in elegant blue evening gown,
        St. Lawrence River shimmering far below,
        warm amber foreground terrace, deep violet and gold sky beyond arch.`,
        // Scene 2: Vieux-Montréal Place Jacques-Cartier
        `Vieux-Montréal Place Jacques-Cartier cobblestone square at evening,
        Nelson Column centre plaza, Hôtel de Ville illuminated above,
        Notre-Dame Basilica twin towers visible at end of street,
        outdoor café terraces lit with warm lanterns, 1940s-dressed diners,
        couple arm-in-arm promenading foreground viewed from behind.`,
        // Scene 3: Notre-Dame Basilica interior light
        `Notre-Dame Basilica Montréal exterior at dusk — twin Gothic towers,
        St. Lawrence River visible behind in distance,
        Vieux-Port cobblestone in foreground,
        couple in 1940s Sunday dress on church steps foreground viewed from behind.`,
      ],
      group7: [
        // Autumn on Mont Royal — Jackson-style
        `Mont Royal in full October blaze, red and orange maple trees carpeting the hill,
        Montréal city visible below through autumn canopy,
        Belvedere viewpoint with iron railing in foreground,
        bold flat colour zones in Jackson style, vivid autumn palette.`,
        // St. Lawrence River in autumn
        `St. Lawrence River broad and grey-blue in October, islands with autumn colour,
        Montréal skyline faint in morning mist background,
        dark maple and birch trees on rocky foreground shore,
        heavy impasto sky with racing clouds in autumn light.`,
      ],
      winter: [
        // Mont Royal toboggan slope
        `Gleeful 1955 family on Mount Royal toboggan run at dusk,
        mother and children on wooden toboggan, father pushing at top,
        illuminated cross visible on hilltop behind,
        Montréal city lights spreading below through trees,
        warm amber lantern light on snow, deep blue sky, colourful winter clothing.`,
        // Vieux-Montréal Christmas
        `Vieux-Montréal rue Saint-Paul in Christmas snow, 1955,
        stone buildings decorated with pine boughs and red ribbons,
        horse-drawn sleigh passing through lantern-lit street,
        warm amber glow from restaurant windows on cobblestones,
        couple arm-in-arm in winter coats, gently falling snow.`,
      ],
      tourism: [
        // Expo 67 poster aesthetic
        `Bold 1967 Expo 67 inspired tourism poster: Buckminster Fuller's geodesic dome Biosphere,
        St. Lawrence River in background, Montreal flags flying,
        crowds in 1967 fashions approaching dome,
        graphic modernist flat colour style, optimistic future aesthetic.`,
        // Jazz Festival
        `Bright 1960s tourism poster: outdoor jazz performance on Plateau Montréal,
        stone spiral staircases of Le Plateau visible on townhouse facades,
        jazz trio on outdoor stage, summer crowd below,
        warm amber evening light, graphic flat colour.`,
      ],
    },
  },

  ottawa: {
    group: 'cities',
    label: 'Ottawa',
    province: 'Ontario',
    tagline_cpr: "CANADA'S CAPITAL",
    tagline_tourism: 'THE CAPITAL OF CANADA',
    // Research: Parliament Hill Centre Block (Peace Tower 1927), Rideau Canal (UNESCO World Heritage,
    // world's longest outdoor skating rink in winter), Diefenbunker Cold War nuclear bunker
    // (now world's largest escape room), Rideau Hall, ByWard Market (1826 — oldest in Canada),
    // Canadian Museum of History across river, Nepean Point viewpoint, BeaverTails origin.
    scenes: {
      cpr: [
        // Scene 1: Rideau Canal skating
        `Parliament Hill Centre Block with Peace Tower glowing golden at winter dusk,
        Rideau Canal frozen solid stretching to foreground,
        1940s-dressed skaters in colourful winter clothing on canal,
        snow-covered banks with snow-laden spruce trees both sides of canal,
        Canadian flag flying, pink and lavender winter sunset sky above Parliament,
        Ottawa River visible right background,
        couple skating hand-in-hand foreground viewed from behind.`,
        // Scene 2: Tulip Festival on Parliament Hill
        `Parliament Hill in Ottawa Tulip Festival peak, millions of tulips covering every lawn,
        Centre Block and Peace Tower above sea of red yellow pink white blooms,
        Ottawa River and Gatineau Hills visible in distance,
        couple strolling through tulip beds foreground viewed from behind,
        brilliant spring sky with racing white clouds.`,
        // Scene 3: ByWard Market at autumn harvest
        `Ottawa ByWard Market outdoor stalls in peak autumn, 1940s harvest time,
        stalls piled with pumpkins, squash, apples, corn, maple syrup jugs,
        market vendors in aprons, shoppers in 1940s coats,
        Parliament Hill Peace Tower visible above rooftops in background,
        warm amber October afternoon light on cobblestones.`,
      ],
      group7: [
        // MacDonald-style: Gatineau autumn
        `Gatineau Park in peak autumn blazing colour viewed from Champlain Lookout,
        Ottawa River valley spread below in autumn glory,
        brilliant red and orange trees in all directions to horizon,
        bold flat colour zones in MacDonald Tangled Garden style,
        dramatic thick paint, rich warm palette.`,
        // Parliament at night — Harris-inspired
        `Parliament Hill at midsummer midnight, Peace Tower against vivid blue night sky,
        Centre Block illuminated, Ottawa River black below,
        silhouetted spruce trees foreground,
        bold simplified forms in Harris late style.`,
      ],
      winter: [
        // Canal skating family scene
        `1955 family outing on Rideau Canal in bright winter afternoon,
        children in red and blue snowsuits learning to skate,
        BeaverTails stand with warm steam visible at rink side,
        Parliament Hill gleaming white above frozen canal,
        happy family figures, warm amber winter light, clear blue sky.`,
        // Changing of the Guard in snow
        `Changing of the Guard ceremony on Parliament Hill in unexpected May snowfall,
        scarlet-uniformed Guards in bearskin hats in falling snow,
        Centre Block stone façade behind, Canadian flag flying,
        Ottawa families watching in winter coats, gentle snow falling.`,
      ],
      tourism: [
        // Parliament Hill tulip poster
        `Bold 1960s tourism poster: Parliament Hill Peace Tower in Ottawa Tulip Festival,
        red and yellow tulip beds covering grounds in foreground,
        blue sky, Canadian flags flying, graphic flat colour style.`,
        // Rideau Canal winter poster
        `Bright 1965 Parks Canada poster: family skating on Rideau Canal,
        Parliament Hill visible in distance,
        ice skaters in colourful clothing, steam from riverside vendors,
        bold graphic illustration, winter blue and white palette.`,
      ],
    },
  },

  'quebec-city': {
    group: 'cities',
    label: 'Québec',
    province: 'Québec',
    tagline_cpr: 'LA VIEILLE CAPITALE',
    tagline_tourism: 'VIEUX-QUÉBEC',
    // Research: Château Frontenac (CPR hotel, 1893, most photographed hotel in world),
    // Dufferin Terrace boardwalk, funicular, Basse-Ville / Place Royale (1608 Champlain founding),
    // St. Lawrence River views, Carnival (toboggan runs, ice sculptures, Ice Palace),
    // Battlefields Park (Plains of Abraham), Cape Diamond.
    scenes: {
      cpr: [
        // Scene 1: Classic Château Frontenac
        `Château Frontenac castle towering magnificently above Lower Town at golden sunset,
        St. Lawrence River broad and shimmering in distance,
        Dufferin Terrace boardwalk promenade below château,
        snow-covered steep cliff with funicular,
        colourful Lower Town rooftops in foreground,
        couple on Dufferin Terrace foreground viewed from behind gazing at river,
        dramatic golden light on château stone, pale blue river to horizon.`,
        // Scene 2: Winter Carnival with ice palace
        `Québec Winter Carnival 1940s: enormous ice palace glowing blue and gold at night,
        Château Frontenac illuminated behind in distance,
        snowshoers and tobogganers in colourful 1940s winter costume,
        enormous snow sculptures lining Avenue Cartier,
        couple in traditional Ceinture fléchée sashes foreground viewed from behind.`,
        // Scene 3: Place Royale, Vieux-Québec Lower Town
        `Place Royale Vieux-Québec stone square at golden hour, 1940s,
        Notre-Dame-des-Victoires stone church centrepiece,
        17th-century stone merchant buildings surrounding square,
        St. Lawrence River visible through arch at far end,
        couple crossing cobblestones foreground viewed from behind.`,
      ],
      group7: [
        // Autumn on Cap Diamant
        `Cape Diamond above Québec City in autumn blaze, stunning St. Lawrence River panorama,
        brilliant red and orange forest on lower slopes,
        river curving to horizon in deep blue-grey,
        Île d'Orléans visible in river distance,
        bold Thomson-inspired silhouette composition.`,
        // Plains of Abraham in winter
        `Battlefields Park Plains of Abraham in January, pure white snow fields,
        Château Frontenac a distant amber jewel against purple-blue winter sky,
        dark spruce trees in sharp foreground silhouette,
        Harris-inspired stripped abstraction, clear winter palette.`,
      ],
      winter: [
        // Carnival toboggan run
        `Quebec Winter Carnival 1958: families on the famous ice toboggan run,
        toboggan launching off ice ramp with happy family aboard,
        ice palace glowing blue in background,
        spectators in bright winter ceinture fléchée coats and toques,
        festive warm atmosphere despite cold, amber lanterns on ice.`,
        // Christmas Eve, Château Frontenac
        `Christmas Eve snowfall, Château Frontenac glowing amber and green,
        horse-drawn calèche on snow-covered Dufferin Terrace,
        St. Lawrence River barely visible in blue-black distance,
        1955 family alighting from calèche in winter finery,
        warm amber hotel windows, soft snow falling.`,
      ],
      tourism: [
        // Château Frontenac poster
        `Bold 1960s tourism poster: Château Frontenac towering over Dufferin Terrace,
        St. Lawrence River in distance, summer blue sky,
        couple at railing in summer clothes, tourisme Quebec graphic style.`,
        // Winter Carnival poster
        `Bright 1965 Winter Carnival poster: Bonhomme Carnaval snowman mascot,
        ice palace behind, Winter Carnival fireworks above,
        Quebec Carnival in bold French lettering, graphic poster style.`,
      ],
    },
  },

  halifax: {
    group: 'cities',
    label: 'Halifax',
    province: 'Nova Scotia',
    tagline_cpr: 'WARDEN OF THE NORTH',
    tagline_tourism: 'ATLANTIC GATEWAY',
    // Research: Halifax Citadel (1856 National Historic Site), tall ships, Georges Island lighthouse,
    // Fairview Lawn Cemetery (121 Titanic victims, 1912), Halifax Public Gardens (Victorian, 1867,
    // oldest public gardens in North America), Alexander Keith's Brewery (1820, oldest in North America),
    // The Hydrostone neighbourhood (built after 1917 Halifax Explosion), Properties boardwalk.
    scenes: {
      cpr: [
        // Scene 1: Halifax Harbour with tall ship
        `Halifax Harbour at golden hour, tall ship with full white sails centre harbour,
        Citadel Hill star fort silhouette on hill above town right,
        colourful waterfront buildings red yellow blue along boardwalk,
        Georges Island lighthouse in middle distance,
        dark blue harbour water reflecting golden sky,
        two sailors in 1940s naval uniform on dock foreground viewed from behind
        watching the tall ship sail, dramatic amber and blue evening palette.`,
        // Scene 2: Halifax Public Gardens in bloom
        `Halifax Public Gardens in peak summer, Victorian bandstand in centre distance,
        formal garden beds blazing with colour in every direction,
        ornamental fountains and iron gates in foreground,
        couple in 1940s summer clothes on garden path foreground viewed from behind,
        soft warm afternoon light through canopy of old trees,
        iron fence and ornate gates in foreground, gardens spreading behind.`,
        // Scene 3: Alexander Keith's Brewery and waterfront
        `Alexander Keith's Brewery stone façade on Lower Water Street, 1940s Halifax,
        Halifax Harbour visible at end of street,
        horse-drawn dray delivering barrels from brewery,
        tall ship masts visible in harbour behind,
        couple walking on cobblestone street foreground viewed from behind.`,
      ],
      group7: [
        // Autumn colour, Point Pleasant Park
        `Point Pleasant Park Halifax in autumn, dark Atlantic Ocean through trees,
        brilliant red and orange maples on rocky coastal headland,
        McNabs Island faint in grey-blue sea distance,
        bold Thomson coastal composition, vivid colour against dark rocks.`,
        // Winter harbour
        `Halifax Harbour in January storm, massive grey Atlantic swells,
        Citadel Hill snow-covered above, garrison flag in wind,
        dark rocks on shore, white spray,
        Varley-inspired coastal drama, dark and powerful.`,
      ],
      winter: [
        // Public Gardens in Christmas snow
        `Halifax Public Gardens Victorian bandstand in Christmas snowfall,
        bare trees with string lights reflected in frozen fountain,
        families strolling in 1955 winter coats among snow-covered formal beds,
        warm amber lamppost light on snow, iron gates in foreground.`,
        // Properties boardwalk in winter
        `Halifax waterfront boardwalk in crisp winter afternoon, 1950s,
        tall ship in harbour with snow on rigging,
        Citadel Hill gleaming white above town behind,
        families in winter coats strolling boardwalk,
        harbour water cold blue, sky pale winter blue.`,
      ],
      tourism: [
        // Tall ships poster
        `Bold 1965 tourism poster: tall ship entering Halifax Harbour,
        Citadel Hill above town, summer blue sky,
        Halifax waterfront buildings, graphic flat colour style.`,
        // Citadel poster
        `Bright 1960s poster: Halifax Citadel star fort from above,
        harbour and city spread below, red-coated garrison soldiers,
        dark cannon in foreground, graphic bold style.`,
      ],
    },
  },

  winnipeg: {
    group: 'cities',
    label: 'Winnipeg',
    province: 'Manitoba',
    tagline_cpr: 'THE GATEWAY CITY',
    tagline_tourism: 'HEART OF THE CONTINENT',
    // Research: Forks National Historic Site (3,000 years of Indigenous gathering), Manitoba
    // Legislature (Hermetic Code symbols discovered by Dr. Frank Albo), Qaumajuq (world's largest
    // Inuit art collection at WAG), The Forks Market, Exchange District (most intact Victorian
    // commercial architecture in North America), Garbage Hill (highest point in city — actually
    // a covered landfill), St. Boniface Cathedral ruins and Riel grave, Prairie Theatre Exchange.
    scenes: {
      cpr: [
        // Scene 1: Red River and Manitoba Legislature
        `Manitoba Legislature golden Boy statue gleaming at sunset above Red River,
        Red River valley stretching in foreground, golden autumn trees on banks,
        Legislature dome reflecting in river below,
        CPR railway bridge visible right background,
        couple on riverbank foreground viewed from behind gazing at dome in golden light.`,
        // Scene 2: The Forks with Red River confluence
        `The Forks at Winnipeg: Red and Assiniboine Rivers meeting at golden hour,
        early autumn cottonwood trees blazing yellow on both banks,
        1940s Forks Market building on bank right,
        steam from heating plant rising in cool air,
        couple in autumn coats on riverside path foreground viewed from behind.`,
        // Scene 3: Exchange District Victorian streetscape
        `Winnipeg Exchange District Victorian commercial buildings in amber autumn light,
        ornate stone and brick facades with decorative cornices filling both sides,
        1940s automobiles and horse carts on cobblestone Bannatyne Avenue,
        couple in 1940s coats foreground viewed from behind walking along street.`,
      ],
      group7: [
        // MacDonald-influenced: Prairie sunset
        `Manitoba prairie sunset at harvest time, combines working golden wheat fields,
        enormous prairie sky ablaze with orange and crimson,
        grain elevator silhouette against burning horizon,
        bold flat colour zones, prairie vastness in MacDonald decorative style.`,
        // Red River in flood, spring
        `Red River in spring flood, vast sheet of water covering prairie to horizon,
        Manitoba big sky with racing storm clouds above flooded plain,
        lone farm building on raised ground, geese in flight,
        dramatic dark foreground, luminous reflective floodwater.`,
      ],
      winter: [
        // The Forks skating on Red River
        `The Forks Winnipeg in January: Red River Mutual Trail open for skating,
        families skating on river through downtown Winnipeg,
        The Forks Market building glowing warmly behind,
        warming huts in colourful architectural designs along river trail,
        1955 families in bright winter gear, golden afternoon light on ice.`,
        // Festival du Voyageur at St. Boniface
        `Festival du Voyageur St. Boniface Winnipeg: voyageur in 1800s fur trade costume,
        snow fort walls of Voyageur Winter Park behind,
        Métis family in traditional dress and ceinture fléchée,
        fiddle music festival tents in background,
        warm amber lanterns, gently falling snow.`,
      ],
      tourism: [
        // Forks heritage poster
        `Bold 1965 tourism poster: The Forks with river meeting in background,
        family in summer clothes at riverside,
        Winnipeg skyline beyond, graphic flat colour style.`,
        // Exchange District poster
        `Bright 1960s poster: Exchange District ornate stone buildings,
        horse-drawn dray and 1940s cars, cobblestones,
        warm amber street light, graphic architectural poster style.`,
      ],
    },
  },

  victoria: {
    group: 'cities',
    label: 'Victoria',
    province: 'British Columbia',
    tagline_cpr: 'THE GARDEN CITY',
    tagline_tourism: "CANADA'S GARDEN CITY",
    // Research: Fairmont Empress Hotel (1908), BC Legislature (copper dome), Inner Harbour,
    // Beacon Hill Park (free roaming peacocks, world's tallest totem pole),
    // Fan Tan Alley (narrowest commercial street in Canada — Fan Tan gambling den history),
    // Fisgard Lighthouse (1860, oldest active lighthouse on Pacific coast),
    // Emily Carr House (Emily Carr birthplace, 207 Government Street),
    // Miniature World, Royal BC Museum.
    scenes: {
      cpr: [
        // Scene 1: Empress Hotel and Inner Harbour
        `Fairmont Empress Hotel grand château façade with flowering gardens foreground,
        Inner Harbour with BC Legislative Buildings copper dome across the water,
        CPR Empress steamship docked at harbour,
        hanging flower baskets along causeway,
        formal gardens ablaze with colour in immediate foreground,
        couple in Edwardian summer dress on garden path foreground viewed from behind,
        warm late afternoon golden light on château stone.`,
        // Scene 2: Beacon Hill Park peacocks
        `Beacon Hill Park Victoria in spring bloom: vivid flower beds and rolling lawns,
        peacock with tail fully spread in foreground left, brilliant blue-green display,
        world's tallest totem pole visible in distance right,
        Strait of Juan de Fuca sparkling in distance,
        couple on park path foreground viewed from behind, flower borders bright.`,
        // Scene 3: Fisgard Lighthouse at sunset
        `Fisgard Lighthouse 1860 at Fort Rodd Hill, red tower on rocky Pacific shore,
        Esquimalt Harbour inlet glowing at sunset,
        dramatic amber and crimson sky, dark rocky foreground,
        Royal Navy warship visible in harbour distance,
        couple on rocky shore foreground viewed from behind watching lighthouse.`,
      ],
      group7: [
        // Emily Carr-style: Inner Harbour forest
        `Dark ancient forest at edge of Victoria, massive Douglas fir trunks,
        sea glimpsed through branches in grey Pacific light,
        Emily Carr swirling sky above tortured treetops,
        powerful spiritual forest atmosphere, rich viridian and emerald.`,
        // Autumn at Craigdarroch Castle
        `Craigdarroch Castle turrets in autumn, red and orange Virginia creeper on stone,
        Victoria neighbourhood in October colour below,
        Strait of Juan de Fuca in distance, Olympic Mountains beyond,
        bold Thomson decorative composition, rich warm palette.`,
      ],
      winter: [
        // Empress Hotel Christmas
        `Fairmont Empress Hotel in rare Victoria snow, decorated for Christmas 1955,
        Inner Harbour frozen and glowing in winter light behind,
        families arriving in horse-drawn carriages at hotel entrance,
        warm amber hotel windows, decorated garlands and wreaths,
        soft snow on formal gardens, mountains in distance.`,
        // Fan Tan Alley Christmas
        `Fan Tan Alley Victoria in Christmas lights, narrowest commercial street in Canada,
        stone walls hung with lanterns and red ribbons,
        Chinese grocery and tea shop windows glowing,
        families in 1955 winter coats strolling the alley,
        Inner Harbour visible at far end in winter light.`,
      ],
      tourism: [
        // Empress poster
        `Bold 1960s tourism poster: Fairmont Empress Hotel and Inner Harbour,
        summer blue sky, BC Legislature copper dome opposite,
        tourist couple on causeway, flower baskets visible,
        graphic flat colour, tourism BC style.`,
        // Beacon Hill peacock poster
        `Bright 1965 poster: Beacon Hill Park with spreading peacock foreground,
        flower beds in background, park visitors in summer clothes,
        blue sky, graphic illustrated style.`,
      ],
    },
  },

  // ─── SMALLER CITIES / TOWNS ───────────────────────────────────────────────────

  canmore: {
    group: 'towns',
    label: 'Canmore',
    province: 'Alberta',
    tagline_cpr: 'IN THE BOW VALLEY',
    tagline_tourism: 'GATEWAY TO KANANASKIS',
    // Deep research: Three Sisters mountains (Faith, Hope, Charity — named 1886 by Geological
    // Survey), Ha Ling Peak (named for Chinese cook who won a $50 bet in 1896 by reaching summit
    // by lunchtime), Canmore Engine Bridge over Bow River (former CPR coal-mining railway bridge,
    // featured in The Last of Us), Lawrence Grassi Lakes (Italian immigrant coal miner who built
    // mountain trails, turquoise lakes), Grassi Lakes hiking trail,
    // Canmore hosted Nordic skiing events at 1988 Calgary Winter Olympics,
    // Canmore Museum & Geoscience Center (coal mining history),
    // "Big Head" sculpture by Al Henderson on 8th Street (named for Gaelic Ceann Mór = big head),
    // Rat's Nest Cave system under Grotto Mountain (one of Canada's longest caves),
    // Canmore was a coal mining town servicing CPR trains from 1884 until 1979,
    // Morant's Curve — famous CPR railway photography spot near Lake Louise.
    scenes: {
      cpr: [
        // Scene 1: Three Sisters framing Bow Valley
        `Three Sisters mountain trio — Faith, Hope and Charity — framing Bow Valley at golden hour,
        turquoise Bow River winding through valley floor below,
        dense dark green spruce forest covering lower slopes,
        amber rocky faces of three peaks catching warm afternoon light,
        snow streaking upper ridges, pale blue distant mountains beyond,
        couple on rocky outcrop foreground viewed from behind gazing at Three Sisters.`,
        // Scene 2: Ha Ling Peak with Coal mining heritage
        `Ha Ling Peak towering dramatically above Canmore townsite in clear autumn air,
        amber rocky face catching warm October light, snow on summit,
        Bow River in valley below reflecting blue sky,
        historic CPR coal mining tipple in foreground right,
        two coal miners in work clothes on wooden bridge foreground viewed from behind.`,
        // Scene 3: Engine Bridge over Bow River
        `Canmore Engine Bridge — original CPR coal railway bridge — spanning Bow River,
        Three Sisters mountains dramatically framing scene above bridge,
        turquoise Bow River reflecting amber mountains below,
        elk standing in shallow river below bridge in morning light,
        couple crossing bridge foreground viewed from behind.`,
      ],
      group7: [
        // Harris-style: Three Sisters minimal
        `Three Sisters Canmore in early winter — stark simplified mountains,
        grey-blue shadows on snow, pale yellow sky,
        dark spruce tree silhouettes in foreground,
        Lawren Harris geometric mountain abstraction style, bold simplified forms.`,
        // Thomson-style: Lawrence Grassi Lakes
        `Grassi Lakes turquoise alpine pools above Canmore in autumn,
        brilliant red larches surrounding impossibly blue-green glacial lakes,
        Ha Ling Peak and cliffs above, deep blue sky,
        bold impasto brushwork, rich colour contrast in Thomson style.`,
      ],
      winter: [
        // Nordic skiing — 1988 Calgary Olympics legacy
        `Canmore Nordic Centre cross-country ski trails in January afternoon,
        Three Sisters mountains glowing in winter sunshine above,
        1950s-era skiers in colourful wool sweaters on groomed trail,
        birch trees in foreground with dusting of snow,
        warm amber light on snow, blue shadows.`,
        // Downtown Canmore Main Street in snow
        `Canmore Main Street (8th Street) in Christmas snowfall, 1955,
        mountain restaurants and shops with warm glowing windows,
        Three Sisters barely visible through falling snow behind,
        horse-drawn wagon passing on snowy street,
        families in wool coats, Christmas lights strung between buildings.`,
      ],
      tourism: [
        // Three Sisters hiking poster
        `Bold 1965 tourism poster: Three Sisters mountains viewed from Bow River,
        hiker with backpack on riverside trail,
        turquoise river, forest green slopes, blue sky,
        Kananaskis Country lettering, graphic flat colour style.`,
        // Engine Bridge and mountains
        `Bright 1960s poster: Canmore Engine Bridge with Three Sisters behind,
        couple hiking across bridge, Bow River below,
        dramatic mountain backdrop, clean graphic style.`,
      ],
    },
  },

  lunenburg: {
    group: 'towns',
    label: 'Lunenburg',
    province: 'Nova Scotia',
    tagline_cpr: 'SOUTH SHORE NOVA SCOTIA',
    tagline_tourism: 'UNESCO WORLD HERITAGE TOWN',
    // Deep research: UNESCO World Heritage Site (1995) — best surviving example of planned
    // British colonial settlement in North America, founded 1753 for 1,453 German-Swiss Protestant
    // colonists. Unique "Lunenburg bump" dormer windows.
    // Bluenose schooner: legendary racing and fishing ship, launched 1921, undefeated for 17 years,
    // "Queen of the North Atlantic", image on Canadian dime since 1937.
    // Fisheries Museum of the Atlantic at waterfront, working fishing schooners.
    // Brightly painted wooden houses in bold reds, blues, yellows, greens — photogenic.
    // St. John's Anglican Church (Canada's second oldest Protestant church, Gothic style,
    // nearly destroyed by fire 2001, rebuilt 2005), Lunenburg Academy (1895 Gothic Revival).
    // Old Town grid plan from 1753 still intact, steepest streets in any planned colonial town.
    // Ironworks Distillery in former blacksmith shop over harbour.
    scenes: {
      cpr: [
        // Scene 1: Bluenose schooner in harbour
        `Bluenose schooner under full sail in Lunenburg Harbour at golden sunset,
        "Queen of the North Atlantic" racing hull under billowing canvas,
        Lunenburg's brightly-painted wooden houses — red, blue, yellow — lining hillside behind,
        Lunenburg Academy Gothic towers visible above coloured rooftops,
        dark blue Atlantic water, amber and crimson sunset sky,
        couple on dock foreground viewed from behind watching Bluenose sail.`,
        // Scene 2: Colourful Old Town houses on hillside
        `Lunenburg Old Town UNESCO hillside at golden hour: rainbow of 18th-century wooden houses,
        bold vivid reds, blues, yellows, greens and ochres on steep grid streets,
        distinctive "Lunenburg bump" dormers visible on rooftops,
        harbour with fishing schooners below, Atlantic Ocean beyond,
        couple on steep cobblestone street foreground viewed from behind.`,
        // Scene 3: Fisheries Museum at waterfront
        `Lunenburg waterfront at morning: Fisheries Museum of the Atlantic red buildings,
        working fishing schooners tied at wharf, nets drying,
        Bluenose II replica in harbour, fishermen unloading catch,
        colourful painted buildings on hillside above,
        couple in 1940s maritime clothing on dock foreground viewed from behind.`,
      ],
      group7: [
        // Carmichael-style: Atlantic coast watercolour
        `Lunenburg Harbour at dawn, fog lifting to reveal coloured houses on hillside,
        Atlantic light on still water, fishing dories in foreground,
        soft watercolour-influenced brushwork in Carmichael style,
        pale pink and gold dawn sky, cool grey-blue water.`,
        // Autumn on South Shore
        `Nova Scotia South Shore in October, rocky Atlantic headland,
        dark ocean below, brilliant red and orange coastal maples,
        Lunenburg lighthouse visible on point,
        bold coastal composition in Thomson style, dark foreground rocks.`,
      ],
      winter: [
        // Old Town in Christmas snow
        `Lunenburg Old Town in rare Christmas snowfall, colourful wooden houses dusted white,
        strings of lights hanging between red-painted buildings,
        St. John's Anglican Church Gothic spire above,
        families on steep grid street in 1955 winter coats,
        harbour barely visible through falling snow.`,
        // Ironworks Distillery on snowy harbour
        `Former blacksmith shop on Lunenburg Harbour turned Christmas gathering place, 1955,
        warm amber glow from old forge windows on snowy harbour,
        Bluenose II in harbour with snow on rigging,
        fishermen and families around outdoor fire with mugs of grog,
        coloured Lunenburg buildings rising on hillside behind.`,
      ],
      tourism: [
        // Bluenose and coloured houses poster
        `Bold 1960s tourism poster: Bluenose under sail in Lunenburg Harbour,
        coloured wooden houses on hillside behind,
        blue Atlantic sky, crisp graphic style.`,
        // Old Town walking tour poster
        `Bright 1965 poster: Lunenburg Old Town steep street with colourful houses,
        couple strolling past red and yellow buildings,
        Atlantic visible at bottom of hill, graphic flat colour.`,
      ],
    },
  },

  stratford: {
    group: 'towns',
    label: 'Stratford',
    province: 'Ontario',
    tagline_cpr: 'ON THE AVON RIVER',
    tagline_tourism: "CANADA'S FESTIVAL CITY",
    // Deep research: Stratford Festival (founded 1952 by journalist Tom Patterson to save dying
    // railway town economy, opened July 13 1953 with Alec Guinness as Richard III),
    // Alec Guinness, Christopher Plummer, Maggie Smith, William Shatner all performed here.
    // Festival Theatre (1957) designed with thrust stage modelled on Globe Theatre, seating 1,838.
    // Avon River flowing through town (renamed from "Little Thames" in 1832 to honour Stratford-
    // upon-Avon, birthplace of Shakespeare). 24 white swans released annually on Avon River —
    // a tradition since the 1960s. Shakespearean Gardens with 60 species of Elizabethan plants.
    // Red brick Victorian architecture throughout. Ridiculously good chocolate at Rheo Thompson's
    // (open since 1969). Thomas Edison was a telegraph operator here briefly in 1864.
    // Justin Bieber grew up in Stratford.
    scenes: {
      cpr: [
        // Scene 1: Festival Theatre and Avon River swans
        `Stratford Festival Theatre reflected in calm Avon River at summer golden hour,
        white swans gliding on river in foreground,
        willow trees trailing golden fronds into river both sides,
        Victoria Park green lawns visible behind theatre,
        couple in 1940s summer dress on riverside path foreground viewed from behind.`,
        // Scene 2: Shakespearean Gardens and swan release
        `Stratford swan parade: 24 white swans being led through Shakespearean Garden to Avon River,
        red brick Victorian buildings lining King Street behind,
        Shakespearean Gardens in full summer bloom,
        townspeople watching swan parade in 1940s dress,
        couple applauding foreground viewed from behind, golden afternoon.`,
        // Scene 3: Avon River boathouse and Victorian buildings
        `The Avon River through Stratford at autumn peak, Victorian red brick buildings reflecting,
        bright red and orange maple trees lining riverbanks both sides,
        old boathouse right, punt and rowboats on coloured river,
        couple in 1940s autumn coats on riverside foreground viewed from behind.`,
      ],
      group7: [
        // Autumn: Avon River
        `Stratford's Avon River in peak October, stunning red and orange maple reflections,
        white swan floating on mirror-still brilliantly coloured water,
        dark riverbank willows draping branches into colour,
        heavy impasto brushwork in MacDonald decorative autumn style.`,
        // Spring: Victoria Park
        `Victoria Park Stratford in early spring, snowdrops and crocuses on green lawn,
        bare elm and oak trees above in grey spring sky,
        old stone fountain centre, Festival Theatre visible beyond,
        painterly soft-edged spring colours, soft light.`,
      ],
      winter: [
        // Festival Theatre in snow
        `Stratford Festival Theatre in December snowfall, 1958,
        warm amber lobby lights glowing through tall windows on snow,
        audience in 1950s winter clothes arriving on snowy Victoria Park path,
        Avon River just visible through bare trees behind,
        horse-drawn cab pulling up to theatre entrance.`,
        // Christmas market on King Street
        `Stratford King Street Victorian Christmas market, 1955,
        red brick buildings decorated with holly and pine boughs,
        outdoor market stalls selling Christmas greenery and baked goods,
        horse-drawn cart, warm amber shop windows, gently falling snow,
        families in winter coats browsing stalls.`,
      ],
      tourism: [
        // Festival and swans poster
        `Bold 1960s tourism poster: white swans on Avon River, Festival Theatre behind,
        summer blue sky, willow trees, couple in summer clothes,
        Stratford Ontario in confident sans-serif type, graphic style.`,
        // Shakespearean Gardens poster
        `Bright 1965 poster: Shakespearean Gardens in full summer bloom,
        Festival Theatre building behind garden,
        couple strolling among Elizabethan flowers,
        graphic flat colour, warm summer palette.`,
      ],
    },
  },

  tofino: {
    group: 'towns',
    label: 'Tofino',
    province: 'British Columbia',
    tagline_cpr: 'THE PACIFIC RIM',
    tagline_tourism: "CANADA'S SURF CAPITAL",
    // Deep research: Canada's surf capital — surfing discovered by Ralph Devries from Netherlands
    // in 1960s; first surf competition 1966 at Wickaninnish Beach. "Tuff City" (toughness of
    // remote living at end of road). Long Beach — 16km in Pacific Rim National Park Reserve.
    // Clayoquot Sound UNESCO Biosphere Reserve. Wickaninnish Inn (opened 1996 by Charles McDiarmid,
    // renowned for storm watching). Winter storm watching is major tourism — Nov storms, highest
    // rainfall in Canada. Hot Springs Cove — geothermal hot springs, 45km north by boat only.
    // Meares Island — ancient temperate rainforest, 800-year-old red cedars.
    // Freedom Cove — floating island home/art gallery built by Wayne Adams and Catherine King 1992.
    // Tofino is official western terminus of Trans-Canada Highway (signed 1970).
    scenes: {
      cpr: [
        // Scene 1: Long Beach Pacific Rim surf
        `Long Beach Pacific Rim National Park at golden sunset: massive Pacific swells rolling in,
        dark green temperate rainforest backing entire beach right and left,
        ancient red cedar drift logs on beach foreground,
        lone 1940s-style couple in oilskin coats watching waves from beach,
        dramatic crimson and amber sunset sky, dark Pacific waves with white foam,
        misty mountains of Meares Island visible in haze left.`,
        // Scene 2: Hot Springs Cove boardwalk
        `Hot Springs Cove Tofino: cedar boardwalk trail through ancient rainforest,
        800-year-old Western Red Cedar trunks towering on both sides,
        moss-covered massive roots, cathedral forest light filtering down,
        steam from geothermal pools visible at boardwalk end,
        couple in 1940s hiking clothes on boardwalk viewed from behind.`,
        // Scene 3: Clayoquot Sound by seaplane
        `Clayoquot Sound viewed from above at golden hour: emerald islands,
        dark Pacific kelp forests visible in clear water,
        floatplane on glassy sound inlet in foreground,
        ancient rainforest of Meares Island in distance,
        orange-amber sky reflected on sound surface,
        couple watching from dock foreground viewed from behind.`,
      ],
      group7: [
        // Emily Carr-style: old growth cedar
        `Ancient red cedar forest, Meares Island Tofino, in Emily Carr swirling style,
        massive 800-year-old trunks spiralling upward, dark forest floor,
        shafts of grey Pacific light through high canopy,
        powerful spiritual forest presence, deep viridian and emerald.`,
        // Storm watching: Long Beach winter storm
        `Long Beach Pacific Rim in winter storm: enormous dark Pacific swells,
        wind-sculpted storm-battered Sitka spruce on rocky headland foreground,
        dramatic dark purple and grey storm sky, white spray on rocks,
        powerful elemental composition à la Thomson's The West Wind.`,
      ],
      winter: [
        // Storm watching at Wickaninnish
        `Wickaninnish Inn Tofino in Pacific winter storm, 1960s,
        warm amber lodge windows glowing against dark stormy Pacific,
        massive winter waves crashing on rocks below lodge,
        wrapped-up couple watching storm from sheltered porch,
        dramatic contrast of warm interior light and wild Pacific storm.`,
        // Christmas at The Common Loaf Bake Shop
        `Tofino village Christmas Eve 1960: Common Loaf Bake Shop warmly lit,
        ancient red cedar trees draped with string lights in village,
        Pacific mist rolling through cedar forest behind village,
        families with lanterns on Main Street, gentle rain on cobblestones,
        warm amber shop windows, green rainforest above.`,
      ],
      tourism: [
        // Surfing poster
        `Bold 1965 tourism poster: surfer on Pacific wave at Long Beach Tofino,
        dark green rainforest backing beach, dramatic sky,
        Pacific Rim National Park lettering, graphic flat colour.`,
        // Storm watching poster
        `Bright 1960s poster: Tofino storm watching from rocky headland,
        couple in oilskins watching massive Pacific waves,
        dramatic sky, dark green Sitka spruce, graphic style.`,
      ],
    },
  },

  'niagara-on-the-lake': {
    group: 'towns',
    label: 'Niagara-on-the-Lake',
    province: 'Ontario',
    tagline_cpr: 'ON LAKE ONTARIO',
    tagline_tourism: 'THE PRETTIEST TOWN IN ONTARIO',
    // Deep research: Shaw Festival (founded 1962 by lawyer Brian Doherty with "Salute to Shaw",
    // first professional season 1964. Festival Theatre dedicated by Queen Elizabeth II in 1973.
    // Alec Guinness, Maggie Smith, Christopher Plummer performed here). Royal George Theatre
    // (1915 vaudeville house). NOTL was capital of Upper Canada 1792, first provincial Parliament.
    // Fort George (War of 1812, 1796 British fort taken by Americans 1813, rebuilt 1813-14 by
    // British). Town burned by Americans 1813, rebuilt by residents. Niagara Apothecary (1820,
    // oldest operating pharmacy in Ontario). 40+ wineries in Niagara Wine Country, world-famous
    // ice wine. Queen Street Victorian/Edwardian architecture completely preserved.
    scenes: {
      cpr: [
        // Scene 1: Shaw Festival Theatre with gardens
        `Shaw Festival Theatre surrounded by formal summer gardens in full bloom,
        Queen Street Niagara-on-the-Lake Victorian buildings behind,
        Lake Ontario shimmering in distance,
        theatre-goers in 1940s summer dress strolling garden path,
        couple on garden terrace foreground viewed from behind.`,
        // Scene 2: Queen Street Victorian streetscape
        `Niagara-on-the-Lake Queen Street in summer bloom, Victoria era at its finest,
        Edwardian storefronts draped with hanging flower baskets,
        horse-drawn carriage on tree-lined street,
        lake Ontario visible at far end of street in afternoon haze,
        couple arm-in-arm on sidewalk foreground viewed from behind.`,
        // Scene 3: Fort George on Niagara River
        `Fort George National Historic Site 1812 British fort on Niagara River at sunset,
        wooden stockade walls and block houses golden in warm light,
        Niagara River broad behind fort, Lake Ontario in far distance,
        American shore visible across river,
        couple in 1940s clothing outside fort gate foreground viewed from behind.`,
      ],
      group7: [
        // Autumn vineyards
        `Niagara wine country in October harvest: rows of vines heavy with late-harvest grapes,
        Escarpment wall of rock and forest behind in brilliant autumn colour,
        Lake Ontario in distance reflecting grey October sky,
        dark grapevines in foreground, bold autumn palette in Group of Seven style.`,
        // Shaw Festival at night — impressionist
        `Shaw Festival Theatre at summer dusk: warm amber windows,
        manicured gardens glowing in last light,
        Lake Ontario deep blue behind distant trees,
        bold flat colour impressionist, warm-cool palette contrast.`,
      ],
      winter: [
        // Christmas on Queen Street
        `Niagara-on-the-Lake Queen Street in Christmas snowfall, 1955,
        Victorian storefronts decorated with green pine boughs and red ribbons,
        horse-drawn sleigh on snow-covered tree-lined street,
        warm amber windows glowing, gently falling snow,
        families in winter coats, church at far end of street.`,
        // Ice wine harvest
        `Niagara wine country ice wine harvest at night, 1960s,
        workers with headlamps picking frozen grapes in January frost,
        vineyard rows dramatic in winter moonlight,
        Escarpment and distant Lake Ontario visible behind,
        warm amber farmhouse light across frozen vineyard.`,
      ],
      tourism: [
        // Shaw Festival poster
        `Bold 1965 tourism poster: Shaw Festival Theatre with summer gardens,
        couple in summer clothes approaching theatre,
        Lake Ontario in background, graphic flat colour style.`,
        // Fort George poster
        `Bright 1960s poster: Fort George 1812 fort with Niagara River,
        British soldier in red coat at gate,
        river and distant American shore visible, graphic bold style.`,
      ],
    },
  },

  london: {
    group: 'towns',
    label: 'London',
    province: 'Ontario',
    tagline_cpr: 'THE FOREST CITY',
    tagline_tourism: 'THE FOREST CITY',
    // Deep research: "The Forest City" (over 200 parks, most tree-covered large city in Canada),
    // Thames River (flowing through city, renamed from "La Tranche" by Simcoe in 1793).
    // Covent Garden Market (opened 1845, one of oldest continuously operating markets in Canada).
    // Fanshawe Pioneer Village (open-air museum 1959, 34 historic buildings, 1820-1920 rural Ontario).
    // Grand Theatre (opened 1901 as Grand Opera House — "The House of Polite Vaudeville"),
    // Eldon House (1834, oldest surviving house in London, still furnished as lived in).
    // Banting House National Historic Site — Frederick Banting's house where he conceived insulin 1920.
    // Western University (est. 1878), Victoria Park (city centre). Wortley Village — "coolest
    // neighbourhood". London Knights OHL hockey. Blackfriars Bridge (1875, oldest bowstring iron
    // arch bridge in North America). Ontario's first million-dollar fire in 1845 here.
    scenes: {
      cpr: [
        // Scene 1: Thames River in autumn, Blackfriars Bridge
        `Blackfriars Bridge London Ontario — oldest iron bowstring arch bridge in North America —
        spanning Thames River in peak autumn colour,
        maple and oak trees blazing red and orange on both banks,
        river reflecting brilliant golden trees,
        Victoria Park elms visible in distance behind bridge,
        couple in 1940s autumn coats on riverside path foreground viewed from behind.`,
        // Scene 2: Covent Garden Market harvest
        `London Ontario Covent Garden Market exterior at autumn harvest 1940s,
        Victorian market building with arched windows, vendors setting up outside,
        London streetcar visible on street behind,
        piles of pumpkins, apples, squash, autumn bouquets at stalls,
        couple in 1940s market-day coats foreground viewed from behind.`,
        // Scene 3: Victoria Park in autumn
        `Victoria Park London Ontario in October afternoon, dense elm canopy,
        park paths carpeted in golden leaves, fountain at centre,
        Victorian bandstand right, church spires visible above trees behind,
        couple in 1940s autumn walk clothes foreground viewed from behind.`,
      ],
      group7: [
        // Thames Valley autumn
        `Thames River valley London Ontario in October, steep wooded valley walls,
        brilliant autumn maples and oaks in every direction,
        river catching afternoon light below through leaf-fall,
        bold MacDonald-style autumn decoration, rich palette.`,
        // Fanshawe Conservation Area spring
        `Fanshawe Lake at spring, new green willows trailing, migrating geese landing,
        conservation area forest just leafing out in soft greens,
        dramatic April sky with racing clouds,
        impressionistic brushwork in soft spring palette.`,
      ],
      winter: [
        // Covent Garden Market Christmas
        `Covent Garden Market London Ontario at Christmas 1955: outdoor skating rink beside market,
        Victorian market building warmly lit behind,
        families skating in colourful winter clothes,
        Christmas tree at centre of rink, string lights on market,
        Thames River visible behind, gentle snow falling.`,
        // Fanshawe Pioneer Village winter
        `Fanshawe Pioneer Village in December snow: log cabin farmstead with smoke from chimney,
        1820s rural Ontario pioneer family gathering firewood,
        snow-covered fields and split-rail fences,
        horse in barn doorway, warm amber lantern light from cabin windows.`,
      ],
      tourism: [
        // Forest City parks poster
        `Bold 1965 tourism poster: Thames River through Springbank Park,
        couple in canoe on river, forest both banks,
        Victoria Park lawns and elms in background,
        London Ontario The Forest City in graphic type.`,
        // Grand Theatre poster
        `Bright 1960s poster: Grand Theatre London Ontario ornate 1901 building,
        dressed theatregoers arriving for evening performance,
        Victoria Park visible beside theatre, graphic flat colour style.`,
      ],
    },
  },

  // ─── PROVINCES / TERRITORIES ─────────────────────────────────────────────────

  alberta: {
    group: 'provinces',
    label: 'Alberta',
    province: 'Alberta',
    tagline_cpr: 'WILD ROSE COUNTRY',
    tagline_tourism: 'DISCOVER ALBERTA',
    scenes: {
      cpr: [
        `Icefields Parkway stretching into infinite Rocky Mountain grandeur at golden hour,
        turquoise Peyto Lake visible in valley left, snow-capped peaks both sides,
        amber autumn larches on slopes, pale glaciers above,
        couple in 1940s touring car on road foreground viewed from behind.`,
        `Alberta harvest time: combines working golden prairie fields at sunset,
        grain elevator silhouettes on flat horizon,
        enormous Alberta sky blazing orange and crimson,
        Rolling foothills with Rockies on distant horizon left,
        couple on grain wagon foreground viewed from behind.`,
      ],
      group7: [
        `Peyto Lake Alberta from Bow Summit: vivid turquoise wolf-head-shaped lake,
        surrounding mountains in autumn larch gold,
        dark spruce forest foreground, dramatic boulder outcrops,
        bold vivid palette in Thomson style, thick impasto.`,
      ],
      winter: [
        `Alberta winter: Rockies reflected in frozen Vermilion Lakes at Banff dawn,
        pink and lavender sky above snow-covered peaks,
        elk in frozen foreground, steam on cold water,
        1950s family in winter gear on frozen lake.`,
      ],
      tourism: [
        `Bold 1960s poster: Icefields Parkway with Columbia Icefield,
        family at Athabasca Glacier, clean blue-white graphic palette.`,
      ],
    },
  },

  'british-columbia': {
    group: 'provinces',
    label: 'British Columbia',
    province: 'British Columbia',
    tagline_cpr: 'BEAUTIFUL BRITISH COLUMBIA',
    tagline_tourism: 'SUPER, NATURAL BC',
    scenes: {
      cpr: [
        `Fraser Canyon at Hell's Gate, CPR mainline clinging to canyon wall,
        Fraser River boiling through narrow gorge far below,
        forest-covered mountains on both sides, mist rising,
        CPR passenger train rounding canyon curve foreground viewed from above.`,
        `Okanagan Valley at harvest: orchards laden with red and golden fruit,
        Okanagan Lake shimmering turquoise below on valley floor,
        surrounding brown-gold hills in afternoon light,
        couple picking apples in orchard foreground viewed from behind.`,
      ],
      group7: [
        `BC Interior dry pine forest at sunset: ponderosa pines silhouetted,
        Thompson River valley in amber below,
        desert hills in vivid ochre and burnt sienna,
        Jackson-inspired warm Western palette, bold flat colour.`,
      ],
      winter: [
        `Whistler ski slope 1958: skiers in bright sweaters on mountain runs,
        Coastal Mountains peaks in all directions,
        ski lodge glowing amber below,
        families after ski day on sun-drenched snowy terrace.`,
      ],
      tourism: [
        `Bold 1960s poster: BC Ferry on Georgia Strait,
        Vancouver Island shore and mountains ahead,
        summer deck passengers in sun hats, blue sky, graphic style.`,
      ],
    },
  },

  ontario: {
    group: 'provinces',
    label: 'Ontario',
    province: 'Ontario',
    tagline_cpr: 'THE HEART OF CANADA',
    tagline_tourism: 'YOURS TO DISCOVER',
    scenes: {
      cpr: [
        `Thousand Islands at sunset: granite islands with pine trees in St. Lawrence River,
        Boldt Castle amber-lit on Heart Island,
        river glinting between islands in orange and gold,
        steamboat with flag passing foreground viewed from shore.`,
        `Algonquin Park peak autumn aerial view: blazing red orange yellow maple canopy,
        lakes and rivers threading through ancient forest,
        dramatic clouds and shafts of light,
        couple in birchbark canoe on lake foreground viewed from behind.`,
      ],
      group7: [
        `Algonquin Park October: single jack pine on rocky shore, iconic Thomson composition,
        blazing scarlet and orange maples surrounding pine,
        dark lake reflecting sky, heavy impasto paint.`,
      ],
      winter: [
        `Ontario cottage country in Christmas snow: log cabin on frozen lake,
        smoke from stone chimney, warm amber windows,
        snowshoers crossing frozen lake, spruce forest behind,
        1955 winter scene, warm nostalgia.`,
      ],
      tourism: [
        `Bold 1965 poster: canoeing on Algonquin Park lake,
        autumn maples both shores, clear sky, couple paddling,
        Ontario Parks lettering, graphic style.`,
      ],
    },
  },

  quebec: {
    group: 'provinces',
    label: 'Québec',
    province: 'Québec',
    tagline_cpr: 'LA BELLE PROVINCE',
    tagline_tourism: 'JE ME SOUVIENS',
    scenes: {
      cpr: [
        `Charlevoix Region at autumn peak: steep forested hills above St. Lawrence River,
        brilliant red and orange maples on every hillside,
        white farmhouses and stone churches in valley below,
        river shimmering beyond, couple on country road foreground viewed from behind.`,
        `Gaspésie: Percé Rock limestone monolith at sunrise,
        enormous rock arch emerging from green St. Lawrence Gulf,
        dramatic pink and gold sky, seabirds in flight,
        couple on shore foreground viewed from behind.`,
      ],
      group7: [
        `Laurentian Mountains in October: rolling hills of vivid red and orange maples,
        lake in valley reflecting brilliant sky,
        A.Y. Jackson-style Quebec landscape, bold colour zones.`,
      ],
      winter: [
        `Quebec sugar shack in maple forest: steam rising from evaporator,
        horse-drawn sleigh arriving through snowy maple woods,
        family in traditional Québécois dress arriving for sugaring,
        golden afternoon light on snow, amber lanterns.`,
      ],
      tourism: [
        `Bold 1965 poster: Percé Rock and Gaspé coast,
        fishing boat in turquoise bay, dramatic rock arch,
        graphic coastal poster style.`,
      ],
    },
  },

  'nova-scotia': {
    group: 'provinces',
    label: 'Nova Scotia',
    province: 'Nova Scotia',
    tagline_cpr: "CANADA'S OCEAN PLAYGROUND",
    tagline_tourism: "CANADA'S OCEAN PLAYGROUND",
    scenes: {
      cpr: [
        `Cabot Trail Cape Breton: road hugging cliff edge above Gulf of St. Lawrence,
        autumn forest in brilliant colour covering every hillside,
        Ingonish Beach visible in cove below,
        couple in 1940s car on cliff road foreground viewed from behind.`,
        `Peggy's Cove lighthouse on smooth glacier-scoured granite at golden sunset,
        Atlantic swells sending spray over pink and orange rock,
        lobster boats in harbour left,
        couple on rocks foreground viewed from behind.`,
      ],
      group7: [
        `Cape Breton coast in October storm: dark grey Atlantic, white spray,
        dramatic orange and red cliff-top maples,
        fishing weir visible in cove below,
        powerful coastal composition in Thomson style.`,
      ],
      winter: [
        `Nova Scotia fishing village Christmas: lobster boat in snowy harbour,
        brightly painted fishing shacks decorated with lights,
        harbour water dark but calm, snowfall on docks,
        1955 fishermen's family arriving at wharf.`,
      ],
      tourism: [
        `Bold 1960s poster: Cabot Trail cliff road in autumn,
        car on cliff edge, fiery foliage, gulf below,
        Cape Breton Highlands lettering, graphic style.`,
      ],
    },
  },

  'new-brunswick': {
    group: 'provinces',
    label: 'New Brunswick',
    province: 'New Brunswick',
    tagline_cpr: 'THE PICTURE PROVINCE',
    tagline_tourism: 'THE PICTURE PROVINCE',
    scenes: {
      cpr: [
        `Bay of Fundy at low tide: highest tides in world, 15-metre sea floor exposed,
        Hopewell Rocks "flowerpot" sea stacks on bare ocean floor,
        1940s family exploring stacks at low tide viewed from behind,
        dramatic amber and red cliff face, distant incoming tide.`,
        `Saint John River Valley at peak autumn: Saint John River winding through hills,
        Grand Falls visible in distance,
        brilliant red and orange maple forest on valley slopes,
        covered bridge on river foreground, couple crossing bridge viewed from behind.`,
      ],
      group7: [
        `Fundy Coast at dawn: dark basalt cliffs above receding tide,
        orange sunrise reflecting in tidal pools,
        silhouetted spruce forest above cliffs,
        bold dark foreground against luminous dawn sky.`,
      ],
      winter: [
        `Fredericton Christmas: 1955 Garrison District in snowfall,
        colonial stone military buildings decorated for Christmas,
        horse-drawn sleigh on Officer's Square,
        warm amber windows, families in winter coats.`,
      ],
      tourism: [
        `Bold 1960s poster: Hopewell Rocks flowerpot stacks at low tide,
        tourists between stacks, dramatic cliffs,
        Bay of Fundy lettering, graphic style.`,
      ],
    },
  },

  pei: {
    group: 'provinces',
    label: 'Prince Edward Island',
    province: 'Prince Edward Island',
    tagline_cpr: 'THE GARDEN OF THE GULF',
    tagline_tourism: 'GARDEN OF THE GULF',
    scenes: {
      cpr: [
        `Green Gables House in summer, L.M. Montgomery's inspiration for Anne's home,
        white gabled farmhouse in green fields with apple blossoms,
        red PEI road winding past farm, Gulf of St. Lawrence distant blue,
        couple in 1940s summer clothes on road foreground viewed from behind.`,
        `PEI North Shore red sand cliffs at sunset: brilliant red-orange sandstone,
        Gulf of St. Lawrence in deep amber sunset,
        red sand beach below with lobster boats,
        couple on cliff edge foreground viewed from behind.`,
      ],
      group7: [
        `PEI farmland in autumn: rolling patchwork of russet potato fields and golden grain,
        Gulf of St. Lawrence at horizon,
        red soil exposed where furrows turn,
        bold decorative pastoral composition.`,
      ],
      winter: [
        `PEI oyster fishermen in winter: horse-drawn ice fishing rigs on Malpeque Bay,
        red ice fishing huts in bright colours on white ice,
        1950s fishermen drilling ice holes,
        warm amber hut windows, brilliant winter sky.`,
      ],
      tourism: [
        `Bold 1960s poster: Green Gables house and red sand beach,
        Anne of Green Gables figure in straw hat in field,
        Gulf blue behind, red road, graphic style.`,
      ],
    },
  },

  newfoundland: {
    group: 'provinces',
    label: 'Newfoundland',
    province: 'Newfoundland',
    tagline_cpr: "THE ROCK",
    tagline_tourism: "CANADA'S MOST EASTERLY PROVINCE",
    scenes: {
      cpr: [
        `Cape St. Mary's seabird colony at sunrise: Bird Rock towering from sea,
        thousands of gannets nesting on cliff face,
        Atlantic spray below, amber morning sky,
        couple on headland foreground viewed from behind watching colony.`,
        `St. John's Harbour from Signal Hill at golden hour: Cape Spear in distance,
        Jellybean Row houses — red blue yellow green — on hillsides,
        The Narrows entrance with Cabot Tower above,
        harbour full of fishing vessels, couple on Signal Hill viewed from behind.`,
      ],
      group7: [
        `Newfoundland barrens in autumn: vast open tundra-like landscape,
        dark ponds reflecting turbulent sky, caribou in distance,
        vivid russet and crimson bog vegetation,
        Harris-inspired isolated northern landscape.`,
      ],
      winter: [
        `St. John's in January blizzard: Jellybean Row buried in drifts,
        warm amber windows, brave figure walking through storm,
        Cabot Tower barely visible through blowing snow on Signal Hill,
        quintessential Newfoundland winter hardship and warmth.`,
      ],
      tourism: [
        `Bold 1965 poster: Cape St. Mary's Bird Rock with gannets,
        Atlantic Ocean below, Newfoundland coast,
        graphic dramatic style.`,
      ],
    },
  },

  manitoba: {
    group: 'provinces',
    label: 'Manitoba',
    province: 'Manitoba',
    tagline_cpr: 'KEYSTONE PROVINCE',
    tagline_tourism: 'THE KEYSTONE PROVINCE',
    scenes: {
      cpr: [
        `Churchill Manitoba polar bears on Hudson Bay shore in October,
        three polar bears on tundra waiting for bay to freeze,
        Hudson Bay steel-grey to horizon,
        Northern Lights beginning to appear above,
        photographer on tundra buggy foreground viewed from behind.`,
        `Manitoba harvest: Red River Valley grain harvest sunset,
        combines working vast golden wheat fields,
        grain elevators silhouetted against prairie sunset,
        enormous sky ablaze, couple on field edge foreground viewed from behind.`,
      ],
      group7: [
        `Churchill tundra: polar bear walking along Hudson Bay shore,
        harsh autumn tundra, low brown vegetation,
        stormy grey Hudson Bay to horizon,
        simplified bold composition, dark and powerful.`,
      ],
      winter: [
        `Churchill Northern Lights: curtains of green and pink aurora above Hudson Bay,
        polar bear silhouette on sea ice foreground,
        1955 scientist with camera on shore,
        magnificent aurora reflected in dark water.`,
      ],
      tourism: [
        `Bold 1965 poster: polar bear and Northern Lights Churchill,
        Hudson Bay shore, aurora above,
        Churchill Manitoba in graphic lettering.`,
      ],
    },
  },

  saskatchewan: {
    group: 'provinces',
    label: 'Saskatchewan',
    province: 'Saskatchewan',
    tagline_cpr: 'LAND OF LIVING SKIES',
    tagline_tourism: 'LAND OF LIVING SKIES',
    scenes: {
      cpr: [
        `Saskatchewan harvest sunset: combines working golden wheat fields,
        grain elevators — six in a row — silhouetted on flat horizon,
        sky painted vermilion and gold above,
        flat prairie extending to horizon in every direction,
        couple on grain elevator steps foreground viewed from behind.`,
        `Waskesiu Lake Prince Albert National Park: clear lake, sandy beach,
        boreal forest of mixed birch and spruce behind,
        canoe pulled up on beach, couple at campfire on shore,
        summer evening sky, loons calling.`,
      ],
      group7: [
        `Saskatchewan prairie in August storm: towering cumulonimbus above flat grain fields,
        silver grain in wind, combine halted,
        bold dramatic sky filling three-quarters of canvas,
        Jackson-influenced prairie landscape.`,
      ],
      winter: [
        `Saskatchewan winter: homestead farm in January deep freeze,
        horses in fur-covered coats at frozen water trough,
        farmhouse with snow drifted to eaves, smoke from chimney,
        1950s farm family breaking ice for cattle, brilliant cold sky.`,
      ],
      tourism: [
        `Bold 1965 poster: Saskatchewan grain elevator at sunset,
        rolling wheat fields, big sky,
        Land of Living Skies in graphic lettering.`,
      ],
    },
  },

  yukon: {
    group: 'provinces',
    label: 'Yukon',
    province: 'Yukon',
    tagline_cpr: "CANADA'S NORTH",
    tagline_tourism: 'LARGER THAN LIFE',
    scenes: {
      cpr: [
        `Klondike Gold Rush: Dawson City boom town at midnight sun,
        wooden false-fronted saloons and hotels along Front Street,
        Yukon River steamboat at dock,
        prospectors and dance hall girls on boardwalk,
        midnight sun above bluffs, river glittering,
        couple in 1940s touring car foreground viewed from behind.`,
        `Northern Lights above Yukon wilderness: spectacular green and violet aurora,
        Yukon River reflecting aurora in open patch of river ice,
        aurora colours reflecting in water,
        lone wolf silhouette howling on rocky ridge right,
        couple on snowy riverbank foreground viewed from behind gazing at aurora.`,
      ],
      group7: [
        `Kluane National Park autumn: Dall sheep on rocky ridge above vast valley,
        enormous mountains beyond, Kluane Glacier visible in distance,
        Harris-inspired stripped northern grandeur.`,
      ],
      winter: [
        `Dawson City Klondike Yukon in winter: snow-covered Gold Rush buildings,
        sled dog team arriving with mail in 1955,
        Aurora borealis above town, −40 steam rising from buildings,
        warm amber saloon windows through blizzard.`,
      ],
      tourism: [
        `Bold 1965 poster: Northern Lights above Yukon River,
        moose silhouette on riverbank, aurora above,
        Yukon Canada in graphic lettering.`,
      ],
    },
  },

  nunavut: {
    group: 'provinces',
    label: 'Nunavut',
    province: 'Nunavut',
    tagline_cpr: 'OUR LAND',
    tagline_tourism: "CANADA'S ARCTIC TERRITORY",
    scenes: {
      cpr: [
        `Baffin Island midnight sun over Arctic tundra: sun at horizon casting golden-orange light,
        Arctic fox in summer coat watching from rocky ridge,
        tundra ponds reflecting extraordinary pink and gold sky,
        distant icebergs in Arctic bay,
        couple on Arctic tundra foreground viewed from behind watching sun.`,
        `Arctic narwhal pod in Nunavut Sound: ice floes and open water at sunset,
        narwhals spiralling ivory tusks breaking surface,
        midnight sun above, ice glowing orange and gold,
        distant coastal cliffs on horizon.`,
      ],
      group7: [
        `Harris-style: Arctic icebergs in deep blue water,
        pure white sculptural ice forms against deep cobalt sky,
        minimal stripped abstraction, cool pure palette.`,
      ],
      winter: [
        `Nunavut Inuit community winter: sled dogs outside igloo at Arctic dusk,
        Arctic sky blazing with stars, aurora beginning above,
        warm amber glow from igloo dome,
        figure in traditional amauti coat with baby.`,
      ],
      tourism: [
        `Bold 1965 poster: narwhal pod with Arctic coast,
        midnight sun above, ice floes, dramatic scale,
        Nunavut in graphic lettering.`,
      ],
    },
  },

  'northwest-territories': {
    group: 'provinces',
    label: 'Northwest Territories',
    province: 'Northwest Territories',
    tagline_cpr: 'SPECTACULAR NWT',
    tagline_tourism: 'SPECTACULAR NWT',
    scenes: {
      cpr: [
        `Great Slave Lake midnight sun at summer solstice: sun at horizon casting golden light,
        vast lake shimmering gold and amber to horizon,
        dark spruce forest silhouette foreground both sides,
        caribou herd crossing tundra in silhouette middle distance,
        extraordinary pink orange gold sky reflected in lake,
        couple on rocky lakeshore foreground viewed from behind watching sun.`,
      ],
      group7: [
        `Virginia Falls NWT — higher than Niagara — in full flood,
        Nahanni River canyon walls on both sides,
        rainbow in mist, thundering water,
        bold powerful composition.`,
      ],
      winter: [
        `Yellowknife on Great Slave Lake in aurora season,
        Northern Lights spectacular above frozen lake,
        ice road with vehicles visible on lake,
        1960s prospecting camp, warm amber windows.`,
      ],
      tourism: [
        `Bold 1965 poster: Virginia Falls higher than Niagara,
        Nahanni River canyon, dramatic spray and rainbow,
        NWT in graphic lettering.`,
      ],
    },
  },

};

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT BUILDERS — one per collection
// ═══════════════════════════════════════════════════════════════════════════════

function buildPromptCPR(location, sceneText) {
  const scene = sceneText.trim().replace(/\s+/g, ' ');
  return `${CPR_STYLE} ${scene} ${CPR_TYPOGRAPHY} ` +
    `Title text: "${location.label}" — Subtitle: "${location.tagline_cpr}"`;
}

function buildPromptG7(location, sceneText) {
  const scene = sceneText.trim().replace(/\s+/g, ' ');
  return `${G7_STYLE} ${scene} ${G7_TYPOGRAPHY} Title: "${location.label}, ${location.province}"`;
}

function buildPromptWinter(location, sceneText) {
  const scene = sceneText.trim().replace(/\s+/g, ' ');
  return `${WINTER_STYLE} ${scene} ${WINTER_TYPOGRAPHY} ` +
    `Location name: "${location.label}" — greeting: "Season's Greetings from ${location.label}"`;
}

function buildPromptTourism(location, sceneText) {
  const scene = sceneText.trim().replace(/\s+/g, ' ');
  return `${TOURISM_STYLE} ${scene} ${TOURISM_TYPOGRAPHY} ` +
    `Location: "${location.label}" — Province: "${location.province}" — ` +
    `Tagline: "${location.tagline_tourism}"`;
}

const BUILDERS = {
  cpr:     buildPromptCPR,
  group7:  buildPromptG7,
  winter:  buildPromptWinter,
  tourism: buildPromptTourism,
};

const ASPECT_RATIOS = {
  cpr:     '2:3',   // portrait poster
  group7:  '1:1',   // square canvas
  winter:  '3:2',   // landscape greeting card
  tourism: '2:3',   // portrait poster
};

// ═══════════════════════════════════════════════════════════════════════════════
// GENERATOR ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

async function generateCard(ai, locationId, location, collectionId, sceneIndex, sceneText) {
  const buildPrompt = BUILDERS[collectionId];
  const prompt = buildPrompt(location, sceneText);
  const aspectRatio = ASPECT_RATIOS[collectionId];

  const outputId = `${locationId}--${collectionId}--scene${sceneIndex + 1}`;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`🎨  ${location.label} | ${collectionId.toUpperCase()} | Scene ${sceneIndex + 1}`);

  if (DRY_RUN) {
    const words = prompt.split(' ');
    let line = '    ';
    for (const w of words) {
      if (line.length + w.length > 80) { console.log(line); line = '    '; }
      line += w + ' ';
    }
    if (line.trim()) console.log(line);
    console.log('\n[dry run — no API call]');
    return 0;
  }

  try {
    const response = await ai.models.generateImages({
      model: MODEL,
      prompt,
      config: {
        numberOfImages:  COUNT,
        aspectRatio,
        outputMimeType:  'image/jpeg',
      },
    });

    const cardDir = path.join(OUT_DIR, collectionId, locationId, `scene${sceneIndex + 1}`);
    fs.mkdirSync(cardDir, { recursive: true });
    fs.writeFileSync(path.join(cardDir, 'prompt.txt'), prompt, 'utf8');

    let saved = 0;
    for (const [i, img] of response.generatedImages.entries()) {
      if (img.image?.imageBytes) {
        const file = path.join(cardDir, `variant-${i + 1}.jpg`);
        fs.writeFileSync(file, Buffer.from(img.image.imageBytes, 'base64'));
        saved++;
        console.log(`    ✅  ${collectionId}/${locationId}/scene${sceneIndex + 1}/variant-${i + 1}.jpg`);
      } else if (img.raiFilteredReason) {
        console.log(`    ⚠️   variant-${i + 1} filtered: ${img.raiFilteredReason}`);
      }
    }

    if (saved === 0) console.log('    ⚠️   No images saved — check safety filters');
    return saved;

  } catch (err) {
    console.error(`    ❌  ${err.message}`);
    if (err.message?.includes('quota'))   console.error('       → Quota exceeded — wait or check billing');
    if (err.message?.includes('API key')) console.error('       → Invalid API key');
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  // Determine which collections to run
  const allCollections = ['cpr', 'group7', 'winter', 'tourism'];
  const collections = args.collection
    ? (allCollections.includes(args.collection) ? [args.collection] : (() => {
        console.error(`\n❌  Unknown collection "${args.collection}". Options: ${allCollections.join(', ')}\n`);
        process.exit(1);
      })())
    : allCollections;

  // Determine which locations to run
  let locationEntries = Object.entries(LOCATIONS);
  if (args.card) {
    if (!LOCATIONS[args.card]) {
      console.error(`\n❌  Unknown location "${args.card}". Available:\n    ${Object.keys(LOCATIONS).join(', ')}\n`);
      process.exit(1);
    }
    locationEntries = [[args.card, LOCATIONS[args.card]]];
  } else if (args.set === 'cities') {
    locationEntries = locationEntries.filter(([,l]) => l.group === 'cities');
  } else if (args.set === 'towns') {
    locationEntries = locationEntries.filter(([,l]) => l.group === 'towns');
  } else if (args.set === 'provinces') {
    locationEntries = locationEntries.filter(([,l]) => l.group === 'provinces');
  }

  // Count total jobs
  let totalJobs = 0;
  for (const [,location] of locationEntries) {
    for (const collectionId of collections) {
      const scenes = location.scenes[collectionId] || [];
      totalJobs += scenes.length;
    }
  }

  const price = args.model === 'ultra' ? 0.06 : args.model === 'fast' ? 0.02 : 0.04;
  const cost  = (totalJobs * COUNT * price).toFixed(2);

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  MapleCard Full Collection Generator  🍁  Imagen 4           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`   Collections : ${collections.join(', ')}`);
  console.log(`   Locations   : ${locationEntries.length}  (${locationEntries.map(([id]) => id).join(', ')})`);
  console.log(`   Total scenes: ${totalJobs}`);
  console.log(`   Variants    : ${COUNT} per scene`);
  console.log(`   Total images: ${totalJobs * COUNT}`);
  console.log(`   Model       : ${MODEL}`);
  console.log(`   Est. cost   : ~$${cost} USD`);
  console.log(`   Output      : ./output/{collection}/{location}/scene{N}/variant-{N}.jpg`);
  if (DRY_RUN) console.log('   Mode        : DRY RUN — prompts only, no API calls');

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  let totalSaved = 0;

  for (const [locationId, location] of locationEntries) {
    for (const collectionId of collections) {
      const scenes = location.scenes[collectionId];
      if (!scenes || scenes.length === 0) {
        console.log(`\n⚠️   No scenes for ${locationId} in collection "${collectionId}" — skipping`);
        continue;
      }
      for (const [i, sceneText] of scenes.entries()) {
        totalSaved += await generateCard(ai, locationId, location, collectionId, i, sceneText);
        if (!DRY_RUN) await new Promise(r => setTimeout(r, 600));
      }
    }
  }

  console.log(`\n${'═'.repeat(62)}`);
  if (DRY_RUN) {
    console.log(`  ${totalJobs} scene prompts previewed. Remove --dry to generate images.`);
  } else {
    console.log(`  ✅  ${totalSaved} images saved → ./output/`);
    console.log('  Structure: output/{collection}/{location}/scene{N}/variant-{N}.jpg');
    console.log('  Pick the best variant from each folder,');
    console.log('  then copy to maplecard/public/{collection-name}/ 🍁');
  }
  console.log(`${'═'.repeat(62)}\n`);
  console.log('  QUICK START COMMANDS:');
  console.log('  node generate-all-collections.js --card=canmore --dry       Preview prompts');
  console.log('  node generate-all-collections.js --card=canmore --count=2   2 variants, all collections');
  console.log('  node generate-all-collections.js --set=towns --collection=cpr  All towns, CPR only');
  console.log('  node generate-all-collections.js --card=banff --collection=group7 --model=ultra');
  console.log();
}

main().catch(err => {
  console.error('\n❌  Fatal:', err.message);
  process.exit(1);
});
