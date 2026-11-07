export function siteOrigin() {
  const url = URL.parse(process.env.NOURISH_SITE_URL ?? '');
  return url?.protocol === 'https:' && !url.username && !url.password ? url.origin : undefined;
}
