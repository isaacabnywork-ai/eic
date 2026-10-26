import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { ContentItem, Person, ImageInfo } from '@/api/types';
import { PlayIcon, ChevronRightIcon, BookmarkIcon } from '@/components/ui/Icons';
import { Img } from '@/components/ui/Img';
import { itemPath, authorPath } from '@/lib/routes';
import { useBookmarks } from '@/lib/bookmarks';

export interface MobileHeroSlide {
  id: string | number;
  category: string;
  badge?: string;
  title: string;
  excerpt?: string;
  image?: ImageInfo;
  to: string;
  actionLabel?: string;
  categoryDot?: string;
}

/** Reusable Full-Bleed Hero Banner matching Canon+ style in screenshots 1, 3, 4 */
export function MobileHeroBanner({
  items,
  slides,
  type = 'video',
  actionLabel = 'Watch Now',
}: {
  items?: ContentItem[];
  slides?: MobileHeroSlide[];
  type?: 'video' | 'sermon' | 'article' | 'series';
  actionLabel?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const bannerSlides: MobileHeroSlide[] = useMemo(() => {
    if (slides && slides.length > 0) return slides;
    if (!items || items.length === 0) return [];

    return items.map((it) => {
      let defaultCat = 'Featured';
      let defaultAction = actionLabel;
      if (it.type === 'sermon') {
        defaultCat = 'Expository Sermon';
        defaultAction = 'Watch Sermon';
      } else if (it.type === 'video') {
        defaultCat = 'Video & Podcast';
        defaultAction = 'Watch Now';
      } else if (it.type === 'article') {
        defaultCat = 'Featured Article';
        defaultAction = 'Read Article';
      } else if (it.type === 'bookReview') {
        defaultCat = 'Book Review';
        defaultAction = 'Read Review';
      } else if (it.type === 'event') {
        defaultCat = 'Upcoming Event';
        defaultAction = 'View Event';
      }

      return {
        id: it.id,
        category: it.terms.series?.[0]?.name || defaultCat,
        badge: it.author?.name || undefined,
        title: it.title,
        excerpt: it.excerpt,
        image: it.image,
        to: itemPath(it.type === 'sermon' ? 'sermon' : type === 'sermon' ? 'sermon' : it.type, it.slug),
        actionLabel: defaultAction,
      };
    });
  }, [slides, items, type, actionLabel]);

  // Auto-cycle through hero items every 5.5s
  useEffect(() => {
    if (bannerSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(bannerSlides.length, 5));
    }, 5500);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  if (bannerSlides.length === 0) return null;
  const current = bannerSlides[activeIndex] || bannerSlides[0];

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
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-[#070A0F]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="absolute bottom-6 inset-x-0 px-5 flex flex-col justify-end text-white z-10">
        {/* Eyebrow / Tag */}
        <div className="flex items-center gap-2 mb-2">
          {current.category && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white border border-white/25 shadow-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${current.categoryDot || 'bg-amber-400'} animate-pulse`} />
              <span>{current.category}</span>
            </span>
          )}
          {current.badge && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80 drop-shadow truncate max-w-[180px]">
              {current.badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className="font-serif text-2xl sm:text-3xl font-black leading-tight drop-shadow-md line-clamp-2 text-white !text-white"
          style={{ color: '#FFFFFF' }}
        >
          <Link to={current.to} className="hover:text-amber-200 transition-colors">
            {current.title}
          </Link>
        </h2>

        {/* Description or Excerpt */}
        {current.excerpt && (
          <p
            className="mt-2 text-xs sm:text-sm text-white/90 line-clamp-2 drop-shadow leading-relaxed max-w-sm !text-white/90"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
          >
            {current.excerpt}
          </p>
        )}

        {/* CTA Button & Indicators */}
        <div className="mt-3.5 flex items-center justify-between">
          <Link
            to={current.to}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-xs font-bold text-white transition-all shadow-xs group"
          >
            <span>{current.actionLabel || 'Explore'}</span>
            <ChevronRightIcon size={14} className="text-white group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Dash indicators */}
          {bannerSlides.length > 1 && (
            <div className="flex items-center gap-1.5">
              {bannerSlides.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1 transition-all duration-300 rounded-full cursor-pointer ${
                    idx === activeIndex
                      ? 'w-6 bg-white shadow-xs'
                      : 'w-2 bg-white/35 hover:bg-white/60'
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
