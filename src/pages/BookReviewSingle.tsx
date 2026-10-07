import { useParams, Link } from 'react-router-dom';
import { useContentItem, useRelated } from '@/hooks/queries';
import { formatDate } from '@/lib/format';
import { authorPath } from '@/lib/routes';
import { SeoHead } from '@/components/seo/SeoHead';
import { RichContent } from '@/components/content/RichContent';
import { Img } from '@/components/ui/Img';
import { BookCard } from '@/components/cards/BookCard';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/States';
import { ExternalLinkIcon, StarIcon, UserIcon } from '@/components/ui/Icons';

export function BookReviewSinglePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: book, isLoading, isError, error, refetch } = useContentItem('bookReview', slug);
  const { data: related } = useRelated(book, 4);

  if (isLoading) {
    return (
      <div className="container-page max-w-4xl py-12 space-y-6">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
          </div>
          <div className="md:col-span-8 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <SkeletonText lines={6} />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="container-page max-w-2xl py-16">
        <ErrorState
          title="Review Not Found"
          error={error || new Error('The book review could not be found.')}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const displayTitle = book.bookTitle || book.title;

  return (
    <>
      <SeoHead
        title={`Review: ${displayTitle}`}
        description={book.excerpt || `Book review of ${displayTitle} by ${book.bookAuthor || 'unknown'}.`}
        path={`/book-reviews/${book.slug}`}
        image={book.image?.src}
        type="book"
        publishedTime={book.date}
        author={book.author?.name}
      />

      <article className="py-10 sm:py-16">
        <div className="container-page max-w-4xl">
          {/* Header block with Book Cover */}
          <div className="grid gap-8 md:grid-cols-12 items-start border-b border-line pb-10">
            {/* Book Cover portrait */}
            <div className="md:col-span-4 mx-auto w-full max-w-[260px]">
              <div className="aspect-[2/3] overflow-hidden rounded-2xl shadow-xl border border-line">
                <Img
                  image={book.image}
                  alt={displayTitle}
                  wrapperClassName="h-full w-full"
                  eager
                />
              </div>
            </div>

            {/* Book Details */}
            <div className="md:col-span-8 space-y-4">
              <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-text">
                Book Review
              </span>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-ink">
                {displayTitle}
              </h1>

              {book.bookAuthor && (
                <p className="text-lg font-medium text-muted">
                  By <span className="text-ink font-semibold">{book.bookAuthor}</span>
                </p>
              )}

              {/* Star Rating */}
              {book.rating && (
                <div className="flex items-center gap-2 pt-1 text-accent">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <StarIcon
                        key={i}
                        size={18}
                        className={i < Math.floor(book.rating!) ? 'fill-accent text-accent' : 'text-line'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-ink">
                    {book.rating.toFixed(1)} / 5.0
                  </span>
                </div>
              )}

              {/* Reviewer Meta */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-sm text-muted">
                {book.author && (
                  <Link to={authorPath(book.author.id)} className="flex items-center gap-1.5 font-medium text-ink hover:text-link">
                    <UserIcon size={16} />
                    <span>Reviewed by {book.author.name}</span>
                  </Link>
                )}
                <span>•</span>
                <time dateTime={book.date}>{formatDate(book.date)}</time>
              </div>

              {/* Buy Link if configured */}
              {book.buyUrl && (
                <div className="pt-2">
                  <a
                    href={book.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-ink hover:bg-primary-hover shadow-md"
                  >
                    <span>Get a copy of this book</span>
                    <ExternalLinkIcon size={15} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Review Body */}
          <div className="mt-10">
            <h2 className="font-serif text-2xl font-bold mb-6">Review & Recommendation</h2>
            <RichContent html={book.html} />
          </div>
        </div>

        {/* Related Book Reviews */}
        {related && related.items.length > 0 && (
          <section className="mt-16 border-t border-line bg-surface-2/30 py-16">
            <div className="container-page">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-text mb-1">
                  More Good Books
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                  Recommended Reading
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {related.items.map((item) => (
                  <BookCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
