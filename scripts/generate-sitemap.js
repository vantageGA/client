import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { publicSeoRoutes } from '../seo-routes.js';

const siteUrl = (process.env.VITE_SITE_URL || 'https://www.bodyvantage.co.uk').replace(
  /\/$/,
  '',
);

const today = new Date().toISOString().slice(0, 10);
const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicSeoRoutes
  .map(
    (route) => `  <url>
    <loc>${escapeXml(`${siteUrl}${route}`)}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Disallow: /admin-users
Disallow: /admin-profiles
Disallow: /admin-reviewers
Disallow: /forgot-password
Disallow: /login
Disallow: /profile-edit
Disallow: /registration
Disallow: /reset-password
Disallow: /reviewer-forgot-password
Disallow: /reviewer-login
Disallow: /reviewer-register
Disallow: /reviewer-reset-password
Disallow: /subscribe
Disallow: /user-profile-edit
Disallow: /verify-email
Disallow: /verify-email-change

Sitemap: ${siteUrl}/sitemap.xml
`;

writeFileSync(resolve('public/sitemap.xml'), sitemap);
writeFileSync(resolve('public/robots.txt'), robots);
