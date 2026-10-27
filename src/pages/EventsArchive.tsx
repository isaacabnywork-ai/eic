import { useMemo } from 'react';
import { useContentList } from '@/hooks/queries';
import { useArchiveParams } from '@/hooks/useArchiveParams';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { FilterBar } from '@/components/navigation/FilterBar';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { EventCard } from '@/components/cards/EventCard';
import { MobileEventsView } from '@/components/mobile/MobileEventsView';
import { usePublishedEvents, customEventToContentItem } from '@/lib/publicEvents';

export function EventsArchivePage() {
  const { state, listParams, update, clear, hasFilters } = useArchiveParams('event');
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useContentList(
    'event',
    listParams,
  );
  const customEvents = usePublishedEvents();

  const combinedItems = useMemo(() => {
    const customContentItems = customEvents.map(customEventToContentItem);
    if (!data?.items) return customContentItems;

    let filteredCustom = customContentItems;
    if (state.q) {
      const q = state.q.toLowerCase();
      filteredCustom = customContentItems.filter(
        (e) => e.title.toLowerCase().includes(q) || e.excerpt.toLowerCase().includes(q),
      );
    }

    return [...filteredCustom, ...data.items];
  }, [customEvents, data?.items, state.q]);

  const hasAnyItems = combinedItems.length > 0;

  return (
    <>
      <SeoHead
        title="Events & Conferences"
        description="Upcoming Christian conferences, regional pastoral training gatherings, and workshops in India."
        path="/events"
      />

      {/* Mobile & Tablet Streaming View (< md) */}
      {!hasFilters && <MobileEventsView />}

      {/* Desktop / Filtered Archive Container */}
      <div className={!hasFilters ? 'hidden md:block' : ''}>
        <PageHeader
          title="Events & Gatherings"
          eyebrow="Fellowship & Assembly"
          description="Conferences, regional leaders' forums, and training seminars designed to sharpen pastors and bring believers together."
        />

        <div className="container-page py-10">
          <FilterBar
            type="event"
            state={state}
            onUpdate={update}
            onClear={clear}
            hasFilters={hasFilters}
            total={(data?.total || 0) + customEvents.length}
          />

          {isLoading && !hasAnyItems ? (
            <CardGridSkeleton variant="event" count={6} />
          ) : isError && !hasAnyItems ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : hasAnyItems ? (
            <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
              <div className="grid gap-6 md:grid-cols-2">
                {combinedItems.map((event) => (
                  <EventCard key={event.id} item={event} />
                ))}
              </div>

              {data && data.totalPages > 1 && (
                <Pagination
                  page={state.page}
                  totalPages={data.totalPages}
                  onChange={(newPage) => update({ page: newPage })}
                />
              )}
            </div>
          ) : (
            <EmptyState
              title="No events listed"
              message={
                hasFilters
                  ? 'Try adjusting your search keywords.'
                  : 'There are no upcoming events scheduled at this moment. Stay tuned for future announcements!'
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
