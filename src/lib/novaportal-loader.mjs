/**
 * NovaPortal content loader for Astro's content layer.
 *
 * Usage in content.config.ts:
 *
 *   import { novaPortalLoader } from './lib/novaportal-loader.mjs';
 *   const journal = defineCollection({
 *     loader: novaPortalLoader({ portal: 'https://portal.example.com' }),
 *     schema: z.object({ ... })
 *   });
 *
 * Source of truth is the portal: published posts are pulled at build time from
 * `GET /api/v1/content/posts` with a bearer read token (options.token or the
 * NOVAPORTAL_READ_TOKEN environment variable). Entry ids are the URL slugs and
 * the data shape matches the local-markdown collection the site started from,
 * so `render(entry)` and its `headings` export keep working.
 *
 * FALLBACK: before the NovaPortal instance is provisioned (no read token, or the
 * portal is unreachable), the loader reads the local seed markdown in
 * src/content/<collection>/ instead, so the site still builds and looks complete.
 * Once NOVAPORTAL_READ_TOKEN is set in the build environment and the portal is
 * live, the portal wins and the local files become import source only.
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

/**
 * @param {object} options
 * @param {string} options.portal - Instance URL, e.g. https://portal.example.com
 * @param {string} [options.token] - Read token (default: NOVAPORTAL_READ_TOKEN env)
 * @param {string} [options.seedDir] - Local markdown fallback dir (default: src/content/journal)
 * @param {(post: object) => object} [options.mapData] - Map an API post onto the
 *   site's own schema shape. Default matches the standard Nova template.
 */
export function novaPortalLoader({ portal, token, seedDir, mapData } = {}) {
  if (!portal) throw new Error('novaPortalLoader: `portal` (instance URL) is required');
  const base = portal.replace(/\/+$/, '');

  const defaultMap = (p) => ({
    title: p.title,
    description: p.description,
    category: p.category,
    categoryLabel: p.categoryLabel,
    date: p.date,
    image: p.image,
    imageAlt: p.imageAlt,
    author: p.author,
    ...p.extras,
  });
  const map = mapData ?? defaultMap;

  return {
    name: 'novaportal-loader',
    load: async ({ store, parseData, generateDigest, logger }) => {
      const readToken = token ?? process.env.NOVAPORTAL_READ_TOKEN;

      let posts = null;
      if (readToken) {
        try {
          const res = await fetch(`${base}/api/v1/content/posts`, {
            headers: { Authorization: `Bearer ${readToken}` },
          });
          if (res.ok) {
            posts = (await res.json()).posts;
          } else {
            logger.warn(`novaPortalLoader: portal responded ${res.status} — falling back to local seed content`);
          }
        } catch (err) {
          logger.warn(`novaPortalLoader: portal unreachable (${err.message}) — falling back to local seed content`);
        }
      } else {
        logger.warn('novaPortalLoader: no NOVAPORTAL_READ_TOKEN — building from local seed content (portal not yet wired)');
      }

      store.clear();

      if (posts) {
        for (const p of posts) {
          const data = await parseData({ id: p.slug, data: map(p) });
          store.set({
            id: p.slug,
            data,
            body: p.body,
            rendered: { html: p.html, metadata: { headings: p.headings ?? [] } },
            digest: generateDigest(JSON.stringify([p.title, p.body, p.date, p.image])),
          });
        }
        logger.info(`Loaded ${posts.length} published posts from ${base}`);
        return;
      }

      // ---- Local seed fallback ----
      const dir = seedDir ?? path.join(process.cwd(), 'src', 'content', 'journal');
      if (!existsSync(dir)) {
        logger.info('novaPortalLoader: no local seed content found — building an empty collection');
        return;
      }
      const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
      for (const file of files) {
        const raw = await readFile(path.join(dir, file), 'utf8');
        const { fm, body } = parseFrontmatter(raw);
        const slug = file.replace(/\.md$/, '');
        const data = await parseData({ id: slug, data: map({ ...fm, extras: {} }) });
        store.set({
          id: slug,
          data,
          body,
          rendered: { html: marked.parse(body), metadata: { headings: extractHeadings(body) } },
          digest: generateDigest(raw),
        });
      }
      logger.info(`Loaded ${files.length} posts from local seed content (${path.relative(process.cwd(), dir)})`);
    },
  };
}

/** Minimal YAML-frontmatter parser: `key: value` scalars only (matches the seed template). */
function parseFrontmatter(raw) {
  const src = raw.replace(/^﻿/, '');
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: {}, body: src };
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    fm[kv[1]] = v;
  }
  return { fm, body: src.slice(m[0].length) };
}

const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Extract `## ` / `### ` headings for the article table of contents. */
function extractHeadings(body) {
  const headings = [];
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^(#{2,3})\s+(.*)$/);
    if (m) headings.push({ depth: m[1].length, slug: slugify(m[2]), text: m[2].trim() });
  }
  return headings;
}
