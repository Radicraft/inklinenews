// Registry access layer. Data source of truth: the app's own registry
// (Resources/registry.json v1, updated 2026-07-17), ingested from the
// technical manual's Appendix B. Metadata only; feed URLs never exist here.
import fullRaw from '../data/registry/publications-full.json';
import editorialRaw from '../data/registry/editorial.json';
import marketsRaw from '../data/registry/markets.json';
import topicsRaw from '../data/registry/topics-full.json';
import countriesProse from '../data/registry/countries.json';
import topicsProse from '../data/registry/topics.json';
import collectionsRaw from '../data/registry/collections.json';

export type Publication = (typeof fullRaw.publications)[number];
export const publications = fullRaw.publications as Publication[];
export const REGISTRY = fullRaw.totals;
export const REGISTRY_UPDATED = fullRaw.updated as string; // '2026-07-17'

const editorialBySlug = new Map(editorialRaw.editorial.map((e) => [e.slug, e.description]));
export const bySlug = new Map(publications.map((p) => [p.slug, p]));
export const described = publications.filter((p) => editorialBySlug.has(p.slug));
for (const p of publications as any[]) p.hasPage = editorialBySlug.has(p.slug);
export function descriptionFor(slug: string): string | undefined { return editorialBySlug.get(slug); }

export const markets = marketsRaw.markets;
const marketProse = new Map((countriesProse.countries ?? []).map((c: any) => [c.slug, c]));
export function proseForMarket(slug: string) { return marketProse.get(slug); }

export const topics = topicsRaw.topics;
const topicProse = new Map((topicsProse.topics ?? []).map((t: any) => [t.slug, t]));
export function proseForTopic(slug: string) { return topicProse.get(slug); }

export const collections = collectionsRaw.collections;

export function pubsInMarket(slug: string) {
  return publications.filter((p) => p.marketSlug === slug).sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
}
export function pubsInTopic(topic: string) {
  return publications.filter((p) => p.topics.includes(topic)).sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
}
export function pubsInCollection(slug: string) {
  const c = collections.find((x: any) => x.slug === slug);
  return (c?.slugs ?? []).map((s: string) => bySlug.get(s)).filter(Boolean) as Publication[];
}
export function relatedTo(pub: Publication): Publication[] {
  return described
    .filter((p) => p.slug !== pub.slug)
    .map((p) => ({ p, s: (p.marketSlug === pub.marketSlug ? 2 : 0) + p.topics.filter((t) => pub.topics.includes(t)).length }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => x.p);
}
export function getFeatured(n = 6): Publication[] {
  return described.slice(0, n);
}
export const accessLabel = (paywall: string) =>
  paywall === 'hard' ? 'Paywall' : paywall === 'metered' ? 'Some free articles' : 'Free';
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
