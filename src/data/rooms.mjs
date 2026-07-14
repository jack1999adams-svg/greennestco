// Shop by Room — the seven spaces from the GNc foundation (Part 2 / Part 3).
export const rooms = [
  {
    slug: 'living-room',
    name: 'Living Room',
    tagline: 'a space for warmth, comfort, and connection',
    intro:
      'The heart of the home. Grounded seating, natural-fibre rugs and soft, tactile textiles that invite you to slow down and stay a while.',
    categories: ['furniture', 'textiles', 'baskets', 'pottery-ceramics', 'art-wall-decor', 'plants'],
    tone: 'sage',
  },
  {
    slug: 'bedroom',
    name: 'Bedroom',
    tagline: 'soft textures and calming tones for rest and renewal',
    intro:
      'A sanctuary for rest. Breathable linens, gentle lighting and quiet, uncluttered pieces that help the day wind down.',
    categories: ['textiles', 'furniture', 'aromatherapy-candles', 'baskets', 'art-wall-decor'],
    tone: 'clay',
  },
  {
    slug: 'bathroom',
    name: 'Bathroom',
    tagline: 'natural materials for quiet, grounding rituals',
    intro:
      'Turn a daily routine into a ritual. Stoneware, natural fibres and plant-based scents for a spa-like calm.',
    categories: ['pottery-ceramics', 'textiles', 'aromatherapy-candles', 'baskets', 'plants'],
    tone: 'sage',
  },
  {
    slug: 'kitchen-dining',
    name: 'Kitchen & Dining',
    tagline: 'a place for nourishment, gathering, and slow moments',
    intro:
      'Where people gather. Honest ceramics, solid-wood tables and natural table linens made for long, unhurried meals.',
    categories: ['pottery-ceramics', 'furniture', 'textiles', 'baskets'],
    tone: 'clay',
  },
  {
    slug: 'hallway',
    name: 'Hallway',
    tagline: 'the first impression: simple, intentional, welcoming',
    intro:
      'The threshold of the home. Considered storage, a warm mirror and a single sculptural piece to set the tone.',
    categories: ['baskets', 'art-wall-decor', 'furniture', 'plants'],
    tone: 'sage',
  },
  {
    slug: 'home-office',
    name: 'Home Office',
    tagline: 'a calm, focused space for clarity and creativity',
    intro:
      'Clear space, clear mind. Solid desks, natural storage and greenery that keeps a working day grounded.',
    categories: ['furniture', 'baskets', 'plants', 'art-wall-decor', 'aromatherapy-candles'],
    tone: 'clay',
  },
  {
    slug: 'garden-outdoor',
    name: 'Garden & Outdoor',
    tagline: 'a sanctuary under open sky',
    intro:
      'Your home, extended. Weather-honest furniture, lanterns and planters for evenings spent close to nature.',
    categories: ['outdoor-living', 'plants', 'aromatherapy-candles', 'textiles'],
    tone: 'sage',
  },
];

export const roomBySlug = (slug) => rooms.find((r) => r.slug === slug);
