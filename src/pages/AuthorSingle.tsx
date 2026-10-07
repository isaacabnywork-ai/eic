import { useParams, useSearchParams } from 'react-router-dom';
import { useUser, useContentList } from '@/hooks/queries';
import { plural } from '@/lib/format';
import { SeoHead } from '@/components/seo/SeoHead';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { CardGridSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { UserIcon } from '@/components/ui/Icons';

export function AuthorSinglePage() {
  const { id } = useParams<{ id: string }>();
  const authorId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const { data: author, isLoading: authorLoading, isError: authorError, error: authorErr, refetch: refetchAuthor } = useUser(authorId);

  const {
    data: articles,
    isLoading: articlesLoading,
    isError: articlesError,
    error: articlesErr,
    refetch: refetchArticles,
    isPlaceholderData,
  } = useContentList('article', {
    author: authorId,
    page,
    perPage: 12,
  });

  const isLoading = authorLoading || (articlesLoading && !articles);

  if (authorError) {
    return (
      <div className="container-page max-w-2xl py-16">
        <ErrorState title="Author Not Found" error={authorErr} onRetry={() => void refetchAuthor()} />
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={author ? `${author.name} • Contributor` : 'Author Profile'}
        description={author?.description || `Articles and resources by ${author?.name || 'this contributor'} on Equip Indian Churches.`}
        path={`/authors/${id}`}
        image={author?.avatar}
      />

      {/* Author Profile Header */}
      <section className="border-b border-line bg-surface-2/40 py-12 sm:py-16">
        <div className="container-page max-w-4xl">
          {authorLoading ? (
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ) : author ? (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-primary-soft shadow-md border-2 border-line">
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-link">
                    <UserIcon size={40} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent-text">
                  Contributor Profile
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-1">
                  {author.name}
                </h1>
                {author.description && (
                  <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed max-w-2xl">
                    {author.description}
                  </p>
                )}
                {articles && (
                  <p className="mt-3 text-xs font-semibold text-muted">
                    {plural(articles.total, 'published article')}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Authored Content Grid */}
      <div className="container-page py-10">
        <h2 className="font-serif text-2xl font-bold mb-6">
          Contributions by {author?.name || 'Author'}
        </h2>

        {isLoading ? (
          <CardGridSkeleton variant="article" count={6} />
        ) : articlesError ? (
          <ErrorState error={articlesErr} onRetry={() => void refetchArticles()} />
        ) : articles && articles.items.length > 0 ? (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.items.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={articles.totalPages}
              onChange={(newPage) => {
                setSearchParams({ page: String(newPage) });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        ) : (
          <EmptyState
            title="No articles found"
            message={`${author?.name || 'This author'} has not published any articles yet.`}
          />
        )}
      </div>
    </>
  );
}
