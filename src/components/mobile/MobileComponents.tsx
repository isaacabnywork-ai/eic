import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ContentItem, Person } from '@/api/types';
import { PlayIcon, ChevronRightIcon, BookmarkIcon } from '@/components/ui/Icons';
import { Img } from '@/components/ui/Img';
import { itemPath, authorPath } from '@/lib/routes';
import { useBookmarks } from '@/lib/bookmarks';

/** Reusable Full-Bleed Hero Banner matching Canon+ style in screenshots 1, 3, 4 */
export function MobileHeroBanner({
  items,
  type = 'video',
  actionLabel = 'Watch Now',
}: {
  items: ContentItem[];
  type?: 'video' | 'sermon' | 'article' | 'series';
  actionLabel?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-cycle through hero items every 6s
  useEffect(() => {
    if (!items || items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(items.length, 5));
    }, 6000);
    return () => clearInterval(timer);
  }, [items]);

  if (!items || items.length === 0) return null;
  const current = items[activeIndex] || items[0];
  const href = itemPath(current.type === 'sermon' ? 'sermon' : type === 'sermon' ? 'sermon' : current.type, current.slug);

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] overflow-hidden bg-black select-none">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Img
          image={current.image}
          alt={current.title}
          className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
          wrapperClassName="h-full w-full"
          eager
        />
        {/* Cinematic gradient fade at bottom & top */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-[#070A0F]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="absolute bottom-6 inset-x-0 px-5 flex flex-col justify-end text-white">
        {/* Eyebrow / Tag */}
        {current.terms.series?.[0] && (
          <span className="text-xs font-semibold uppercase tracking-wider text-[#F0F6FB] mb-1 drop-shadow">
            {current.terms.series[0].name}
          </span>
        )}

        {/* Title */}
        <h2
          className="font-serif text-2xl sm:text-3xl font-black leading-tight drop-shadow-md line-clamp-2 text-white !text-white"
          style={{ color: '#FFFFFF' }}
        >
          {current.title}
        </h2>

        {/* Description or Quote */}
        {current.excerpt && (
          <p
            className="mt-2 text-xs sm:text-sm text-white/90 line-clamp-2 drop-shadow leading-relaxed max-w-sm !text-white/90"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            {current.excerpt}
          </p>
        )}

        {/* CTA Button */}
        <div className="mt-3.5 flex items-center justify-between">
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white hover:text-[#F0F6FB] group transition-colors"
          >
            <span>{actionLabel}</span>
            <ChevronRightIcon size={16} className="text-[#F0F6FB] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Dash indicators */}
          {items.length > 1 && (
            <div className="flex items-center gap-1.5">
              {items.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-0.5 transition-all duration-300 rounded-full ${
                    idx === activeIndex
                      ? 'w-6 bg-white'
                      : 'w-3 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Section Header matching "Watch This Week", "Just Added", "New Audio" */
export function MobileSectionHeader({
  title,
  seeAllLink,
  count,
}: {
  title: string;
  seeAllLink?: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between px-4 pt-6 pb-2.5">
      <h3 className="font-serif text-lg font-bold tracking-tight text-[#182541] dark:text-white flex items-center gap-2">
        <span>{title}</span>
        {count !== undefined && (
          <span className="text-xs text-slate-400 dark:text-white/40 font-normal">({count})</span>
        )}
      </h3>
      {seeAllLink && (
        <Link
          to={seeAllLink}
          className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-[#182541] dark:text-white/50 dark:hover:text-white transition-colors"
        >
          See All
        </Link>
      )}
    </div>
  );
}

/** 16:9 Horizontal Video Card */
export function MobileVideoCard({
  item,
  variant = 'video',
}: {
  item: ContentItem;
  variant?: 'video' | 'sermon';
}) {
  const href = itemPath(variant, item.slug);
  const speaker = item.speaker || item.author?.name;
  const { isSaved, toggle } = useBookmarks();
  const bookmarked = isSaved(item.id || item.slug);

  return (
    <div className="group relative w-56 shrink-0 flex flex-col snap-start select-none">
      {/* 16:9 Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5 border border-[#D0E1F0] dark:border-white/10">
        <Link to={href} tabIndex={-1} aria-hidden="true">
          <Img
            image={item.image}
            alt={item.title}
            thumb
            wrapperClassName="h-full w-full"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
        
        {/* Play Icon Badge */}
        <div className="pointer-events-none absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs">
          <PlayIcon size={12} className="ml-0.5" />
        </div>

        {/* Quick Bookmark Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(item);
          }}
          aria-label={bookmarked ? 'Remove from library' : 'Save to library'}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-[#F0F6FB] active:scale-90 transition backdrop-blur-xs"
        >
          <BookmarkIcon size={14} className={bookmarked ? 'fill-[#F0F6FB] text-[#F0F6FB]' : ''} />
        </button>
      </div>

      {/* Info below */}
      <div className="mt-2 flex flex-col">
        <h4 className="font-medium text-xs sm:text-sm text-[#182541] dark:text-white line-clamp-2 leading-snug group-hover:text-primary dark:group-hover:text-[#F0F6FB] transition-colors">
          <Link to={href} className="text-[#182541] dark:text-white hover:text-primary dark:hover:text-[#F0F6FB]">
            {item.title}
          </Link>
        </h4>
        {speaker && (
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-white/60 line-clamp-1">{speaker}</p>
        )}
      </div>
    </div>
  );
}

/** Circular Speaker / Author Avatar matching Screenshot 5 & Screenshot 1 */
export function MobileSpeakerAvatar({ person }: { person: Person }) {
  const href = authorPath(person.id);

  return (
    <Link
      to={href}
      className="group flex flex-col items-center shrink-0 w-20 sm:w-24 text-center snap-start select-none"
    >
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 shadow-xs dark:shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:border-primary dark:group-hover:border-[#F0F6FB]">
        {person.avatar ? (
          <img
            src={person.avatar}
            alt={person.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60 font-serif text-xl font-bold">
            {person.name.charAt(0)}
          </div>
        )}
      </div>
      <span className="mt-2 text-xs font-medium text-[#182541] dark:text-white/90 line-clamp-1 group-hover:text-primary dark:group-hover:text-[#F0F6FB] transition-colors">
        {person.name}
      </span>
    </Link>
  );
}

/** 2:3 Vertical Poster Card matching "Start a Show" / Series in Screenshot 5 */
export function MobilePosterCard({
  item,
}: {
  item: {
    id: string | number;
    title: string;
    slug: string;
    image?: string;
    count?: number;
    description?: string;
    to: string;
  };
}) {
  return (
    <Link
      to={item.to}
      className="group relative aspect-[2/3] w-36 sm:w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg snap-start select-none transition-transform duration-300 hover:scale-[1.02]"
    >
      {/* Background Poster Image */}
      {item.image ? (
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#18233C] to-[#0A0E17] p-4 text-center font-serif text-sm font-bold text-white">
          {item.title}
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Poster text content */}
      <div className="absolute bottom-0 inset-x-0 p-3 text-white">
        <h4
          className="font-serif text-sm font-bold leading-tight line-clamp-2 drop-shadow-md text-white !text-white group-hover:text-[#F0F6FB] transition-colors"
          style={{ color: '#FFFFFF' }}
        >
          {item.title}
        </h4>
        {item.count !== undefined && item.count > 0 && (
          <p
            className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 !text-white/70"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {item.count} Resources
          </p>
        )}
      </div>
    </Link>
  );
}
