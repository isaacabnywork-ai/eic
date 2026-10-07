import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { contentTypes, QUERY_STALE_MS } from '@/config/content';
import type { ContentKey, TaxKey } from '@/config/content';
import {
  fetchAllTerms,
  fetchFeatured,
  fetchGalleryImages,
  fetchPost,
  fetchPosts,
  fetchRelated,
  fetchTermBySlug,
  fetchTerms,
  fetchUser,
  fetchUsers,
  getSermonTermIds,
  searchAll,
} from '@/api';
import type { ContentItem, ListParams, TermParams, UserParams } from '@/api';
import { fetchSeriesCards } from '@/api/series';

/** Every page reads data through these hooks — one place to tune caching. */

export const useContentList = (type: ContentKey, params: ListParams = {}) =>
  useQuery({
    queryKey: ['list', type, params],
    queryFn: () => fetchPosts(type, params),
    placeholderData: keepPreviousData,
    staleTime: QUERY_STALE_MS,
  });

export const useContentItem = (type: ContentKey, slug: string | undefined) =>
  useQuery({
    queryKey: ['item', type === 'media' ? 'video' : type, slug],
    queryFn: () => fetchPost(type, slug as string),
    enabled: !!slug,
    staleTime: QUERY_STALE_MS,
  });

export const useFeatured = (type: ContentKey, count = 1) =>
  useQuery({
    queryKey: ['featured', type, count],
    queryFn: () => fetchFeatured(type, count),
    staleTime: QUERY_STALE_MS,
  });

export const useRelated = (item: ContentItem | null | undefined, limit = 4) =>
  useQuery({
    queryKey: ['related', item?.type, item?.id, limit],
    queryFn: () => fetchRelated(item as ContentItem, limit),
    enabled: !!item && contentTypes[item.type].enabled,
    staleTime: QUERY_STALE_MS,
  });

export const useTerms = (taxonomy: TaxKey, params: TermParams = {}, enabled = true) =>
  useQuery({
    queryKey: ['terms', taxonomy, params],
    queryFn: () => fetchTerms(taxonomy, params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: QUERY_STALE_MS * 2,
  });

export const useTermBySlug = (taxonomy: TaxKey, slug: string | undefined) =>
  useQuery({
    queryKey: ['term', taxonomy, slug],
    queryFn: () => fetchTermBySlug(taxonomy, slug as string),
    enabled: !!slug,
    staleTime: QUERY_STALE_MS,
  });

/**
 * Terms offered in a filter dropdown for a content type. For the shared Videos
 * post type, "Category" only lists sermon terms on /sermons and non-sermon terms on /videos.
 */
export const useFilterTerms = (type: ContentKey, taxonomy: TaxKey, enabled = true) =>
  useQuery({
    queryKey: ['filter-terms', type, taxonomy],
    enabled,
    staleTime: QUERY_STALE_MS * 2,
    queryFn: async () => {
      const terms = await fetchAllTerms(taxonomy, true);
      const scope = contentTypes[type].scope;
      if (scope && scope.taxonomy === taxonomy && taxonomy === 'videoCategory') {
        const sermonIds = await getSermonTermIds();
        return terms.filter((t) => (scope.mode === 'include') === sermonIds.has(t.id));
      }
      return terms;
    },
  });


export const useSearch = (query: string) =>
  useQuery({
    queryKey: ['search', query],
    queryFn: () => searchAll(query),
    enabled: query.trim().length >= 2,
    staleTime: QUERY_STALE_MS,
  });

export const useUsers = (params: UserParams = {}) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
    placeholderData: keepPreviousData,
    staleTime: QUERY_STALE_MS,
  });

export const useUser = (id: number | undefined) =>
  useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id as number),
    enabled: !!id,
    staleTime: QUERY_STALE_MS,
  });

export const useGalleryImages = (item: ContentItem | null | undefined) =>
  useQuery({
    queryKey: ['gallery-images', item?.id],
    queryFn: () => fetchGalleryImages(item as ContentItem),
    enabled: !!item,
    staleTime: QUERY_STALE_MS,
  });

export const useSeriesCards = (opts: {
  count: number;
  hiddenSlugs?: string[];
  onlySlugs?: string[];
  coverType: ContentKey;
}) =>
  useQuery({
    queryKey: ['series-cards', opts],
    queryFn: () => fetchSeriesCards(opts),
    staleTime: QUERY_STALE_MS,
  });
