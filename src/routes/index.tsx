import { createFileRoute, notFound } from '@tanstack/react-router';
import { pageHead } from '../seo';
import { getPage } from '../server/content';
import { ReferencePage } from '../components/ReferencePage';

export const Route = createFileRoute('/')({
  loader: async () => { const page = await getPage({ data: '/' }); if (!page) throw notFound(); return page; },
  head: ({ loaderData }) => pageHead(loaderData),
  component: Home,
});
function Home() { return <ReferencePage page={Route.useLoaderData()} />; }
