import { useContentList } from '@/hooks/queries';
import { useArchiveParams } from '@/hooks/useArchiveParams';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { FilterBar } from '@/components/navigation/FilterBar';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ArticleCard } from '@/components/cards/ArticleCard';

export function ArticlesArchivePage() {
  const { state, listParams, update, clear, hasFilters } = useArchiveParams('article');
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useContentList(
    'article',
    listParams,
  );

  return (
    <>
      <SeoHead
        title="Articles"
        description="Biblical reflections, pastoral guidance, and theological essays equipping the church in India."
        path="/articles"
      />

      <PageHeader
        title="Articles & Essays"
        eyebrow="Theological Library"
        description="Sound biblical teaching and practical pastoral wisdom for Christian living, leadership, and ministry in India."
      />

      <div className="container-page py-10">
        <FilterBar
          type="article"
          state={state}
          onUpdate={update}
          onClear={clear}
          hasFilters={hasFilters}
          total={data?.total}
        />

        {isLoading ? (
          <CardGridSkeleton variant="article" count={9} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : data && data.items.length > 0 ? (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            <Pagination
              page={state.page}
              totalPages={data.totalPages}
              onChange={(newPage) => update({ page: newPage })}
            />
          </div>
        ) : (
          <EmptyState
            title="No articles found"
            message={
              hasFilters
                ? 'Try adjusting your search keywords or clearing active filters.'
                : 'No published articles are available at the moment.'
            }
          />
        )}
      </div>
    </>
  );
}
