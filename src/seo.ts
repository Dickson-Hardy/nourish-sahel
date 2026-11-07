import type { PageData } from './types';

export function pageHead(page: PageData | undefined) {
  if (!page) return { meta: [{ title: 'Page Not Found | Nourish Sahel' }, { name: 'robots', content: 'noindex' }] };

  const meta = [
    { title: page.title },
    { name: 'description', content: page.description },
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: page.description },
    { property: 'og:site_name', content: 'Nourish Sahel' },
    { property: 'og:locale', content: 'en_NG' },
    { property: 'og:type', content: page.kind ?? 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: page.title },
    { name: 'twitter:description', content: page.description },
  ];

  if (!page.canonicalUrl) return { meta: [...meta, { name: 'robots', content: 'noindex, nofollow' }] };

  const image = new URL(page.socialImage.path, page.canonicalUrl).href;
  return {
    links: [{ rel: 'canonical', href: page.canonicalUrl }],
    meta: [
      ...meta,
      { property: 'og:url', content: page.canonicalUrl },
      { property: 'og:image', content: image },
      { property: 'og:image:type', content: 'image/jpeg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: page.socialImage.alt },
      { name: 'twitter:image', content: image },
      { name: 'twitter:image:alt', content: page.socialImage.alt },
    ],
  };
}
