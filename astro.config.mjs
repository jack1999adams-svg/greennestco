import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { novaPortalRedirects } from './src/lib/redirects-integration.mjs';

// The NovaPortal instance worker for this site. Same Cloudflare account as the
// rest of the fleet, so the workers.dev subdomain matches (collectiq). Update
// here if the worker is deployed under a different name/subdomain.
const PORTAL = 'https://novaportal-greennestco.collectiq.workers.dev';

export default defineConfig({
  // Update to the custom domain when it goes live (e.g. https://greennestco.co.uk).
  site: 'https://greennestco.pages.dev',
  output: 'static',
  integrations: [
    sitemap({ filter: (page) => !page.includes('/nova-preview/') }),
    novaPortalRedirects({ portal: PORTAL }),
  ],
});
