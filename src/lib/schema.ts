import { SITE } from './site';

type Crumb = { name: string; url: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name, item: SITE.domain + c.url,
    })),
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Inkline', url: SITE.domain + '/',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: SITE.domain + '/publications/?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question', name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export function publicationLd(p: { name: string; slug: string; topics: string[]; domain: string; market: string; language: string; paywall: string; global: boolean }, langNameStr: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE.domain}/publications/${p.slug}/`,
    dateModified: '2026-08-11',
    mainEntity: {
      '@type': 'NewsMediaOrganization',
      name: p.name,
      url: `https://${p.domain}`,
      inLanguage: p.language,
      knowsLanguage: langNameStr,
      knowsAbout: p.topics,
      areaServed: p.global ? [p.market, 'Worldwide'] : p.market,
      isAccessibleForFree: p.paywall === 'none',
    },
  };
}

export function registryDatasetLd(totals: { sources: number; markets: number; languages: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: "Inkline source registry",
    description: `The checked directory of ${totals.sources} news publications across ${totals.markets} markets and ${totals.languages} languages that ships inside the Inkline app. Every entry records market, language, coverage topics and access status, and every feed is machine-verified before each app release. Every title also carries its owner's public position on generative AI (licensed, blocking or litigating, or nothing on record), compiled from public sources and dated 16 August 2026.`,
    url: `${SITE.domain}/publications/`,
    version: '1',
    dateModified: '2026-08-11',
    creator: { '@type': 'Person', name: 'Michael White', url: 'https://www.whitewiki.org' },
    isAccessibleForFree: true,
    keywords: ['RSS feeds', 'news publications', 'media monitoring', 'feed directory', 'generative AI licensing', 'AI crawler blocking'],
  };
}

export function appLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Inkline', operatingSystem: 'iOS', applicationCategory: 'NewsApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
    // aggregateRating intentionally omitted until pulled from real App Store values (§8).
  };
}

export function personLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.author.name,
    url: SITE.domain + '/about/',
    jobTitle: SITE.author.title,
  };
}
