import { useParams, useSearchParams } from 'react-router-dom';
import { useContentList, useTermBySlug } from '@/hooks/queries';
import { plural } from '@/lib/format';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';

export function SeriesSinglePage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const { data: term, isLoading: termLoading, isError: termError, error: termErr, refetch: refetchTerm } = useTermBySlug(
    'series',
    slug,
  );

  const {
    data: posts,
    isLoading: postsLoading,
    isError: postsError,
    error: postsErr,
    refetch: refetchPosts,
    isPlaceholderData,
  } = useContentList('article', {
    page,
    perPage: 12,
    terms: term ? { series: [term.id] } : undefined,
  });

  const isLoading = termLoading || (postsLoading && !posts);

  if (termError) {
    return (
      <div className="container-page max-w-2xl py-16">
        <ErrorState title="Series not found" error={termErr} onRetry={() => void refetchTerm()} />
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={term?.name ? `Series: ${term.name}` : 'Series'}
        description={term?.description || `Resources in the ${term?.name} series on Equip Indian Churches.`}
        path={`/series/${slug}`}
      />

      <PageHeader
        title={term?.name || 'Loading series...'}
        eyebrow="Series Collection"
        description={
          term?.description ||
          `Collection of ${term ? plural(term.count || 0, 'resource') : 'resources'} in this study series.`
        }
      />

      <div className="container-page py-10">
        {isLoading ? (
          <CardGridSkeleton variant="article" count={6} />
        ) : postsError ? (
          <ErrorState error={postsErr} onRetry={() => void refetchPosts()} />
        ) : posts && posts.items.length > 0 ? (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.items.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={posts.totalPages}
              onChange={(newPage) => {
                setSearchParams({ page: String(newPage) });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        ) : (
          <EmptyState
            title="No items found in this series"
            message="Check back soon as more resources are published."
          />
        )}
      </div>
    </>
  );
}
