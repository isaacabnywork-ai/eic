import { useTerms } from '@/hooks/queries';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { SeriesCard } from '@/components/cards/SeriesCard';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { useQuery } from '@tanstack/react-query';
import { fetchSeriesCards } from '@/api/series';

export function SeriesArchivePage() {
  const { data: termsPage, isLoading: termsLoading, isError, error, refetch } = useTerms('series', {
    perPage: 50,
    orderby: 'count',
    order: 'desc',
    hideEmpty: true,
  });

  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ['series-archive-cards', termsPage?.items?.map((t) => t.id)],
    queryFn: async () => {
      if (!termsPage?.items) return [];
      return fetchSeriesCards({
        count: termsPage.items.length,
        onlySlugs: termsPage.items.map((t) => t.slug),
        coverType: 'article',
      });
    },
    enabled: !!termsPage?.items && termsPage.items.length > 0,
  });

  const isLoading = termsLoading || cardsLoading;

  return (
    <>
      <SeoHead
        title="Teaching Series"
        description="Explore comprehensive multi-part series exploring biblical books, theology, and pastoral disciplines."
        path="/series"
      />

      <PageHeader
        title="Teaching Series"
        eyebrow="Thematic Collections"
        description="Comprehensive collections of articles, sermons, and studies grouped together for deep and sequential study."
      />

      <div className="container-page py-10">
        {isLoading ? (
          <CardGridSkeleton variant="series" count={9} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : cards && cards.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((series) => (
              <SeriesCard key={series.term.id} series={series} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No series found"
            message="No series collections are available right now."
          />
        )}
      </div>
    </>
  );
}
