import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { contentTypes } from '@/config/content';
import { useSearch } from '@/hooks/queries';
import { useDebounce } from '@/hooks/useDebounce';
import { plural } from '@/lib/format';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { VideoCard } from '@/components/cards/VideoCard';
import { BookCard } from '@/components/cards/BookCard';
import { GalleryCard } from '@/components/cards/GalleryCard';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/States';
import { SearchIcon, CloseIcon, ArrowRightIcon } from '@/components/ui/Icons';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(qParam);
  const debouncedVal = useDebounce(inputVal, 400);

  // Sync debounced input to URL search parameter
  useEffect(() => {
    if (debouncedVal !== qParam) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (debouncedVal.trim()) next.set('q', debouncedVal.trim());
          else next.delete('q');
          return next;
        },
        { replace: true },
      );
    }
  }, [debouncedVal, qParam, setSearchParams]);

  useEffect(() => {
    setInputVal(qParam);
  }, [qParam]);

  const { data: groups, isLoading, isFetching } = useSearch(qParam);

  const totalResults = groups
    ? groups.reduce((acc, g) => acc + (g.page?.total || 0), 0)
    : 0;

  return (
    <>
      <SeoHead
        title={qParam ? `Search: "${qParam}"` : 'Search the Library'}
        description="Search across articles, video teachings, expository sermons, book reviews, and photo albums."
        path="/search"
      />

      <PageHeader
        title="Search the Library"
        eyebrow="Global Search"
        description="Find biblical wisdom, expository messages, book reviews, and theological articles across our complete collection."
      >
        <div className="max-w-xl">
          <div className="relative">
            <SearchIcon
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              type="search"
              autoFocus
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search across all articles, videos, reviews..."
              aria-label="Search resources"
              className="h-13 w-full rounded-2xl border border-line bg-surface pl-12 pr-12 text-base text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-sm"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => {
                  setInputVal('');
                  setSearchParams({}, { replace: true });
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                aria-label="Clear search text"
              >
                <CloseIcon size={18} />
              </button>
            )}
          </div>
        </div>
      </PageHeader>

      <div className="container-page py-10">
        {qParam.trim().length < 2 ? (
          <div className="py-12 text-center text-muted">
            <p className="text-base">
              Type at least 2 characters to search across all content types.
            </p>
          </div>
        ) : isLoading || isFetching ? (
          <div className="space-y-10">
            <CardGridSkeleton variant="article" count={6} />
          </div>
        ) : groups && totalResults > 0 ? (
          <div className="space-y-14">
            <p className="text-sm font-semibold text-muted">
              Found {plural(totalResults, 'result')} for{' '}
              <span className="text-ink">"{qParam}"</span>:
            </p>

            {groups.map((group) => {
              const cfg = contentTypes[group.type];
              const items = group.page?.items || [];
              if (items.length === 0) return null;

              return (
                <section key={group.type} className="border-b border-line pb-12 last:border-b-0">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold">
                        {cfg.label}
                      </h3>
                      <p className="text-xs text-muted">
                        {plural(group.page?.total || items.length, 'match', 'matches')}
                      </p>
                    </div>

                    <Link
                      to={`/${cfg.route}?q=${encodeURIComponent(qParam)}`}
                      className="group inline-flex items-center gap-1.5 text-xs font-semibold text-link hover:underline"
                    >
                      <span>View all in {cfg.label}</span>
                      <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                  {group.type === 'article' && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((it) => (
                        <ArticleCard key={it.id} article={it} />
                      ))}
                    </div>
                  )}

                  {(group.type === 'video' || group.type === 'media' || group.type === 'sermon') && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((it) => (
                        <VideoCard key={it.id} item={it} />
                      ))}
                    </div>
                  )}

                  {group.type === 'bookReview' && (
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                      {items.map((it) => (
                        <BookCard key={it.id} item={it} />
                      ))}
                    </div>
                  )}

                  {group.type === 'gallery' && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((it) => (
                        <GalleryCard key={it.id} item={it} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No matches found"
            message={`We couldn't find anything matching "${qParam}". Try broader search terms or checking different keywords.`}
          />
        )}
      </div>
    </>
  );
}
