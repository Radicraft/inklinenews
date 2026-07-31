// Brand-colour gate (§15): any colour value in compiled CSS outside the token
// set fails the build. Tokens live ONLY in src/styles/tokens.css.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED = new Set(
  readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')
    .match(/#[0-9a-fA-F]{3,8}\b/g)
    .map((h) => h.toLowerCase())
);
const DIST = new URL('../dist/', import.meta.url).pathname;
const fail = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(css|html)$/.test(p)) {
      for (const hex of readFileSync(p, 'utf8').match(/#[0-9a-fA-F]{3,8}\b/g) ?? []) {
        if (hex.length === 9 && ALLOWED.has(hex.slice(0, 7).toLowerCase())) continue; // brand colour with alpha
        if (!ALLOWED.has(hex.toLowerCase())) fail.push(`${hex} in ${p}`);
      }
    }
  }
})(DIST);
if (fail.length) {
  console.error('\nCOLOUR GATE FAILED (§15): values outside the brand token set:\n' + [...new Set(fail)].map((f) => '  ✗ ' + f).join('\n') + '\n');
  process.exit(1);
}
console.log('Colour gate passed: compiled CSS and HTML use only brand token values.');
