import { taxonomies } from '@/config/content';
import type { TaxKey } from '@/config/content';
import { wpGet } from './client';
import { normalizeTerm } from './normalize';
import type { Page, Term, TermParams } from './types';

const TERM_FIELDS = 'id,name,slug,count,parent,taxonomy,description';

/** fetchTerms — one page of terms of any configured taxonomy. */
export async function fetchTerms(taxonomy: TaxKey, params: TermParams = {}): Promise<Page<Term>> {
  const cfg = taxonomies[taxonomy];
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 100;
  const { data, total, totalPages } = await wpGet<Record<string, unknown>[]>(
    `/wp/v2/${cfg.restBase}`,
    {
      per_page: perPage,
      page,
      search: params.search,
      slug: params.slug,
      orderby: params.orderby ?? 'name',
      order: params.order ?? (params.orderby === 'count' ? 'desc' : 'asc'),
      hide_empty: params.hideEmpty ?? true,
      parent: params.parent,
      include: params.include,
      _fields: TERM_FIELDS,
    },
    { page, perPage },
  );
  const items = data
    .map((t) => normalizeTerm({ ...t, taxonomy: cfg.slug }, taxonomy))
    .filter((t): t is Term => !!t);
  return { items, total, totalPages, page };
}

const allTermsCache = new Map<string, Promise<Term[]>>();

/** Every term of a taxonomy (follows pagination). Cached for the session. */
export function fetchAllTerms(taxonomy: TaxKey, hideEmpty = false): Promise<Term[]> {
  const key = `${taxonomy}:${hideEmpty}`;
  let promise = allTermsCache.get(key);
  if (!promise) {
    promise = (async () => {
      const first = await fetchTerms(taxonomy, { perPage: 100, hideEmpty });
      const rest = await Promise.all(
        Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, i) =>
          fetchTerms(taxonomy, { perPage: 100, page: i + 2, hideEmpty }),
        ),
      );
      return [first, ...rest].flatMap((p) => p.items);
    })();
    promise.catch(() => allTermsCache.delete(key));
    allTermsCache.set(key, promise);
  }
  return promise;
}

export async function fetchTermBySlug(taxonomy: TaxKey, slug: string): Promise<Term | null> {
  const { items } = await fetchTerms(taxonomy, { slug, hideEmpty: false, perPage: 1 });
  return items[0] ?? null;
}

/** Look up a term id by slug (cached through fetchAllTerms). */
export async function resolveTermId(taxonomy: TaxKey, slug: string): Promise<number | null> {
  const all = await fetchAllTerms(taxonomy);
  return all.find((t) => t.slug === slug)?.id ?? null;
}
