import { createServerFn } from '@tanstack/react-start';
import type { PageData } from '../types';

export const getPage = createServerFn({ method: 'GET' })
  .validator((pathname: string) => pathname)
  .handler(async ({ data: pathname }): Promise<PageData | null> => {
    const { default: pages } = await import('../data/pages.json');
    const key = pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}/`;
    const page = (pages as Record<string, PageData>)[key];
    if (!page) return null;

    const origin = URL.parse(process.env.NOURISH_SITE_URL ?? '');
    if (!origin || origin.protocol !== 'https:' || origin.username || origin.password) return page;

    return { ...page, canonicalUrl: new URL(key, origin.origin).href };
  });
