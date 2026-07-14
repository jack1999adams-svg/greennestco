# Green Nest Co — NovaPortal onboarding runbook & diagnostics

Handoff doc for a NovaPortal-side session. Use it to stand up this site's
instance, or to diagnose where onboarding went wrong.

## Context

- **Site:** Green Nest Co (GNc) — a curated natural-living homeware site,
  affiliate model. Astro static site → Cloudflare Pages, content managed in
  NovaPortal (per-site Worker + D1 + R2), modelled on the Redflags instance.
- **Site repo:** `jack1999adams-svg/greennestco` (default branch `main`).
  Locally expected at `../greennestco` relative to the NovaPortal repo.
- **State:** the Astro site is built, verified locally, and pushed. It builds
  even before the portal exists (the loader falls back to local seed markdown in
  `src/content/journal/`). What remains is provisioning + wiring the instance and
  deploying to Pages — the steps below.

## Key facts

| Thing | Value |
|---|---|
| Instance name (registry) | `greennestco` |
| Worker + D1 database name | `novaportal-greennestco` |
| R2 bucket | `novaportal-greennestco-media` |
| Expected worker URL | `https://novaportal-greennestco.collectiq.workers.dev` |
| Cloudflare Pages project | `greennestco` (→ `greennestco.pages.dev`) |
| Cloudflare account id | `911a99ce4beaeb65af7df82a32721cad` |
| GitHub repo | `jack1999adams-svg/greennestco` |
| CMS content type | `journal` collection (blog posts) |
| Forms | `lead` (Contact, seeded by default) + `newsletter` (must be seeded) |
| Nova-side secrets | `NovaPortal/.secrets.nova.local` |
| Instance secrets | `NovaPortal/.secrets.greennestco.local` |

## How the site references the portal

Four constants in the site repo hardcode the worker URL. If the worker deploys
under a different subdomain than `collectiq.workers.dev`, all four must be
updated (then commit + push + redeploy):

- `astro.config.mjs` (redirects integration)
- `src/lib/theme.mjs` (`PORTAL`)
- `src/content.config.ts` (loader `portal`)
- `src/components/Newsletter.astro` and `src/components/ContactForm.astro` (form `action`)

The site's `.novaportal/instance.jsonc` is the instance config the CLI
materialises into a wrangler config via `registry.json`.

---

## Runbook (run from the NovaPortal repo unless noted)

Prerequisites: `wrangler` authenticated (or `CLOUDFLARE_API_TOKEN` +
`CLOUDFLARE_ACCOUNT_ID` in env / `.secrets.nova.local`), `gh` authenticated,
Node 22+.

### 0. Get the site code onto `main`
The deploy workflow must live on `main` for publish→rebuild to work.
```bash
cd ../greennestco
git fetch origin
git checkout main
git merge origin/claude/astro-novaportal-deploy-uiha6a
git push origin main
cd ../NovaPortal
```

### 1. Provision D1 + R2
```bash
npx wrangler d1 create novaportal-greennestco
npx wrangler r2 bucket create novaportal-greennestco-media
```
Put the printed **`database_id`** into `../greennestco/.novaportal/instance.jsonc`
→ `d1_databases[0].database_id` (replace `REPLACE_WITH_D1_DATABASE_ID`), commit + push.

### 2. Register in the fleet
Add to `registry.json` → `instances`:
```jsonc
{ "name": "greennestco", "repo": "../greennestco" }
```
```bash
node cli/novaportal.mjs sync
```

### 3. Instance secrets
Create `.secrets.greennestco.local`:
```
SETUP_TOKEN=<random long string>
READ_TOKEN=<random long string>
GH_DISPATCH_TOKEN=<fine-grained PAT covering jack1999adams-svg/greennestco>
RESEND_API_KEY=<optional, for form email delivery>
```
```bash
npx wrangler secret bulk .secrets.greennestco.local --name novaportal-greennestco
```

### 4. Deploy the worker + run migrations
```bash
node cli/novaportal.mjs upgrade --instance greennestco
```
Note the worker URL it prints; update the four site constants if it differs.

### 5. Seed the admin login
```bash
node cli/novaportal.mjs seed-admin \
  --portal https://novaportal-greennestco.collectiq.workers.dev \
  --token <SETUP_TOKEN> \
  --email you@greennestco.co.uk --name "Green Nest Co" --password <password>
```

