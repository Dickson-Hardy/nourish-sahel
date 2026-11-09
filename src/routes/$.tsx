import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { pageHead } from '../seo';
import { getPage } from '../server/content';
import { ReferencePage } from '../components/ReferencePage';

export const Route = createFileRoute('/$')({
  loader: async ({ location }) => {
    if (location.pathname.replace(/\/$/, '') === '/food-guides') {
      throw redirect({ to: '/$/', params: { _splat: 'food' }, statusCode: 301 });
    }

    const page = await getPage({ data: location.pathname });
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => pageHead(loaderData),
  component: ContentPage,
});
function ContentPage() { return <ReferencePage page={Route.useLoaderData()} />; }
