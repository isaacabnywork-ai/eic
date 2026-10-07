import { useContentList } from '@/hooks/queries';
import { useArchiveParams } from '@/hooks/useArchiveParams';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { GalleryCard } from '@/components/cards/GalleryCard';

export function GalleryArchivePage() {
  const { state, listParams, update } = useArchiveParams('gallery');
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useContentList(
    'gallery',
    listParams,
  );

  return (
    <>
      <SeoHead
        title="Photo Gallery"
        description="Visual memories from regional conferences, pastor roundtables, and church gatherings."
        path="/gallery"
      />

      <PageHeader
        title="Photo Gallery"
        eyebrow="Moments & Memories"
        description="Photos and memories from our annual pastor conferences, regional training seminars, and fellowship gatherings."
      />

      <div className="container-page py-10">
        {isLoading ? (
          <CardGridSkeleton variant="gallery" count={6} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : data && data.items.length > 0 ? (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((album) => (
                <GalleryCard key={album.id} item={album} />
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
            title="No gallery albums found"
            message="No photographic albums are available at this moment."
          />
        )}
      </div>
    </>
  );
}
