// Near-duplicate gate (§6.2). Runs BEFORE build so bad content never compiles.
// Fails on: any description under 55 words; any pair > 0.70 TF-IDF cosine
// similarity; any sentence recurring verbatim on more than 3 pages.
import { readFileSync } from 'node:fs';

const publications = JSON.parse(readFileSync(new URL('../src/data/registry/editorial.json', import.meta.url))).editorial;
const fail = [];

const tokenize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

// 1. minimum word count
for (const p of publications) {
  const words = tokenize(p.description).length;
  if (words < 55) fail.push(`UNDER 55 WORDS (${words}): ${p.slug}`);
}

// 2. pairwise TF-IDF cosine
const docs = publications.map((p) => tokenize(p.description));
const df = new Map();
for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
const N = docs.length;
const vecs = docs.map((d) => {
  const tf = new Map();
  for (const t of d) tf.set(t, (tf.get(t) ?? 0) + 1);
  const v = new Map();
  for (const [t, f] of tf) v.set(t, (f / d.length) * Math.log(N / df.get(t)));
  return v;
});
const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (const [t, w] of a) { na += w * w; if (b.has(t)) dot += w * b.get(t); }
  for (const [, w] of b) nb += w * w;
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
};
for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
  const sim = cosine(vecs[i], vecs[j]);
  if (sim > 0.7) fail.push(`SIMILARITY ${sim.toFixed(2)}: ${publications[i].slug} vs ${publications[j].slug}`);
}

// 3. verbatim sentence recurrence
const sentenceMap = new Map();
for (const p of publications) {
  for (const s of p.description.split(/(?<=[.!?])\s+/)) {
    const key = s.trim().toLowerCase();
    if (key.split(' ').length < 5) continue;
    if (!sentenceMap.has(key)) sentenceMap.set(key, new Set());
    sentenceMap.get(key).add(p.slug);
  }
}
for (const [s, pages] of sentenceMap) {
  if (pages.size > 3) fail.push(`SENTENCE ON ${pages.size} PAGES: "${s.slice(0, 60)}…" (${[...pages].join(', ')})`);
}

if (fail.length) {
  console.error('\nNEAR-DUPLICATE GATE FAILED (§6.2):\n' + fail.map((f) => '  ✗ ' + f).join('\n') + '\n');
  process.exit(1);
}
console.log(`Near-duplicate gate passed: ${N} descriptions, max pair similarity within 0.70.`);