### 6. Seed the newsletter form
```bash
npx wrangler d1 execute novaportal-greennestco -c instances/greennestco.jsonc --remote \
  --command "INSERT INTO forms (key, name) VALUES ('newsletter', 'Newsletter signup')"
```

### 7. Import the seed Journal content
```bash
# dry run first
node cli/novaportal.mjs import --site ../greennestco --collection journal \
  --portal https://novaportal-greennestco.collectiq.workers.dev --token <SETUP_TOKEN>
# then apply
node cli/novaportal.mjs import --site ../greennestco --collection journal \
  --portal https://novaportal-greennestco.collectiq.workers.dev --token <SETUP_TOKEN> --apply
```

### 8. Create the Pages project + first deploy (from the site repo)
```bash
cd ../greennestco
# PowerShell: $env:NOVAPORTAL_READ_TOKEN="<READ_TOKEN>"; npx astro build
# cmd:        set NOVAPORTAL_READ_TOKEN=<READ_TOKEN> && npx astro build
npx wrangler pages deploy dist --project-name greennestco --branch main --commit-dirty=true
cd ../NovaPortal
```

### 9. Wire CI (read token + publish→rebuild)
```bash
node cli/novaportal.mjs wire --instance greennestco
```
`ci.kind` is `actions`, so this sets `NOVAPORTAL_READ_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets. Then finish manually:
```bash
gh secret set CLOUDFLARE_API_TOKEN --repo jack1999adams-svg/greennestco   # token: Cloudflare Pages: Edit
```
And confirm `GH_DISPATCH_TOKEN` (step 3) is set on the worker — it's what fires
the rebuild dispatch on publish.

### 10. Verify end-to-end
1. Portal → edit a Journal post → **Publish**.
2. GitHub Actions runs (`novaportal-publish` → deploy.yml) → Pages redeploys.
3. Change is live on `greennestco.pages.dev`.
4. Newsletter + Contact forms land in the portal submissions inbox.

---

## Diagnostics — where it commonly breaks

**Worker health check (start here):**
```bash
curl https://novaportal-greennestco.collectiq.workers.dev/api/health
```
Expect JSON like `{ site, posts, submissions }`. If it fails, the worker isn't
deployed (step 4) or the URL/subdomain differs.

| Symptom | Likely cause | Fix |
|---|---|---|
| `upgrade` fails on migrations | `database_id` still the placeholder, or D1 not created | Steps 1 + fill `instance.jsonc` |
| `no secrets file for greennestco` | `.secrets.greennestco.local` missing | Step 3 |
| `wire` / `secret bulk` errors: no D1 binding | secrets pushed before D1 exists | Run step 1 before step 3 |
| Site build fails: `no read token` | `NOVAPORTAL_READ_TOKEN` not in build env | Set it locally (step 8) / via `wire` for CI (step 9) |
| Site builds but Journal is the 3 seed posts only | build didn't reach the portal (no/invalid token, or worker down) — loader fell back to local seed | Check `/api/health`, confirm `READ_TOKEN` matches the worker's secret |
| Journal empty after import | import ran without `--apply`, or wrong `--collection` (must be `journal`) | Re-run step 7 with `--apply` |
| Newsletter form returns 404 | `newsletter` form row not seeded | Step 6 |
| Contact form returns 404 | worker missing the default `lead` seed (migration 0001) | re-run migrations via `upgrade` |
| Publish doesn't trigger a rebuild | `GH_DISPATCH_TOKEN` missing on worker, or `CLOUDFLARE_API_TOKEN` missing on the repo | Step 9 |
| Deploy Action fails at wrangler step | `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets missing on repo | Step 9 |
| Portal preview shows raw `{{NOVA_*}}` | the baked `/nova-preview/default/` page missing from the deployed site | confirm the site deployed and the route exists |

## Known assumptions / placeholders (verify these)

- Worker URL assumed `novaportal-greennestco.collectiq.workers.dev` (same
  account subdomain as Redflags). Correct the four site constants if different.
- `instance.jsonc` `database_id` is a placeholder until step 1.
- `registry.json` entry (step 2) is **not** yet committed to the NovaPortal repo.
- Affiliate links in the site's `src/data/products.mjs` point at partner
  homepages (not launch-blocking, but not tracked links yet).
