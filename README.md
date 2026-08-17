# inklinenews.com

Marketing, discovery and support site for Inkline, built to the July 2026 brief.
Astro 5, static output, zero external JavaScript, Cloudflare Pages target.

## Run it

    npm install
    npm run dev        # local preview at localhost:4321
    npm run build      # gates + build + gates + sitemaps

## The build gates (all wired into `npm run build`, all fail the deploy)

| Gate | Brief | What it does |
| --- | --- | --- |
| `gate-duplicates` | §6.2 | Runs before compile. Fails on any description under 55 words, any pair over 0.70 TF-IDF cosine similarity, any sentence verbatim on more than 3 pages. |
| `gate-feed-urls` | §7 | Runs on `dist/`. Fails on any registry feed URL, external /rss /feed /atom paths, `feeds.` hostnames, `.xml?` endpoints, any `/api/` route or stray `.json`. |
| `gate-colours` | §15 | Fails on any hex value in compiled CSS/HTML outside `src/styles/tokens.css`. |
| `gate-vocabulary` | §12A.1 | Fails on banned words/constructions in visible copy; allows literal "landscape reading" etc. |

`build-sitemaps.mjs` then splits sitemaps by depth tier (core, publications-1/2/3,
guides) and honours the per-publication `index: false` escape hatch (§6.4).

## What is real vs stand-in

Real and final in structure: the IA (§4), all templates, internal-linking rules
enforced by the generator, JSON-LD per page type, FAQ blocks with FAQPage schema,
breadcrumbs, self-canonicals, robots.txt, llms.txt, the entrance animation and its
guardrails, tiered sitemaps, the four gates.

Stand-ins, all flagged inline in the code:
- **Registry**: `src/data/registry/` is a 12-publication SAMPLE. Point the build
  at the private registry repo and the whole directory generates. Tier-1
  descriptions here are drafts for Michael's read (§6.3).
- **Inkdrop mark**: `src/components/Mark.astro` + favicon + OG image are a
  placeholder drop. Acceptance requires the supplied vector, unaltered; swap at
  Stage 0 and design the 16px simplified variant properly.
- **Palette**: working values in `tokens.css` per the brief's direction. Replace
  `--ink` (and check the rest) against the app's asset-catalogue values.
- **App Store ID + Team ID**: `src/lib/site.ts` and
  `public/.well-known/apple-app-site-association`. The Smart App Banner meta in
  `Base.astro` is commented until the ID is real.
- **Screenshots**: slots noted on feature pages; every image must be a real
  Inkline screenshot per §12A.3.
- **Guide**: one of the four launch guides is drafted, with [VERIFY] comments on
  every falsifiable row. Three more to write.
- **Reviews**: intentionally absent. Real ones only, with storefront noted, once
  the review texts are pulled from App Store Connect.
