import { createFileRoute } from '@tanstack/react-router';
import { submitForm } from '../server/forms';

export const Route = createFileRoute('/api/forms')({
  server: { handlers: { POST: ({ request }) => submitForm(request) } },
});
