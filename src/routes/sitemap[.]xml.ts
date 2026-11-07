import { createFileRoute } from '@tanstack/react-router';
import { siteOrigin } from '../server/site-origin';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const origin = siteOrigin();
        if (!origin) return new Response('Not found', { status: 404 });

        const { default: pages } = await import('../data/pages.json');
        const entries = Object.keys(pages).map(path => `<url><loc>${new URL(path, origin).href}</loc></url>`);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
      },
    },
  },
});
