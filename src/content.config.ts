import { defineCollection, z } from 'astro:content';
import { novaPortalLoader } from './lib/novaportal-loader.mjs';

// The Journal is managed in NovaPortal (portal Worker + D1). The loader pulls
// published posts at build time; entry ids are the URL slugs. Same shape as the
// seed markdown in src/content/journal/, which is the import source and the
// build-time fallback before the portal instance is wired.
// Requires NOVAPORTAL_READ_TOKEN in the build env once the portal is live.
const journal = defineCollection({
  loader: novaPortalLoader({
    portal: 'https://novaportal-greennestco.collectiq.workers.dev',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().default('journal'),
    categoryLabel: z.string().default('Journal'),
    date: z.coerce.date(),
    image: z.string(),
    imageAlt: z.string().default(''),
    author: z.string().default('Green Nest Co'),
  }),
});

export const collections = { journal };
