import { Link } from 'react-router-dom';
import type { ContentItem } from '@/api/types';
import { dateParts } from '@/lib/format';
import { CalendarIcon, ArrowRightIcon, MapPinIcon } from '@/components/ui/Icons';
import { Img } from '@/components/ui/Img';

interface EventCardProps {
  item: ContentItem;
}

export function EventCard({ item }: EventCardProps) {
  const eventHref = `/events/${item.slug}`;
  const customUrl = typeof item.meta?.registrationUrl === 'string' ? item.meta.registrationUrl : null;
  const isExternal = Boolean(customUrl && (customUrl.startsWith('http://') || customUrl.startsWith('https://')));
  const { day, month } = dateParts(item.eventDate || item.date);
  const venue = typeof item.meta?.venue === 'string' ? item.meta.venue : null;
  const badge = typeof item.meta?.badge === 'string' ? item.meta.badge : 'Conference / Event';
  const cost = typeof item.meta?.cost === 'string' ? item.meta.cost : null;
  const isExpired = new Date(item.eventDate || item.date).getTime() < Date.now() - 86400000;

  return (
    <article className="group flex flex-col sm:flex-row items-stretch gap-5 sm:gap-6 rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-ink/20 hover:shadow-md">
      {/* Flyer / Book Image (Portrait 3:4 Aspect Ratio) */}
      <Link
        to={eventHref}
        className="relative block w-full sm:w-36 md:w-44 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden border border-line/80 bg-slate-950 shadow-sm group-hover:shadow-md transition-all group-hover:scale-[1.01]"
      >
        <Img
          image={item.image}
          alt={item.title}
          wrapperClassName="h-full w-full"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Date Overlay Tag on Flyer */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-xs text-white text-center shadow-md border border-white/10">
          <span className="block text-sm font-extrabold leading-none text-white">{day}</span>
          <span className="block text-[9px] uppercase tracking-wider font-bold text-amber-400 mt-0.5">{month}</span>
        </div>

        {/* Expired Tag if event has concluded */}
        {isExpired && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[10px] font-bold uppercase tracking-wider shadow">
            Concluded
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-accent-text mb-2">
            <span className="inline-flex items-center gap-1 text-[11px]">
              <CalendarIcon size={12} />
              <span>{badge}</span>
            </span>
            {venue && (
              <span className="inline-flex items-center gap-1 text-muted text-[11px] truncate max-w-[220px]">
                <MapPinIcon size={12} className="shrink-0" />
                <span className="truncate">{venue}</span>
              </span>
            )}
            {cost && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/10 text-accent-text border border-accent/20">
                {cost}
              </span>
            )}
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug text-ink">
            <Link to={eventHref} className="hover:text-accent-text transition-colors">
              {item.title}
            </Link>
          </h3>

          {item.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-body leading-relaxed">
              {item.excerpt}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-line/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={eventHref}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-ink bg-accent/15 hover:bg-accent hover:text-accent-ink px-4 py-2 rounded-full transition-colors"
            >
              <span>Event Details</span>
              <ArrowRightIcon size={12} />
            </Link>
            {cost && (
              <span className="text-xs font-bold text-ink">
                {cost}
              </span>
            )}
          </div>

          {/* Show Register External ONLY if event is NOT expired */}
          {!isExpired && customUrl && isExternal && (
            <a
              href={customUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent-text hover:underline transition"
            >
              <span>Register Now</span>
              <ArrowRightIcon size={11} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
