import { getRequestIP } from '@tanstack/react-start/server';
import { reserveFormSend } from './form-limits';
import { siteOrigin } from './site-origin';

const emailPattern = /^[^\s@,<>]+@[^\s@,<>]+\.[^\s@,<>]+$/;
const topics = new Map([
  ['meal-plans', 'Menu and meal plans'],
  ['ordering', 'Ordering and delivery'],
  ['workplace', 'Workplace meals'],
  ['fittrac', 'FitTrac'],
  ['partnerships', 'Partnerships'],
  ['careers', 'Careers'],
  ['other', 'Something else'],
]);
const maxBodySize = 24 * 1024;

async function readForm(request: Request) {
  if (Number(request.headers.get('content-length')) > maxBodySize || !request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return new URLSearchParams(body + decoder.decode());
    size += value.byteLength;
    if (size > maxBodySize) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
}

export async function submitForm(request: Request) {
  const acceptsJson = request.headers.get('accept')?.includes('application/json');
  const reply = (status: number, message: string, headers = new Headers()) => {
    headers.set('Cache-Control', 'no-store');
    if (acceptsJson) return Response.json({ message }, { status, headers });
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    return new Response(message, { status, headers });
  };

  const origin = siteOrigin() ?? new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return reply(403, 'Please submit from the Nourish Sahel website.');
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/x-www-form-urlencoded') {
    return reply(415, 'This form submission format is unsupported.');
  }
  const form = await readForm(request).catch(() => null);
  if (!form) return reply(400, 'We couldn’t read your submission. Please check the form and try again.');

  const type = form.get('kind');
  if (type !== 'contact' && type !== 'newsletter') return reply(400, 'This form is unavailable.');
  const success = type === 'newsletter' ? 'Thanks. We received your request for Nourish Sahel updates.' : 'Thanks. Your message was sent.';
  if (form.get('website')) return reply(200, success);

  const email = form.get('email')?.trim() ?? '';
  if (email.length > 254 || !emailPattern.test(email)) return reply(422, 'Enter a valid email address.');
  let subject = 'Nourish Sahel website – Newsletter signup';
  let text = `A visitor requested Nourish Sahel news and launch updates.\n\nEmail: ${email.toLowerCase()}`;
  if (type === 'contact') {
    const name = form.get('name')?.trim() ?? '';
    const message = form.get('message')?.trim() ?? '';
    const topic = topics.get(form.get('topic') ?? '');
    if (!name || name.length > 120 || /[\r\n]/.test(name) || !message || message.length > 4000 || !topic) {
      return reply(422, 'Check your name, topic and message, then try again.');
    }
    subject = `Nourish Sahel website – ${topic}`;
    text = `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`;
  }

  const token = process.env.NOURISH_HOSTINGER_API_TOKEN?.trim();
  const mailbox = process.env.NOURISH_HOSTINGER_MAILBOX_ID?.trim();
  const to = process.env.NOURISH_FORM_TO?.trim() || 'info@nourishsahel.com';
  if (!token || !mailbox || !emailPattern.test(to)) {
    return reply(503, 'This form is temporarily unavailable. Please try again later.');
  }

  let retryAfter: number;
  try {
    retryAfter = reserveFormSend(getRequestIP());
  } catch {
    console.error('Nourish Sahel form rate limit unavailable');
    return reply(503, 'This form is temporarily unavailable. Please try again later.');
  }
  if (retryAfter) {
    return reply(429, 'Too many submissions. Please wait before trying again.',
      new Headers({ 'Retry-After': String(retryAfter) }));
  }

  try {
    const response = await fetch(`https://api.mail.hostinger.com/api/v1/mailboxes/${encodeURIComponent(mailbox)}/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: [to], displayName: 'Nourish Sahel Website', subject, text }),
      signal: AbortSignal.timeout(8000),
      redirect: 'error',
    });
    if (response.status === 204) return reply(200, success);
    console.error('Nourish Sahel Mail API rejected a submission', type, response.status);
  } catch {
    console.error('Nourish Sahel Mail API submission failed', type);
  }
  return reply(502, 'We couldn’t complete your submission. Your details are still in the form so you can try again.');
}
