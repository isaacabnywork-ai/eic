import { useContentList } from '@/hooks/queries';
import { useArchiveParams } from '@/hooks/useArchiveParams';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { FilterBar } from '@/components/navigation/FilterBar';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { VideoCard } from '@/components/cards/VideoCard';

export function SermonsArchivePage() {
  const { state, listParams, update, clear, hasFilters } = useArchiveParams('sermon');
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useContentList(
    'sermon',
    listParams,
  );

  return (
    <>
      <SeoHead
        title="Sermons"
        description="Expository messages and conference sermons delivered to equip Indian churches."
        path="/sermons"
      />

      <PageHeader
        title="Sermons & Expositions"
        eyebrow="Word Preached"
        description="Full-length expository messages preached at conferences, regional gatherings, and local church assemblies across the subcontinent."
      />

      <div className="container-page py-10">
        <FilterBar
          type="sermon"
          state={state}
          onUpdate={update}
          onClear={clear}
          hasFilters={hasFilters}
          total={data?.total}
        />

        {isLoading ? (
          <CardGridSkeleton variant="video" count={9} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : data && data.items.length > 0 ? (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((sermon) => (
                <VideoCard key={sermon.id} item={sermon} variant="sermon" />
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
            title="No sermons found"
            message={
              hasFilters
                ? 'Try adjusting your search keywords or clearing active filters.'
                : 'No sermons are available at this time.'
            }
          />
        )}
      </div>
    </>
  );
}
