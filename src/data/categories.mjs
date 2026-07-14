// Shop by Category — the GNc Product Universe (Part 5), plus the Part 3 nav set.
export const categories = [
  {
    slug: 'furniture',
    name: 'Furniture',
    tone: 'Solid, timeless, grounded',
    includes: 'Sofas, armchairs, coffee tables, sideboards, dining tables, benches, bed frames, desks.',
    blurb: 'Solid-wood and naturally-finished pieces built to last through seasons and years.',
  },
  {
    slug: 'pottery-ceramics',
    name: 'Pottery & Ceramics',
    tone: 'Imperfect, honest, human',
    includes: 'Vases, bowls, mugs, plates, decorative and sculptural pieces.',
    blurb: 'Hand-thrown stoneware and clay — the quiet beauty of the hand-touched and imperfect.',
  },
  {
    slug: 'textiles',
    name: 'Textiles & Soft Furnishings',
    tone: 'Warm, tactile, natural',
    includes: 'Throws, cushions, bedspreads, table linens, curtains, natural-fibre rugs.',
    blurb: 'Linen, wool, cotton and jute — soft, breathable textures that warm a room.',
  },
  {
    slug: 'baskets',
    name: 'Baskets & Storage',
    tone: 'Natural, functional, beautiful',
    includes: 'Seagrass and jute baskets, woven storage, under-bed storage, laundry baskets.',
    blurb: 'Handwoven natural-fibre storage that keeps calm, uncluttered spaces.',
  },
  {
    slug: 'aromatherapy-candles',
    name: 'Aromatherapy & Candles',
    tone: 'Soft, sensory, restorative',
    includes: 'Natural-wax candles, diffusers, room sprays, incense, wax melts (natural only).',
    blurb: 'Plant-based waxes and essential oils for restorative, sensory rituals.',
  },
  {
    slug: 'art-wall-decor',
    name: 'Art & Wall Decor',
    tone: 'Minimal, organic, expressive',
    includes: 'Prints, photography, textural wall hangings, mirrors, sculptural pieces.',
    blurb: 'Minimal, organic pieces that bring expression and warmth to bare walls.',
  },
  {
    slug: 'plants',
    name: 'Plants & Botanical Living',
    tone: 'Alive, fresh, calming',
    includes: 'Indoor and outdoor plants, planters, pots, botanical accessories.',
    blurb: 'Greenery and eco-friendly planters — the living heart of a natural home.',
  },
  {
    slug: 'outdoor-living',
    name: 'Outdoor Living',
    tone: 'Earthy, warm, evening light',
    includes: 'Outdoor seating, tables, lanterns, candles, planters, ornaments, outdoor rugs, cushions.',
    blurb: 'Weather-honest pieces for the garden — an extension of the calm indoors.',
  },
];

export const categoryBySlug = (slug) => categories.find((c) => c.slug === slug);
