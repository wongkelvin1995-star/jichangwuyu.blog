import type { APIRoute } from 'astro';
import { brands, seoKeywords } from '../lib/db';
import { articles } from '../data/articles';
import { networkArticles } from '../data/network-articles';
import { digitalArticles } from '../data/digital-articles';

const SITE = 'https://jichangwuyu.blog';
const NOINDEX_ROUTES = new Set(['/search/', '/profile/', '/404/']);

export const GET: APIRoute = () => {
  const urls = new Set<string>([
    '/',
    '/airports/',
    '/stories/',
    '/plans/',
    '/applications/',
    '/archives/',
    '/price-history/',
    '/coupons/',
    '/risk/',
    '/nodes/',
    '/evidence/',
    '/observations/',
    '/articles/',
    '/tools/subscription-calendar/',
    '/tools/value-analyzer/',
    '/about/',
    '/methodology/',
    '/contact/',
    '/disclosure/',
    '/privacy/',
    '/updates/',
  ]);

  brands.forEach((b) => urls.add(b.storyPath));
  articles.forEach((a) => urls.add(`/articles/${a.slug}/`));
  networkArticles.forEach((na) => urls.add(`/network/${na.slug}/`));
  digitalArticles.forEach((da) => urls.add(`/digital-applications/${da.slug}/`));
  seoKeywords.forEach((k) => {
    if (!NOINDEX_ROUTES.has(k.targetUrl)) urls.add(k.targetUrl);
  });

  const sorted = Array.from(urls).sort();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sorted
  .map(
    (u) => `  <url>
    <loc>${SITE}${u}</loc>
    <lastmod>2026-11-26</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
