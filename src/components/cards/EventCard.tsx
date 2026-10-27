import { Link } from 'react-router-dom';
import type { ContentItem } from '@/api/types';
import { dateParts } from '@/lib/format';
import { itemPath } from '@/lib/routes';
import { CalendarIcon, ArrowRightIcon, MapPinIcon } from '@/components/ui/Icons';

interface EventCardProps {
  item: ContentItem;
}

export function EventCard({ item }: EventCardProps) {
  const customUrl = typeof item.meta?.registrationUrl === 'string' ? item.meta.registrationUrl : null;
  const isExternal = Boolean(customUrl && (customUrl.startsWith('http://') || customUrl.startsWith('https://')));
  const href = customUrl || itemPath('event', item.slug);
  const { day, month, year } = dateParts(item.eventDate || item.date);
  const venue = typeof item.meta?.venue === 'string' ? item.meta.venue : null;
  const badge = typeof item.meta?.badge === 'string' ? item.meta.badge : 'Conference / Event';

  const CardLink = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      );
    }
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  };

  return (
    <article className="group flex flex-col sm:flex-row items-start gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs transition-all duration-300 hover:border-ink/20 hover:shadow-md">
      {/* Date badge / Poster thumb */}
      <div className="flex sm:flex-col items-center justify-center gap-1.5 sm:gap-0 h-16 sm:h-24 w-auto sm:w-24 shrink-0 rounded-xl border border-line/80 bg-surface-2 text-ink font-bold px-4 sm:px-0 text-center shadow-xs">
        <span className="text-2xl sm:text-3xl font-extrabold leading-none text-ink">{day}</span>
        <span className="text-xs uppercase tracking-wider text-accent-text font-bold mt-0.5">{month}</span>
        <span className="text-[11px] text-muted hidden sm:block font-medium">{year}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-accent-text mb-2">
            <span className="inline-flex items-center gap-1">
              <CalendarIcon size={13} />
              <span>{badge}</span>
            </span>
            {venue && (
              <span className="inline-flex items-center gap-1 text-muted lowercase first-letter:uppercase">
                <MapPinIcon size={12} />
                <span className="truncate max-w-[200px]">{venue}</span>
              </span>
            )}
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug text-ink">
            <CardLink className="hover:text-accent-text transition-colors">
              {item.title}
            </CardLink>
          </h3>

          {item.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-body leading-relaxed">
              {item.excerpt}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-line/50 flex items-center justify-between">
          <CardLink className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-ink bg-accent/15 hover:bg-accent hover:text-accent-ink px-3 py-1.5 rounded-full transition-colors">
            <span>Register & Details</span>
            <ArrowRightIcon size={12} />
          </CardLink>
        </div>
      </div>
    </article>
  );
}
