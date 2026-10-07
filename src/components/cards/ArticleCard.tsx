import { Link } from 'react-router-dom';
import type { ContentItem } from '@/api/types';
import { formatDateShort } from '@/lib/format';
import { itemPath, termPath } from '@/lib/routes';
import { readingTimeMinutes } from '@/lib/html';
import { Img } from '@/components/ui/Img';
import { ClockIcon, ArrowRightIcon } from '@/components/ui/Icons';

interface ArticleCardProps {
  article: ContentItem;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const category = article.terms.category?.[0];
  const series = article.terms.series?.[0];
  const readTime = readingTimeMinutes(article.html || article.excerpt);
  const href = itemPath('article', article.slug);

  if (featured) {
    return (
      <article className="group relative grid gap-8 lg:grid-cols-12 rounded-xl border border-line bg-surface p-6 sm:p-8 md:p-10 shadow-xs transition-all duration-300 hover:border-ink/20 hover:shadow-md">
        <div className="lg:col-span-7 overflow-hidden rounded-lg">
          <Link to={href} tabIndex={-1} aria-hidden="true">
            <Img
              image={article.image}
              alt={article.title}
              wrapperClassName="aspect-[16/10] w-full rounded-lg"
              className="transition-transform duration-500 group-hover:scale-[1.02]"
              eager
            />
          </Link>
        </div>
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded bg-accent/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-accent-text">
              Featured Article
            </span>
            {category && (
              <Link
                to={termPath('category', category, 'article')}
                className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink transition-colors"
              >
                {category.name}
              </Link>
            )}
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-bold leading-tight text-ink">
            <Link to={href} className="hover:text-accent-text transition-colors">
              {article.title}
            </Link>
          </h3>

          {article.excerpt && (
            <p className="mt-4 line-clamp-3 text-body text-base sm:text-lg leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              to={href}
              className="inline-flex items-center gap-2 rounded-[6px] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:brightness-105 transition-all shadow-xs"
            >
              <span>Read Article</span>
              <ArrowRightIcon size={16} />
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted">
              {article.author && <span className="font-medium text-ink">{article.author.name}</span>}
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon size={13} />
                {readTime} min read
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-ink/20">
      <Link to={href} tabIndex={-1} aria-hidden="true" className="overflow-hidden">
        <Img
          image={article.image}
          alt={article.title}
          thumb
          wrapperClassName="aspect-[16/10] w-full"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          {category && (
            <Link
              to={termPath('category', category, 'article')}
              className="rounded bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink/80 hover:text-ink transition-colors"
            >
              {category.name}
            </Link>
          )}
          {series && (
            <Link
              to={termPath('series', series, 'article')}
              className="text-xs font-medium text-accent-text hover:underline transition-colors"
            >
              {series.name}
            </Link>
          )}
        </div>

        <h3 className="font-serif text-xl font-bold leading-snug text-ink">
          <Link to={href} className="hover:text-accent-text transition-colors">
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="mt-2.5 line-clamp-2 text-sm text-body leading-relaxed">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted border-t border-line/60">
          <span className="font-medium text-ink/80">{article.author?.name || 'EIC Contributor'}</span>
          <div className="flex items-center gap-2">
            <time dateTime={article.date}>{formatDateShort(article.date)}</time>
            <span>•</span>
            <span>{readTime}m</span>
          </div>
        </div>
      </div>
    </article>
  );
}
