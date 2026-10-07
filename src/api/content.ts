import {
  contentTypes,
  searchableTypes,
  SERMON_CATEGORY_SLUGS,
  taxonomies,
} from '@/config/content';
import type { ContentKey, FeaturedRule, TaxKey } from '@/config/content';
import { collectTermIds } from '@/lib/videoGroups';
import { warnOnce } from '@/lib/devWarn';
import { wpGet } from './client';
import type { Query } from './client';
import { normalizeItem } from './normalize';
import type { NormalizeCtx } from './normalize';
import { fetchAllTerms, resolveTermId } from './terms';
import type { ContentItem, ListParams, Page, WpRaw } from './types';

/** Payload trimmed for list views. `_links` + `_embedded` are required for ?_embed to work. */
const LIST_FIELDS = [
  'id', 'date', 'modified', 'slug', 'type', 'link', 'title', 'excerpt', 'author', 'featured_media',
  'sticky', 'meta', 'acf', 'jet', 'parent',
  ...Object.values(taxonomies).map((t) => t.restBase),
  '_links', '_embedded',
].join(',');

const emptyPage = (page = 1): Page<ContentItem> => ({ items: [], total: 0, totalPages: 0, page });

/* ---- sermon / video split ------------------------------------------- */

let sermonIdsPromise: Promise<Set<number>> | null = null;

/** Term ids (incl. children) that make a Videos-type item a sermon. Cached. */
export function getSermonTermIds(): Promise<Set<number>> {
  sermonIdsPromise ??= fetchAllTerms('videoCategory')
    .then((terms) => {
      const ids = collectTermIds(
        terms.map((t) => ({ id: t.id, slug: t.slug, parent: t.parent ?? 0 })),
        SERMON_CATEGORY_SLUGS,
        true,
      );
      if (!ids.size) {
        warnOnce(
          'sermon-terms',
          `None of SERMON_CATEGORY_SLUGS (${SERMON_CATEGORY_SLUGS.join(', ')}) exist in the "video-category" taxonomy, so every item will be treated as a Video. Edit src/config/content.ts.`,
        );
      }
      return ids;
    })
    .catch((e) => {
      sermonIdsPromise = null;
      throw e;
    });
  return sermonIdsPromise;
}

async function ctxFor(restBase: string): Promise<NormalizeCtx> {
  return restBase === contentTypes.media.restBase ? { sermonTermIds: await getSermonTermIds() } : {};
}

/* ---- query building --------------------------------------------------- */

/** Resolve the term ids that define a type's "scope" (sermons, events, ...). */
async function scopeIds(type: ContentKey): Promise<{ ids: number[]; taxonomy: TaxKey; mode: 'include' | 'exclude' } | null> {
  const scope = contentTypes[type].scope;
  if (!scope) return null;
  let ids: number[];
  if (scope.taxonomy === 'videoCategory' && scope.descendants) {
    const set = await getSermonTermIds(); // same slugs/tree rule as SERMON_CATEGORY_SLUGS
    ids = [...set];
  } else {
    const found = await Promise.all(scope.slugs.map((s) => resolveTermId(scope.taxonomy, s)));
    ids = found.filter((n): n is number => n !== null);
    if (!ids.length && scope.mode === 'include') {
      warnOnce(
        `scope:${type}`,
        `No "${scope.slugs.join('/')}" term exists in taxonomy "${taxonomies[scope.taxonomy].slug}", so the ${contentTypes[type].label} list is empty. Create that ${taxonomies[scope.taxonomy].label.toLowerCase()} in WordPress and assign it to posts, or change the rule in src/config/content.ts.`,
      );
    }
  }
  return { ids, taxonomy: scope.taxonomy, mode: scope.mode };
}

async function buildPostQuery(type: ContentKey, p: ListParams): Promise<Query | null> {
  const cfg = contentTypes[type];
  const perPage = p.perPage ?? cfg.perPage;
  const q: Query = {
    per_page: perPage,
    page: p.page ?? 1,
    _embed: 1,
    search: p.search?.trim() || undefined,
    author: p.author,
    include: p.include,
    exclude: p.exclude,
    slug: p.slug,
    sticky: p.sticky,
    orderby: p.orderby ?? (p.search ? 'relevance' : undefined),
    order: p.order,
    _fields: p.lite === false ? undefined : LIST_FIELDS,
  };

  const filters: Partial<Record<TaxKey, number[]>> = { ...p.terms };
  const scope = await scopeIds(type);
  if (scope) {
    if (scope.mode === 'include') {
      const wanted = filters[scope.taxonomy];
      const ids = wanted?.length ? wanted.filter((id) => scope.ids.includes(id)) : scope.ids;
      if (!ids.length) return null; // nothing can match
      filters[scope.taxonomy] = ids;
    } else if (scope.ids.length) {
      q[`${taxonomies[scope.taxonomy].restBase}_exclude`] = scope.ids;
    }
  }
  for (const [tax, ids] of Object.entries(filters) as [TaxKey, number[]][]) {
    if (ids?.length) q[taxonomies[tax].restBase] = ids;
  }
  return q;
}

