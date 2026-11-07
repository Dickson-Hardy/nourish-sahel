import { createRootRoute, HeadContent, Outlet, Scripts, useMatches } from '@tanstack/react-router';
import type { PageData } from '../types';

export const Route = createRootRoute({
  head: () => ({
    meta: [{ charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    links: [
      { rel: 'stylesheet', href: '/assets/b83927ae549104ac.css' },
      { rel: 'stylesheet', href: '/assets/dcd8538b69f11aae.css' },
      { rel: 'stylesheet', href: '/assets/abbd8deef5c283a5.css' },
      { rel: 'stylesheet', href: '/assets/a796cfb7e1b91cf0.css' },
      { rel: 'stylesheet', href: '/assets/624acf339c8b9ea9.css' },
      { rel: 'stylesheet', href: '/precision.css' },
      { rel: 'icon', href: '/nourish/nourish-bowl-emblem.svg', type: 'image/svg+xml' },
      { rel: 'preload', href: '/assets/89ab80106523d58c.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
    ],
  }),
  component: RootDocument,
  notFoundComponent: () => <main className="container pt-32 block-content"><h1>Page not found</h1><p><a href="/">Back to home</a></p></main>,
});

function RootDocument() {
  const matches = useMatches();
  const page = matches.at(-1)?.loaderData as PageData | undefined;
  return <html lang="en-NG"><head><HeadContent /></head><body className={page?.bodyClass ?? ''}>
    <Outlet /><Scripts />
  </body></html>;
}
