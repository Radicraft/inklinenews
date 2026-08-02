export const SITE = {
  name: 'Inkline',
  domain: 'https://inklinenews.com',
  // TODO(Michael): real App Store ID before launch. All install links and the
  // Smart App Banner read from here. Campaign token scheme per brief §10.
  appStoreId: '6788323715', bundleId: 'com.whitewiki.Inkline',
  appStoreBase: 'https://apps.apple.com/app/inkline-news-media-monitor/id',
  price: 'from £2.99 a month or £14.99 a year in the UK',
  trial: 'week free on Pro plans',
  // One boilerplate paragraph, used verbatim on /about/, /press/, llms.txt and
  // in guide author boxes (§9, entity consistency). Edit in ONE place only.
  boilerplate:
    'Inkline is a media monitoring app for iPhone and iPad, built for journalists, communications professionals and anyone who reads for a living. It tracks the topics, publications and people you choose across a registry of 817 hand-picked, feed-verified sources spanning 55 markets and 34 languages, compares how titles cover the same story, writes a private morning brief on your device, and reads it to you as a spoken briefing. No dashboards, no accounts, and nothing you read leaves your phone. Inkline is free to download and free to use; Inkline Pro adds monitoring, spoken briefings, analysis and unlimited publications, from £2.99 a month in the UK with a week free.',
  author: {
    name: 'Michael White',
    title: 'Director of Intelligence at a communications consultancy',
  },
};

export function appStoreUrl(token: string) {
  return `${SITE.appStoreBase}${SITE.appStoreId}?ct=${token}&mt=8`;
}
