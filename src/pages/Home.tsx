import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { contentTypes, homeConfig } from '@/config/content';
import { site } from '@/config/site';
import {
  useContentList,
  useFeatured,
  useSeriesCards,
} from '@/hooks/queries';
import type { ContentItem } from '@/api/types';
import { SeoHead } from '@/components/seo/SeoHead';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import {
  SeriesCard,
} from '@/components/cards';
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
  ExternalLinkIcon,
} from '@/components/ui/Icons';
import { itemPath } from '@/lib/routes';
import { formatDateShort } from '@/lib/format';
import { readingTimeMinutes } from '@/lib/html';
import { seminariesData, bookstoresData } from '@/data/recommendations';

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

export function HomePage() {
  // 1. Hero / Featured Lead Article
  const { data: featuredHero, isLoading: heroLoading } = useFeatured(homeConfig.heroSource, 1);
  const heroItem = featuredHero?.[0];

  // 2. High-density Article Feed for Broadsheet Grid (fetch 24 articles)
  const { data: latestArticles, isLoading: articlesLoading } = useContentList('article', {
    perPage: 24,
  });
  const articlesList = latestArticles?.items || [];

  // 3. Featured Sermons & Media (fetch 8 for ticker and photo triplets)
  const { data: featuredSermons } = useFeatured('sermon', 8);
  const sermonsList = featuredSermons || [];
  const sideSermons = sermonsList.slice(1, 4);
  const tickerSermons = sermonsList.slice(0, 6);

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

  // 4. Teaching Series
  const { data: seriesList } = useSeriesCards({
    count: 3,
    hiddenSlugs: homeConfig.hiddenSeriesSlugs,
    onlySlugs: homeConfig.featuredSeriesSlugs.length ? homeConfig.featuredSeriesSlugs : undefined,
    coverType: 'article',
  });

  // 5. Book Reviews
  const { data: books } = useContentList('bookReview', {
    perPage: 6,
  });
  const bookList = books?.items || [];

  // 6. Upcoming Events
  const { data: events, isLoading: eventsLoading } = useContentList('event', {
    perPage: 3,
  });

  // Compose dynamic notification slides for the Hero Auto-Slider
  const heroSlides = useMemo<HeroNotificationSlide[]>(() => {
    const slides: HeroNotificationSlide[] = [];

    // 1. Latest Event
    const latestEvent = events?.items?.[0];
    if (latestEvent) {
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

  // Main featured latest event for the left column
  const mainLatestEvent = useMemo(() => {
    const liveFirst = events?.items?.[0];
    return {
      id: liveFirst?.id || 'aipc-2026-main',
      title: 'All India Pastors Conference (AIPC) 2026: Proclaiming Christ Faithfully',
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
      registrationUrl: liveFirst ? itemPath('event', liveFirst.slug) : '/events',
      isUpcoming: true,
    };
  }, [events]);

  // Upcoming events list for the right column (4 events)
  const upcomingEventsList = useMemo(() => {
    return [
      {
        id: 'upcoming-1',
        title: 'All India Pastors Conference 2026',
        formattedDate: 'Nov 12 – 14, 2026',
        date: '2026-11-12',
        venue: 'New Delhi • National Summit',
        image: {
          src: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'AIPC 2026',
        },
        registrationUrl: '/events',
        isUpcoming: true,
      },
      {
        id: 'upcoming-2',
        title: 'Regional Pastors Roundtable: South India',
        formattedDate: 'Aug 22, 2026',
        date: '2026-08-22',
        venue: 'Bangalore, Karnataka',
        image: {
          src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'Regional Pastors Roundtable',
        },
        registrationUrl: '/events',
        isUpcoming: true,
      },
      {
        id: 'upcoming-3',
        title: 'Expository Preaching Seminar & Workshop',
        formattedDate: 'Oct 5 – 7, 2026',
        date: '2026-10-05',
        venue: 'Mumbai, Maharashtra',
        image: {
          src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'Expository Preaching Seminar',
        },
        registrationUrl: '/events',
        isUpcoming: true,
      },
      {
        id: 'upcoming-4',
        title: 'Church Leaders Theological Colloquium',
        formattedDate: 'Dec 4 – 6, 2026',
        date: '2026-12-04',
        venue: 'Kolkata, West Bengal',
        image: {
          src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'Theological Colloquium',
        },
        registrationUrl: '/events',
        isUpcoming: true,
      },
    ];
  }, []);

  // Past events list from live API data (4 events)
  const pastEventsList = useMemo(() => {
    if (events?.items && events.items.length >= 4) {
      return events.items.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        formattedDate: formatDateShort(item.eventDate || item.date),
        date: item.eventDate || item.date,
        venue: typeof item.meta?.venue === 'string' ? String(item.meta.venue) : 'National Gathering',
        image: item.image || {
          src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&h=800&q=80',
          alt: item.title,
        },
        registrationUrl: itemPath('event', item.slug),
        isUpcoming: false,
      }));
    }
    return [
      {
        id: 'past-1',
        title: 'Day 2 at AIPC 2023: Faithful Shepherding',
        formattedDate: 'Sep 28, 2023',
        date: '2023-09-28',
        venue: 'National Conference Assembly',
        image: {
          src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'AIPC 2023',
        },
        registrationUrl: '/events',
        isUpcoming: false,
      },
      {
        id: 'past-2',
        title: 'Day 1 at AIPC 2023: The Sufficiency of Scripture',
        formattedDate: 'Sep 27, 2023',
        date: '2023-09-27',
        venue: 'National Conference Assembly',
        image: {
          src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'AIPC 2023',
        },
        registrationUrl: '/events',
        isUpcoming: false,
      },
      {
        id: 'past-3',
        title: 'AIPC 2022: Pastoral Fellowship in Christ',
        formattedDate: 'Dec 24, 2022',
        date: '2022-12-24',
        venue: 'Annual Assembly',
        image: {
          src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'AIPC 2022',
        },
        registrationUrl: '/events',
        isUpcoming: false,
      },
      {
        id: 'past-4',
        title: 'AIPC 2021: Suffering and Sovereignty of God',
        formattedDate: 'Oct 25, 2021',
        date: '2021-10-25',
        venue: 'Pastoral Exposition',
        image: {
          src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&h=800&q=80',
          alt: 'AIPC 2021',
        },
        registrationUrl: '/events',
        isUpcoming: false,
      },
    ];
  }, [events]);

  // Curated Recommendation item
  const featuredSeminary = seminariesData[0];
  const featuredBookstore = bookstoresData[0];

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
                      {/* Flyer / Book Shaped Image (Height-controlled so whole section fits on screen) */}
                      <div className="relative aspect-[3/4] max-h-[360px] w-auto mx-auto overflow-hidden rounded-2xl shadow-md border border-line/60 bg-black/40 group-hover:shadow-xl transition-shadow duration-300">
                        <Link to={mainLatestEvent.registrationUrl} className="block h-full w-full">
                          <Img
                            image={mainLatestEvent.image}
                            alt={mainLatestEvent.title}
                            wrapperClassName="h-full w-full"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </Link>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

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
                          <Link to={mainLatestEvent.registrationUrl}>
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
                      <Link
                        to={mainLatestEvent.registrationUrl}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-accent-ink font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <span>Register for Conference</span>
                        <ArrowRightIcon size={13} />
                      </Link>

                      <Link
                        to="/events"
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
                          {/* Small Flyer / Book Poster (Height controlled to stay compact) */}
                          <div className="relative h-32 sm:h-36 aspect-[3/4] mx-auto overflow-hidden rounded-xl shadow-md border border-line/60 bg-black/40 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                            <Link to={ev.registrationUrl} className="block h-full w-full">
                              <Img
                                image={ev.image}
                                alt={ev.title}
                                thumb
                                wrapperClassName="h-full w-full"
                                className="h-full w-full object-cover"
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
                              <Link to={ev.registrationUrl}>
                                {ev.title}
                              </Link>
                            </h4>
                          </div>
                        </div>

                        {/* Registration Button Below */}
                        <div className="mt-2.5 pt-2 border-t border-line/50 flex items-center justify-between">
                          <Link
                            to={ev.registrationUrl}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent hover:bg-accent-hover text-accent-ink text-xs font-bold transition shadow-xs"
                          >
                            <span>{ev.isUpcoming ? 'Register' : 'Details'}</span>
                            <ArrowRightIcon size={10} />
                          </Link>
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
        {/* SECTION 4: EXPOSITORY SERMONS (Tabular Ticker + Photo Triple)*/}
        {/* Matches the 'JAPAN' section layout in reference image        */}
        {/* ------------------------------------------------------------ */}
        <section className="border-b border-line/80 py-12 bg-bg">
          <div className="container-page max-w-[1400px]">

            {/* Asymmetric Top Row: Left Title Column (30%) + Right Tabular Ticker (70%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10 pb-8 border-b border-line/80">
              {/* Left Column: Title & Blurb */}
              <div className="lg:col-span-4 space-y-3">
                <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-text inline-block">
                  Pulpit Ministry
                </span>
                <h2 className="font-serif text-3xl lg:text-4xl font-black uppercase tracking-[0.06em] text-ink leading-tight">
                  Expository Sermons
                </h2>
                <p className="text-sm text-body leading-relaxed max-w-sm">
                  Gospel-centered messages expounding God's Word from regional assemblies, pastors conferences, and local Indian church pulpits.
                </p>
                <div className="pt-2">
                  <Link
                    to={`/${contentTypes.sermon.route}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink hover:border-accent hover:text-accent-text transition shadow-xs"
                  >
                    <span>( Browse All Sermons → )</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Stacked Tabular Ticker List */}
              <div className="lg:col-span-8 rounded-lg border border-line overflow-hidden bg-surface shadow-xs">
                {tickerSermons.map((sermon, idx) => {
                  const isFirst = idx === 0;
                  if (isFirst) {
                    return (
                      <div
                        key={sermon.id}
                        className="bg-[#182541] dark:bg-[#111A2E] text-white px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 transition-colors border-b border-white/10"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="rounded bg-[#D9A62E] text-[#10182E] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                            Featured Message
                          </span>
                          <span className="font-serif text-sm sm:text-base font-bold truncate hover:text-[#F3E6BE]">
                            <Link to={itemPath('sermon', sermon.slug)}>{sermon.title}</Link>
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {sermon.speaker && (
                            <span className="text-xs text-white/60 hidden sm:inline">{sermon.speaker}</span>
                          )}
                          <Link
                            to={itemPath('sermon', sermon.slug)}
                            className="rounded-full bg-white/10 hover:bg-white/20 text-[#D9A62E] px-3 py-1 text-xs font-bold transition flex items-center gap-1"
                          >
                            <span>( → )</span>
                          </Link>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={sermon.id}
                      className="px-4 sm:px-5 py-3 flex items-center justify-between gap-4 border-b last:border-b-0 border-line/60 hover:bg-surface-2 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="rounded bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted shrink-0 border border-line/60">
                          {sermon.terms.videoCategory?.[0]?.name || 'Sermon'}
                        </span>
                        <h4 className="font-serif text-xs sm:text-sm font-semibold text-ink truncate hover:text-accent-text">
                          <Link to={itemPath('sermon', sermon.slug)}>{sermon.title}</Link>
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {sermon.speaker && (
                          <span className="text-xs text-muted hidden sm:inline">{sermon.speaker}</span>
                        )}
                        <Link
                          to={itemPath('sermon', sermon.slug)}
                          className="text-xs text-muted hover:text-ink font-semibold flex items-center gap-1"
                        >
                          <span>( → )</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Triple Photo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sideSermons.map((sermon) => (
                <article
                  key={sermon.id}
                  className="group flex flex-col rounded-xl border border-line bg-surface p-4 shadow-xs transition-all hover:border-accent hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-2 mb-3.5">
                    <Link to={itemPath('sermon', sermon.slug)}>
                      <Img
                        image={sermon.image}
                        alt={sermon.title}
                        wrapperClassName="w-full h-full"
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-ink shadow transition group-hover:scale-110">
                        <PlayIcon size={16} className="ml-0.5" />
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent-text block mb-1">
                    {sermon.terms.videoCategory?.[0]?.name || 'Conference Exposition'}
                  </span>
                  <h3 className="font-serif text-base font-bold text-ink leading-snug line-clamp-2 group-hover:text-accent-text transition-colors">
                    <Link to={itemPath('sermon', sermon.slug)}>
                      {sermon.title}
                    </Link>
                  </h3>
                  {sermon.speaker && (
                    <p className="mt-1 text-xs font-medium text-body truncate">
                      Speaker: {sermon.speaker}
                    </p>
                  )}
                  <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-xs text-muted">
                    <time dateTime={sermon.date}>{formatDateShort(sermon.date)}</time>
                    <Link to={itemPath('sermon', sermon.slug)} className="text-accent-text font-semibold hover:underline">
                      Watch & Listen →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* SECTION 5: LITERATURE & STUDY RESOURCES (4-Column Asymmetric)*/}
        {/* Matches the 'ARTS / TRAVEL & TOURISM' layout in image        */}
        {/* ------------------------------------------------------------ */}
        <section className="border-b border-line/80 py-12 bg-surface">
          <div className="container-page max-w-[1400px]">
            <div className="flex items-center justify-between pb-4 mb-8 border-b border-line/80">
              <div>
                <h2 className="font-serif text-2xl lg:text-3xl font-black uppercase tracking-[0.06em] text-ink">
                  Literature & Study Resources
                </h2>
                <p className="text-xs text-muted mt-0.5">Faithful book reviews, recommended seminaries, and Christian distributors</p>
              </div>
              <Link
                to={`/${contentTypes.bookReview.route}`}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:border-accent hover:text-accent-text transition shadow-xs"
              >
                ( All Literature → )
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Book Review */}
              {bookList[0] && (
                <article className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-4 shadow-xs transition-all hover:border-accent">
                  <div>
                    <div className="aspect-[3/4] w-full rounded-md overflow-hidden bg-surface-2 mb-3">
                      <Link to={itemPath('bookReview', bookList[0].slug)}>
                        <Img
                          image={bookList[0].image}
                          alt={bookList[0].title}
                          wrapperClassName="w-full h-full"
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>
                    </div>
                    <div className="flex items-center gap-1 text-accent mb-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} size={12} className={i < (bookList[0].rating || 5) ? 'text-accent' : 'text-line'} />
                      ))}
                    </div>
                    <h3 className="font-serif text-sm font-bold text-ink line-clamp-2 group-hover:text-accent-text">
                      <Link to={itemPath('bookReview', bookList[0].slug)}>{bookList[0].title}</Link>
                    </h3>
                    {bookList[0].bookAuthor && (
                      <p className="mt-1 text-xs text-muted">by {bookList[0].bookAuthor}</p>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-line/60 text-xs">
                    <Link to={itemPath('bookReview', bookList[0].slug)} className="text-accent-text font-semibold hover:underline">
                      Read Review →
                    </Link>
                  </div>
                </article>
              )}

              {/* Card 2: Signature Deep Navy Contrast Card with Book Inset */}
              {bookList[1] && (
                <article className="group flex flex-col justify-between rounded-xl bg-[#182541] dark:bg-[#111A2E] text-white p-5 shadow-xs border border-line/10 hover:border-accent/40 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded bg-[#D9A62E]/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#D9A62E]">
                        Staff Pick
                      </span>
                      <span className="text-[10px] text-white/50">Must Read</span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-white line-clamp-2 group-hover:text-[#F3E6BE]">
                      <Link to={itemPath('bookReview', bookList[1].slug)}>{bookList[1].title}</Link>
                    </h3>

                    {bookList[1].excerpt && (
                      <p className="mt-2 text-xs text-white/70 line-clamp-3 leading-relaxed">
                        {bookList[1].excerpt}
                      </p>
                    )}

                    {bookList[1].image && (
                      <div className="mt-4 aspect-[4/3] rounded-md overflow-hidden bg-black/30 border border-white/10">
                        <Link to={itemPath('bookReview', bookList[1].slug)}>
                          <Img
                            image={bookList[1].image}
                            alt={bookList[1].title}
                            thumb
                            wrapperClassName="w-full h-full"
                            className="transition-transform duration-500 group-hover:scale-105"
                          />
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                    <span>{bookList[1].bookAuthor || 'Literature'}</span>
                    <Link to={itemPath('bookReview', bookList[1].slug)} className="text-[#D9A62E] font-semibold hover:underline">
                      Review →
                    </Link>
                  </div>
                </article>
              )}

              {/* Card 3: Featured Seminary Recommendation */}
              {featuredSeminary && (
                <article className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-5 shadow-xs transition-all hover:border-accent">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-text border border-line">
                        Theological Seminary
                      </span>
                      <span className="text-[10px] text-muted">{featuredSeminary.established || 'India'}</span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-ink group-hover:text-accent-text transition-colors">
                      <Link to={`/seminaries/${featuredSeminary.slug}`}>{featuredSeminary.title}</Link>
                    </h3>

                    <p className="mt-1 text-xs text-accent-text font-medium">{featuredSeminary.location}</p>

                    <p className="mt-2 text-xs text-body line-clamp-3 leading-relaxed">
                      {featuredSeminary.description}
                    </p>

                    {featuredSeminary.focusAreas && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {featuredSeminary.focusAreas.slice(0, 2).map((area) => (
                          <span key={area} className="rounded bg-surface-2 px-2 py-0.5 text-[10px] text-muted border border-line/50">
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                    <Link to={`/seminaries/${featuredSeminary.slug}`} className="font-semibold text-ink hover:text-accent-text">
                      Seminary Details →
                    </Link>
                    <a
                      href={featuredSeminary.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-ink inline-flex items-center gap-1"
                    >
                      <ExternalLinkIcon size={12} />
                    </a>
                  </div>
                </article>
              )}

              {/* Card 4: Featured Christian Bookstore */}
              {featuredBookstore && (
                <article className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-5 shadow-xs transition-all hover:border-accent">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-text border border-line">
                        Bookstore & Literature
                      </span>
                      <span className="text-[10px] text-muted">India Delivery</span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-ink group-hover:text-accent-text transition-colors">
                      <Link to={`/bookstores/${featuredBookstore.slug}`}>{featuredBookstore.title}</Link>
                    </h3>

                    <p className="mt-1 text-xs text-muted">{featuredBookstore.subtitle}</p>

                    <p className="mt-2 text-xs text-body line-clamp-3 leading-relaxed">
                      {featuredBookstore.description}
                    </p>

                    {featuredBookstore.focusAreas && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {featuredBookstore.focusAreas.slice(0, 2).map((area) => (
                          <span key={area} className="rounded bg-surface-2 px-2 py-0.5 text-[10px] text-muted border border-line/50">
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                    <Link to={`/bookstores/${featuredBookstore.slug}`} className="font-semibold text-ink hover:text-accent-text">
                      View Bookstore →
                    </Link>
                    <a
                      href={featuredBookstore.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-ink inline-flex items-center gap-1"
                    >
                      <ExternalLinkIcon size={12} />
                    </a>
                  </div>
                </article>
              )}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* SECTION 6: TEACHING SERIES & THEOLOGICAL TOPICS DIRECTORY    */}
        {/* ------------------------------------------------------------ */}
        <section className="py-12 bg-surface">
          <div className="container-page max-w-[1400px]">
            <div className="flex items-center justify-between pb-4 mb-8 border-b border-line/80">
              <div>
                <h2 className="font-serif text-2xl lg:text-3xl font-black uppercase tracking-[0.06em] text-ink">
                  Teaching Series & Core Topics
                </h2>
                <p className="text-xs text-muted mt-0.5">Explore systematic doctrinal studies and topical indexes</p>
              </div>
              <Link
                to="/series"
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:border-accent hover:text-accent-text transition shadow-xs"
              >
                ( All Series → )
              </Link>
            </div>

            {/* Teaching Series Row */}
            {seriesList && seriesList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {seriesList.slice(0, 3).map((series) => (
                  <SeriesCard key={series.term.id} series={series} />
                ))}
              </div>
            )}

            {/* 10 Theological Topic Pills / Broadsheet Index */}
            <div className="rounded-xl border border-line/80 bg-surface-2/40 p-6">
              <h3 className="font-serif text-sm font-bold uppercase tracking-[0.14em] text-accent-text mb-4">
                Explore by Theological Subject
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { name: 'Biblical Studies', count: 'Exposition' },
                  { name: 'Church Leadership', count: 'Pastoral' },
                  { name: 'Discipleship', count: 'Christian Life' },
                  { name: 'Systematic Theology', count: 'Doctrine' },
                  { name: 'Missions & Church Planting', count: 'Evangelism' },
                  { name: 'Marriage & Family', count: 'Sanctification' },
                  { name: 'Youth Ministry', count: 'Next Gen' },
                  { name: 'Pastoral Ministry', count: 'Shepherding' },
                  { name: 'Church History', count: 'Heritage' },
                  { name: 'Christian Living', count: 'Practical' },
                ].map((topic) => (
                  <Link
                    key={topic.name}
                    to={`/${contentTypes.article.route}?search=${encodeURIComponent(topic.name)}`}
                    className="flex flex-col justify-between rounded-md border border-line bg-surface p-3 text-xs transition-all hover:border-accent hover:shadow-xs group"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-accent-text mb-0.5">
                      {topic.count}
                    </span>
                    <span className="font-serif text-sm font-bold text-ink group-hover:text-accent-text transition-colors">
                      {topic.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
