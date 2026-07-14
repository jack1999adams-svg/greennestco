# Green Nest Co (GNc) — Website

> A calmer home creates a calmer life.

The production marketing + editorial site for **Green Nest Co**, a curated
natural-living homeware platform on an **affiliate** model (not e-commerce).
Built with [Astro](https://astro.build), content managed in **NovaPortal**
(per-site Cloudflare Worker + D1 + R2), deployed on **Cloudflare Pages**.

Live target: **https://greennestco.pages.dev**

---

## Local development

```bash
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # production build → dist/
npm run preview    # preview the production build
```

The **Journal** collection is loaded from NovaPortal at build time. Before the
portal instance is wired (no `NOVAPORTAL_READ_TOKEN`), the loader falls back to
the local seed markdown in `src/content/journal/`, so the site builds and looks
complete out of the box. Once the token is set and the portal is live, the
portal becomes the source of truth and the seed files become import source only.

## Project structure

```
src/
  layouts/Base.astro          Shared <head> (fonts, portal theme), header, footer
  components/                 Header, Footer, Logo, Placeholder, ProductCard,
                              Newsletter, ContactForm
  data/                       rooms, categories, products, partners, values
                              (drive the curated static pages)
  pages/
    index.astro               Homepage (Mockup E)
    about / sustainability / outdoor-living / brand-foundation / contact
    terms / affiliate-disclosure / 404
    rooms/                    Shop by Room (index + [room])
    categories/               Shop by Category (index + [category])
    journal/                  Journal (index + [slug]) — NovaPortal-managed
    nova-preview/default.astro Baked draft-preview template ({{NOVA_*}} sentinels)
  content/journal/            Seed Journal posts (import source + build fallback)
  lib/
    novaportal-loader.mjs     Content-layer loader (portal → local-seed fallback)
    theme.mjs                 Portal-managed design tokens + head snippets
    redirects-integration.mjs Appends portal-managed redirects to dist/_redirects
  styles/global.css           Design system (sage/clay/linen, Playfair + Montserrat)
.novaportal/instance.jsonc    NovaPortal instance config for this site
.github/workflows/deploy.yml  Pages deploy: on push, on publish, manual
```

## Design system

- **Palette:** sage `#8a9a7b` · warm clay `#b47b5e` · soft linen `#f2ece0` ·
  deep forest `#2e4034` (see `src/styles/global.css` `:root`).
- **Type:** Playfair Display (serif headings) + Montserrat (body).
- These tokens are also declared in `THEME_SCHEMA` in `.novaportal/instance.jsonc`,
  so the client can tune them from the portal's **Design** page — each `cssVar`
  maps to a variable in `global.css`.

## Affiliate model

GNc doesn't hold stock or process orders. Product cards link out to partner
brands (`rel="sponsored"`). `src/data/products.mjs` `href`s currently point at
each partner's site — **swap in your tracked affiliate links** (Awin / Impact /
ShareASale / direct programme) once approved. Partners live in
`src/data/partners.mjs`.

---

## NovaPortal onboarding runbook

There is no one-command installer yet — onboarding is the sequence below, run
from the **novaportal repo** on a machine that has the Cloudflare API token in
`.secrets.nova.local`. It provisions this site's isolated instance, imports the
seed Journal content, wires CI, and connects publish → rebuild.

Prerequisites: `wrangler` authenticated (or `CLOUDFLARE_API_TOKEN` +
`CLOUDFLARE_ACCOUNT_ID` in env), `gh` CLI authenticated, Node 22+.

Names used below — instance `greennestco`, worker/db `novaportal-greennestco`,
Pages project `greennestco`, account `911a99ce4beaeb65af7df82a32721cad`.

### 1. Provision D1 + R2

```bash
cd <novaportal-repo>
npx wrangler d1 create novaportal-greennestco
npx wrangler r2 bucket create novaportal-greennestco-media
```

Copy the printed **database_id** into this repo's
`.novaportal/instance.jsonc` → `d1_databases[0].database_id`
(replacing `REPLACE_WITH_D1_DATABASE_ID`).

### 2. Register the instance in the fleet

Add an entry to the novaportal repo's `registry.json`:

```jsonc
{ "name": "greennestco", "repo": "../greennestco" }
```

Then materialise the wrangler config:

```bash
node cli/novaportal.mjs sync
```

### 3. Instance secrets

Create `.secrets.greennestco.local` in the novaportal repo (git-ignored) with:

