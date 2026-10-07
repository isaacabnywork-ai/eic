import { Link } from 'react-router-dom';
import type { ContentItem } from '@/api/types';
import { dateParts } from '@/lib/format';
import { itemPath } from '@/lib/routes';
import { CalendarIcon, ArrowRightIcon } from '@/components/ui/Icons';

interface EventCardProps {
  item: ContentItem;
}

export function EventCard({ item }: EventCardProps) {
  const href = itemPath('article', item.slug);
  const { day, month, year } = dateParts(item.eventDate || item.date);

  return (
    <article className="group flex flex-col sm:flex-row items-start gap-5 rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-xs transition-all duration-300 hover:border-ink/20 hover:shadow-md">
      {/* Date badge */}
      <div className="flex sm:flex-col items-center justify-center gap-1.5 sm:gap-0 h-14 sm:h-20 w-auto sm:w-20 shrink-0 rounded-lg border border-line/80 bg-surface-2 text-ink font-bold px-4 sm:px-0">
        <span className="text-xl sm:text-2xl leading-none text-ink">{day}</span>
        <span className="text-xs uppercase tracking-wider text-accent-text">{month}</span>
        <span className="text-[10px] text-muted hidden sm:block">{year}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-text mb-1.5">
          <CalendarIcon size={13} />
          <span>Conference / Event</span>
        </div>

        <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug text-ink">
          <Link to={href} className="hover:text-accent-text transition-colors">
            {item.title}
          </Link>
        </h3>

        {item.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-body leading-relaxed">
            {item.excerpt}
          </p>
        )}

        <div className="mt-4">
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-accent-text transition-colors"
          >
            <span>Event details</span>
            <ArrowRightIcon size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
