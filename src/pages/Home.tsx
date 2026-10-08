import { useState } from 'react';
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
import { Section } from '@/components/ui/Section';
import { CardGridSkeleton, CardSkeleton } from '@/components/ui/Skeleton';
import {
  ArticleCard,
  BookCard,
  EventCard,
  GalleryCard,
  SeriesCard,
  VideoCard,
} from '@/components/cards';
import { Img } from '@/components/ui/Img';
import { MobileDiscoverView } from '@/components/mobile/MobileDiscoverView';
import {
  ArrowRightIcon,
  BookIcon,
  ClockIcon,
  LayersIcon,
  MicIcon,
  PlayIcon,
  StarIcon,
} from '@/components/ui/Icons';
import { itemPath } from '@/lib/routes';
import { formatDateShort } from '@/lib/format';
import { readingTimeMinutes } from '@/lib/html';

type ResourceTab = 'all' | 'articles' | 'sermons' | 'videos' | 'bookReviews';

export function HomePage() {
  const [activeTab, setActiveTab] = useState<ResourceTab>('all');

  // Hero / Featured Article
  const { data: featuredHero, isLoading: heroLoading } = useFeatured(homeConfig.heroSource, 1);
  const heroItem = featuredHero?.[0];

  // Latest Articles
  const { data: latestArticles, isLoading: articlesLoading } = useContentList('article', {
    perPage: 6,
  });

  // Featured Sermons & Videos
  const { data: featuredSermons, isLoading: sermonLoading } = useFeatured('sermon', 4);
  const { data: featuredVideos, isLoading: videoLoading } = useFeatured('video', 4);
  const primarySermon = featuredSermons?.[0];
  const sideSermons = featuredSermons?.slice(1, 4) || [];
  const primaryVideo = featuredVideos?.[0];

  // Teaching Series
  const { data: seriesList, isLoading: seriesLoading } = useSeriesCards({
    count: 3,
    hiddenSlugs: homeConfig.hiddenSeriesSlugs,
    onlySlugs: homeConfig.featuredSeriesSlugs.length ? homeConfig.featuredSeriesSlugs : undefined,
    coverType: 'article',
  });

  // Book Reviews
  const { data: books, isLoading: booksLoading } = useContentList('bookReview', {
    perPage: 4,
  });

  // Gallery preview
  const { data: galleryAlbums, isLoading: galleryLoading } = useContentList('gallery', {
    perPage: 3,
  });

  // Upcoming Events
  const { data: events, isLoading: eventsLoading } = useContentList('event', {
    perPage: 3,
  });

  // Combine items for the interactive Latest Resources tab
  const getTabItems = (): ContentItem[] => {
    if (activeTab === 'articles') return latestArticles?.items || [];
    if (activeTab === 'sermons') return featuredSermons || [];
    if (activeTab === 'videos') return featuredVideos || [];
    if (activeTab === 'bookReviews') return books?.items || [];

    // 'all' curated mix
    const mixed: ContentItem[] = [];
    if (latestArticles?.items?.[0]) mixed.push(latestArticles.items[0]);
    if (featuredSermons?.[0]) mixed.push(featuredSermons[0]);
    if (latestArticles?.items?.[1]) mixed.push(latestArticles.items[1]);
    if (featuredVideos?.[0]) mixed.push(featuredVideos[0]);
    if (books?.items?.[0]) mixed.push(books.items[0]);
    if (latestArticles?.items?.[2]) mixed.push(latestArticles.items[2]);
    return mixed;
  };

  const tabItems = getTabItems();
  const isTabLoading =
    articlesLoading || sermonLoading || videoLoading || booksLoading;

  return (
    <>
      <SeoHead title="Home" description={site.description} path="/" />

      {/* Mobile Native Streaming Experience (< md) */}
      <MobileDiscoverView />

      {/* Desktop Modern Editorial Layout (>= md) */}
      <div className="hidden md:block">
        {/* ============================================================== */}
        {/* 1. HERO SECTION: Two-column Modern Editorial                   */}
        {/* ============================================================== */}
        <section className="border-b border-line bg-bg py-16 sm:py-20 lg:py-24 transition-colors">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14 items-center">
            {/* Left Column: Editorial Messaging */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
                EQUIPPING INDIAN CHURCHES
              </p>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-bold text-ink leading-[1.08] tracking-tight">
                Equipping the Church.
                <br />
                Uniting the Saints.
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-body leading-relaxed max-w-xl">
                Sermons, videos, articles and book reviews that equip pastors and churches across India.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#explore-resources"
                  className="inline-flex items-center gap-2 rounded-[6px] bg-accent px-6 py-3.5 text-sm font-semibold text-accent-ink hover:brightness-105 transition-all shadow-xs"
                >
                  <span>Explore Resources</span>
                  <ArrowRightIcon size={16} />
                </a>
                <Link
                  to={`/${contentTypes.sermon.route}`}
                  className="inline-flex items-center gap-2 rounded-[6px] border border-line bg-surface px-6 py-3.5 text-sm font-semibold text-ink hover:bg-surface-2 transition-all shadow-xs"
                >
                  <span>Listen to Sermons</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Authentic Indian Christian Ministry Imagery */}
            <div className="lg:col-span-6 xl:col-span-5">
              <div className="group relative overflow-hidden rounded-xl border border-line bg-surface shadow-md">
                <Img
                  image={{
                    src: 'https://equipindianchurches.com/wp-content/uploads/2021/03/DSCF1061-3-1024x683-1.jpg',
                    alt: 'Indian pastors and congregation gathered at the All India Pastors Conference',
                    width: 1024,
                    height: 683,
                  }}
                  alt="Pastors gathered at the All India Pastors Conference"
                  wrapperClassName="aspect-[4/3] sm:aspect-[16/11] w-full"
                  className="transition-transform duration-700 group-hover:scale-[1.02]"
                  eager
                />
                <div className="border-t border-line/80 bg-surface/95 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs font-medium text-muted flex items-center justify-between">
                    <span>All India Pastors Conference</span>
                    <span className="text-accent-text font-semibold uppercase tracking-wider text-[11px]">
                      Equipping Local Churches
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. RESOURCE NAVIGATION ("Explore Resources")                   */}
      {/* ============================================================== */}
      <section id="explore-resources" className="border-b border-line bg-surface py-10 sm:py-14">
        <div className="container-page">
          <div className="mb-6 sm:mb-8 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
              EXPLORE RESOURCE TYPES
            </h2>
            <span className="text-xs text-muted hidden sm:inline">Sound biblical doctrine for India</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* Articles */}
            <Link
              to={`/${contentTypes.article.route}`}
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
            >
              <div className="text-accent mb-3 group-hover:scale-105 transition-transform">
                <BookIcon size={24} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink group-hover:text-accent-text transition-colors">
                  Articles
                </h3>
                <p className="mt-1 text-xs text-muted leading-snug">
                  Biblical reflections & pastoral theology
                </p>
              </div>
            </Link>

            {/* Sermons */}
            <Link
              to={`/${contentTypes.sermon.route}`}
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
            >
              <div className="text-accent mb-3 group-hover:scale-105 transition-transform">
                <MicIcon size={24} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink group-hover:text-accent-text transition-colors">
                  Sermons
                </h3>
                <p className="mt-1 text-xs text-muted leading-snug">
                  Expository pulpit preaching & expositions
                </p>
              </div>
            </Link>

            {/* Videos */}
            <Link
              to={`/${contentTypes.video.route}`}
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
            >
              <div className="text-accent mb-3 group-hover:scale-105 transition-transform">
                <PlayIcon size={24} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink group-hover:text-accent-text transition-colors">
                  Videos
                </h3>
                <p className="mt-1 text-xs text-muted leading-snug">
                  Conversations, Q&As, and discussions
                </p>
              </div>
            </Link>

            {/* Series */}
            <Link
              to="/series"
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
            >
              <div className="text-accent mb-3 group-hover:scale-105 transition-transform">
                <LayersIcon size={24} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink group-hover:text-accent-text transition-colors">
                  Series
                </h3>
                <p className="mt-1 text-xs text-muted leading-snug">
                  In-depth thematic & multi-part studies
                </p>
              </div>
            </Link>

            {/* Book Reviews */}
            <Link
              to={`/${contentTypes.bookReview.route}`}
              className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-sm col-span-2 md:col-span-1"
            >
              <div className="text-accent mb-3 group-hover:scale-105 transition-transform">
                <StarIcon size={24} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink group-hover:text-accent-text transition-colors">
                  Book Reviews
                </h3>
                <p className="mt-1 text-xs text-muted leading-snug">
                  Faithful literature guidance for readers
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. FEATURED ARTICLE: Magazine / Editorial Section              */}
      {/* ============================================================== */}
      <section className="border-b border-line bg-bg py-16 sm:py-20 lg:py-24">
        <div className="container-page">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
              FEATURED ESSAY
            </p>
            <Link
              to={`/${contentTypes.article.route}`}
              className="text-xs font-semibold uppercase tracking-wider text-ink hover:text-accent-text hover:underline"
            >
              All Articles →
            </Link>
          </div>

          {heroLoading ? (
            <div className="rounded-xl border border-line bg-surface p-8 shadow-xs">
              <CardSkeleton variant="article" />
            </div>
          ) : heroItem ? (
            <div className="rounded-xl border border-line bg-surface p-6 sm:p-10 lg:p-12 shadow-xs transition-all hover:border-ink/20">
              <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-center">
                {/* Left: Large Article Image */}
                <div className="lg:col-span-6 overflow-hidden rounded-lg">
                  <Link to={itemPath(heroItem.type, heroItem.slug)} tabIndex={-1} aria-hidden="true">
                    <Img
                      image={heroItem.image}
                      alt={heroItem.title}
                      wrapperClassName="aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/10] w-full rounded-lg"
                      className="transition-transform duration-700 hover:scale-[1.02]"
                      eager
                    />
                  </Link>
                </div>

                {/* Right: Editorial Typography */}
                <div className="lg:col-span-6 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded bg-accent/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-accent-text">
                      FEATURED ARTICLE
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {heroItem.terms.category?.[0]?.name || 'Blog Articles'}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight">
                    <Link
                      to={itemPath(heroItem.type, heroItem.slug)}
                      className="hover:text-accent-text transition-colors"
                    >
                      {heroItem.title}
                    </Link>
                  </h2>

                  {heroItem.excerpt && (
                    <p className="mt-4 text-base sm:text-lg text-body line-clamp-3 leading-relaxed">
                      {heroItem.excerpt}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted">
                    {heroItem.author && (
                      <span className="font-semibold text-ink">{heroItem.author.name}</span>
                    )}
                    <span>•</span>
                    <time dateTime={heroItem.date}>{formatDateShort(heroItem.date)}</time>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon size={13} />
                      {readingTimeMinutes(heroItem.html || heroItem.excerpt)} min read
                    </span>
                  </div>

                  <div className="mt-7">
                    <Link
                      to={itemPath(heroItem.type, heroItem.slug)}
                      className="inline-flex items-center gap-2 rounded-[6px] bg-accent px-6 py-3 text-sm font-semibold text-accent-ink hover:brightness-105 transition-all shadow-xs"
                    >
                      <span>Read Article</span>
                      <ArrowRightIcon size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. LATEST RESOURCES: Interactive Filter Tabs + 3-Col Grid       */}
      {/* ============================================================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-surface border-b border-line">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text mb-2">
                FRESH TEACHING
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-ink leading-tight">
                Latest Resources
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-line/60 pb-1 sm:border-0 sm:pb-0">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'articles', label: 'Articles' },
                  { id: 'sermons', label: 'Sermons' },
                  { id: 'videos', label: 'Videos' },
                  { id: 'bookReviews', label: 'Book Reviews' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-ink font-semibold shadow-xs'
                      : 'text-body hover:text-ink hover:bg-surface-2'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3-Column Editorial Grid */}
          {isTabLoading ? (
            <CardGridSkeleton variant="article" count={6} />
          ) : tabItems.length > 0 ? (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {tabItems.slice(0, 6).map((item) => {
                if (item.type === 'bookReview') {
                  return <BookCard key={item.id} item={item} />;
                }
                if (item.type === 'sermon' || item.type === 'video') {
                  return <VideoCard key={item.id} item={item} variant={item.type} />;
                }
                return <ArticleCard key={item.id} article={item} />;
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-surface-2/30 p-12 text-center text-muted">
              No items available in this category.
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to={`/${
                activeTab === 'sermons'
                  ? contentTypes.sermon.route
                  : activeTab === 'videos'
                    ? contentTypes.video.route
                    : activeTab === 'bookReviews'
                      ? contentTypes.bookReview.route
                      : contentTypes.article.route
              }`}
              className="inline-flex items-center gap-2 rounded-[6px] border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink hover:bg-surface-2 transition-all shadow-xs"
            >
              <span>Explore All {activeTab === 'all' ? 'Resources' : activeTab.toUpperCase()}</span>
              <ArrowRightIcon size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. SERVING THE CHURCH IN INDIA: Ministry Identity Section      */}
      {/* ============================================================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-bg border-b border-line">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14 items-center">
            {/* Left: Authentic Indian Pastors Photo */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-xl border border-line bg-surface shadow-md">
                <Img
                  image={{
                    src: 'https://equipindianchurches.com/wp-content/uploads/2021/03/DSC_0993-1-1024x685-1.jpg',
                    alt: 'Indian pastors and elders in fellowship at All India Pastors Conference',
                    width: 1024,
                    height: 685,
                  }}
                  alt="Indian pastors gathered together"
                  wrapperClassName="aspect-[4/3] w-full"
                  className="transition-transform duration-700 hover:scale-[1.02]"
                />
                <div className="border-t border-line/80 bg-surface/95 px-5 py-3.5 backdrop-blur-sm">
                  <p className="text-xs font-serif italic text-muted">
                    “Strengthening pastors with sound doctrine to shepherd the flock of God in India.”
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Ministry Calling & Key Verified Stats */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text mb-2">
                  OUR CALLING & MISSION
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-ink leading-tight">
                  Serving the Church in India
                </h2>
                <p className="mt-4 text-base sm:text-lg text-body leading-relaxed">
                  Equipping pastors, leaders and churches with faithful biblical resources for ministry in the Indian context.
                </p>
              </div>

              {/* 4 Verified Stats Grid */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="rounded-lg border border-line bg-surface p-5 shadow-xs">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-accent">
                    300+
                  </span>
                  <h4 className="font-serif text-base font-semibold text-ink mt-1">
                    Articles & Essays
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-snug">
                    Scripture-grounded pastoral writing for Indian believers.
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-surface p-5 shadow-xs">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-accent">
                    95+
                  </span>
                  <h4 className="font-serif text-base font-semibold text-ink mt-1">
                    Sermons & Expositions
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-snug">
                    Expository messages delivered to equip congregations.
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-surface p-5 shadow-xs">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-accent">
                    30+
                  </span>
                  <h4 className="font-serif text-base font-semibold text-ink mt-1">
                    Teaching Series
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-snug">
                    Systematic theological and doctrinal studies.
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-surface p-5 shadow-xs">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-accent">
                    50+
                  </span>
                  <h4 className="font-serif text-base font-semibold text-ink mt-1">
                    Pastors & Contributors
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-snug">
                    Servants of Christ contributing across regions of India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. LATEST SERMONS SECTION: 1 Large Featured + Stacked Side Cards*/}
      {/* ============================================================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-surface border-b border-line">
        <div className="container-page">
          <div className="mb-10 sm:mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text mb-2">
                EXPOSITORY PREACHING
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-ink leading-tight">
                Latest Sermons
              </h2>
              <p className="mt-2 text-base text-body">
                Gospel-centered messages expounding God's Word for local churches.
              </p>
            </div>
            <Link
              to={`/${contentTypes.sermon.route}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-accent-text transition-colors"
            >
              <span>View All Sermons</span>
              <ArrowRightIcon size={15} />
            </Link>
          </div>

          {sermonLoading ? (
            <CardGridSkeleton variant="video" count={3} />
          ) : primarySermon ? (
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Primary Large Sermon (7 cols) */}
              <div className="lg:col-span-7">
                <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xs transition-all duration-300 hover:border-ink/20 hover:shadow-md">
                  <div className="relative overflow-hidden aspect-video bg-surface-2">
                    <Link to={itemPath('sermon', primarySermon.slug)} tabIndex={-1} aria-hidden="true">
                      <Img
                        image={primarySermon.image}
                        alt={primarySermon.title}
                        wrapperClassName="h-full w-full"
                        className="transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </Link>
                    <div className="pointer-events-none absolute inset-0 bg-black/25" />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg transition-transform group-hover:scale-110">
                        <PlayIcon size={24} className="ml-1" />
                      </span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-accent-text">
                      <span>Featured Sermon</span>
                      {primarySermon.terms.videoCategory?.[0] && (
                        <>
                          <span>•</span>
                          <span>{primarySermon.terms.videoCategory[0].name}</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-snug">
                      <Link
                        to={itemPath('sermon', primarySermon.slug)}
                        className="hover:text-accent-text transition-colors"
                      >
                        {primarySermon.title}
                      </Link>
                    </h3>

                    {primarySermon.speaker && (
                      <p className="mt-2 text-sm font-medium text-body">
                        Speaker: {primarySermon.speaker}
                      </p>
                    )}

                    {primarySermon.excerpt && (
                      <p className="mt-3 text-sm sm:text-base text-body line-clamp-2 leading-relaxed">
                        {primarySermon.excerpt}
                      </p>
                    )}

                    <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-muted">
                      <time dateTime={primarySermon.date}>{formatDateShort(primarySermon.date)}</time>
                      <Link
                        to={itemPath('sermon', primarySermon.slug)}
                        className="font-semibold text-ink hover:text-accent-text"
                      >
                        Listen to Message →
                      </Link>
                    </div>
                  </div>
                </article>
              </div>

              {/* Side Stacked Sermons (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {sideSermons.map((sermon) => (
                  <article
                    key={sermon.id}
                    className="group flex gap-4 rounded-xl border border-line bg-surface p-4 shadow-xs transition-all duration-200 hover:border-ink/20 hover:shadow-sm"
                  >
                    <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-md bg-surface-2">
                      <Link to={itemPath('sermon', sermon.slug)} tabIndex={-1} aria-hidden="true">
                        <Img
                          image={sermon.image}
                          alt={sermon.title}
                          thumb
                          wrapperClassName="h-full w-full"
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                      </Link>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/90 text-accent-ink shadow">
                          <PlayIcon size={12} className="ml-0.5" />
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-serif text-base font-bold text-ink leading-snug line-clamp-2">
                          <Link to={itemPath('sermon', sermon.slug)} className="hover:text-accent-text">
                            {sermon.title}
                          </Link>
                        </h4>
                        {sermon.speaker && (
                          <p className="mt-1 text-xs text-muted font-medium truncate">
                            {sermon.speaker}
                          </p>
                        )}
                      </div>
                      <time dateTime={sermon.date} className="text-[11px] text-muted">
                        {formatDateShort(sermon.date)}
                      </time>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted">No sermons currently listed.</p>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. VIDEO SECTION (Light Blue & White)                           */}
      {/* ============================================================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-bg border-b border-line">
        <div className="container-page">
          <div className="mb-10 sm:mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text mb-2">
                FROM EQUIP INDIAN CHURCHES
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-ink leading-tight">
                Conversations. Teaching. Stories.
              </h2>
              <p className="mt-2 text-base text-body">
                Practical discussions, panel interviews, and theological Q&A for ministry life.
              </p>
            </div>
            <Link
              to={`/${contentTypes.video.route}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-accent-text transition-colors"
            >
              <span>Browse All Videos</span>
              <ArrowRightIcon size={15} />
            </Link>
          </div>

          {videoLoading ? (
            <CardGridSkeleton variant="video" count={3} />
          ) : primaryVideo ? (
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              {/* Featured Video Player Preview (7 cols) */}
              <div className="lg:col-span-7">
                <div className="group relative overflow-hidden rounded-xl border border-line bg-surface shadow-md p-2 sm:p-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-2">
                    <Link to={itemPath('video', primaryVideo.slug)} tabIndex={-1} aria-hidden="true">
                      <Img
                        image={primaryVideo.image}
                        alt={primaryVideo.title}
                        wrapperClassName="h-full w-full"
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                    <div className="pointer-events-none absolute inset-0 bg-black/25" />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg transition-transform group-hover:scale-110">
                        <PlayIcon size={26} className="ml-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Info & YouTube CTA (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                <span className="rounded bg-accent/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-text">
                  FEATURED VIDEO
                </span>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-snug">
                  <Link
                    to={itemPath('video', primaryVideo.slug)}
                    className="hover:text-accent-text transition-colors"
                  >
                    {primaryVideo.title}
                  </Link>
                </h3>

                {primaryVideo.excerpt && (
                  <p className="text-sm sm:text-base text-body leading-relaxed line-clamp-3">
                    {primaryVideo.excerpt}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    to={itemPath('video', primaryVideo.slug)}
                    className="inline-flex items-center gap-2 rounded-[6px] bg-accent px-5 py-3 text-sm font-semibold text-accent-ink hover:brightness-105 transition-all shadow-xs"
                  >
                    <span>Watch Video</span>
                    <PlayIcon size={14} />
                  </Link>
                  <a
                    href="https://www.youtube.com/@EquipIndianChurches"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[6px] border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink hover:bg-surface-2 hover:border-accent hover:text-accent-text transition-colors shadow-xs"
                  >
                    <span>Watch on YouTube →</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted">No video items currently available.</p>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. FEATURED SERIES SECTION                                     */}
      {/* ============================================================== */}
      <Section
        title="Featured Teaching Series"
        eyebrow="THEMATIC STUDIES"
        description="Follow in-depth multi-part teaching series on vital doctrines and pastoral themes."
        to="/series"
        toLabel="Explore All Series"
      >
        {seriesLoading ? (
          <CardGridSkeleton variant="series" count={3} />
        ) : seriesList && seriesList.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {seriesList.map((series) => (
              <SeriesCard key={series.term.id} series={series} />
            ))}
          </div>
        ) : (
          <p className="text-muted">No series found.</p>
        )}
      </Section>

      {/* ============================================================== */}
      {/* 9. BOOKS WORTH READING SECTION                                 */}
      {/* ============================================================== */}
      <Section
        title="Books Worth Reading"
        eyebrow="LITERATURE & REVIEWS"
        description="Helpful reviews of Christian literature to guide your personal and church library."
        to={`/${contentTypes.bookReview.route}`}
        toLabel="View All Book Reviews"
        tone="soft"
      >
        {booksLoading ? (
          <CardGridSkeleton variant="book" count={4} />
        ) : books && books.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {books.items.map((b) => (
              <BookCard key={b.id} item={b} />
            ))}
          </div>
        ) : (
          <p className="text-muted">No book reviews available at this time.</p>
        )}
      </Section>

      {/* ============================================================== */}
      {/* 10. EXPLORE BY TOPIC SECTION: Typography-Driven Grid           */}
      {/* ============================================================== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-surface border-b border-line">
        <div className="container-page">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text mb-2">
              THEOLOGICAL FOUNDATIONS
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-ink leading-tight">
              Explore by Topic
            </h2>
            <p className="mt-2 text-base text-body">
              Delve into sound doctrine and pastoral ministry practice by core theological subject.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {[
              { name: 'Biblical Studies', slug: 'biblical-studies', count: 'Exposition' },
              { name: 'Church Leadership', slug: 'church-leadership', count: 'Pastoral' },
              { name: 'Discipleship', slug: 'discipleship', count: 'Christian Life' },
              { name: 'Systematic Theology', slug: 'theology', count: 'Doctrine' },
              { name: 'Mission & Outreach', slug: 'mission', count: 'Evangelism' },
              { name: 'Marriage & Family', slug: 'family', count: 'Sanctification' },
              { name: 'Youth Ministry', slug: 'youth', count: 'Next Gen' },
              { name: 'Pastoral Ministry', slug: 'pastoral-ministry', count: 'Shepherding' },
              { name: 'Church History', slug: 'church-history', count: 'Heritage' },
              { name: 'Christian Living', slug: 'christian-living', count: 'Practical' },
            ].map((topic) => (
              <Link
                key={topic.name}
                to={`/${contentTypes.article.route}?search=${encodeURIComponent(topic.name)}`}
                className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-text block mb-1">
                    {topic.count}
                  </span>
                  <h3 className="font-serif text-base font-bold text-ink group-hover:text-accent-text transition-colors">
                    {topic.name}
                  </h3>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-muted group-hover:text-ink">
                  <span>Explore</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 11. CONFERENCE GALLERIES & UPCOMING EVENTS                     */}
      {/* ============================================================== */}
      <Section
        title="Conferences & Fellowship Galleries"
        eyebrow="COMMUNITY & GATHERINGS"
        description="Photographic memories from gospel conferences, pastoral roundtables, and workshops across India."
        to={`/${contentTypes.gallery.route}`}
        toLabel="View Full Photo Gallery"
        tone="soft"
      >
        {galleryLoading ? (
          <CardGridSkeleton variant="gallery" count={3} />
        ) : galleryAlbums && galleryAlbums.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryAlbums.items.slice(0, 3).map((alb) => (
              <GalleryCard key={alb.id} item={alb} />
            ))}
          </div>
        ) : (
          <p className="text-muted">No conference albums available.</p>
        )}
      </Section>

      {/* Upcoming Events */}
      {events && events.items.length > 0 && (
        <Section
          title="Upcoming Events & Roundtables"
          eyebrow="CONNECT & MEET"
          description="Pastoral training events, theological consultations, and local assemblies."
          to={`/${contentTypes.event.route}`}
          toLabel="All Events"
        >
          {eventsLoading ? (
            <CardGridSkeleton variant="event" count={2} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.items.map((ev) => (
                <EventCard key={ev.id} item={ev} />
              ))}
            </div>
          )}
        </Section>
      )}
      </div>
    </>
  );
}