- **Contact form**: Cloudflare/Formspark wiring at Stage 1.
- **Fonts**: Literata (OFL, the app's reading face) + Inter as the SF Pro web
  substitute pending Michael's §16.8 decision. Fontsource ships all subsets;
  unicode-range means browsers only fetch Latin, but a prune to Latin+Latin-Ext
  files is a nice-to-have. Preload of the display face: add once filenames are
  pinned by the fonts API.

## Design direction (for the Stage-0 sign-off)

Named signature: **the ink drop that becomes the mark** — the entrance per the
timing study choreography (fall 40–500ms, squash, three ripples revealing header
then hero, header rule sweep at 580ms, complete ≤1.18s, H1 fully visible by
700ms, once per session, pure CSS, ~1.2KB total inline JS), resolving into the
permanent header lockup. Its second act is the **ink line**: a 2px pencil-blue
rail in the left margin column that draws itself as the reader scrolls
(scroll-driven animation, static rule as fallback).

The stated aesthetic risk, taken with the brand: the **verification stamp** —
the one place proof-red appears, a hand-rotated (−1.2°) stamped tick that draws
itself once on scroll, carrying the last-verified date on every publication
page. It is the product's claim rendered as a mark.

Everything else is disciplined: Literata at optical sizes for display and body,
Inter for data surfaces with tabular numerals, an asymmetric frame (rail +
content), no gradients, no cards, no centred hero, hairlines only where they
separate real rows.

## The home page graphics (brief amendment, agreed)

The home page carries two custom WebGL fragment shaders, written by hand, no
libraries: the marbled-ink hero (the entrance drop's impact releases the ink)
and the landing surface (headlines drop and ring out with the mark's own
hand-drawn wobble; tap to add your own). Together they are ~9KB of inline
JavaScript. This is a deliberate, home-only amendment to the brief's JS rule;
every other page keeps zero script beyond the entrance guard. Fallback chain:
WebGL missing or shader failure removes the canvas and the static ring
watermark shows; prefers-reduced-motion renders a single settled frame and
disables the newsfall. Both canvases pause offscreen via IntersectionObserver.
In file:// preview copies, any GL failure prints a visible red-on-navy banner
to screenshot; in production it logs to console and degrades silently.

Headlines in the landing section come from src/data/headlines.json (SAMPLE
data, replace before deploy). A build-time source can regenerate that file;
never put feed URLs in it. The App Store buttons are styled text links; swap
in Apple's official badge artwork from the marketing portal before launch if
preferred.

## Registry (now real)

src/data/registry/publications-full.json is the app's actual registry
(v1, updated 2026-07-17), ingested from the technical manual's Appendix B:
817 sources, 55 markets, 34 languages, tiers 1/2, paywall none/metered/hard,
global flags. editorial.json holds the 11 written detail pages; detail pages
generate only for slugs present there (no thin pages exist to noindex). Index,
market and topic pages render all 817 from metadata. Tier is deliberately not
displayed, matching the app. 1,986 sources are headlines-backed in the app; the
site states this only as an aggregate fact.

The site describes 1.6 (registry v3, 5,175 sources / 105 markets / 72
languages, updated 11 Aug 2026; Gen-AI position dataset dated 16 Aug 2026):
freemium unchanged (free tier, 50 publications; Pro monthly £2.99 / annual
£14.99 UK, week-free intro offer on both), coverage reports, the Atlas,
per-keyword numbers, the rewritten Today, OPML export and the Gen-AI dataset.
Registry ingest: `Inkline-Publications.xlsx` -> `src/data/registry/*` with
feed URLs stripped at ingest (they never enter this repo); slugs are
preserved across registry versions by domain-and-name matching so publication
URLs stay stable. KNOWN GAP: the public changelog jumps 1.4 -> 1.6 because
1.5's release notes were never supplied; add the 1.5 entry when Michael
provides it.

## News section (Substack-fed)

/news/ lists White Wiki posts about Inkline. scripts/fetch-news.mjs runs first
in the build: it fetches https://www.whitewiki.org/feed, keeps posts whose
<category> matches "inkline" (falling back to a title/excerpt keyword match if
Substack ships no categories), and writes src/data/news.json. Any failure
keeps the committed news.json, so the page can never break the build. Tag
posts "Inkline" on Substack and they appear on the next deploy.

Because the site is static, new posts appear when a build runs. On Cloudflare
Pages, create a Deploy Hook and ping it after publishing (or on a daily cron
via any scheduler); the fetch does the rest.

## Launch checklist (state as of this build)

Done and gated: full IA (50 pages), the shader home (hero + landing surface),
five gates (registry validation, near-duplicates, feed-URL exclusion, colour,
vocabulary incl. em dashes and antithesis constructions), tiered sitemaps,
llms.txt, robots.txt, AASA with the real bundle id, Safari-safe fonts with
preload, _redirects, four guides ([VERIFY] comments flag every claim needing
Michael's sign-off).

Waiting on Michael: App Store ID + Team ID (Smart App Banner + AASA), the real
800-row registry (drop into src/data/registry/, validator + gates take it from
there), real headlines for src/data/headlines.json, screenshots for feature
pages, legal wording for privacy/terms, Tier-1 description read, official App
Store badge artwork if preferred over the styled button, and the app tech
breakdown artifact for the style/database truing pass.

## Hosting: two prepared routes, Cloudflare Pages recommended

Route 1 (recommended): Cloudflare Pages, free tier. Static hosting with a
global CDN, unlimited bandwidth for this use, builds on every push. Setup:
push the repo to GitHub; Cloudflare dashboard -> Workers & Pages -> create
Pages project -> connect the repo; build command `npm run build`, output
directory `dist`, Node 22. Add the custom domain inklinenews.com and follow
the DNS instructions (a CNAME added in SiteGround's DNS zone, or move the
zone to Cloudflare free; domain REGISTRATION stays at SiteGround either way).
public/_redirects and public/_headers apply natively. For daily /news/
freshness, create a Deploy Hook and enable .github/workflows/rebuild-news.yml
with the hook URL as the CF_DEPLOY_HOOK secret. Email: the free plan carries
no mailboxes; Cloudflare Email Routing forwards hello@inklinenews.com to any
inbox for free, or keep mail on SiteGround only if a plan stays active there.

Route 2 (workflow file removed from the repo now Cloudflare is chosen; ask and it returns): SiteGround StartUp (£1.99/mo year one, renews ~£13.99/mo). Fine, and
already fully prepared; nothing WordPress-related on the plan is used. public/.htaccess carries the canonical
host redirect, the legacy 301s and cache headers (Apache replaces the
Cloudflare _redirects convention; the _redirects file is inert there and can
stay). SSL: Site Tools -> Security -> SSL Manager -> Let's Encrypt, then
enforce HTTPS. The 10,000 visits/month plan cap is fine at launch; revisit if
the SEO plan works.

Two ways to deploy, pick one:

A. Manual: run `npm run build` locally, upload the contents of dist/ to
   public_html via Site Tools File Manager or SFTP. New Substack posts appear
   on /news/ whenever you next build and upload.

B. Automated (recommended): push the repo to GitHub and add the five secrets
   listed in .github/workflows/deploy-siteground.yml. Every push deploys, and
   a daily 06:10 UTC run rebuilds so posts tagged Inkline appear on /news/
   within a day. Note this pipeline touches the WEBSITE only; the app's
   standing no-CI rule (registry building, scraping) is untouched: the
   registry ships as data in this repo and the only network call is your own
   Substack feed.

## Deploy notes (Stage 5)

- Cloudflare Pages build command: `npm run build`, output `dist/`.
- 301s from the old privacy/support URLs via `_redirects`; update App Store
  Connect the same day.
- Submit `sitemap-publications-1.xml` first in Search Console, then 2 and 3.
- Edge rules per §7: rate-limit /publications/*, Bot Fight Mode with verified
  crawler allow-list, block scraping ASNs, cache aggressively.
- Watch "Discovered, not indexed" weeks 4–10; flip `index: false` on Tier-3
  blocks if the tail is classified thin.
