import { useContentList } from '@/hooks/queries';
import { useArchiveParams } from '@/hooks/useArchiveParams';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { FilterBar } from '@/components/navigation/FilterBar';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { BookCard } from '@/components/cards/BookCard';

export function BookReviewsArchivePage() {
  const { state, listParams, update, clear, hasFilters } = useArchiveParams('bookReview');
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useContentList(
    'bookReview',
    listParams,
  );

  return (
    <>
      <SeoHead
        title="Book Reviews"
        description="Thoughtful Christian book reviews to cultivate discernment and edifying reading habits."
        path="/book-reviews"
      />

      <PageHeader
        title="Book Reviews"
        eyebrow="Literary Discernment"
        description="Careful reviews and recommendations of biblical commentaries, pastoral theology, historical biographies, and discipleship books."
      />

      <div className="container-page py-10">
        <FilterBar
          type="bookReview"
          state={state}
          onUpdate={update}
          onClear={clear}
          hasFilters={hasFilters}
          total={data?.total}
        />

        {isLoading ? (
          <CardGridSkeleton variant="book" count={8} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : data && data.items.length > 0 ? (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {data.items.map((book) => (
                <BookCard key={book.id} item={book} />
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
            title="No book reviews found"
            message={
              hasFilters
                ? 'Try adjusting your search keywords.'
                : 'No book reviews have been published yet.'
            }
          />
        )}
      </div>
    </>
  );
}
