import type { ContentKey } from '@/config/content';
import { fetchPosts } from './content';
import { fetchTerms } from './terms';
import type { ContentItem, ImageInfo, Term } from './types';

export interface SeriesCard {
  term: Term;
  cover?: ImageInfo;
  latest?: ContentItem;
}

/**
 * Top series (most items first, or the explicit list from config) with a cover taken
 * from the newest item inside each series. Terms themselves have no image in WordPress.
 */
export async function fetchSeriesCards(
  opts: { count: number; hiddenSlugs?: string[]; onlySlugs?: string[]; coverType: ContentKey },
): Promise<SeriesCard[]> {
  const hidden = new Set(opts.hiddenSlugs ?? []);
  let terms: Term[];
  if (opts.onlySlugs?.length) {
    const page = await fetchTerms('series', { perPage: 100, hideEmpty: false });
    terms = opts.onlySlugs
      .map((s) => page.items.find((t) => t.slug === s))
      .filter((t): t is Term => !!t);
  } else {
    const page = await fetchTerms('series', { perPage: opts.count + hidden.size + 2, orderby: 'count', order: 'desc' });
    terms = page.items.filter((t) => !hidden.has(t.slug));
  }
  terms = terms.slice(0, opts.count);

  return Promise.all(
    terms.map(async (term): Promise<SeriesCard> => {
      try {
        const { items } = await fetchPosts(opts.coverType, { perPage: 1, terms: { series: [term.id] } });
        return { term, latest: items[0], cover: items[0]?.image };
      } catch {
        return { term };
      }
    }),
  );
}
