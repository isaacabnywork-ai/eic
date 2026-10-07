import type { ContentKey, TaxKey } from '../config/content.ts';
import { contentTypes } from '../config/content.ts';
import { env } from '../config/env.ts';

/** Single source of truth for URLs on THIS site. Also used by scripts/sitemap.js. */

export const routes = {
  home: '/',
  series: '/series',
  authors: '/authors',
  search: '/search',
} as const;

/** "events" are Posts, so they open on the article page. "media" is an unsplit video. */
const singleRouteKey = (type: ContentKey): ContentKey =>
  type === 'event' ? 'article' : type === 'media' ? 'video' : type;

export function archivePath(type: ContentKey, query?: Record<string, string | number | undefined>): string {
  const base = `/${contentTypes[type === 'media' ? 'video' : type].route}`;
  return base + toQueryString(query);
}

export function itemPath(type: ContentKey, slug: string): string {
  return `/${contentTypes[singleRouteKey(type)].route}/${slug}`;
}

export const seriesPath = (slug: string): string => `/series/${slug}`;
export const authorPath = (id: number): string => `/authors/${id}`;

/** Where clicking a term chip should go. Series have their own pages. */
export function termPath(
  taxonomy: TaxKey,
  term: { id: number; slug: string },
  ownerType: ContentKey,
): string {
  if (taxonomy === 'series') return seriesPath(term.slug);
  const owner = ownerType === 'media' ? 'video' : ownerType === 'event' ? 'article' : ownerType;
  return archivePath(owner, { [taxonomy]: term.id });
}

export function toQueryString(query?: Record<string, string | number | undefined | null>): string {
  if (!query) return '';
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export function absoluteUrl(path: string): string {
  return `${env.siteUrl}${path}`;
}

/**
 * Turn a link that points at the WordPress site into a route of this app,
 * when we know the equivalent. Returns null if there is no mapping.
 */
export function wpLinkToRoute(href: string): string | null {
  if (!env.wpUrl) return null;
  let url: URL;
  try {
    url = new URL(href, env.wpUrl);
  } catch {
    return null;
  }
  if (url.origin !== new URL(env.wpUrl).origin) return null;
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length === 2) {
    const [base, slug] = parts;
    if (base === 'videos' || base === 'sermon') return `/videos/${slug}`;
    if (base === 'gallery') return `/gallery/${slug}`;
    if (base === 'series') return `/series/${slug}`;
    if (base === 'book-review') return `/book-reviews/${slug}`;
  }
  return null;
}
