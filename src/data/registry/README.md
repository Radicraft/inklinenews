# Registry (v3, live data)

This folder carries the app's real bundled directory (registry v3, updated
2026-08-11, 5,175 sources), ingested from `Inkline-Publications.xlsx` with all
feed URLs stripped at ingest, plus the Gen-AI position dataset (ai-policy v1,
data as of 2026-08-16) and the robots.txt AI-crawler sweep of the same date.
The gate in `scripts/gate-feed-urls.mjs` still scans the built output on every
deploy.

Fields per publication: slug, name, country, countrySlug, language, publisher,
founded, paywall, sections[], cadence, lastVerified, tier (1–3), band,
index (robots escape hatch, §6.4), topics[], collections[], description.

`sections` are desk NAMES ONLY: never endpoints.
