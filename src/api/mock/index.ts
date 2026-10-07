/**
 * Tiny in-memory imitation of the WordPress REST API.
 * Supports the query parameters the app uses: per_page, page, search, slug, include,
 * exclude, author, sticky, orderby/order, <taxonomy> filters (+ _exclude), parent,
 * hide_empty and _embed.
 */
import { ApiError } from '../client';
import type { WpResponse } from '../client';
import type { WpRaw } from '../types';
import { bookReviews, gallery, mediaItems, posts, sermons, termRows, userRows } from './data';
import type { TermRow } from './data';

const collections: Record<string, WpRaw[]> = {
  posts,
  sermon: sermons,
  'book-review': bookReviews,
  gallery,
  'church-listing': [],
};

const termBases = [...new Set(termRows.map((t) => t.restBase))];
const termRowsByBase = (base: string) => termRows.filter((t) => t.restBase === base);

const numList = (v: string | null): number[] => (v ? v.split(',').map(Number).filter((n) => !Number.isNaN(n)) : []);

const termObject = (t: TermRow) => ({
  id: t.id,
  name: t.name,
  slug: t.slug,
  taxonomy: t.taxonomy,
  parent: t.parent,
  description: t.description,
  count: countOf(t),
});

function countOf(t: TermRow): number {
  return Object.values(collections).flat().filter((i) => (i[t.restBase] as number[] | undefined)?.includes(t.id)).length;
}

function embed(item: WpRaw): WpRaw {
  const author = userRows.find((u) => u.id === item.author);
  const featured = mediaItems.find((m) => m.id === item.featured_media);
  const groups = termBases
    .map((base) =>
      ((item[base] as number[] | undefined) ?? [])
        .map((id) => termRows.find((t) => t.id === id && t.restBase === base))
        .filter((t): t is TermRow => !!t)
        .map(termObject),
    )
    .filter((g) => g.length);
  const _embedded: WpRaw = {};
  if (author) _embedded.author = [author];
  if (featured) _embedded['wp:featuredmedia'] = [featured];
  if (groups.length) _embedded['wp:term'] = groups;
  return { ...item, _embedded };
}

function filterItems(items: WpRaw[], qs: URLSearchParams): WpRaw[] {
  let out = items.slice();
  const search = qs.get('search')?.toLowerCase();
  if (search) {
    out = out.filter((i) =>
      `${i.title?.rendered ?? ''} ${i.content?.rendered ?? ''} ${i.excerpt?.rendered ?? ''}`.toLowerCase().includes(search),
    );
  }
  const slug = qs.get('slug');
  if (slug) out = out.filter((i) => i.slug === slug);
  const include = numList(qs.get('include'));
  if (include.length) out = out.filter((i) => include.includes(i.id));
  const exclude = numList(qs.get('exclude'));
  if (exclude.length) out = out.filter((i) => !exclude.includes(i.id));
  const author = qs.get('author');
  if (author) out = out.filter((i) => String(i.author) === author);
  if (qs.get('sticky') === 'true') out = out.filter((i) => i.sticky);
  for (const base of termBases) {
    const inc = numList(qs.get(base));
    if (inc.length) out = out.filter((i) => ((i[base] as number[]) ?? []).some((id) => inc.includes(id)));
    const exc = numList(qs.get(`${base}_exclude`));
    if (exc.length) out = out.filter((i) => !((i[base] as number[]) ?? []).some((id) => exc.includes(id)));
  }
  const orderby = qs.get('orderby');
  const dir = qs.get('order') === 'asc' ? 1 : -1;
  if (orderby === 'title') out.sort((a, b) => dir * a.title.rendered.localeCompare(b.title.rendered));
  else if (orderby === 'id') out.sort((a, b) => dir * (a.id - b.id));
  else out.sort((a, b) => (a.date < b.date ? 1 : -1) * (qs.get('order') === 'asc' ? -1 : 1));
  return out;
}

function paginate<T>(items: T[], qs: URLSearchParams): WpResponse<T[]> {
  const perPage = Math.min(100, Number(qs.get('per_page') ?? 10));
  const page = Number(qs.get('page') ?? 1);
  const totalPages = Math.ceil(items.length / perPage);
  if (page > totalPages && page > 1) return { data: [], total: items.length, totalPages };
  return { data: items.slice((page - 1) * perPage, page * perPage), total: items.length, totalPages };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockRequest<T>(path: string, qs: URLSearchParams): Promise<WpResponse<T>> {
  await delay(180); // feel like a network
  const parts = path.replace(/^\/wp\/v2\//, '').split('/').filter(Boolean);
  const [base, id] = parts;
  const respond = (r: WpResponse<unknown>) => r as WpResponse<T>;

  if (collections[base]) {
    const page = paginate(filterItems(collections[base], qs), qs);
    return respond({ ...page, data: page.data.map((i) => (qs.has('_embed') ? embed(i) : i)) });
  }

  if (termBases.includes(base)) {
    let rows = termRowsByBase(base);
    const search = qs.get('search')?.toLowerCase();
    if (search) rows = rows.filter((r) => r.name.toLowerCase().includes(search));
    if (qs.get('slug')) rows = rows.filter((r) => r.slug === qs.get('slug'));
    if (qs.has('parent')) rows = rows.filter((r) => String(r.parent) === qs.get('parent'));
    const include = numList(qs.get('include'));
    if (include.length) rows = rows.filter((r) => include.includes(r.id));
    let objs = rows.map(termObject);
    if (qs.get('hide_empty') === 'true') objs = objs.filter((t) => t.count > 0);
    const dir = qs.get('order') === 'desc' ? -1 : 1;
    objs.sort((a, b) => (qs.get('orderby') === 'count' ? dir * (a.count - b.count) : dir * a.name.localeCompare(b.name)));
    return respond(paginate(objs, qs));
  }

  if (base === 'users') {
    if (id) {
      const user = userRows.find((u) => String(u.id) === id);
      if (!user) throw new ApiError('http', 'Invalid user ID.', { status: 404 });
      return respond({ data: user, total: 1, totalPages: 1 });
    }
    let rows = userRows.slice();
    const search = qs.get('search')?.toLowerCase();
    if (search) rows = rows.filter((u) => u.name.toLowerCase().includes(search));
    rows.sort((a, b) => a.name.localeCompare(b.name));
    return respond(paginate(rows, qs));
  }

  if (base === 'media') {
    let rows = mediaItems.slice();
    const parent = qs.get('parent');
    if (parent) rows = rows.filter((m) => String(m.post) === parent);
    const include = numList(qs.get('include'));
    if (include.length) rows = rows.filter((m) => include.includes(m.id));
    return respond(paginate(rows, qs));
  }

  return respond({ data: [], total: 0, totalPages: 0 });
}
