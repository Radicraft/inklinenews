// Registry access layer. Data source of truth: the app's own bundled
// directory (Resources/registry.json v3, updated 2026-08-11), exported to
// Inkline-Publications.xlsx and ingested here, together with the Gen-AI
// position dataset (ai-policy.json v1, data as of 2026-08-16) and the
// robots.txt AI-crawler sweep of the same date. Metadata only; feed URLs
// never exist here.
import fullRaw from '../data/registry/publications-full.json';
import editorialRaw from '../data/registry/editorial.json';
import marketsRaw from '../data/registry/markets.json';
import topicsRaw from '../data/registry/topics-full.json';
import countriesProse from '../data/registry/countries.json';
import topicsProse from '../data/registry/topics.json';
import collectionsRaw from '../data/registry/collections.json';

export type Publication = (typeof fullRaw.publications)[number] & {
  dupOf?: string; aiGroup?: string; aiPartners?: string[]; aiOpponents?: string[];
  aiNote?: string; aiSourceUrl?: string; aiAsOf?: string; blockedCrawlers?: string[];
};
export const publications = fullRaw.publications as Publication[];
export const REGISTRY = fullRaw.totals;
export const REGISTRY_UPDATED = fullRaw.updated as string; // '2026-08-11'
export const REGISTRY_VERSION = fullRaw.version as number; // 3
export const AI_POLICY_AS_OF = (fullRaw as any).aiPolicyAsOf as string; // '2026-08-16'

const editorialBySlug = new Map(editorialRaw.editorial.map((e) => [e.slug, e.description]));
export const bySlug = new Map(publications.map((p) => [p.slug, p]));
export const described = publications.filter((p) => editorialBySlug.has(p.slug));
// Every publication has a detail page except exact-duplicate registry rows,
// which point at the page of the row they duplicate.
for (const p of publications as any[]) p.hasPage = !p.dupOf;
export const paged = publications.filter((p: any) => p.hasPage);
export function descriptionFor(slug: string): string | undefined { return editorialBySlug.get(slug); }

export const markets = marketsRaw.markets;
const marketProse = new Map((countriesProse.countries ?? []).map((c: any) => [c.slug, c]));
export function proseForMarket(slug: string) { return marketProse.get(slug); }

export const topics = topicsRaw.topics;
const topicProse = new Map((topicsProse.topics ?? []).map((t: any) => [t.slug, t]));
export function proseForTopic(slug: string) { return topicProse.get(slug); }

export const collections = collectionsRaw.collections;

export function pubsInMarket(slug: string) {
  return publications.filter((p) => p.marketSlug === slug && (p as any).hasPage).sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
}
export function pubsInTopic(topic: string) {
  return publications.filter((p) => p.topics.includes(topic) && (p as any).hasPage).sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
}
export function pubsInCollection(slug: string) {
  const c = collections.find((x: any) => x.slug === slug);
  return (c?.slugs ?? []).map((s: string) => bySlug.get(s)).filter(Boolean) as Publication[];
}
export function relatedTo(pub: Publication): Publication[] {
  return paged
    .filter((p) => p.slug !== pub.slug && p.marketSlug === pub.marketSlug)
    .map((p) => ({ p, s: (p.tier === 1 ? 1 : 0) + p.topics.filter((t) => pub.topics.includes(t)).length }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => x.p);
}
export function getFeatured(n = 6): Publication[] {
  return described.slice(0, n);
}
const LANGS: Record<string, string> = { af: 'Afrikaans', am: 'Amharic', ar: 'Arabic', az: 'Azerbaijani', bg: 'Bulgarian', bn: 'Bengali', bs: 'Bosnian', ca: 'Catalan', cs: 'Czech', cy: 'Welsh', da: 'Danish', de: 'German', el: 'Greek', en: 'English', es: 'Spanish', et: 'Estonian', eu: 'Basque', fi: 'Finnish', fr: 'French', ga: 'Irish', gl: 'Galician', gu: 'Gujarati', ha: 'Hausa', he: 'Hebrew', hi: 'Hindi', hr: 'Croatian', hu: 'Hungarian', hy: 'Armenian', id: 'Indonesian', it: 'Italian', ja: 'Japanese', ka: 'Georgian', kk: 'Kazakh', kn: 'Kannada', ko: 'Korean', ku: 'Kurdish', lg: 'Luganda', lt: 'Lithuanian', lv: 'Latvian', ml: 'Malayalam', mr: 'Marathi', ms: 'Malay', nb: 'Norwegian', ne: 'Nepali', nl: 'Dutch', no: 'Norwegian', or: 'Odia', pa: 'Punjabi', pl: 'Polish', pt: 'Portuguese', ro: 'Romanian', ru: 'Russian', rw: 'Kinyarwanda', sd: 'Sindhi', si: 'Sinhala', sk: 'Slovak', sl: 'Slovenian', sn: 'Shona', sr: 'Serbian', sv: 'Swedish', sw: 'Swahili', ta: 'Tamil', te: 'Telugu', th: 'Thai', tl: 'Filipino', tr: 'Turkish', uk: 'Ukrainian', ur: 'Urdu', uz: 'Uzbek', vi: 'Vietnamese', zh: 'Chinese', zu: 'Zulu' };
export const langName = (code: string) => LANGS[code] ?? code;
export const accessLabel = (paywall: string) =>
  paywall === 'hard' ? 'Paywall' : paywall === 'metered' ? 'Some free articles' : 'Free';
// Gen-AI position, read the way the app reads it: the ownership group's
// public position first; where there is none, the domain's own robots.txt
// stance on AI crawlers; otherwise no public position.
export function aiStance(p: Publication): 'licensed' | 'blocking' | 'robots' | 'none' {
  if (p.aiStatus === 'licensed') return 'licensed';
  if (p.aiStatus === 'blocking') return 'blocking';
  if (p.blockedCrawlers && p.blockedCrawlers.length > 0) return 'robots';
  return 'none';
}
export const aiStanceLabel = (s: string) =>
  s === 'licensed' ? 'Licensed to AI' : s === 'blocking' ? 'Blocking or litigating' : s === 'robots' ? 'Blocks AI crawlers' : 'No public position';
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
