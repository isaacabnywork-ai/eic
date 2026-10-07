#!/usr/bin/env node
/**
 * Endpoint discovery script.
 *
 * Usage:   npm run discover            (reads VITE_WP_URL from env or .env)
 *          node scripts/discover.js https://example.com
 *
 * Prints:
 *   1. /wp-json/wp/v2/types       -> real rest_base for every post type
 *   2. /wp-json/wp/v2/taxonomies  -> real rest_base + attached post types
 *   3. One sample item per post type (?_embed=1&per_page=1), with its
 *      top-level keys and meta/acf/jet keys, so you can fix src/config/content.ts
 *
 * The full raw output is also written to scripts/discover-output.json.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
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
const BASE = (process.argv[2] || env.VITE_WP_URL || '').replace(/\/+$/, '');
if (!BASE) {
  console.error('Set VITE_WP_URL in .env (or pass the URL as an argument).');
  process.exit(1);
}

/** Post types we care about: [label, slug-from-/types] */
const WANTED = [
  ['Articles / Blogs', 'post'],
  ['Videos AND Sermons', 'sermon'],
  ['Book Reviews', 'book-review'],
  ['Gallery', 'gallery'],
  ['Church Listing', 'church-listing'],
];

const heading = (t) => console.log(`\n${'='.repeat(78)}\n${t}\n${'='.repeat(78)}`);

async function getJson(path) {
  const url = `${BASE}/wp-json${path}`;
  const started = Date.now();
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const ms = Date.now() - started;
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON */
  }
  return {
    url,
    ok: res.ok,
    status: res.status,
    ms,
    total: res.headers.get('x-wp-total'),
    totalPages: res.headers.get('x-wp-totalpages'),
    body,
  };
}

const report = { base: BASE, types: null, taxonomies: null, samples: {} };

async function main() {
  console.log(`Discovering endpoints on ${BASE}`);

  /* 1. Types ------------------------------------------------------------ */
  heading('1. /wp/v2/types  (post types -> rest_base)');
  const types = await getJson('/wp/v2/types');
  if (!types.ok) {
    console.error(`FAILED (${types.status}) ${types.url}`);
    process.exit(1);
  }
  report.types = types.body;
  const typeRows = Object.values(types.body).map((t) => ({
    slug: t.slug,
    name: t.name,
    rest_base: t.rest_base,
    taxonomies: (t.taxonomies || []).join(', '),
  }));
  console.table(typeRows);

  /* 2. Taxonomies ------------------------------------------------------- */
  heading('2. /wp/v2/taxonomies  (rest_base + attached post types)');
  const tax = await getJson('/wp/v2/taxonomies');
  report.taxonomies = tax.ok ? tax.body : null;
  if (tax.ok) {
    console.table(
      Object.values(tax.body).map((t) => ({
        slug: t.slug,
        name: t.name,
        rest_base: t.rest_base,
        hierarchical: t.hierarchical,
        attached_to: (t.types || []).join(', '),
      })),
    );
  } else {
    console.warn(`Could not read taxonomies (${tax.status}).`);
  }

  /* Sanity warnings about the assumptions from the brief */
  const bySlug = types.body;
  for (const [label, slug] of WANTED) {
    if (!bySlug[slug]) console.warn(`! Post type "${slug}" (${label}) not exposed in REST.`);
  }
  if (tax.ok) {
    const series = Object.values(tax.body).find((t) => t.slug === 'series');
    if (!series) {
      console.warn('! Taxonomy "series" not exposed in REST (enable "Show in REST API").');
    } else {
      for (const [, slug] of WANTED) {
        if (slug === 'church-listing') continue;
        if (bySlug[slug] && !series.types.includes(slug)) {
          console.warn(
            `! "series" is NOT attached to post type "${slug}" (attached to: ${series.types.join(', ')}). ` +
              'Fix in JetEngine > Taxonomies > Series > "Post types".',
          );
        }
      }
    }
  }

  /* 3. Samples ---------------------------------------------------------- */
  heading('3. One sample item per post type  (?_embed=1&per_page=1)');
  for (const [label, slug] of WANTED) {
    const t = bySlug[slug];
    if (!t) continue;
    const r = await getJson(`/wp/v2/${t.rest_base}?_embed=1&per_page=1`);
    console.log(`\n--- ${label}  [${slug}]  GET /wp/v2/${t.rest_base}  -> ${r.status} (${r.ms} ms)`);
    if (!r.ok) {
      console.log('   not publicly readable:', r.body && r.body.message ? r.body.message : r.status);
      report.samples[slug] = { status: r.status, error: r.body };
      continue;
    }
    console.log(`   total items: ${r.total}   total pages: ${r.totalPages}`);
    const item = Array.isArray(r.body) ? r.body[0] : null;
    if (!item) {
      console.log('   (no published items)');
      report.samples[slug] = { status: r.status, total: r.total, item: null };
      continue;
    }
    report.samples[slug] = { status: r.status, total: r.total, item };
    console.log('   top-level keys :', Object.keys(item).join(', '));
    for (const bag of ['meta', 'acf', 'jet']) {
      if (item[bag] === undefined) continue;
      const v = item[bag];
      const keys = v && typeof v === 'object' ? Object.keys(v) : [];
      console.log(`   ${bag.padEnd(14)} :`, Array.isArray(v) ? '[] (EMPTY - no field has "Show in REST API")' : keys.join(', ') || '(empty)');
    }
    const embedded = item._embedded || {};
    console.log('   _embedded keys :', Object.keys(embedded).join(', ') || '(none)');
    const terms = (embedded['wp:term'] || []).flat();
    if (terms.length) {
      const taxes = [...new Set(terms.map((x) => x.taxonomy))];
      console.log('   embedded terms :', taxes.join(', '));
    }
    console.log('   featured_media :', item.featured_media, embedded['wp:featuredmedia'] ? '(embedded)' : '(no embedded image)');
    console.log('   sticky         :', item.sticky);
    console.log('   title / slug   :', item.title && item.title.rendered, '/', item.slug);
  }

  const out = resolve(__dirname, 'discover-output.json');
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`\nFull output written to ${out}`);
  console.log('Update src/config/content.ts with anything that differs from the assumptions.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
