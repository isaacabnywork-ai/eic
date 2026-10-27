import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { contentTypes, homeConfig, type ContentKey } from '@/config/content';
import { site } from '@/config/site';
import {
  useContentList,
  useFeatured,
} from '@/hooks/queries';
import type { ContentItem, ImageInfo } from '@/api/types';
import { SeoHead } from '@/components/seo/SeoHead';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { Img } from '@/components/ui/Img';
import { MobileDiscoverView } from '@/components/mobile/MobileDiscoverView';
import {
  ArrowRightIcon,
  CalendarIcon,
  MapPinIcon,
  PlayIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/components/ui/Icons';
import { itemPath } from '@/lib/routes';
import { formatDateShort } from '@/lib/format';
import { readingTimeMinutes } from '@/lib/html';
import { usePublishedEvents } from '@/lib/publicEvents';

interface HeroNotificationSlide {
  id: string;
  category: string;
  categoryDot: string;
  badge: string;
  title: string;
  excerpt?: string;
  date: string;
  metaExtra?: string;
  image?: ContentItem['image'];
  url: string;
}

export function getArticleCategory(item: ContentItem): string {
  const text = `${item.title} ${item.excerpt || ''}`.toLowerCase();
  if (text.includes('marriage') || text.includes('husband') || text.includes('wife') || text.includes('premarital')) {
    return 'Marriage & Family';
  }
  if (text.includes('father') || text.includes('parent') || text.includes('children') || text.includes('mother')) {
    return 'Family & Parenting';
  }
  if (
    text.includes('pastor') ||
    text.includes('shepherd') ||
    text.includes('elder') ||
    text.includes('ministry') ||
    text.includes('preach') ||
    text.includes('accountability') ||
    text.includes('calling')
  ) {
    return 'Pastoral Ministry';
  }
  if (
    text.includes('psalm') ||
    text.includes('scripture') ||
    text.includes('bible') ||
    text.includes('testament') ||
    text.includes('exegesis')
  ) {
    return 'Biblical Studies';
  }
  if (
    text.includes('joy') ||
    text.includes('suffer') ||
    text.includes('death') ||
    text.includes('hades') ||
    text.includes('hope') ||
    text.includes('living') ||
    text.includes('walk')
  ) {
    return 'Christian Living';
  }
  if (
    text.includes('salvation') ||
    text.includes('gospel') ||
    text.includes('grace') ||
    text.includes('atonement') ||
    text.includes('resurrection') ||
    text.includes('calvinism') ||
    text.includes('creed') ||
    text.includes('theology')
  ) {
    return 'Theology & Doctrine';
  }
  if (
    text.includes('church') ||
    text.includes('mission') ||
    text.includes('fellowship') ||
    text.includes('planting')
  ) {
    return 'Church & Mission';
  }
  if (item.terms.tag && item.terms.tag.length > 0) {
    const tagName = item.terms.tag[0].name;
    if (tagName && !['aipc', 'post', 'article'].includes(tagName.toLowerCase())) {
      return tagName;
    }
  }
  if (item.terms.topic && item.terms.topic.length > 0) {
    const topicName = item.terms.topic[0].name;
    if (topicName && topicName.toLowerCase() !== 'aipc') {
      return topicName;
    }
  }
  return 'Theology & Doctrine';
}

function HeroAutoSlider({ slides }: { slides: HeroNotificationSlide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  if (!slides.length) return null;

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className="group relative h-[440px] sm:h-[480px] lg:h-[510px] xl:h-[530px] w-full overflow-hidden rounded-3xl bg-black shadow-md border border-line/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides with Crossfade Transition */}
      {slides.map((slide, idx) => {
        const isActive = idx === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 h-full w-full">
              <Img
                image={slide.image}
                alt={slide.title}
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                eager={idx === 0}
              />
            </div>

            {/* Gradient Overlays for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

            {/* Slide Content (Bottom Aligned) */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10 z-10">
              <div className="max-w-2xl">
                {/* Category Pill with Colored Indicator Dot */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/95 dark:bg-[#111A2E]/95 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-ink shadow-sm border border-white/20">
                  <span className={`h-2 w-2 rounded-full ${slide.categoryDot} animate-pulse`} />
                  <span className="tracking-wide">{slide.category}</span>
                </div>

                {/* Big Headline */}
                <h2 className="mt-3.5 font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.18] text-white transition-colors hover:text-[#F3E6BE]">
                  <Link to={slide.url}>{slide.title}</Link>
                </h2>

                {/* Excerpt */}
                {slide.excerpt && (
                  <p className="mt-2.5 text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed">
                    {slide.excerpt}
                  </p>
                )}

                {/* Metadata Line */}
                <div className="mt-3.5 flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-white/70">
                  <time dateTime={slide.date}>{formatDateShort(slide.date)}</time>
                  {slide.metaExtra && (
                    <>
                      <span>•</span>
                      <span className="text-white/90 font-medium">{slide.metaExtra}</span>
                    </>
                  )}
                  <span>•</span>
                  <Link
                    to={slide.url}
                    className="font-semibold text-[#D9A62E] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Explore</span>
                    <ArrowRightIcon size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next Arrows (Appear on hover) */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/45 hover:bg-black/85 text-white backdrop-blur-md border border-white/25 transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
      >
        <ChevronLeftIcon size={20} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/45 hover:bg-black/85 text-white backdrop-blur-md border border-white/25 transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
      >
        <ChevronRightIcon size={20} />
      </button>

      {/* Pagination Dot Indicators (Bottom Right) */}
      <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              i === currentSlide ? 'w-8 bg-white shadow-sm' : 'w-2 bg-white/45 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ==================================================================== */
/* BOOK REVIEWS 3D COVERFLOW AUTO-SLIDER                                */
/* ==================================================================== */

interface BookSlideItem {
  id: string | number;
  title: string;
  bookTitle?: string;
  bookAuthor?: string;
  slug: string;
  rating?: number;
  tag?: string;
  image?: ImageInfo;
}

const BOOK_CARD_THEMES = [
  {
    bg: '#9E2A2B', // Terracotta Crimson Red (Center active color in reference image)
    textColor: 'text-white',
    authorColor: 'text-white/80',
    badgeBg: 'bg-black/25 hover:bg-black/40',
    badgeText: 'text-white',
  },
  {
    bg: '#D4C157', // Buttercup Mustard Yellow (Right color in reference image)
    textColor: 'text-slate-900',
    authorColor: 'text-slate-800/80',
    badgeBg: 'bg-black/15 hover:bg-black/25',
    badgeText: 'text-slate-900',
  },
  {
    bg: '#C88A7A', // Dusty Coral / Salmon Pink (Far-right color in reference image)
    textColor: 'text-white',
    authorColor: 'text-white/80',
    badgeBg: 'bg-black/25 hover:bg-black/40',
    badgeText: 'text-white',
  },
  {
    bg: '#7E8F83', // Sage / Olive Green (Left color in reference image)
    textColor: 'text-white',
    authorColor: 'text-white/80',
    badgeBg: 'bg-black/25 hover:bg-black/40',
    badgeText: 'text-white',
  },
  {
    bg: '#7E8F9F', // Slate Blue (Far-left color in reference image)
    textColor: 'text-white',
    authorColor: 'text-white/80',
    badgeBg: 'bg-black/25 hover:bg-black/40',
    badgeText: 'text-white',
  },
  {
    bg: '#253549', // Midnight Navy
    textColor: 'text-white',
    authorColor: 'text-white/80',
    badgeBg: 'bg-white/20 hover:bg-white/30',
    badgeText: 'text-white',
  },
  {
    bg: '#A26742', // Warm Cinnamon
    textColor: 'text-white',
    authorColor: 'text-white/80',
    badgeBg: 'bg-black/25 hover:bg-black/40',
    badgeText: 'text-white',
  },
  {
    bg: '#5E6D59', // Herb Green
    textColor: 'text-white',
    authorColor: 'text-white/80',
    badgeBg: 'bg-black/25 hover:bg-black/40',
    badgeText: 'text-white',
  },
];

const FALLBACK_BOOKS: BookSlideItem[] = [
  {
    id: 'fb-1',
    title: 'How to Read the Bible for All Its Worth',
    bookTitle: 'How to Read the Bible',
    bookAuthor: 'David Platt',
    slug: 'how-to-read-the-bible',
    rating: 5,
    tag: 'Read Review',
    image: {
      src: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&h=900&q=80',
      alt: 'How to Read the Bible',
    },
  },
  {
    id: 'fb-2',
    title: 'Pray the World: A Scripture Guide for Global Engagement',
    bookTitle: 'Pray the World',
    bookAuthor: 'Steven Morales, David Platt',
    slug: 'pray-the-world',
    rating: 5,
    tag: 'Read Review',
    image: {
      src: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&h=900&q=80',
      alt: 'Pray the World',
    },
  },
  {
    id: 'fb-3',
    title: 'Faith Foundations: Building Your Life on Truth',
    bookTitle: 'Faith Foundations',
    bookAuthor: 'David Platt',
    slug: 'faith-foundations',
    rating: 5,
    tag: 'Read Review',
    image: {
      src: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&h=900&q=80',
      alt: 'Faith Foundations',
    },
  },
  {
    id: 'fb-4',
    title: 'Something Needs to Change: A Call to Make Your Life Count',
    bookTitle: 'Something Needs to Change',
    bookAuthor: 'David Platt',
    slug: 'something-needs-to-change',
    rating: 5,
    tag: 'Read Review',
    image: {
      src: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&h=900&q=80',
      alt: 'Something Needs to Change',
    },
  },
  {
    id: 'fb-5',
    title: 'Don’t Hold Back: Leaving Behind the Religion of Power, Politics, and Prosperity',
    bookTitle: 'Don’t Hold Back',
    bookAuthor: 'David Platt',
    slug: 'dont-hold-back',
    rating: 4.5,
    tag: 'Read Review',
    image: {
      src: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&h=900&q=80',
      alt: 'Don’t Hold Back',
    },
  },
  {
    id: 'fb-6',
    title: 'The Cross of Christ: The Heart of the Atonement',
    bookTitle: 'The Cross of Christ',
    bookAuthor: 'John Stott',
    slug: 'the-cross-of-christ',
    rating: 5,
    tag: 'Read Review',
    image: {
      src: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&h=900&q=80',
      alt: 'The Cross of Christ',
    },
  },
  {
    id: 'fb-7',
    title: 'The Pastor’s Heart: Shepherding with Grace and Humility',
    bookTitle: 'The Pastor’s Heart',
    bookAuthor: 'Alexander Strauch',
    slug: 'the-pastors-heart',
    rating: 5,
    tag: 'Read Review',
    image: {
      src: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=600&h=900&q=80',
      alt: 'The Pastor’s Heart',
    },
  },
  {
    id: 'fb-8',
    title: 'Expositional Preaching: How We Speak God’s Word Today',
    bookTitle: 'Expositional Preaching',
    bookAuthor: 'David R. Helm',
    slug: 'expositional-preaching',
    rating: 4.5,
    tag: 'Read Review',
    image: {
      src: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&h=900&q=80',
      alt: 'Expositional Preaching',
    },
  },
];

function BookReviewsCoverflowSlider({ books }: { books: BookSlideItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = books;
  const N = slides.length;

  useEffect(() => {
    if (N <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % N);
    }, 3800);
    return () => clearInterval(interval);
  }, [N, isPaused]);

  if (!N) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + N) % N);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % N);
  };

  return (
    <div
      className="relative w-full py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Edge gradient masks matching reference image */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32 lg:w-44 bg-gradient-to-r from-surface via-surface/85 to-transparent z-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-32 lg:w-44 bg-gradient-to-l from-surface via-surface/85 to-transparent z-40" />

      {/* Prev / Next Buttons */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous book"
        className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/95 dark:bg-[#182541]/95 text-ink shadow-xl backdrop-blur-md border border-line/70 hover:scale-110 active:scale-95 transition-all cursor-pointer"
      >
        <ChevronLeftIcon size={20} />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next book"
        className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/95 dark:bg-[#182541]/95 text-ink shadow-xl backdrop-blur-md border border-line/70 hover:scale-110 active:scale-95 transition-all cursor-pointer"
      >
        <ChevronRightIcon size={20} />
      </button>

      {/* 3D Coverflow Container */}
      <div className="relative h-[490px] sm:h-[510px] w-full overflow-hidden flex items-center justify-center">
        {slides.map((slide, idx) => {
          let diff = idx - currentIndex;
          if (diff < -Math.floor(N / 2)) diff += N;
          if (diff > Math.floor(N / 2)) diff -= N;

          const theme = BOOK_CARD_THEMES[idx % BOOK_CARD_THEMES.length];
          const isActive = diff === 0;

          // Position, scale, opacity based on diff
          let transformStyle = '';
          let leftStyle = '';
          let zIndex = 0;
          let opacity = 0;
          let pointerEvents: 'auto' | 'none' = 'none';

          if (diff === 0) {
            transformStyle = 'translate(-50%, -50%) scale(1.08) translateY(-10px)';
            leftStyle = '50%';
            zIndex = 30;
            opacity = 1;
            pointerEvents = 'auto';
          } else if (diff === 1) {
            transformStyle = 'translate(-50%, -50%) scale(0.92) translateY(0px)';
            leftStyle = 'calc(50% + 205px)';
            zIndex = 20;
            opacity = 0.9;
            pointerEvents = 'auto';
          } else if (diff === -1) {
            transformStyle = 'translate(-50%, -50%) scale(0.92) translateY(0px)';
            leftStyle = 'calc(50% - 205px)';
            zIndex = 20;
            opacity = 0.9;
            pointerEvents = 'auto';
          } else if (diff === 2) {
            transformStyle = 'translate(-50%, -50%) scale(0.80) translateY(8px)';
            leftStyle = 'calc(50% + 380px)';
            zIndex = 10;
            opacity = 0.55;
            pointerEvents = 'auto';
          } else if (diff === -2) {
            transformStyle = 'translate(-50%, -50%) scale(0.80) translateY(8px)';
            leftStyle = 'calc(50% - 380px)';
            zIndex = 10;
            opacity = 0.55;
            pointerEvents = 'auto';
          } else {
            transformStyle = 'translate(-50%, -50%) scale(0.68) translateY(16px)';
            leftStyle = `calc(50% + ${Math.sign(diff) * 540}px)`;
            zIndex = 0;
            opacity = 0;
            pointerEvents = 'none';
          }

          const card = (
            <div
              style={{
                backgroundColor: theme.bg,
                left: leftStyle,
                transform: transformStyle,
                zIndex,
                opacity,
                pointerEvents,
              }}
              onClick={() => {
                if (!isActive) {
                  setCurrentIndex(idx);
                }
              }}
              className={`absolute top-1/2 w-[230px] sm:w-[250px] h-[380px] sm:h-[400px] rounded-[28px] p-5 sm:p-6 flex flex-col justify-between select-none transition-all duration-700 ease-out cursor-pointer ${
                isActive
                  ? 'shadow-[0_24px_50px_rgba(0,0,0,0.5)] ring-2 ring-white/25'
                  : 'shadow-lg hover:opacity-100'
              }`}
            >
              {/* 3D Book Cover on Top with realistic spine shadow */}
              <div className="relative aspect-[2/3] w-[130px] sm:w-[140px] mx-auto overflow-hidden rounded-r-md rounded-l-xs shadow-[0_16px_28px_rgba(0,0,0,0.45)] border border-black/15 bg-black/40 group-hover:scale-105 transition-transform duration-500">
                {/* Book spine highlight */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-white/30 via-white/10 to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 left-1 w-0.5 bg-black/25 z-10" />

                <Img
                  image={slide.image}
                  alt={slide.title}
                  thumb
                  wrapperClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Book Details on Bottom */}
              <div className="pt-2">
                <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest ${theme.authorColor} truncate`}>
                  {slide.bookAuthor || 'David Platt'}
                </p>

                <h3 className={`font-serif text-base sm:text-lg font-bold leading-tight ${theme.textColor} line-clamp-2 mt-1 group-hover:underline`}>
                  {slide.bookTitle || slide.title}
                </h3>

                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs transition ${theme.badgeBg} ${theme.badgeText}`}
                  >
                    <span>{slide.tag || 'Read Review'}</span>
                    <ArrowRightIcon size={10} />
                  </span>

                  {slide.rating && (
                    <div className="flex items-center gap-1 text-amber-300">
                      <StarIcon size={12} className="fill-amber-300 text-amber-300" />
                      <span className={`text-[11px] font-bold ${theme.textColor}`}>{slide.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          return isActive ? (
            <Link
              key={slide.id}
              to={itemPath('bookReview', slide.slug)}
              className="contents"
            >
              {card}
            </Link>
          ) : (
            <div key={slide.id} className="contents">
              {card}
            </div>
          );
        })}
      </div>

      {/* Pagination Indicator Dots */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to book ${i + 1}`}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              i === currentIndex ? 'w-8 bg-accent shadow-sm' : 'w-2 bg-line hover:bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ==================================================================== */
/* EXPOSITORY VIDEOS INTERACTIVE PLAYER & SWAP GRID (TGC STYLE)         */
/* ==================================================================== */

interface ExpositoryVideoItem {
  id: string | number;
  title: string;
  speaker: string;
  excerpt: string;
  youtubeId: string;
  thumbnail: string;
  badge?: string;
  slug?: string;
  type?: ContentKey;
}

const INITIAL_EXPOSITORY_VIDEOS: ExpositoryVideoItem[] = [
  {
    id: 'eic-video-1',
    title: 'Stay Vigilant and Be Ready',
    speaker: 'Equip Indian Churches',
    excerpt:
      'A faithful message from 1 Peter 5 expounding the biblical call to spiritual vigilance, standing firm in faith against the adversary, and resting in the eternal grace of Jesus Christ.',
    youtubeId: 'TbustDjFSyU',
    thumbnail: 'https://i.ytimg.com/vi/TbustDjFSyU/hqdefault.jpg',
    badge: 'Video',
    slug: 'stay-vigilant-and-be-ready',
    type: 'sermon',
  },
  {
    id: 'eic-video-2',
    title: 'Be Zealous and Committed',
    speaker: 'Equip Indian Churches',
    excerpt:
      'Examining what it means to serve the Lord with spiritual fervor, steadfast faith, and persevering commitment in the ministry of the local church.',
    youtubeId: 'SgnazuAEO04',
    thumbnail: 'https://i.ytimg.com/vi/SgnazuAEO04/hqdefault.jpg',
    badge: 'Sermon',
    slug: 'be-zealous-and-committed',
    type: 'sermon',
  },
  {
    id: 'eic-video-3',
    title: 'Persevere in Weakness',
    speaker: 'Equip Indian Churches',
    excerpt:
      'Understanding God’s sufficient grace in seasons of affliction, limitation, and trials as expounded from divine power made perfect in human weakness.',
    youtubeId: 'cOb9YR3-ozU',
    thumbnail: 'https://i.ytimg.com/vi/cOb9YR3-ozU/hqdefault.jpg',
    badge: 'Sermon',
    slug: 'persevere-in-weakness',
    type: 'sermon',
  },
  {
    id: 'eic-video-4',
    title: 'Remain Faithful unto Death',
    speaker: 'Equip Indian Churches',
    excerpt:
      'An exposition on Christ’s exhortation to the suffering church in Smyrna: holding fast to truth, enduring persecution, and trusting the promise of the crown of life.',
    youtubeId: 'fDbIRcyrbCA',
    thumbnail: 'https://i.ytimg.com/vi/fDbIRcyrbCA/hqdefault.jpg',
    badge: 'Video',
    slug: 'aipc-2024-ramain-faithful',
    type: 'video',
  },
  {
    id: 'eic-video-5',
    title: 'Rekindle Your First Love',
    speaker: 'Equip Indian Churches',
    excerpt:
      'A vital pastoral call from Revelation 2 to remember our first love for Christ, evaluate our spiritual devotion, and pursue genuine affection for the Lord.',
    youtubeId: 'QYsbSHoAQAM',
    thumbnail: 'https://i.ytimg.com/vi/QYsbSHoAQAM/hqdefault.jpg',
    badge: 'Video',
    slug: 'aipc-2024-rekindle',
    type: 'video',
  },
  {
    id: 'eic-video-6',
    title: 'Trusting God for Growth',
    speaker: 'Equip Indian Churches',
    excerpt:
      'Looking to the sovereign Lord who produces spiritual fruit and gospel advance in local church planting, pastoral labors, and church revitalisation.',
    youtubeId: 'haGn3KOYm04',
    thumbnail: 'https://i.ytimg.com/vi/haGn3KOYm04/hqdefault.jpg',
    badge: 'Sermon',
    slug: 'trusting-god-for-growth',
    type: 'sermon',
  },
  {
    id: 'eic-video-7',
    title: 'Evangelism and Missions',
    speaker: 'Equip Indian Churches',
    excerpt:
      'Proclaiming the unsearchable riches of Christ across unreached regions and equipping local assemblies for intentional cross-cultural gospel mission.',
    youtubeId: 'IJFAUpQds78',
    thumbnail: 'https://i.ytimg.com/vi/IJFAUpQds78/hqdefault.jpg',
    badge: 'Sermon',
    slug: 'evangelism-and-missions',
    type: 'sermon',
  },
  {
    id: 'eic-video-8',
    title: 'What the Bible Teaches About Worship',
    speaker: 'Equip Indian Churches',
    excerpt:
      'Examining the biblical pattern of true worship: honoring the triune God in spirit and truth according to the clear directives of Holy Scripture.',
    youtubeId: '1hMsV4kC6OE',
    thumbnail: 'https://i.ytimg.com/vi/1hMsV4kC6OE/hqdefault.jpg',
    badge: 'Video',
    slug: 'what-the-bible-teaches-about-worship',
    type: 'video',
  },
];

function ExpositoryVideosPlayer({ videos }: { videos: ExpositoryVideoItem[] }) {
  const [videoPool, setVideoPool] = useState<ExpositoryVideoItem[]>(videos);
  const [isSwapping, setIsSwapping] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Synchronize with fresh WordPress video data as soon as query completes
  useEffect(() => {
    if (videos && videos.length >= 5) {
      setVideoPool((prev) => {
        if (hasInteracted && prev[0]) {
          const currentMain = prev[0];
          const remaining = videos.filter((v) => v.id !== currentMain.id);
          return [currentMain, ...remaining];
        }
        return videos;
      });
    }
  }, [videos, hasInteracted]);

  const pool = videoPool.length >= 5 ? videoPool : videos.length >= 5 ? videos : INITIAL_EXPOSITORY_VIDEOS;
  const mainVideo = pool[0];
  const queueVideos = pool.slice(1, 5);

  const handleSwap = (queueIndex: number) => {
    if (isSwapping) return;
    const poolIndex = queueIndex + 1;

    setIsSwapping(true);
    setActiveSlot(queueIndex);
    setHasInteracted(true);

    setTimeout(() => {
      setVideoPool((prev) => {
        const next = [...prev];
        const temp = next[0];
        next[0] = next[poolIndex];
        next[poolIndex] = temp;
        return next;
      });
      setIsSwapping(false);
      setActiveSlot(null);
    }, 280);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* -------------------------------------------------------- */}
      {/* LEFT COLUMN (7 cols): Main Video Player + Details        */}
      {/* -------------------------------------------------------- */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
        {/* Big Video Player Container */}
        <div
          className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl border border-line/60 transition-all duration-300 ease-out ${
            isSwapping ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'
          }`}
        >
          <iframe
            key={mainVideo.id}
            src={`https://www.youtube-nocookie.com/embed/${mainVideo.youtubeId}?autoplay=${hasInteracted ? 1 : 0}&rel=0&modestbranding=1`}
            title={mainVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>

        {/* Video Title, Byline, and Excerpt */}
        <div
          className={`transition-all duration-300 ease-out ${
            isSwapping ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <h3 className="font-serif text-2xl lg:text-3xl font-black text-ink leading-tight mt-4">
            {mainVideo.slug ? (
              <Link
                to={itemPath(mainVideo.type || 'video', mainVideo.slug)}
                className="hover:text-accent-text transition-colors"
              >
                {mainVideo.title}
              </Link>
            ) : (
              mainVideo.title
            )}
          </h3>

          <p className="text-xs font-bold uppercase tracking-wider text-muted mt-2">
            {mainVideo.speaker}
          </p>

          <p className="text-sm text-body leading-relaxed mt-2.5 line-clamp-3">
            {mainVideo.excerpt}
          </p>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* RIGHT COLUMN (5 cols): 4 Videos in 2x2 Grid              */}
      {/* -------------------------------------------------------- */}
      <div className="lg:col-span-5 xl:col-span-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {queueVideos.map((video, qIdx) => {
            const isThisCardSwapping = isSwapping && activeSlot === qIdx;
            return (
              <article
                key={video.id}
                onClick={() => handleSwap(qIdx)}
                className={`group flex flex-col justify-between cursor-pointer rounded-2xl p-2.5 sm:p-3 border border-line/80 bg-surface shadow-xs hover:border-accent hover:shadow-md transition-all duration-300 ${
                  isThisCardSwapping
                    ? 'opacity-30 scale-95 ring-2 ring-accent'
                    : 'hover:-translate-y-1'
                }`}
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40 border border-line/60">
                    <Img
                      image={{ src: video.thumbnail, alt: video.title }}
                      thumb
                      wrapperClassName="h-full w-full"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                    {/* Play Icon Overlay on Hover */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/90 text-accent-ink shadow-md transition-transform duration-300 group-hover:scale-110">
                        <PlayIcon size={14} className="ml-0.5 fill-accent-ink" />
                      </span>
                    </div>

                    {/* Badge: PODCAST / VIDEO */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white/95 border border-white/10 uppercase tracking-wider">
                      <PlayIcon size={9} className="fill-white" />
                      <span>{video.badge || 'VIDEO'}</span>
                    </div>
                  </div>

                  {/* Title & Speaker below thumbnail */}
                  <div className="pt-2.5">
                    <h4 className="font-serif text-sm font-bold text-ink line-clamp-2 leading-snug group-hover:text-accent-text transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider truncate mt-1">
                      {video.speaker}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  // 1. Hero / Featured Lead Article
  const { data: featuredHero, isLoading: heroLoading } = useFeatured(homeConfig.heroSource, 1);
  const heroItem = featuredHero?.[0];

  // 2. High-density Article Feed for Broadsheet Grid (fetch 24 articles)
  const { data: latestArticles, isLoading: articlesLoading } = useContentList('article', {
    perPage: 24,
  });
  const articlesList = latestArticles?.items || [];

  // 3. Featured Sermons & Media
  const { data: featuredSermons } = useFeatured('sermon', 8);
  const sermonsList = featuredSermons || [];

  // 3b. Featured Videos & Podcasts
  const { data: featuredVideos } = useFeatured('video', 6);
  const videosList = featuredVideos || [];

  // 3c. Answers to EIC Videos (category 2268)
  const { data: answersData } = useContentList('video', {
    terms: { videoCategory: [2268] },
    perPage: 6,
  });
  const answersList = answersData?.items || [];

  const displayedAnswers = useMemo(() => {
    if (answersList.length >= 4) return answersList.slice(0, 4);
    if (answersList.length > 0) {
      const fill = videosList.filter((v) => !answersList.some((a) => a.id === v.id));
      return [...answersList, ...fill].slice(0, 4);
    }
    return videosList.slice(0, 4);
  }, [answersList, videosList]);

  // 3d. WordPress Expository Videos from Equip Indian Churches
  const { data: expositoryMediaData } = useContentList('media', {
    perPage: 16,
  });
  const expositoryMediaList = expositoryMediaData?.items || [];

  const expositoryVideosList = useMemo<ExpositoryVideoItem[]>(() => {
    const RESTRICTED_YOUTUBE_IDS = new Set(['wlMTtlv85_M', 'jTBBXt_cB1c']);
    const wpVideos: ExpositoryVideoItem[] = [];

    for (const item of expositoryMediaList) {
      const yId = item.video?.id;
      if (yId && yId.length === 11 && !RESTRICTED_YOUTUBE_IDS.has(yId)) {
        wpVideos.push({
          id: item.id,
          title: item.title,
          speaker: item.speaker || item.author?.name || 'Equip Indian Churches',
          excerpt:
            item.excerpt ||
            'A faithful exposition of God’s Word from Equip Indian Churches pastoral leadership, national assemblies, and church planting networks across India.',
          youtubeId: yId,
          thumbnail:
            item.image?.src ||
            item.video?.thumbnailLarge ||
            item.video?.thumbnail ||
            `https://i.ytimg.com/vi/${yId}/hqdefault.jpg`,
          badge: item.terms.videoCategory?.[0]?.name || (item.type === 'sermon' ? 'Sermon' : 'Video'),
          slug: item.slug,
          type: item.type,
        });
      }
    }

    if (wpVideos.length >= 5) {
      return wpVideos.slice(0, 10);
    }

    const existingIds = new Set(wpVideos.map((v) => v.youtubeId));
    const fallbackFill = INITIAL_EXPOSITORY_VIDEOS.filter((v) => !existingIds.has(v.youtubeId));
    return [...wpVideos, ...fallbackFill].slice(0, 8);
  }, [expositoryMediaList]);

  // 4. Book Reviews (fetch up to 12)
  const { data: books } = useContentList('bookReview', {
    perPage: 12,
  });
  const bookList = books?.items || [];

  // Book review items for the 3D coverflow auto-slider
  const bookReviewSlides = useMemo<BookSlideItem[]>(() => {
    const apiSlides: BookSlideItem[] = bookList.map((item, idx) => ({
      id: item.id,
      title: item.title,
      bookTitle: item.bookTitle || item.title,
      bookAuthor: item.bookAuthor || 'Staff Review',
      slug: item.slug,
      rating: item.rating || 5,
      tag: 'Read Review',
      image: item.image || FALLBACK_BOOKS[idx % FALLBACK_BOOKS.length].image,
    }));

    if (apiSlides.length >= 8) return apiSlides;

    const existingSlugs = new Set(apiSlides.map((s) => s.slug));
    const extra = FALLBACK_BOOKS.filter((fb) => !existingSlugs.has(fb.slug));
    return [...apiSlides, ...extra].slice(0, 8);
  }, [bookList]);

  // 6. Upcoming Events (Live WordPress API + Custom Admin Database)
  const { data: events, isLoading: eventsLoading } = useContentList('event', {
    perPage: 3,
  });
  const customEvents = usePublishedEvents();

  // Compose dynamic notification slides for the Hero Auto-Slider
  const heroSlides = useMemo<HeroNotificationSlide[]>(() => {
    const slides: HeroNotificationSlide[] = [];

    // 1. Latest Event (Prefers published custom event from Admin panel)
    const latestCustom = customEvents[0];
    const latestEvent = events?.items?.[0];
    if (latestCustom) {
      slides.push({
        id: `custom-event-${latestCustom.id}`,
        category: 'Latest Event',
        categoryDot: 'bg-amber-400',
        badge: latestCustom.badge,
        title: latestCustom.title,
        excerpt: latestCustom.excerpt || undefined,
        date: latestCustom.date,
        metaExtra: latestCustom.venue,
        image: latestCustom.image,
        url: latestCustom.registrationUrl,
      });
    } else if (latestEvent) {
      slides.push({
        id: `event-${latestEvent.id}`,
        category: 'Latest Event',
        categoryDot: 'bg-amber-400',
        badge: 'National Gathering',
        title: latestEvent.title,
        excerpt: latestEvent.excerpt || undefined,
        date: latestEvent.eventDate || latestEvent.date,
        metaExtra: typeof latestEvent.meta?.venue === 'string' ? String(latestEvent.meta.venue) : 'National Gathering',
        image: latestEvent.image,
        url: itemPath('event', latestEvent.slug),
      });
    } else {
      slides.push({
        id: 'event-fallback',
        category: 'Upcoming Event',
        categoryDot: 'bg-amber-400',
        badge: 'National Gathering',
        title: 'AIPC National Pastors Conference: Biblical Preaching & Leadership',
        excerpt: 'Equipping pastors and leaders with sound doctrine, expository preaching, and gospel-centered ministry across India.',
        date: '2026-11-20',
        metaExtra: 'New Delhi • Registration Open',
        image: heroItem?.image,
        url: '/events',
      });
    }

    // 2. Latest Sermon
    const latestSermon = sermonsList[0];
    if (latestSermon) {
      slides.push({
        id: `sermon-${latestSermon.id}`,
        category: 'Latest Sermon',
        categoryDot: 'bg-red-500',
        badge: 'Expository Preaching',
        title: latestSermon.title,
        excerpt: latestSermon.excerpt,
        date: latestSermon.date,
        metaExtra: latestSermon.speaker ? `Speaker: ${latestSermon.speaker}` : 'Expository Sermon',
        image: latestSermon.image,
        url: itemPath('sermon', latestSermon.slug),
      });
    }

    // 3. Latest Video & Podcast
    const latestVideo = videosList[0] || sermonsList[1];
    if (latestVideo) {
      slides.push({
        id: `video-${latestVideo.id}`,
        category: 'Latest Video & Podcast',
        categoryDot: 'bg-sky-400',
        badge: 'Media & Discussion',
        title: latestVideo.title,
        excerpt: latestVideo.excerpt,
        date: latestVideo.date,
        metaExtra: latestVideo.speaker || latestVideo.author?.name || 'Equip Indian Churches',
        image: latestVideo.image,
        url: itemPath(latestVideo.type, latestVideo.slug),
      });
    }

    // 4. Latest Article
    const leadArticle = heroItem || articlesList[0];
    if (leadArticle) {
      slides.push({
        id: `article-${leadArticle.id}`,
        category: 'Latest Article',
        categoryDot: 'bg-emerald-400',
        badge: 'Theological Essay',
        title: leadArticle.title,
        excerpt: leadArticle.excerpt,
        date: leadArticle.date,
        metaExtra: `${readingTimeMinutes(leadArticle.html || leadArticle.excerpt)} min read`,
        image: leadArticle.image,
        url: itemPath('article', leadArticle.slug),
      });
    }

    return slides;
  }, [events, sermonsList, videosList, heroItem, articlesList]);

  // Latest Articles filter and pagination state
  type ArticleFilterCategory = 'all' | 'theology' | 'living' | 'pastoral' | 'family';
  const [articleFilter, setArticleFilter] = useState<ArticleFilterCategory>('all');
  const [articlePage, setArticlePage] = useState<number>(0);

  const filterPills: { id: ArticleFilterCategory; label: string }[] = [
    { id: 'all', label: 'All Articles' },
    { id: 'theology', label: 'Theology & Doctrine' },
    { id: 'living', label: 'Christian Living' },
    { id: 'pastoral', label: 'Pastoral Ministry' },
    { id: 'family', label: 'Marriage & Family' },
  ];

  const getCategoryKey = (item: ContentItem): ArticleFilterCategory => {
    const text = `${item.title} ${item.excerpt || ''}`.toLowerCase();
    if (
      text.includes('marriage') ||
      text.includes('husband') ||
      text.includes('wife') ||
      text.includes('premarital') ||
      text.includes('father') ||
      text.includes('parent') ||
      text.includes('children') ||
      text.includes('mother') ||
      text.includes('family')
    ) {
      return 'family';
    }
    if (
      text.includes('pastor') ||
      text.includes('shepherd') ||
      text.includes('elder') ||
      text.includes('ministry') ||
      text.includes('preach') ||
      text.includes('accountability') ||
      text.includes('calling') ||
      text.includes('church') ||
      text.includes('plant')
    ) {
      return 'pastoral';
    }
    if (
      text.includes('joy') ||
      text.includes('suffer') ||
      text.includes('death') ||
      text.includes('hades') ||
      text.includes('hope') ||
      text.includes('living') ||
      text.includes('walk') ||
      text.includes('life')
    ) {
      return 'living';
    }
    return 'theology';
  };

  // Pure article pool — zero sermons
  const filteredArticles = useMemo(() => {
    if (articleFilter === 'all') return articlesList;
    const matches = articlesList.filter((a) => getCategoryKey(a) === articleFilter);
    if (matches.length < 3) {
      const remaining = articlesList.filter((a) => !matches.includes(a));
      return [...matches, ...remaining];
    }
    return matches;
  }, [articlesList, articleFilter]);

  const displayedArticles = useMemo(() => {
    const start = articlePage * 3;
    const pageItems = filteredArticles.slice(start, start + 3);
    return pageItems.length ? pageItems : filteredArticles.slice(0, 3);
  }, [filteredArticles, articlePage]);

  // Events tab switcher state (Upcoming vs Past)
  const [eventsTab, setEventsTab] = useState<'upcoming' | 'past'>('upcoming');

  // Main featured latest event for the left column (Prefers latest published custom event)
  const mainLatestEvent = useMemo(() => {
    if (customEvents.length > 0) {
      const top = customEvents[0];
      return {
        id: top.id,
        title: top.title,
        slug: top.slug,
        formattedDate: top.formattedDate,
        date: top.date,
        venue: top.venue,
        badge: 'Latest Main Event',
        excerpt: top.excerpt,
        image: top.image,
        registrationUrl: top.registrationUrl || `/events/${top.slug}`,
        isUpcoming: top.isUpcoming,
      };
    }
    const liveFirst = events?.items?.[0];
    return {
      id: liveFirst?.id || 'aipc-2026-main',
      title: 'All India Pastors Conference (AIPC) 2026: Proclaiming Christ Faithfully',
      slug: liveFirst?.slug || 'all-india-pastors-conference-2026',
      formattedDate: 'November 12 – 14, 2026',
      date: '2026-11-12',
      venue: 'New Delhi, India',
      badge: 'Latest Main Event',
      excerpt:
        liveFirst?.excerpt ||
        'Gathering pastors, church planters, elders, and ministry leaders from across India for three days of rigorous expository preaching, theological grounding, and pastoral fellowship.',
      image: liveFirst?.image || {
        src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&h=1067&q=80',
        alt: 'All India Pastors Conference 2026',
      },
      registrationUrl: liveFirst ? itemPath('event', liveFirst.slug) : '/events/all-india-pastors-conference-2026',
      isUpcoming: true,
    };
  }, [events, customEvents]);

  // Upcoming events list for the right column (4 events)
  const upcomingEventsList = useMemo(() => {
    const DEFAULT_EVENTS = [
      {
        id: 'upcoming-1',
        title: 'All India Pastors Conference 2026',
        slug: 'all-india-pastors-conference-2026',
        formattedDate: 'Nov 12 – 14, 2026',
        date: '2026-11-12',
        venue: 'New Delhi • National Summit',
        image: {
          src: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'AIPC 2026',
        },
        registrationUrl: '/events/all-india-pastors-conference-2026',
        isUpcoming: true,
      },
      {
        id: 'upcoming-2',
        title: 'Regional Pastors Roundtable: South India',
        slug: 'regional-pastors-roundtable-south-india',
        formattedDate: 'Aug 22, 2026',
        date: '2026-08-22',
        venue: 'Bangalore, Karnataka',
        image: {
          src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'Regional Pastors Roundtable',
        },
        registrationUrl: '/events/regional-pastors-roundtable-south-india',
        isUpcoming: true,
      },
      {
        id: 'upcoming-3',
        title: 'Expository Preaching Seminar & Workshop',
        slug: 'expository-preaching-seminar-workshop-2026',
        formattedDate: 'Oct 5 – 7, 2026',
        date: '2026-10-05',
        venue: 'Mumbai, Maharashtra',
        image: {
          src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'Expository Preaching Seminar',
        },
        registrationUrl: '/events/expository-preaching-seminar-workshop-2026',
        isUpcoming: true,
      },
      {
        id: 'upcoming-4',
        title: 'Church Leaders Theological Colloquium',
        slug: 'church-leaders-theological-colloquium',
        formattedDate: 'Dec 4 – 6, 2026',
        date: '2026-12-04',
        venue: 'Kolkata, West Bengal',
        image: {
          src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'Theological Colloquium',
        },
        registrationUrl: '/events/church-leaders-theological-colloquium',
        isUpcoming: true,
      },
    ];

    if (customEvents.length > 1) {
      const items = customEvents.slice(1, 5).map((ev) => ({
        id: ev.id,
        title: ev.title,
        slug: ev.slug,
        formattedDate: ev.formattedDate,
        date: ev.date,
        venue: ev.venue,
        image: ev.image,
        registrationUrl: ev.registrationUrl || `/events/${ev.slug}`,
        isUpcoming: ev.isUpcoming,
      }));
      // Pad with defaults if fewer than 4
      if (items.length < 4) {
        const needed = 4 - items.length;
        items.push(...DEFAULT_EVENTS.slice(items.length, items.length + needed));
      }
      return items;
    } else if (customEvents.length === 1) {
      return [
        {
          id: customEvents[0].id,
          title: customEvents[0].title,
          slug: customEvents[0].slug,
          formattedDate: customEvents[0].formattedDate,
          date: customEvents[0].date,
          venue: customEvents[0].venue,
          image: customEvents[0].image,
          registrationUrl: customEvents[0].registrationUrl || `/events/${customEvents[0].slug}`,
          isUpcoming: customEvents[0].isUpcoming,
        },
        ...DEFAULT_EVENTS.slice(1),
      ];
    }
    return DEFAULT_EVENTS;
  }, [customEvents]);

  // Past events list from live API data (4 events)
  const pastEventsList = useMemo(() => {
    if (events?.items && events.items.length >= 4) {
      return events.items.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        formattedDate: formatDateShort(item.eventDate || item.date),
        date: item.eventDate || item.date,
        venue: typeof item.meta?.venue === 'string' ? String(item.meta.venue) : 'National Gathering',
        image: item.image || {
          src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&h=800&q=80',
          alt: item.title,
        },
        registrationUrl: `/events/${item.slug}`,
        isUpcoming: false,
      }));
    }
    return [
      {
        id: 'past-1',
        title: 'Day 2 at AIPC 2023: Faithful Shepherding',
        slug: 'aipc-2023-day-2',
        formattedDate: 'Sep 28, 2023',
        date: '2023-09-28',
        venue: 'National Conference Assembly',
        image: {
          src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'AIPC 2023',
        },
        registrationUrl: '/events/aipc-2023-day-2',
        isUpcoming: false,
      },
      {
        id: 'past-2',
        title: 'Day 1 at AIPC 2023: The Sufficiency of Scripture',
        slug: 'aipc-2023-day-1',
        formattedDate: 'Sep 27, 2023',
        date: '2023-09-27',
        venue: 'National Conference Assembly',
        image: {
          src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'AIPC 2023',
        },
        registrationUrl: '/events/aipc-2023-day-1',
        isUpcoming: false,
      },
      {
        id: 'past-3',
        title: 'AIPC 2022: Pastoral Fellowship in Christ',
        slug: 'aipc-2022',
        formattedDate: 'Dec 24, 2022',
        date: '2022-12-24',
        venue: 'Annual Assembly',
        image: {
          src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'AIPC 2022',
        },
        registrationUrl: '/events/aipc-2022',
        isUpcoming: false,
      },
      {
        id: 'past-4',
        title: 'AIPC 2021: Suffering and Sovereignty of God',
        slug: 'aipc-2021',
        formattedDate: 'Oct 25, 2021',
        date: '2021-10-25',
        venue: 'Pastoral Exposition',
        image: {
          src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'AIPC 2021',
        },
        registrationUrl: '/events/aipc-2021',
        isUpcoming: false,
      },
    ];
  }, [events]);


  return (
    <>
      <SeoHead title="Home" description={site.description} path="/" />

      {/* ============================================================== */}
      {/* MOBILE EXPERIENCE (< md): Native Streaming App (UNTOUCHED)     */}
      {/* ============================================================== */}
      <MobileDiscoverView />

      {/* ============================================================== */}
      {/* DESKTOP BROADSHEET NEWSPAPER EXPERIENCE (>= md)                */}
      {/* Matches the high-density editorial reference layout            */}
      {/* ============================================================== */}
      <div className="hidden md:block bg-bg text-ink transition-colors pb-20">

        {/* ------------------------------------------------------------ */}
        {/* SECTION 1: HERO (Auto-Slider Notifications + Latest Articles)*/}
        {/* ------------------------------------------------------------ */}
        <section className="border-b border-line/80 pt-8 pb-10 bg-surface">
          <div className="container-page max-w-[1400px]">

            {heroLoading && articlesLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 xl:col-span-8 h-[480px] bg-surface-2 rounded-3xl animate-pulse" />
                <div className="lg:col-span-5 xl:col-span-4 space-y-3">
                  <div className="h-6 w-36 bg-surface-2 rounded mb-4" />
                  <div className="h-24 bg-surface-2 rounded-2xl animate-pulse" />
                  <div className="h-24 bg-surface-2 rounded-2xl animate-pulse" />
                  <div className="h-24 bg-surface-2 rounded-2xl animate-pulse" />
                  <div className="h-24 bg-surface-2 rounded-2xl animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                {/* Left Column: Auto-sliding Notifications Slider */}
                <div className="lg:col-span-7 xl:col-span-8">
                  <HeroAutoSlider slides={heroSlides} />
                </div>

                {/* Right Column: Answers to EIC Videos (Squircle Thumbnail Cards) */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-line/80">
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink">
                        Answers to EIC
                      </h2>
                      <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-text flex items-center gap-1">
                        <PlayIcon size={9} />
                        <span>Video Q&A</span>
                      </span>
                    </div>
                    <Link
                      to={`/${contentTypes.video.route}`}
                      className="group text-xs font-semibold text-accent-text hover:text-ink flex items-center gap-1 transition-colors"
                    >
                      <span>View All</span>
                      <ArrowRightIcon size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>

                  {/* Squircle Cards List (4 items matching the slider height) */}
                  <div className="flex flex-col justify-between flex-1 space-y-2">
                    {displayedAnswers.map((item) => (
                      <article
                        key={item.id}
                        className="group flex items-center gap-3.5 p-2 sm:p-2.5 rounded-2xl hover:bg-surface-2 transition-all duration-200 border border-transparent hover:border-line/60"
                      >
                        {/* Squircle Thumbnail with Centered Play Button */}
                        <div className="relative h-20 w-20 sm:h-22 sm:w-22 shrink-0 overflow-hidden rounded-2xl bg-black/40 shadow-xs border border-line/40">
                          <Link to={itemPath('video', item.slug)} className="block h-full w-full">
                            <Img
                              image={item.image}
                              alt={item.title}
                              thumb
                              wrapperClassName="h-full w-full"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Play Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/45 transition-colors">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-ink shadow-md transition-transform group-hover:scale-110">
                                <PlayIcon size={11} className="ml-0.5" />
                              </div>
                            </div>
                          </Link>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col justify-center flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-text line-clamp-1 mb-0.5">
                            Answers to EIC
                          </span>
                          <h3 className="font-serif text-sm sm:text-base font-bold text-ink line-clamp-2 leading-snug group-hover:text-accent-text transition-colors">
                            <Link to={itemPath('video', item.slug)}>
                              {item.title}
                            </Link>
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted mt-1.5">
                            <time dateTime={item.date}>{formatDateShort(item.date)}</time>
                            <span>•</span>
                            <span className="truncate">{item.speaker || 'EIC Panel'}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* SECTION 2: LATEST ARTICLES (Signature Circular Spotlight Row)*/}
        {/* ------------------------------------------------------------ */}
        <section className="border-b border-line/80 py-12 bg-bg">
          <div className="container-page max-w-[1400px]">
            {/* Header + Category Filter Pills + Carousel Arrows */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-8 border-b border-line/80">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-2xl lg:text-3xl font-black uppercase tracking-[0.06em] text-ink">
                    Latest Articles
                  </h2>
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-text">
                    Curated
                  </span>
                </div>

                {/* Filter Pills below title (matching reference image) */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {filterPills.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setArticleFilter(f.id);
                        setArticlePage(0);
                      }}
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-all cursor-pointer ${
                        articleFilter === f.id
                          ? 'bg-[#182541] dark:bg-white text-white dark:text-[#182541] font-semibold shadow-xs'
                          : 'border border-line bg-surface text-body hover:text-ink hover:border-accent'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Arrow Controls */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  aria-label="Previous articles"
                  onClick={() => setArticlePage((p) => Math.max(0, p - 1))}
                  disabled={articlePage === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink hover:bg-surface-2 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeftIcon size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Next articles"
                  onClick={() => setArticlePage((p) => p + 1)}
                  disabled={(articlePage + 1) * 3 >= filteredArticles.length}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink hover:bg-surface-2 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            </div>

            {/* 3 Circular Spotlight Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedArticles.map((item) => (
                <article
                  key={item.id}
                  className="group flex items-start gap-4 p-4 rounded-xl border border-line/80 bg-surface shadow-xs transition-all duration-300 hover:border-accent hover:shadow-md"
                >
                  {/* Distinctive Circular Cropped Photo */}
                  <div className="relative shrink-0">
                    <div className="h-24 w-24 rounded-full overflow-hidden ring-2 ring-accent/30 shadow-xs bg-surface-2">
                      <Link to={itemPath(item.type, item.slug)}>
                        <Img
                          image={item.image}
                          alt={item.title}
                          thumb
                          wrapperClassName="w-full h-full"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </Link>
                    </div>
                  </div>

                  {/* Editorial Text */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-text block mb-1">
                        {getArticleCategory(item)}
                      </span>
                      <h3 className="font-serif text-base font-bold leading-snug text-ink line-clamp-2 group-hover:text-accent-text transition-colors">
                        <Link to={itemPath(item.type, item.slug)}>
                          {item.title}
                        </Link>
                      </h3>
                      {item.excerpt && (
                        <p className="mt-1.5 text-xs text-body line-clamp-3 leading-relaxed">
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-line/50 flex items-center justify-between text-[11px] text-muted">
                      <span className="font-semibold text-ink truncate">
                        {item.author?.name || 'Equip Indian Churches'}
                      </span>
                      <time dateTime={item.date}>{formatDateShort(item.date)}</time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* SECTION 3: EVENTS & CONFERENCES (Assemblies in India)        */}
        {/* ------------------------------------------------------------ */}
        <section className="border-b border-line/80 py-12 bg-surface">
          <div className="container-page max-w-[1400px]">
            {/* Header + View All Pill */}
            <div className="flex items-center justify-between pb-4 mb-8 border-b border-line/80">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-2xl lg:text-3xl font-black uppercase tracking-[0.06em] text-ink">
                    Events & Conferences
                  </h2>
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-text">
                    Assemblies in India
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  National pastors conferences, regional ministerial roundtables, and expository training workshops
                </p>
              </div>
              <Link
                to={`/${contentTypes.event.route}`}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:border-accent hover:text-accent-text transition shadow-xs"
              >
                ( View All Events → )
              </Link>
            </div>

            {eventsLoading ? (
              <CardGridSkeleton variant="event" count={3} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* ---------------------------------------------------- */}
                {/* LEFT COLUMN (5 cols): Latest Main Event Flyer        */}
                {/* Book / Flyer shaped with details placed below        */}
                {/* ---------------------------------------------------- */}
                <div className="lg:col-span-5 flex flex-col">
                  <article className="group flex flex-col justify-between rounded-3xl border border-line/80 bg-bg p-5 sm:p-6 shadow-xs hover:border-accent hover:shadow-md transition-all duration-300 h-full">
                    <div>
                      {/* Flyer / Book Shaped Image (Height-controlled so whole section fits on screen, never cut off) */}
                      <div className="relative aspect-[3/4] max-h-[440px] w-auto mx-auto overflow-hidden rounded-2xl shadow-md border border-line/60 bg-slate-950 group-hover:shadow-xl transition-shadow duration-300">
                        <Link to={`/events/${mainLatestEvent.slug}`} className="block h-full w-full">
                          <Img
                            image={mainLatestEvent.image}
                            alt={mainLatestEvent.title}
                            wrapperClassName="h-full w-full"
                            className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                          />
                        </Link>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Top Badge */}
                        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 rounded-full bg-black/80 backdrop-blur-md px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white border border-white/20">
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                          <span>{mainLatestEvent.badge}</span>
                        </div>

                        {/* Bottom Date Pill */}
                        <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2 rounded-lg bg-black/85 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white border border-white/20">
                          <CalendarIcon size={14} className="text-amber-400" />
                          <span>{mainLatestEvent.formattedDate}</span>
                        </div>
                      </div>

                      {/* Event Details Below Flyer */}
                      <div className="pt-5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-text mb-2">
                          <MapPinIcon size={14} />
                          <span>{mainLatestEvent.venue}</span>
                        </div>

                        <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight text-ink group-hover:text-accent-text transition-colors">
                          <Link to={`/events/${mainLatestEvent.slug}`}>
                            {mainLatestEvent.title}
                          </Link>
                        </h3>

                        {mainLatestEvent.excerpt && (
                          <p className="mt-2.5 text-xs sm:text-sm text-body line-clamp-3 leading-relaxed">
                            {mainLatestEvent.excerpt}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Registration CTA Below */}
                    <div className="mt-5 pt-4 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
                      {mainLatestEvent.registrationUrl && (mainLatestEvent.registrationUrl.startsWith('http://') || mainLatestEvent.registrationUrl.startsWith('https://')) ? (
                        <a
                          href={mainLatestEvent.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-accent-ink font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                          <span>Register for Conference</span>
                          <ArrowRightIcon size={13} />
                        </a>
                      ) : (
                        <Link
                          to={`/events/${mainLatestEvent.slug}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-accent-ink font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                          <span>Register for Conference</span>
                          <ArrowRightIcon size={13} />
                        </Link>
                      )}

                      <Link
                        to={`/events/${mainLatestEvent.slug}`}
                        className="text-xs font-semibold text-muted hover:text-ink inline-flex items-center gap-1 transition"
                      >
                        <span>All Details</span>
                        <ArrowRightIcon size={11} />
                      </Link>
                    </div>
                  </article>
                </div>

                {/* ---------------------------------------------------- */}
                {/* RIGHT COLUMN (7 cols): 4 Event Flyers in 2x2 Grid    */}
                {/* Small flyer book style aligned with left section     */}
                {/* ---------------------------------------------------- */}
                <div className="lg:col-span-7 flex flex-col justify-between h-full">
                  {/* Switcher Tabs: Upcoming vs Past */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-line/80">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEventsTab('upcoming')}
                        className={`px-3.5 py-1 text-xs rounded-full font-bold transition-all cursor-pointer ${
                          eventsTab === 'upcoming'
                            ? 'bg-[#182541] dark:bg-white text-white dark:text-[#182541] shadow-xs'
                            : 'border border-line bg-surface text-body hover:text-ink hover:border-accent'
                        }`}
                      >
                        Upcoming Events (4)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventsTab('past')}
                        className={`px-3.5 py-1 text-xs rounded-full font-bold transition-all cursor-pointer ${
                          eventsTab === 'past'
                            ? 'bg-[#182541] dark:bg-white text-white dark:text-[#182541] shadow-xs'
                            : 'border border-line bg-surface text-body hover:text-ink hover:border-accent'
                        }`}
                      >
                        Past Events (4)
                      </button>
                    </div>

                    <Link
                      to="/events"
                      className="text-xs font-semibold text-accent-text hover:underline inline-flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRightIcon size={12} />
                    </Link>
                  </div>

                  {/* 4 Events in 2x2 Grid: Small Book/Flyer Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    {(eventsTab === 'upcoming' ? upcomingEventsList : pastEventsList).map((ev) => (
                      <article
                        key={ev.id}
                        className="group flex flex-col justify-between rounded-2xl border border-line/80 bg-bg p-3.5 shadow-xs hover:border-accent hover:shadow-md transition-all duration-300"
                      >
                        <div>
                          {/* Flyer Poster Container (Never cut off, object-contain on dark canvas) */}
                          <div className="relative h-44 sm:h-52 aspect-[3/4] mx-auto overflow-hidden rounded-xl shadow-md border border-line/60 bg-slate-950 group-hover:shadow-xl transition-all duration-300">
                            <Link to={`/events/${ev.slug}`} className="block h-full w-full">
                              <Img
                                image={ev.image}
                                alt={ev.title}
                                thumb
                                wrapperClassName="h-full w-full"
                                className="h-full w-full object-contain"
                              />
                            </Link>

                            {/* Date Badge over poster */}
                            <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-center gap-1 rounded bg-black/85 backdrop-blur-xs py-0.5 px-1.5 text-[10px] font-semibold text-white/95 border border-white/10">
                              <CalendarIcon size={10} className="text-amber-400 shrink-0" />
                              <span className="truncate">{ev.formattedDate}</span>
                            </div>
                          </div>

                          {/* Event Details Below Flyer */}
                          <div className="pt-2.5 text-center">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-muted mb-1 truncate">
                              <MapPinIcon size={11} className="shrink-0 text-accent-text" />
                              <span className="truncate">{ev.venue}</span>
                            </div>

                            <h4 className="font-serif text-xs sm:text-sm font-bold text-ink line-clamp-2 leading-snug group-hover:text-accent-text transition-colors">
                              <Link to={`/events/${ev.slug}`}>
                                {ev.title}
                              </Link>
                            </h4>
                          </div>
                        </div>

                        {/* Registration Button Below */}
                        <div className="mt-2.5 pt-2 border-t border-line/50 flex items-center justify-between">
                          {ev.registrationUrl && (ev.registrationUrl.startsWith('http://') || ev.registrationUrl.startsWith('https://')) ? (
                            <a
                              href={ev.registrationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent hover:bg-accent-hover text-accent-ink text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              <span>{ev.isUpcoming ? 'Register' : 'Details'}</span>
                              <ArrowRightIcon size={10} />
                            </a>
                          ) : (
                            <Link
                              to={`/events/${ev.slug}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent hover:bg-accent-hover text-accent-ink text-xs font-bold transition shadow-xs"
                            >
                              <span>{ev.isUpcoming ? 'Register' : 'Details'}</span>
                              <ArrowRightIcon size={10} />
                            </Link>
                          )}
                          <span className="text-[10px] text-muted font-medium">Conference</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* SECTION 4: EXPOSITORY VIDEOS (Interactive TGC Style Player)  */}
        {/* ------------------------------------------------------------ */}
        <section className="border-b border-line/80 py-12 bg-bg">
          <div className="container-page max-w-[1400px]">
            {/* Header + Link to All Videos */}
            <div className="flex items-center justify-between pb-4 mb-8 border-b border-line/80">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-2xl lg:text-3xl font-black uppercase tracking-[0.06em] text-ink">
                    Expository Videos
                  </h2>
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-text">
                    Interactive Video Ministry
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  Gospel-centered panel discussions, expositional teachings, and ministry conversations
                </p>
              </div>
              <Link
                to={`/${contentTypes.video.route}`}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:border-accent hover:text-accent-text transition shadow-xs"
              >
                ( More Videos → )
              </Link>
            </div>

            {/* Interactive Player with 4-video Swap Grid */}
            <ExpositoryVideosPlayer videos={expositoryVideosList} />
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* SECTION 5: FAITHFUL BOOK REVIEWS (3D Automatic Coverflow)    */}
        {/* ------------------------------------------------------------ */}
        <section className="border-b border-line/80 py-16 bg-surface overflow-hidden">
          <div className="container-page max-w-[1400px]">
            {/* Header + View All Link */}
            <div className="flex items-center justify-between pb-4 mb-8 border-b border-line/80">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-2xl lg:text-3xl font-black uppercase tracking-[0.06em] text-ink">
                    Faithful Book Reviews
                  </h2>
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-text">
                    Staff Recommendations
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  Biblical assessments and evaluations of essential theological, pastoral, and devotional books
                </p>
              </div>
              <Link
                to={`/${contentTypes.bookReview.route}`}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:border-accent hover:text-accent-text transition shadow-xs"
              >
                ( All Book Reviews → )
              </Link>
            </div>

            {/* 3D Auto Coverflow Book Slider */}
            <BookReviewsCoverflowSlider books={bookReviewSlides} />
          </div>
        </section>

      </div>
    </>
  );
}
