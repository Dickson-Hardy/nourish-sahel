import { createFileRoute } from '@tanstack/react-router';
import { siteOrigin } from '../server/site-origin';

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () => {
        const origin = siteOrigin();
        const body = origin
          ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
          : 'User-agent: *\nAllow: /\n';
        return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      },
    },
  },
});
