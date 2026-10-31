import { useParams, Link } from 'react-router-dom';
import { useContentItem, useRelated } from '@/hooks/queries';
import { formatDate } from '@/lib/format';
import { readingTimeMinutes } from '@/lib/html';
import { termPath, authorPath } from '@/lib/routes';
import { SeoHead } from '@/components/seo/SeoHead';
import { RichContent } from '@/components/content/RichContent';
import { Img } from '@/components/ui/Img';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { AuthorCard } from '@/components/cards/AuthorCard';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/States';
import { ClockIcon, ShareIcon, UserIcon } from '@/components/ui/Icons';
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
      <div className="container-page max-w-3xl pt-4 pb-12 sm:py-16 space-y-4 sm:space-y-6">
        <Skeleton className="aspect-[16/9] sm:aspect-[16/10] w-full rounded-xl sm:rounded-2xl" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 sm:h-12 w-full" />
        <div className="hidden sm:flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
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

      <article className="pt-4 pb-12 sm:py-16">
        <div className="container-page max-w-3xl">
          {/* Featured Image */}
          {article.image && (
            <figure className="mb-4 sm:mb-8 overflow-hidden rounded-xl sm:rounded-2xl shadow-sm">
              <Img
                image={article.image}
                alt={article.title}
                wrapperClassName="aspect-[16/9] sm:aspect-[16/10] w-full"
                eager
              />
              {article.image.caption && (
                <figcaption className="mt-1.5 sm:mt-2 text-center text-xs text-muted">
                  {article.image.caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Mobile Meta line (Badges + Date + Share in a compact row above title) */}
          <div className="sm:hidden flex items-center justify-between gap-2 mb-2.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted min-w-0">
              {series && (
                <Link
                  to={termPath('series', series, 'article')}
                  className="text-[11px] font-semibold uppercase tracking-wider text-accent-text hover:underline truncate max-w-[140px]"
                >
                  {series.name}
                </Link>
              )}
              {series && category && <span className="text-muted/60">•</span>}
              {category && (
                <Link
                  to={termPath('category', category, 'article')}
                  className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-link"
                >
                  {category.name}
                </Link>
              )}
              <span className="text-[11px] text-muted">
                • {formatDate(article.date)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted hover:text-ink active:scale-95 shadow-2xs transition shrink-0 cursor-pointer"
              aria-label="Share this article"
            >
              <ShareIcon size={12} />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>

          {/* Desktop Taxonomy badges */}
          {(series || category) && (
            <div className="hidden sm:flex flex-wrap items-center gap-2 mb-4">
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
          )}

          {/* Title */}
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold leading-snug sm:leading-tight text-ink">
            {article.title}
          </h1>

          {/* Desktop Meta line (hidden on mobile so on mobile content comes directly after title) */}
          <div className="hidden sm:flex mt-6 flex-wrap items-center justify-between gap-4 border-y border-line py-3.5 sm:py-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted">
              {article.author && (
                <>
                  <Link
                    to={authorPath(article.author.id)}
                    className="flex items-center gap-2 font-medium text-ink hover:text-link transition-colors"
                  >
                    {article.author.avatar ? (
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="h-7 w-7 rounded-full object-cover border border-line"
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-link border border-line">
                        <UserIcon size={14} />
                      </span>
                    )}
                    <span>{article.author.name}</span>
                  </Link>
                  <span>•</span>
                </>
              )}
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

          {/* Article Body: On mobile, comes directly after Title! */}
          <div className="mt-4 sm:mt-8">
            <RichContent html={article.html} />
          </div>

          {/* Mobile Bottom Meta & Share Bar */}
          <div className="sm:hidden mt-8 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <ClockIcon size={13} />
              <span>{readTime} min read</span>
            </span>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted hover:text-ink active:scale-95 shadow-2xs transition cursor-pointer"
            >
              <ShareIcon size={13} />
              <span>{copied ? 'Copied Link!' : 'Share Article'}</span>
            </button>
          </div>

          {/* Author of the Article In The Last */}
          {article.author && (
            <div className="mt-10 sm:mt-12 border-t border-line pt-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-link text-xs">
                  <UserIcon size={12} />
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                  Written by / About the Author
                </h4>
              </div>
              <AuthorCard person={article.author} />
            </div>
          )}

          {/* Topics & Tags */}
          {topics.length > 0 && (
            <div className="mt-10 border-t border-line pt-6">
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
