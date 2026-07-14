/**
 * Design tokens + custom head code managed in NovaPortal. Fetched once per
 * build. themeCss is a CSS override block (`:root{--brand:#…}`) and headHtml is
 * the enabled custom snippets (analytics etc.) — both empty when nothing is
 * configured, in which case the built site is byte-identical to an unmanaged
 * build. Fails soft: a portal fetch problem never breaks the site build.
 */
const PORTAL = 'https://novaportal-greennestco.collectiq.workers.dev';

async function loadTheme() {
  const token = process.env.NOVAPORTAL_READ_TOKEN;
  if (!token) return {};
  try {
    const res = await fetch(`${PORTAL}/api/v1/content/theme`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

const theme = await loadTheme();
export const themeCss = theme.css || '';

const snippets = theme.headSnippets || [];
const withSlashes = (p) => `/${String(p || '').replace(/^\/+|\/+$/g, '')}/`.replace(/\/{2,}/g, '/');

/**
 * Head code for a given page, honouring each snippet's scope: 'site'
 * (everywhere), 'section' (a page and everything under it), or 'page'
 * (that page only). Called from the base layout with Astro.url.pathname.
 */
export function headHtmlFor(pathname) {
  const page = withSlashes(pathname);
  return snippets
    .filter((s) => {
      if (s.scope === 'page') return page === withSlashes(s.path);
      if (s.scope === 'section') return page.startsWith(withSlashes(s.path));
      return true;
    })
    .map((s) => s.html)
    .join('\n');
}
