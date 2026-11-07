import { createServerFn } from '@tanstack/react-start';
import type { PageData } from '../types';
import { siteOrigin } from './site-origin';

export const getPage = createServerFn({ method: 'GET' })
  .validator((pathname: string) => pathname)
  .handler(async ({ data: pathname }): Promise<PageData | null> => {
    const { default: pages } = await import('../data/pages.json');
    const key = pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}/`;
    const page = (pages as Record<string, PageData>)[key];
    if (!page) return null;

    const origin = siteOrigin();
    if (!origin) return page;

    return { ...page, canonicalUrl: new URL(key, origin).href };
  });
