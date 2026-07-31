// Optional, run once (or after changing featured publications): npm run icons
// Downloads each editorial publication's favicon into public/icons/<slug>.png
// so the home index rows show real marks. Any miss is fine: the row falls
// back to a monogram disc. Deliberately NOT part of the build chain, so a
// publisher's flaky server can never fail a deploy. Icons are served from
// this site (no third-party favicon service at runtime, keeping the
// no-tracking promise intact).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const editorial = JSON.parse(readFileSync(new URL('../src/data/registry/editorial.json', import.meta.url))).editorial;
const full = JSON.parse(readFileSync(new URL('../src/data/registry/publications-full.json', import.meta.url))).publications;
const byslug = new Map(full.map((p) => [p.slug, p]));
mkdirSync(new URL('../public/icons/', import.meta.url), { recursive: true });
for (const e of editorial) {
  const p = byslug.get(e.slug);
  const url = `https://icons.duckduckgo.com/ip3/${p.domain}.ico`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) throw new Error('empty icon');
    writeFileSync(new URL(`../public/icons/${p.slug}.png`, import.meta.url), buf);
    console.log('✓', p.slug, buf.length, 'bytes');
  } catch (err) {
    console.log('· skipped', p.slug, `(${err.message}); monogram fallback will render`);
  }
}
