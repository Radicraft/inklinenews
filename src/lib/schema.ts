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

export function publicationLd(p: { name: string; slug: string; topics: string[]; domain: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE.domain}/publications/${p.slug}/`,
    about: { '@type': 'NewsMediaOrganization', name: p.name, url: `https://${p.domain}` },
    mainEntity: {
      '@type': 'ItemList',
      name: `${p.name} coverage in Inkline's registry`,
      itemListElement: p.topics.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t })),
    },
  };
}

export function appLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Inkline', operatingSystem: 'iOS', applicationCategory: 'NewsApplication',
    offers: { '@type': 'Offer', price: '14.99', priceCurrency: 'GBP' },
    // aggregateRating intentionally omitted until pulled from real App Store values (§8).
  };
}

export function articleLd(a: { title: string; description: string; slug: string; published: string; modified: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title, description: a.description,
    url: `${SITE.domain}/guides/${a.slug}/`,
    datePublished: a.published, dateModified: a.modified,
    author: { '@type': 'Person', name: SITE.author.name, url: SITE.domain + '/about/' },
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
