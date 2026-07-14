// Curated affiliate products (GNc business model, Part 6). Descriptions are
// original, GNc-written editorial copy. Photography is not held by GNc — tiles
// use an on-brand placeholder until partner/licensed imagery is dropped in
// (set `image` to a path or URL to replace the placeholder).
//
// `partner` maps to src/data/partners.mjs. `href` defaults to the partner's
// site; swap in your tracked affiliate link once the programme is approved.
import { partners } from './partners.mjs';

const p = (partner, path = '') => (partners[partner]?.url ?? '#') + path;

export const products = [
  {
    slug: 'handwoven-seagrass-basket',
    name: 'Handwoven Seagrass Basket',
    partner: 'nkuku',
    category: 'baskets',
    rooms: ['living-room', 'hallway', 'bedroom'],
    featured: true,
    description:
      'Woven by hand from natural seagrass, this open basket keeps throws, logs or laundry close and clutter out of sight. No two are quite alike.',
    href: p('nkuku'),
  },
  {
    slug: 'reactive-glaze-stoneware-mug',
    name: 'Reactive-Glaze Stoneware Mug',
    partner: 'nkuku',
    category: 'pottery-ceramics',
    rooms: ['kitchen-dining'],
    featured: true,
    description:
      'A generous mug in hand-glazed stoneware, each one settling into its own soft, tonal finish. Made to be held on slow mornings.',
    href: p('nkuku'),
  },
  {
    slug: 'recycled-cotton-throw',
    name: 'Recycled Cotton Waffle Throw',
    partner: 'casa-beyond',
    category: 'textiles',
    rooms: ['living-room', 'bedroom'],
    featured: true,
    description:
      '100% cotton, woven in a soft waffle that softens further with every wash. A quiet layer of warmth for the sofa or the end of the bed.',
    href: p('casa-beyond'),
  },
  {
    slug: 'flatweave-wool-rug',
    name: 'Natural Flatweave Rug',
    partner: 'fableroom',
    category: 'textiles',
    rooms: ['living-room', 'bedroom', 'home-office'],
    description:
      'A flatweave rug in undyed natural tones that grounds a room without shouting. Tactile underfoot, timeless in a space.',
    href: p('fableroom'),
  },
  {
    slug: 'weaver-green-outdoor-rug',
    name: 'All-Weather Woven Rug',
    partner: 'weaver-green',
    category: 'outdoor-living',
    rooms: ['garden-outdoor', 'living-room'],
    description:
      'A hard-wearing woven rug that lives happily indoors or out. Soft as wool underfoot, and simply hosed clean when the season turns.',
    href: p('weaver-green'),
  },
  {
    slug: 'reclaimed-wood-coffee-table',
    name: 'Reclaimed Wood Coffee Table',
    partner: 'garden-trading',
    category: 'furniture',
    rooms: ['living-room'],
    featured: true,
    description:
      'Built from reclaimed timber with a solid, honest presence. The grain, knots and marks are part of the story, not flaws to hide.',
    href: p('garden-trading'),
  },
  {
    slug: 'vintage-linen-armchair',
    name: 'Heritage Linen Armchair',
    partner: 'vintage-sofa-co',
    category: 'furniture',
    rooms: ['living-room', 'home-office'],
    description:
      'A hand-built armchair upholstered in natural linen, made to be reupholstered rather than replaced. Comfort that ages gracefully.',
    href: p('vintage-sofa-co'),
  },
  {
    slug: 'soy-wax-candle-fig',
    name: 'Natural Soy Candle — Fig & Cedar',
    partner: 'earl-of-east',
    category: 'aromatherapy-candles',
    rooms: ['living-room', 'bathroom', 'bedroom'],
    featured: true,
    description:
      'Plant-based wax and essential oils poured into a reusable vessel. Warm fig softened with cedar — restorative, never synthetic.',
    href: p('earl-of-east'),
  },
  {
    slug: 'ceramic-diffuser',
    name: 'Stoneware Reed Diffuser',
    partner: 'earl-of-east',
    category: 'aromatherapy-candles',
    rooms: ['bathroom', 'hallway', 'home-office'],
    description:
      'A matte stoneware vessel and natural reeds carry a low, steady scent through a room. Refillable, so the vessel stays for years.',
    href: p('earl-of-east'),
  },
  {
    slug: 'terracotta-planter',
    name: 'Hand-Thrown Terracotta Planter',
    partner: 'crocus',
    category: 'plants',
    rooms: ['garden-outdoor', 'living-room', 'hallway'],
    description:
      'Classic terracotta that breathes with the plant and weathers beautifully outdoors. The quiet backdrop greenery deserves.',
    href: p('crocus'),
  },
  {
    slug: 'potted-olive-tree',
    name: 'Potted Olive Tree',
    partner: 'crocus',
    category: 'plants',
    rooms: ['garden-outdoor', 'living-room'],
    featured: true,
    description:
      'A slow-growing evergreen with silvered leaves, as at home by a doorway as on a terrace. Living structure for a calm space.',
    href: p('crocus'),
  },
  {
    slug: 'garden-lantern',
    name: 'Recycled Glass Garden Lantern',
    partner: 'garden-trading',
    category: 'outdoor-living',
    rooms: ['garden-outdoor'],
    description:
      'A simple lantern for a natural-wax candle, casting warm evening light across the garden table long after sunset.',
    href: p('garden-trading'),
  },
  {
    slug: 'solid-oak-desk',
    name: 'Solid Oak Writing Desk',
    partner: 'garden-trading',
    category: 'furniture',
    rooms: ['home-office'],
    description:
      'A pared-back desk in solid oak — room to think, nothing to distract. Finished with natural oil, not lacquer.',
    href: p('garden-trading'),
  },
  {
    slug: 'wood-veneer-wall-panel',
    name: 'Solid-Wood Wall Panelling',
    partner: 'charles-ivy',
    category: 'art-wall-decor',
    rooms: ['living-room', 'bedroom', 'hallway'],
    description:
      'Real wood panelling that brings warmth and texture to a bare wall. We feature only the solid-wood and veneer pieces — never composite cores.',
    href: p('charles-ivy'),
  },
  {
    slug: 'linen-cushion-set',
    name: 'Washed Linen Cushion',
    partner: 'nkuku',
    category: 'textiles',
    rooms: ['living-room', 'bedroom'],
    description:
      'Stonewashed linen in muted, earthy tones. Soft-edged and lived-in from the first day, better with every year.',
    href: p('nkuku'),
  },
];

export const featuredProducts = () => products.filter((x) => x.featured);
export const productsInRoom = (roomSlug) => products.filter((x) => x.rooms.includes(roomSlug));
export const productsInCategory = (catSlug) => products.filter((x) => x.category === catSlug);