```
SETUP_TOKEN=<random-long-string>
READ_TOKEN=<random-long-string>          # NOVAPORTAL_READ_TOKEN for builds
GH_DISPATCH_TOKEN=<fine-grained PAT for jack1999adams-svg/greennestco>
RESEND_API_KEY=<optional, for form email delivery>
```

Push them onto the worker (D1 must exist first — from step 1):

```bash
npx wrangler secret bulk .secrets.greennestco.local --name novaportal-greennestco
```

### 4. Deploy the worker + run migrations

```bash
node cli/novaportal.mjs upgrade --instance greennestco
```

This applies D1 migrations, builds, and deploys the worker to
`https://novaportal-greennestco.collectiq.workers.dev`, then health-checks it.
(If the worker's public URL differs, update the four `PORTAL` constants in this
repo: `astro.config.mjs`, `src/lib/theme.mjs`, `src/content.config.ts`, and the
form `action`s in `Newsletter.astro` / `ContactForm.astro`.)

### 5. Seed the admin login

```bash
node cli/novaportal.mjs seed-admin \
  --portal https://novaportal-greennestco.collectiq.workers.dev \
  --token <SETUP_TOKEN> \
  --email <you@greennestco.co.uk> --name "Green Nest Co" --password <password>
```

### 6. Seed the newsletter form

The `lead` form (used by the Contact page) ships by default. Add the
`newsletter` form used by the homepage signup:

```bash
npx wrangler d1 execute novaportal-greennestco -c instances/greennestco.jsonc --remote \
  --command "INSERT INTO forms (key, name) VALUES ('newsletter', 'Newsletter signup')"
```

### 7. Import the seed Journal content

Dry run, then apply (uploads any referenced images to R2 and inserts posts +
categories with slugs preserved):

```bash
node cli/novaportal.mjs import --site ../greennestco --collection journal \
  --portal https://novaportal-greennestco.collectiq.workers.dev --token <SETUP_TOKEN>
# looks right? add --apply
node cli/novaportal.mjs import --site ../greennestco --collection journal \
  --portal https://novaportal-greennestco.collectiq.workers.dev --token <SETUP_TOKEN> --apply
```

### 8. Create the Cloudflare Pages project + first deploy

From **this** repo:

```bash
cd ../greennestco
NOVAPORTAL_READ_TOKEN=<READ_TOKEN> npx astro build
npx wrangler pages deploy dist --project-name greennestco --branch main --commit-dirty=true
```

This creates `greennestco.pages.dev` and publishes the first build (with Journal
content pulled from the portal).

### 9. Wire CI (read token + publish → rebuild)

```bash
cd <novaportal-repo>
node cli/novaportal.mjs wire --instance greennestco
```

For `ci.kind: "actions"` this sets `NOVAPORTAL_READ_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets on `jack1999adams-svg/greennestco`.
Then finish the two things it can't mint automatically:

- **`CLOUDFLARE_API_TOKEN`** — create a token with *Cloudflare Pages: Edit* and
  set it: `gh secret set CLOUDFLARE_API_TOKEN --repo jack1999adams-svg/greennestco`
- **`GH_DISPATCH_TOKEN`** — a fine-grained PAT covering this repo, set on the
  worker so publishing fires the rebuild:
  `echo 'GH_DISPATCH_TOKEN=<pat>' >> .secrets.greennestco.local` then re-run the
  `wrangler secret bulk` from step 3.

`.github/workflows/deploy.yml` already listens for `repository_dispatch`
(`novaportal-publish`), so publishing in the portal triggers a Pages rebuild.

### 10. Verify end-to-end

1. Log into the portal, open a Journal post, edit and **Publish**.
2. Confirm the GitHub Action runs (Actions tab) and Pages redeploys.
3. Confirm the change is live on `greennestco.pages.dev`.
4. Submit the homepage newsletter form and the Contact form — check they appear
   in the portal's submissions inbox.

## Custom domain (later)

Attach the domain in **Cloudflare Pages → Custom domains**, then update `site`
in `astro.config.mjs` and `SITE_URL` / `PREVIEW_SITE_URL` in
`.novaportal/instance.jsonc` (re-run `novaportal sync`), and redeploy.

## Form email delivery (optional)

Form submissions are always stored in the portal. To also email them, set
`RESEND_API_KEY` (and `LEAD_TO_EMAIL` / `LEAD_FROM_EMAIL`) on the worker — see
`.novaportal/instance.jsonc`. Until then, no submissions are lost; they just
aren't emailed.
