export interface PageData {
  title: string;
  bodyClass: string;
  header: string;
  main: string;
  footer: string;
  description: string;
  socialImage: { path: string; alt: string };
  kind?: 'article';
  canonicalUrl?: string;
}
