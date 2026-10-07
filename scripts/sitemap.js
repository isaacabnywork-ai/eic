#!/usr/bin/env node
/**
 * Sitemap generation script.
 * Usage: node scripts/sitemap.js
 * Generates sitemap.xml in both public/ and dist/ (if it exists).
 */
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function readEnvFile() {
  const out = {};
  for (const name of ['.env.local', '.env']) {
    const file = resolve(root, name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !(m[1] in out)) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return out;
}

const env = { ...readEnvFile(), ...process.env };
const SITE_URL = (env.VITE_SITE_URL || 'https://equipindianchurches.com').replace(/\/+$/, '');
const WP_URL = (env.VITE_WP_URL || 'https://equipindianchurches.com').replace(/\/+$/, '');

const staticRoutes = [
  '/',
  '/articles',
  '/videos',
  '/sermons',
  '/series',
  '/book-reviews',
  '/gallery',
  '/events',
  '/authors',
  '/search',
];

async function fetchSlugs(path) {
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/${path}?per_page=100&_fields=slug,modified`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function main() {
  console.log(`Generating sitemap for ${SITE_URL}...`);
  const urls = [];

  const today = new Date().toISOString().slice(0, 10);
  for (const route of staticRoutes) {
    urls.push({
      loc: `${SITE_URL}${route}`,
      lastmod: today,
      changefreq: route === '/' ? 'daily' : 'weekly',
      priority: route === '/' ? '1.0' : '0.8',
    });
  }

  // Fetch articles
  const articles = await fetchSlugs('posts');
  for (const a of articles) {
    if (a.slug) {
      urls.push({
        loc: `${SITE_URL}/articles/${a.slug}`,
        lastmod: (a.modified || today).slice(0, 10),
        changefreq: 'monthly',
        priority: '0.7',
      });
    }
  }

  // Fetch videos/sermons
  const media = await fetchSlugs('sermon');
  for (const m of media) {
    if (m.slug) {
      urls.push({
        loc: `${SITE_URL}/videos/${m.slug}`,
        lastmod: (m.modified || today).slice(0, 10),
        changefreq: 'monthly',
        priority: '0.7',
      });
    }
  }

  // Fetch series
  const series = await fetchSlugs('series');
  for (const s of series) {
    if (s.slug) {
      urls.push({
        loc: `${SITE_URL}/series/${s.slug}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7',
      });
    }
  }

  // Fetch book reviews
  const books = await fetchSlugs('book-review');
  for (const b of books) {
    if (b.slug) {
      urls.push({
        loc: `${SITE_URL}/book-reviews/${b.slug}`,
        lastmod: (b.modified || today).slice(0, 10),
        changefreq: 'monthly',
        priority: '0.6',
      });
    }
  }

  // Fetch galleries
  const galleries = await fetchSlugs('gallery');
  for (const g of galleries) {
    if (g.slug) {
      urls.push({
        loc: `${SITE_URL}/gallery/${g.slug}`,
        lastmod: (g.modified || today).slice(0, 10),
        changefreq: 'monthly',
        priority: '0.6',
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  const pubPath = resolve(root, 'public', 'sitemap.xml');
  writeFileSync(pubPath, xml, 'utf8');
  console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`);

  const distPath = resolve(root, 'dist', 'sitemap.xml');
  if (existsSync(resolve(root, 'dist'))) {
    writeFileSync(distPath, xml, 'utf8');
    console.log(`Wrote sitemap to dist/sitemap.xml`);
  }
}

main().catch((err) => {
  console.warn('Sitemap generation completed with warning:', err.message);
});
