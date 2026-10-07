import { Link } from 'react-router-dom';
import type { ContentItem } from '@/api/types';
import { itemPath } from '@/lib/routes';
import { Img } from '@/components/ui/Img';
import { StarIcon } from '@/components/ui/Icons';

interface BookCardProps {
  item: ContentItem;
}

export function BookCard({ item }: BookCardProps) {
  const href = itemPath('bookReview', item.slug);
  const displayTitle = item.bookTitle || item.title;

  return (
    <article className="group flex flex-col rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-ink/20">
      {/* Book Cover */}
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[180px] overflow-hidden rounded-md border border-line/60 shadow-sm transition-shadow group-hover:shadow-md">
        <Link to={href} tabIndex={-1} aria-hidden="true">
          <Img
            image={item.image}
            alt={displayTitle}
            wrapperClassName="h-full w-full"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      </div>

      {/* Info */}
      <div className="mt-5 flex flex-1 flex-col text-center">
        {item.rating && (
          <div className="mb-2 flex items-center justify-center gap-1 text-accent">
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon
                key={i}
                size={14}
                className={i < Math.floor(item.rating!) ? 'fill-accent text-accent' : 'text-line'}
              />
            ))}
            <span className="ml-1 text-xs font-semibold text-muted">
              {item.rating.toFixed(1)}
            </span>
          </div>
        )}

        <h3 className="font-serif text-base sm:text-lg font-bold leading-snug line-clamp-2 text-ink">
          <Link to={href} className="hover:text-accent-text transition-colors">
            {displayTitle}
          </Link>
        </h3>

        {item.bookAuthor && (
          <p className="mt-1 text-xs font-medium text-muted">
            by {item.bookAuthor}
          </p>
        )}

        <div className="mt-auto pt-4 text-center">
          <Link
            to={href}
            className="text-xs font-semibold text-ink hover:text-accent-text transition-colors"
          >
            Read Review →
          </Link>
        </div>
      </div>
    </article>
  );
}