/* ---- public API ------------------------------------------------------- */

/** fetchPosts — list any content type (articles, videos, sermons, books, gallery, events...). */
export async function fetchPosts(type: ContentKey, params: ListParams = {}): Promise<Page<ContentItem>> {
  const cfg = contentTypes[type];
  const page = params.page ?? 1;
  const perPage = params.perPage ?? cfg.perPage;
  const query = await buildPostQuery(type, params);
  if (!query) return emptyPage(page);

  const [{ data, total, totalPages }, ctx] = await Promise.all([
    wpGet<WpRaw[]>(`/wp/v2/${cfg.restBase}`, query, { page, perPage }),
    ctxFor(cfg.restBase),
  ]);
  return { items: data.map((raw) => normalizeItem(raw, type, ctx)), total, totalPages, page };
}

/** fetchPost — a single item by slug (null when it does not exist). */
export async function fetchPost(type: ContentKey, slug: string): Promise<ContentItem | null> {
  const cfg = contentTypes[type];
  const [{ data }, ctx] = await Promise.all([
    wpGet<WpRaw[]>(`/wp/v2/${cfg.restBase}`, { slug, _embed: 1, per_page: 1 }),
    ctxFor(cfg.restBase),
  ]);
  return data[0] ? normalizeItem(data[0], type, ctx) : null;
}

const truthy = (v: unknown) => v === true || v === 1 || v === '1' || /^(true|yes|on)$/i.test(String(v));

async function applyRule(type: ContentKey, rule: FeaturedRule, count: number, exclude: number[]): Promise<ContentItem[]> {
  switch (rule.by) {
    case 'sticky':
      return (await fetchPosts(type, { sticky: true, perPage: count, exclude })).items;
    case 'term': {
      const id = await resolveTermId(rule.taxonomy, rule.slug);
      if (id === null) return [];
      return (await fetchPosts(type, { perPage: count, exclude, terms: { [rule.taxonomy]: [id] } })).items;
    }
    case 'meta': {
      const { items } = await fetchPosts(type, { perPage: 30, exclude });
      return items.filter((i) => truthy(i.meta[rule.key])).slice(0, count);
    }
    case 'latest':
      return (await fetchPosts(type, { perPage: count, exclude })).items;
  }
}

/** Featured items for a type, following the (configurable) rules in content.ts. */
export async function fetchFeatured(type: ContentKey, count = 1): Promise<ContentItem[]> {
  const found: ContentItem[] = [];
  for (const rule of contentTypes[type].featured) {
    if (found.length >= count) break;
    const more = await applyRule(type, rule, count - found.length, found.map((i) => i.id));
    found.push(...more);
  }
  return found.slice(0, count);
}

export interface RelatedResult {
  items: ContentItem[];
  /** Why these items were chosen (drives the section heading). */
  basis: TaxKey | 'latest';
  term?: string;
}

/** Items sharing a series / category / topic with `item`, falling back to the latest. */
export async function fetchRelated(item: ContentItem, limit = 4): Promise<RelatedResult> {
  const cfg = contentTypes[item.type];
  for (const tax of cfg.related) {
    const ids = item.termIds[tax];
    if (!ids?.length) continue;
    const page = await fetchPosts(item.type, { terms: { [tax]: ids }, exclude: [item.id], perPage: limit });
    if (page.items.length) return { items: page.items, basis: tax, term: item.terms[tax]?.[0]?.name };
  }
  const latest = await fetchPosts(item.type, { exclude: [item.id], perPage: limit });
  return { items: latest.items, basis: 'latest' };
}

export interface SearchGroup {
  type: ContentKey;
  page?: Page<ContentItem>;
  error?: Error;
}

/** Global search across every searchable content type. Partial failures are kept per group. */
export async function searchAll(query: string, perType = 6): Promise<SearchGroup[]> {
  const results = await Promise.allSettled(
    searchableTypes.filter((t) => contentTypes[t].enabled).map((t) => fetchPosts(t, { search: query, perPage: perType })),
  );
  return results.map((r, i) => {
    const type = searchableTypes.filter((t) => contentTypes[t].enabled)[i];
    return r.status === 'fulfilled' ? { type, page: r.value } : { type, error: r.reason as Error };
  });
}
