import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUsers } from '@/hooks/queries';
import { useDebounce } from '@/hooks/useDebounce';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { AuthorCard } from '@/components/cards/AuthorCard';
import { SearchIcon, CloseIcon } from '@/components/ui/Icons';

export function AuthorsArchivePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const q = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(q);
  const debouncedSearch = useDebounce(searchTerm, 400);

  const queryParams = useMemo(
    () => ({
      page,
      perPage: 24,
      search: debouncedSearch || undefined,
    }),
    [page, debouncedSearch],
  );

  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useUsers(queryParams);

  return (
    <>
      <SeoHead
        title="Authors & Speakers"
        description="Meet the pastors, theologians, and ministry leaders contributing to Equip Indian Churches."
        path="/authors"
      />

      <PageHeader
        title="Authors & Contributors"
        eyebrow="Voices of Truth"
        description="Meet the pastors, church planters, theologians, and servant-leaders who contribute articles, sermons, and book reviews."
      />

      <div className="container-page py-10">
        {/* Search bar */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <SearchIcon
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (e.target.value) next.set('q', e.target.value);
                  else next.delete('q');
                  next.delete('page');
                  return next;
                });
              }}
              placeholder="Search by author name..."
              aria-label="Search authors"
              className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-10 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete('q');
                    return next;
                  });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                aria-label="Clear author search"
              >
                <CloseIcon size={16} />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <CardGridSkeleton variant="person" count={12} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : data && data.items.length > 0 ? (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((author) => (
                <AuthorCard key={author.id} person={author} />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={data.totalPages}
              onChange={(newPage) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set('page', String(newPage));
                  return next;
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        ) : (
          <EmptyState
            title="No contributors found"
            message={
              searchTerm
                ? 'No authors matched your search term.'
                : 'No author profiles are available.'
            }
          />
        )}
      </div>
    </>
  );
}
