# Registry (SAMPLE)

This folder is a stand-in for the private registry repo. At build time the real
pipeline transforms the app's registry and strips feed URLs before anything is
emitted (brief §3). This sample carries no feed URLs at all; the gate in
`scripts/gate-feed-urls.mjs` still scans the built output on every deploy.

Fields per publication: slug, name, country, countrySlug, language, publisher,
founded, paywall, sections[], cadence, lastVerified, tier (1–3), band,
index (robots escape hatch, §6.4), topics[], collections[], description.

`sections` are desk NAMES ONLY: never endpoints.
