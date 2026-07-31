// Build-time news fetch: pulls the White Wiki Substack feed and keeps posts
// tagged (or failing that, mentioning) Inkline. Never breaks the build: any
// failure leaves the committed src/data/news.json exactly as it was, so the
// news page degrades to the last good fetch. The feed URL lives here only;
// it is never rendered into output (§10 feed-URL rule applies to the 817
// registry, but the same hygiene is kept for consistency).
import { readFileSync, writeFileSync } from 'node:fs';
const FEED = process.env.NEWS_FEED_URL || 'https://www.whitewiki.org/feed';
const TAG = (process.env.NEWS_TAG || 'inkline').toLowerCase();
const OUT = new URL('../src/data/news.json', import.meta.url);

const strip = (h) => h.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const pick = (xml, tag) => (xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)) || [])[1] ?? '';

try {
  const res = await fetch(FEED, { headers: { 'user-agent': 'inklinenews-build/1.0' }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const it = m[1];
    const cats = [...it.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/g)].map((c) => strip(c[1]).toLowerCase());
    return {
      title: strip(pick(it, 'title')),
      url: strip(pick(it, 'link')),
      published: new Date(strip(pick(it, 'pubDate')) || Date.now()).toISOString().slice(0, 10),
      excerpt: strip(pick(it, 'description')).split(/\s+/).slice(0, 42).join(' '),
      cats,
    };
  });
  const tagged = items.filter((i) => i.cats.includes(TAG));
  const kept = (tagged.length ? tagged : items.filter((i) => (i.title + ' ' + i.excerpt).toLowerCase().includes(TAG)))
    .slice(0, 24)
    .map(({ cats, ...i }) => i);
  if (!kept.length) throw new Error('no matching posts; keeping previous news.json');
  writeFileSync(OUT, JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), source: 'whitewiki.org', items: kept }, null, 1));
  console.log(`News fetched: ${kept.length} Inkline post(s)${tagged.length ? ' (tag match)' : ' (keyword fallback)'}.`);
} catch (e) {
  const existing = JSON.parse(readFileSync(OUT, 'utf8'));
  console.log(`News fetch skipped (${e.message}); using committed news.json (${existing.items.length} item(s), fetched ${existing.fetched}).`);
}
