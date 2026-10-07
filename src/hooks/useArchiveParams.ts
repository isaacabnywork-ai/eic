import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { contentTypes } from '@/config/content';
import type { ContentKey, TaxKey } from '@/config/content';
import type { ListParams } from '@/api';

export interface ArchiveState {
  page: number;
  q: string;
  filters: Partial<Record<TaxKey, number>>;
}

/**
 * Archive filters live in the URL (?page=2&q=grace&series=12) so pages are
 * shareable and the back button works. Returns state + ListParams for the API.
 */
export function useArchiveParams(type: ContentKey, baseParams: ListParams = {}) {
  const [sp, setSp] = useSearchParams();
  const cfg = contentTypes[type];

  const state = useMemo<ArchiveState>(() => {
    const filters: ArchiveState['filters'] = {};
    for (const tax of cfg.taxonomies) {
      const v = Number(sp.get(tax));
      if (v > 0) filters[tax] = v;
    }
    return { page: Math.max(1, Number(sp.get('page')) || 1), q: sp.get('q') ?? '', filters };
  }, [sp, cfg.taxonomies]);

  const listParams = useMemo<ListParams>(() => {
    const terms: NonNullable<ListParams['terms']> = { ...baseParams.terms };
    for (const [tax, id] of Object.entries(state.filters) as [TaxKey, number][]) terms[tax] = [id];
    return {
      ...baseParams,
      page: state.page,
      search: state.q || undefined,
      terms,
    };
  }, [state, baseParams]);

  /** Change one or more params; changing a filter resets to page 1. */
  const update = useCallback(
    (patch: Record<string, string | number | undefined>) => {
      setSp(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === undefined || v === '' || v === 0) next.delete(k);
            else next.set(k, String(v));
          }
          if (!('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSp],
  );

  const clear = useCallback(() => setSp({}, { replace: true }), [setSp]);
  const hasFilters = !!state.q || Object.keys(state.filters).length > 0;

  return { state, listParams, update, clear, hasFilters };
}
