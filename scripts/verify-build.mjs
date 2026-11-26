import fs from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
const keywords = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'seo-keywords.json'), 'utf-8'));
const brands = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'brands', 'index.json'), 'utf-8'));

const missingTargets = [];
for (const k of keywords) {
  const rel = k.targetUrl === '/' ? 'index.html' : path.join(k.targetUrl.replace(/^\/|\/$/g, ''), 'index.html');
  if (!fs.existsSync(path.join(dist, rel))) {
    missingTargets.push({ id: k.id, targetUrl: k.targetUrl });
  }
}

const missingAff = [];
for (const b of brands) {
  const html = fs.readFileSync(path.join(dist, 'stories', b.slug, 'index.html'), 'utf-8');
  if (!html.includes(b.affiliateUrl) || !html.includes(b.coupon.code)) {
    missingAff.push(b.slug);
  }
}

const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf-8');
const sitemapHasNoindex = ['/search/', '/profile/', '/404'].some((r) => sitemap.includes(`jichangwuyu.blog${r}<`));
const homeHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');
const faqCount = (homeHtml.match(/class="story-card faq-item/g) || []).length;

const htmlFiles = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
}
walk(dist);

let objErr = 0, missingTitle = 0, missingDesc = 0, missingH1 = 0;
const brokenImgs = new Set();
const brokenLinks = new Map();
for (const f of htmlFiles) {
  const s = fs.readFileSync(f, 'utf-8');
  if (s.includes('[object Object]')) objErr++;
  if (!/<title>[^<]+<\/title>/.test(s)) missingTitle++;
  if (!/<meta name="description" content="[^"]+"/.test(s)) missingDesc++;
  if (!/<h1[\s>]/.test(s)) missingH1++;
  for (const m of s.matchAll(/<img[^>]+src="(\/[^"]+)"/g)) {
    const imgPath = path.join(dist, m[1].replace(/^\//, ''));
    if (!fs.existsSync(imgPath)) brokenImgs.add(m[1]);
  }
  for (const m of s.matchAll(/href="(\/[^"#?]*)/g)) {
    const href = m[1];
    if (href.startsWith('/_astro/') || href.startsWith('/images/') || href === '/favicon.svg') continue;
    const target = href === '/' ? 'index.html' : path.join(href.replace(/^\/|\/$/g, ''), 'index.html');
    if (!fs.existsSync(path.join(dist, target)) && !fs.existsSync(path.join(dist, href.replace(/^\//, '')))) {
      brokenLinks.set(href, (brokenLinks.get(href) || 0) + 1);
    }
  }
}

console.log(JSON.stringify({
  totalKeywordsChecked: keywords.length,
  missingTargets,
  totalBrandsChecked: brands.length,
  missingAff,
  sitemapUrlCount: (sitemap.match(/<loc>/g) || []).length,
  sitemapHasNoindex,
  homepageFaqCount: faqCount,
  hasRobots: fs.existsSync(path.join(dist, 'robots.txt')),
  hasBingAuth: fs.existsSync(path.join(dist, 'BingSiteAuth.xml')),
  totalHtmlFiles: htmlFiles.length,
  objErr,
  missingTitle,
  missingDesc,
  missingH1,
  brokenImgs: [...brokenImgs],
  brokenLinkCount: brokenLinks.size,
  brokenLinks: Object.fromEntries(brokenLinks),
}, null, 2));
