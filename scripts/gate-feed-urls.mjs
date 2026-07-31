// Feed-URL exclusion gate (§7). Runs AFTER build, scans every byte of output.
// Fails on: any registry feed URL (when the real registry is wired in), any
// external URL whose path contains /rss, /feed or /atom, any feeds. hostname,
// and any .xml?  querystring endpoint. The site's own /feeds/<country>/ pages
// are directory routes, not endpoints, and are excluded by the host check.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const registryPath = new URL('../src/data/registry/publications-full.json', import.meta.url);
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const knownFeedUrls = registry.publications.flatMap((p) => p.feedUrls ?? p.feeds ?? []); // schema carries none by design

const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
})(DIST);

const externalFeedPath = /https?:\/\/(?!inklinenews\.com)[^\s"'<>]*\/(rss|feed|atom)\b/gi;
const feedsHost = /\bfeeds\.[a-z0-9-]+\.[a-z]{2,}/gi;
const xmlQuery = /\.xml\?[^\s"'<>]*/gi;

const fail = [];
for (const file of files) {
  if (/\.(png|jpg|jpeg|webp|avif|woff2?|ico|gif)$/i.test(file)) continue;
  const text = readFileSync(file, 'utf8');
  for (const url of knownFeedUrls) {
    if (text.includes(url)) fail.push(`REGISTRY FEED URL in ${file}: ${url}`);
  }
  for (const re of [externalFeedPath, feedsHost, xmlQuery]) {
    const m = text.match(re);
    if (m) fail.push(`PATTERN ${re.source.slice(0, 30)}… in ${file}: ${m[0]}`);
  }
}
// No /api routes, no .json in output (§15)
for (const file of files) {
  if (file.includes('/api/')) fail.push(`/api/ ROUTE IN OUTPUT: ${file}`);
  if (file.endsWith('.json') && !file.endsWith('manifest.json')) fail.push(`.json IN OUTPUT: ${file}`);
}

if (fail.length) {
  console.error('\nFEED-URL GATE FAILED (§7):\n' + fail.map((f) => '  ✗ ' + f).join('\n') + '\n');
  process.exit(1);
}
console.log(`Feed-URL gate passed: ${files.length} output files scanned, zero endpoints leaked.`);
