// Registry validator against the app's real schema (Appendix B ingest).
// Fails on malformed fields, duplicate slugs, unknown references, and ANY
// feed-URL-shaped string anywhere (plain domains are allowed and expected).
import { readFileSync } from 'node:fs';
const load = (f) => JSON.parse(readFileSync(new URL(`../src/data/registry/${f}`, import.meta.url), 'utf8'));
const full = load('publications-full.json');
const editorial = load('editorial.json').editorial;
const markets = new Set(load('markets.json').markets.map((m) => m.slug));
const topicSet = new Set(load('topics-full.json').topics.map((t) => t.name));

const fail = [];
const slugRe = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const feedRe = /https?:\/\/|\/(rss|feed|atom)\b|^feeds\.|\.xml\b/i;
const seen = new Set();
for (const p of full.publications) {
  const at = `[${p.slug ?? '??'}]`;
  for (const f of ['slug','name','domain','market','marketSlug','marketCode','language','paywall','added']) {
    if (typeof p[f] !== 'string' || !p[f].trim()) fail.push(`${at} missing ${f}`);
  }
  if (!slugRe.test(p.slug ?? '')) fail.push(`${at} bad slug`);
  if (seen.has(p.slug)) fail.push(`${at} duplicate slug`);
  seen.add(p.slug);
  if (![1,2].includes(p.tier)) fail.push(`${at} tier must be 1 or 2`);
  if (!['none','metered','hard'].includes(p.paywall)) fail.push(`${at} bad paywall value`);
  if (typeof p.global !== 'boolean') fail.push(`${at} global must be boolean`);
  if (!markets.has(p.marketSlug)) fail.push(`${at} unknown market ${p.marketSlug}`);
  for (const t of p.topics ?? []) if (!topicSet.has(t)) fail.push(`${at} unknown topic ${t}`);
  if (feedRe.test(p.domain)) fail.push(`${at} domain looks like a feed endpoint`);
  if (feedRe.test(JSON.stringify([p.name, p.market, p.topics]))) fail.push(`${at} feed pattern in metadata`);
}
const slugs = new Set(full.publications.map((p) => p.slug));
const wc = (s) => s.trim().split(/\s+/).length;
for (const e of editorial) {
  if (!slugs.has(e.slug)) fail.push(`[editorial:${e.slug}] not in registry`);
  if (wc(e.description) < 55) fail.push(`[editorial:${e.slug}] description under 55 words (${wc(e.description)})`);
  if (/https?:\/\/|\/(rss|feed|atom)\b/i.test(e.description)) fail.push(`[editorial:${e.slug}] URL in description`);
}
if (fail.length) {
  console.error('\nREGISTRY VALIDATION FAILED:\n' + fail.map((f) => '  ✗ ' + f).join('\n') + '\n');
  process.exit(1);
}
console.log(`Registry valid: ${full.publications.length} sources, ${markets.size} markets, ${topicSet.size} topics, ${editorial.length} editorial pages.`);
