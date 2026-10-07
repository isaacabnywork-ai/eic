import { useContentList } from '@/hooks/queries';
import { useArchiveParams } from '@/hooks/useArchiveParams';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { FilterBar } from '@/components/navigation/FilterBar';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { VideoCard } from '@/components/cards/VideoCard';

export function VideosArchivePage() {
  const { state, listParams, update, clear, hasFilters } = useArchiveParams('video');
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useContentList(
    'video',
    listParams,
  );

  return (
    <>
      <SeoHead
        title="Videos"
        description="Biblical discussions, Q&A, and practical teachings produced for Indian churches."
        path="/videos"
      />

      <PageHeader
        title="Videos & Discussions"
        eyebrow="Media Library"
        description="Short teaching clips, question and answer sessions, and discussions addressing topics relevant to Indian pastors and church members."
      />

      <div className="container-page py-10">
        <FilterBar
          type="video"
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
              {data.items.map((video) => (
                <VideoCard key={video.id} item={video} variant="video" />
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
            title="No videos found"
            message={
              hasFilters
                ? 'Try adjusting your search keywords or clearing active filters.'
                : 'No published videos are available right now.'
            }
          />
        )}
      </div>
    </>
  );
}
