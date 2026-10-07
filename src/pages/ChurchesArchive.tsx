import { useContentList } from '@/hooks/queries';
import { useArchiveParams } from '@/hooks/useArchiveParams';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { FilterBar } from '@/components/navigation/FilterBar';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { env } from '@/config/env';
import { Link } from 'react-router-dom';

export function ChurchesArchivePage() {
  if (!env.enableChurchDirectory) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-serif text-3xl font-bold">Church Directory</h1>
        <p className="mt-3 text-muted max-w-md mx-auto">
          The public church directory feature is currently in preparation. Please check back later or contact us directly.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-link hover:underline">
          Return to home →
        </Link>
      </div>
    );
  }

  const { state, listParams, update, clear, hasFilters } = useArchiveParams('church');
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useContentList(
    'church',
    listParams,
  );

  return (
    <>
      <SeoHead
        title="Church Directory"
        description="Find Bible-believing local churches and assemblies across India."
        path="/churches"
      />

      <PageHeader
        title="Church Directory"
        eyebrow="Directory"
        description="Connect with local congregations holding to sound biblical teaching across India."
      />

      <div className="container-page py-10">
        <FilterBar
          type="church"
          state={state}
          onUpdate={update}
          onClear={clear}
          hasFilters={hasFilters}
          total={data?.total}
        />

        {isLoading ? (
          <CardGridSkeleton variant="article" count={6} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : data && data.items.length > 0 ? (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((church) => (
                <div key={church.id} className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
                  <h3 className="font-serif text-xl font-bold">{church.title}</h3>
                  {church.excerpt && <p className="mt-2 text-sm text-muted">{church.excerpt}</p>}
                </div>
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
            title="No churches listed"
            message="No listings are available at this time."
          />
        )}
      </div>
    </>
  );
}
