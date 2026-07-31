// Sitemaps split by depth tier (§6.4, §8): sitemap-core, sitemap-publications-1/2/3,
// sitemap-guides, plus an index. Submit Tier 1 first in Search Console.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SITE = 'https://inklinenews.com';
const DIST = new URL('../dist/', import.meta.url).pathname;
const publications = JSON.parse(readFileSync(new URL('../src/data/registry/editorial.json', import.meta.url), 'utf8')).editorial;
const pubSlugs = new Set(publications.map((p) => p.slug));


const urls = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f === 'index.html') {
      const rel = relative(DIST, dir).replace(/\\/g, '/');
      urls.push(rel === '' ? '/' : `/${rel}/`);
    }
  }
})(DIST);

const buckets = { core: [], publications: [], guides: [] };
for (const u of urls) {
  if (u === '/404/') continue;
  const pubMatch = u.match(/^\/publications\/([^/]+)\/$/);
  if (pubMatch && pubSlugs.has(pubMatch[1])) {
    buckets.publications.push(u);
  } else if (u.startsWith('/guides/')) buckets.guides.push(u);
  else buckets.core.push(u);
}

const today = new Date().toISOString().slice(0, 10);
const xml = (list) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  list.sort().map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`;

const written = [];
for (const [name, list] of Object.entries(buckets)) {
  if (!list.length) continue;
  const file = `sitemap-${name}.xml`;
  writeFileSync(join(DIST, file), xml(list));
  written.push(file);
}
writeFileSync(join(DIST, 'sitemap-index.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  written.map((f) => `  <sitemap><loc>${SITE}/${f}</loc><lastmod>${today}</lastmod></sitemap>`).join('\n') +
  `\n</sitemapindex>\n`);
console.log(`Sitemaps written: ${written.join(', ')} + sitemap-index.xml (${urls.length} pages).`);
