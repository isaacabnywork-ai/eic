import { useParams, Link } from 'react-router-dom';
import { useContentItem, useRelated } from '@/hooks/queries';
import { formatDate } from '@/lib/format';
import { readingTimeMinutes } from '@/lib/html';
import { termPath } from '@/lib/routes';
import { SeoHead } from '@/components/seo/SeoHead';
import { RichContent } from '@/components/content/RichContent';
import { Img } from '@/components/ui/Img';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/States';
import { ClockIcon, ShareIcon } from '@/components/ui/Icons';
import { useState } from 'react';

export function ArticleSinglePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, isError, error, refetch } = useContentItem('article', slug);
  const { data: related } = useRelated(article, 3);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="container-page max-w-4xl py-12 space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
        <SkeletonText lines={8} />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="container-page max-w-2xl py-16">
        <ErrorState
          title="Article Not Found"
          error={error || new Error('The article you requested could not be found.')}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const category = article.terms.category?.[0];
  const series = article.terms.series?.[0];
  const topics = article.terms.topic || [];
  const readTime = readingTimeMinutes(article.html);

  return (
    <>
      <SeoHead
        title={article.title}
        description={article.excerpt}
        path={`/articles/${article.slug}`}
        image={article.image?.src}
        type="article"
        publishedTime={article.date}
        modifiedTime={article.modified}
        author={article.author?.name}
      />

      <article className="py-10 sm:py-16">
        <div className="container-page max-w-3xl">
          {/* Taxonomy badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {series && (
              <Link
                to={termPath('series', series, 'article')}
                className="text-xs font-semibold uppercase tracking-wider text-accent-text hover:underline"
              >
                Series: {series.name}
              </Link>
            )}
            {category && (
              <Link
                to={termPath('category', category, 'article')}
                className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-link"
              >
                {category.name}
              </Link>
            )}
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-ink">
            {article.title}
          </h1>

          {/* Meta line */}
          <div className="mt-6 flex items-center justify-between gap-3 border-y border-line py-3.5 sm:py-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted">
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon size={14} />
                <span>{readTime} min read</span>
              </span>
            </div>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink hover:border-ink/40 active:scale-95 shadow-2xs transition cursor-pointer"
              aria-label="Share this article"
            >
              <ShareIcon size={15} />
              <span>{copied ? 'Copied URL!' : 'Share'}</span>
            </button>
          </div>

          {/* Featured Image */}
          {article.image && (
            <figure className="my-8 overflow-hidden rounded-2xl shadow-sm">
              <Img
                image={article.image}
                alt={article.title}
                wrapperClassName="aspect-[16/10] w-full"
                eager
              />
              {article.image.caption && (
                <figcaption className="mt-2 text-center text-xs text-muted">
                  {article.image.caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Body */}
          <div className="mt-8">
            <RichContent html={article.html} />
          </div>

          {/* Topics & Tags */}
          {topics.length > 0 && (
            <div className="mt-12 border-t border-line pt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {topics.map((top) => (
                  <Link
                    key={top.id}
                    to={termPath('topic', top, 'article')}
                    className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink hover:border-primary hover:text-link"
                  >
                    #{top.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Content */}
        {related && related.items.length > 0 && (
          <section className="mt-20 border-t border-line bg-surface-2/30 py-16">
            <div className="container-page">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-text mb-1">
                  Keep Reading
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                  Related {related.basis === 'latest' ? 'Articles' : `Articles in ${related.term || related.basis}`}
                </h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.items.map((item) => (
                  <ArticleCard key={item.id} article={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
