// AI-tell vocabulary gate (§12A.1 / §15). Scans visible copy in built HTML.
// 'landscape' is banned figuratively; literal orientation uses are allowed.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BANNED = [
  'delve', 'seamless', 'robust', 'leverage', 'empower', 'tapestry',
  'game-changer', 'cutting-edge', 'revolutionis', 'revolutioniz',
  'testament to', 'at its core', 'fast-paced world', 'more than ever',
  'the world of', 'curated', 'realm', 'unlock', 'elevate', 'harness',
  "it's not just", 'whether you\u2019re a', "whether you're a",
];
const LANDSCAPE_OK = /landscape (reading|layout|orientation|mode)/;
const EM_DASH = /\u2014/;
const ANTITHESIS = /\bnot (?!just your subscriptions)[^.!?]{1,40}, but\b/;

const DIST = new URL('../dist/', import.meta.url).pathname;
const fail = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) {
      const text = readFileSync(p, 'utf8')
        .replace(/<script[\s\S]*?<\/script>/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .toLowerCase();
      for (const b of BANNED) if (text.includes(b)) fail.push(`"${b}" in ${p}`);
      if (EM_DASH.test(text)) fail.push(`em dash in visible copy: ${p}`);
      if (ANTITHESIS.test(text)) fail.push(`antithetical "not X, but Y" construction in ${p}`);
      for (const m of text.matchAll(/[^.]*landscape[^.]*/g)) {
        if (!LANDSCAPE_OK.test(m[0])) fail.push(`figurative "landscape" in ${p}: ${m[0].trim().slice(0, 70)}…`);
      }
    }
  }
})(DIST);
if (fail.length) {
  console.error('\nVOCABULARY GATE FAILED (§12A.1):\n' + [...new Set(fail)].map((f) => '  ✗ ' + f).join('\n') + '\n');
  process.exit(1);
}
console.log('Vocabulary gate passed: no banned words or constructions in visible copy.');
