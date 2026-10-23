import { useState, useMemo } from 'react';
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
import { CardGridSkeleton, CardSkeleton } from '@/components/ui/Skeleton';
import {
  EventCard,
  SeriesCard,
} from '@/components/cards';
import { Img } from '@/components/ui/Img';
import { MobileDiscoverView } from '@/components/mobile/MobileDiscoverView';
import {
  ArrowRightIcon,
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

function PlayableSermonBlock({
  sermon,
  badgeText = 'Featured Sermon',
  eager = false,
}: {
  sermon?: ContentItem;
  badgeText?: string;
  eager?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!sermon) {
    return (
      <div className="rounded-lg border border-line bg-surface p-5 shadow-xs animate-pulse">
        <div className="aspect-video bg-surface-2 rounded-md mb-3" />
        <div className="h-4 bg-surface-2 rounded w-3/4 mb-2" />
        <div className="h-3 bg-surface-2 rounded w-1/2" />
      </div>
    );
  }

  const video = sermon.video;
  const embedUrl = video?.embedUrl;

  return (
    <article className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 sm:p-5 shadow-xs transition-all hover:border-accent">
      <div>
        {/* Playable Video Player Container (16:9) */}
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black mb-3.5 border border-line/60">
          {isPlaying && embedUrl ? (
            <div className="relative h-full w-full">
              <iframe
                src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                title={sermon.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
              />
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="absolute top-2 right-2 rounded-full bg-black/85 text-white hover:bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs border border-white/20 transition cursor-pointer z-10"
              >
                ✕ Close Player
              </button>
            </div>
          ) : (
            <div className="relative h-full w-full">
              <Img
                image={sermon.image}
                alt={sermon.title}
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                eager={eager}
              />
              <div className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/45" />

              {/* Big Interactive Play Button */}
              <button
                type="button"
                onClick={() => {
                  if (embedUrl) {
                    setIsPlaying(true);
                  }
                }}
                className="group/btn absolute inset-0 m-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-accent text-accent-ink shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent"
                aria-label={`Play sermon video: ${sermon.title}`}
              >
                <PlayIcon size={24} className="ml-1" />
              </button>

              {/* Top-left Video Badge */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white border border-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>Play Sermon</span>
              </div>

              {/* Bottom-right Speaker badge */}
              {sermon.speaker && (
                <div className="absolute bottom-2.5 right-2.5 max-w-[70%] truncate rounded-md bg-black/75 backdrop-blur-xs px-2 py-0.5 text-[11px] font-medium text-white/90">
                  {sermon.speaker}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category & Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-text">
            {badgeText}
          </span>
          {sermon.terms.videoCategory?.[0] && (
            <span className="text-[11px] font-medium text-muted">
              {sermon.terms.videoCategory[0].name}
            </span>
          )}
        </div>

        {/* Sermon Title */}
        <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug text-ink group-hover:text-accent-text transition-colors">
          <Link to={itemPath('sermon', sermon.slug)}>
            {sermon.title}
          </Link>
        </h3>

        {/* Speaker Name */}
        {sermon.speaker && (
          <p className="mt-1 text-xs font-semibold text-accent-text">
            Speaker: {sermon.speaker}
          </p>
        )}

        {/* Excerpt */}
        {sermon.excerpt && (
          <p className="mt-2 text-xs sm:text-sm text-body line-clamp-2 leading-relaxed">
            {sermon.excerpt}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs text-muted">
        <time dateTime={sermon.date}>{formatDateShort(sermon.date)}</time>
        <Link
          to={itemPath('sermon', sermon.slug)}
          className="font-semibold text-ink hover:text-accent-text inline-flex items-center gap-1 transition-colors"
        >
          <span>Listen & Details</span>
          <ArrowRightIcon size={12} />
        </Link>
      </div>
    </article>
  );
}

export function HomePage() {
  // 1. Hero / Featured Lead Article
  const { data: featuredHero, isLoading: heroLoading } = useFeatured(homeConfig.heroSource, 1);
  const heroItem = featuredHero?.[0];

  // 2. High-density Article Feed for Broadsheet Grid (fetch 14 articles)
  const { data: latestArticles, isLoading: articlesLoading } = useContentList('article', {
    perPage: 14,
  });
  const articlesList = latestArticles?.items || [];

  // 3. Featured Sermons & Media (fetch 8 for ticker and photo triplets)
  const { data: featuredSermons } = useFeatured('sermon', 8);
  const sermonsList = featuredSermons || [];
  const sideSermons = sermonsList.slice(1, 4);
  const tickerSermons = sermonsList.slice(0, 6);

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

  // Editor's Choice filter and pagination state
  const [editorFilter, setEditorFilter] = useState<'all' | 'theology' | 'pastoral' | 'sermons'>('all');
  const [editorPage, setEditorPage] = useState<number>(0);

  // Filter items for the Editor's Choice row
  const editorItems = useMemo(() => {
    let pool: ContentItem[] = [];
    if (editorFilter === 'sermons') {
      pool = sermonsList;
    } else if (editorFilter === 'pastoral' || editorFilter === 'theology') {
      pool = articlesList.filter((a) =>
        a.title.toLowerCase().includes(editorFilter) ||
        (a.terms.category && a.terms.category.some((c) => c.slug.includes(editorFilter))),
      );
    }
    if (pool.length < 3) {
      pool = articlesList.length >= 3 ? articlesList : [...articlesList, ...sermonsList];
    }
    const start = editorPage * 3;
    return pool.slice(start, start + 3);
  }, [articlesList, sermonsList, editorFilter, editorPage]);

  // Items for the 3-Column Top Resources Mosaic:
  // Left blocks (up & down) feature TWO playable sermons!
  const heroSermonTop = sermonsList[0];
  const heroSermonBottom = sermonsList[1];

  // Center column features articles / digests
  const centerCardTop = heroItem || articlesList[0];
  const centerCardBottom = articlesList[1] || articlesList[0];

  // Right column features stacked articles
  const rightStackItems = [
    articlesList[2] || articlesList[0],
    articlesList[3] || articlesList[1],
    articlesList[4] || articlesList[2],
  ].filter(Boolean);

  // Items for Latest Teaching 3-card top row
  const latestRowTop1 = articlesList[5] || articlesList[0];
  const latestRowTop2 = articlesList[6] || articlesList[1]; // Dark Accent Card
  const latestRowTop3 = articlesList[7] || articlesList[2];

  // Items for Latest Teaching 2-card bottom wide row
  const latestRowBottom1 = articlesList[8] || articlesList[0];
  const latestRowBottom2 = articlesList[9] || articlesList[1];

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
        {/* SECTION 1: TOP RESOURCES (The Iconic 3-Column Mosaic Grid)   */}
        {/* ------------------------------------------------------------ */}
        <section className="border-b border-line/80 pt-10 pb-12 bg-surface">
          <div className="container-page max-w-[1400px]">

            {/* Prominent Broadsheet Section Headline */}
            <div className="text-center mb-8 border-b border-line/80 pb-5">
              <h1 className="font-serif text-3xl lg:text-4xl xl:text-5xl font-black uppercase tracking-[0.06em] text-ink">
                Top Resources
              </h1>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent-text font-semibold">
                Sound Reformed Doctrine • Expository Sermons • Pastoral Equipping in India
              </p>
            </div>

            {heroLoading && articlesLoading ? (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-6"><CardSkeleton variant="article" /></div>
                <div className="col-span-3"><CardSkeleton variant="article" /></div>
                <div className="col-span-3"><CardSkeleton variant="article" /></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                {/* ------------------------------------------------------ */}
                {/* COLUMN 1 (LEFT, 5.5 cols): Two Playable Sermons (Up & Down) */}
                {/* ------------------------------------------------------ */}
                <div className="lg:col-span-6 xl:col-span-5 flex flex-col space-y-6 lg:border-r lg:border-line/80 lg:pr-6">
                  {/* Up Block: First Playable Sermon */}
                  <PlayableSermonBlock
                    sermon={heroSermonTop}
                    badgeText="Featured Sermon"
                    eager
                  />

                  {/* Down Block: Second Playable Sermon */}
                  <PlayableSermonBlock
                    sermon={heroSermonBottom}
                    badgeText="Conference Exposition"
                  />
                </div>

                {/* ------------------------------------------------------ */}
                {/* COLUMN 2 (CENTER, 3.5 cols): Dark Hero Card + Light Photo */}
                {/* ------------------------------------------------------ */}
                <div className="lg:col-span-3 xl:col-span-4 flex flex-col justify-between space-y-5 lg:border-r lg:border-line/80 lg:pr-6">
                  {/* Top Card: Signature Inverted Dark Accent Box */}
                  {centerCardTop && (
                    <article className="group flex flex-col justify-between rounded-md bg-[#182541] dark:bg-[#111A2E] text-white p-4 sm:p-5 shadow-sm border border-line/10 hover:border-accent/40 transition-all">
                      <div>
                        {centerCardTop.image && (
                          <div className="overflow-hidden rounded-sm mb-3.5 aspect-[16/10] bg-black/40">
                            <Link to={itemPath(centerCardTop.type, centerCardTop.slug)}>
                              <Img
                                image={centerCardTop.image}
                                alt={centerCardTop.title}
                                thumb
                                wrapperClassName="w-full h-full"
                                className="transition-transform duration-500 group-hover:scale-105"
                              />
                            </Link>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="rounded bg-[#D9A62E]/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#D9A62E]">
                            Ministry Digest
                          </span>
                          <time dateTime={centerCardTop.date} className="text-[10px] text-white/60">
                            {formatDateShort(centerCardTop.date)}
                          </time>
                        </div>
                        <h3 className="font-serif text-lg font-bold leading-snug text-white line-clamp-3 group-hover:text-[#F3E6BE] transition-colors">
                          <Link to={itemPath(centerCardTop.type, centerCardTop.slug)}>
                            {centerCardTop.title}
                          </Link>
                        </h3>
                        {centerCardTop.excerpt && (
                          <p className="mt-2 text-xs text-white/70 line-clamp-3 leading-relaxed">
                            {centerCardTop.excerpt}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                        <span className="truncate">{centerCardTop.speaker || centerCardTop.author?.name || 'Equip Indian Churches'}</span>
                        <Link to={itemPath(centerCardTop.type, centerCardTop.slug)} className="text-[#D9A62E] font-semibold hover:underline">
                          Explore →
                        </Link>
                      </div>
                    </article>
                  )}

                  {/* Bottom Card: Crisp Light Photo Box */}
                  {centerCardBottom && (
                    <article className="group flex flex-col rounded-md border border-line bg-surface p-3.5 shadow-xs transition-all hover:border-accent">
                      {centerCardBottom.image && (
                        <div className="overflow-hidden rounded-sm mb-2.5 aspect-[16/10] bg-surface-2">
                          <Link to={itemPath(centerCardBottom.type, centerCardBottom.slug)}>
                            <Img
                              image={centerCardBottom.image}
                              alt={centerCardBottom.title}
                              thumb
                              wrapperClassName="w-full h-full"
                              className="transition-transform duration-500 group-hover:scale-105"
                            />
                          </Link>
                        </div>
                      )}
                      <span className="text-[9px] font-bold uppercase tracking-wider text-accent-text block mb-1">
                        {centerCardBottom.terms.category?.[0]?.name || 'Church Leadership'}
                      </span>
                      <h3 className="font-serif text-sm font-bold leading-snug text-ink line-clamp-2 group-hover:text-accent-text transition-colors">
                        <Link to={itemPath(centerCardBottom.type, centerCardBottom.slug)}>
                          {centerCardBottom.title}
                        </Link>
                      </h3>
                      {centerCardBottom.excerpt && (
                        <p className="mt-1.5 text-xs text-body line-clamp-2 leading-relaxed">
                          {centerCardBottom.excerpt}
                        </p>
                      )}
                    </article>
                  )}
                </div>

                {/* ------------------------------------------------------ */}
                {/* COLUMN 3 (RIGHT, 3 cols): Stack of 3 Vertical Cards    */}
                {/* ------------------------------------------------------ */}
                <div className="lg:col-span-3 xl:col-span-3 flex flex-col justify-between space-y-4">
                  {rightStackItems.map((item, idx) => {
                    const isDarkThird = idx === 2;
                    if (isDarkThird) {
                      return (
                        <article
                          key={item.id}
                          className="group rounded-md bg-[#182541] dark:bg-[#111A2E] p-3.5 text-white shadow-xs border border-line/10 hover:border-accent/40 transition-all flex flex-col justify-between flex-1"
                        >
                          <div>
                            {item.image && (
                              <div className="overflow-hidden rounded-sm mb-2 aspect-[16/10] bg-black/40">
                                <Link to={itemPath(item.type, item.slug)}>
                                  <Img
                                    image={item.image}
                                    alt={item.title}
                                    thumb
                                    wrapperClassName="w-full h-full"
                                    className="transition-transform duration-500 group-hover:scale-105"
                                  />
                                </Link>
                              </div>
                            )}
                            <span className="rounded bg-[#D9A62E]/25 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#D9A62E] inline-block mb-1">
                              Special Feature
                            </span>
                            <h4 className="font-serif text-xs font-bold leading-snug text-white line-clamp-2 group-hover:text-[#F3E6BE] transition-colors">
                              <Link to={itemPath(item.type, item.slug)}>
                                {item.title}
                              </Link>
                            </h4>
                          </div>
                          <span className="mt-2 text-[10px] text-white/50 block">
                            {formatDateShort(item.date)}
                          </span>
                        </article>
                      );
                    }

                    return (
                      <article
                        key={item.id}
                        className="group flex flex-col rounded-md border border-line bg-surface p-3 shadow-xs transition-all hover:border-accent flex-1 justify-between"
                      >
                        <div>
                          {item.image && (
                            <div className="overflow-hidden rounded-sm mb-2 aspect-[16/10] bg-surface-2">
                              <Link to={itemPath(item.type, item.slug)}>
                                <Img
                                  image={item.image}
                                  alt={item.title}
                                  thumb
                                  wrapperClassName="w-full h-full"
                                  className="transition-transform duration-500 group-hover:scale-105"
                                />
                              </Link>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[9px] text-accent-text font-bold uppercase tracking-wider mb-1">
                            <span>{item.terms.category?.[0]?.name || item.type}</span>
                            <span className="text-muted font-normal lowercase">{readingTimeMinutes(item.html || item.excerpt)}m</span>
                          </div>
                          <h4 className="font-serif text-xs font-bold leading-snug text-ink line-clamp-2 group-hover:text-accent-text transition-colors">
                            <Link to={itemPath(item.type, item.slug)}>
                              {item.title}
                            </Link>
                          </h4>
                        </div>
                        <time dateTime={item.date} className="mt-2 text-[10px] text-muted">
                          {formatDateShort(item.date)}
                        </time>
                      </article>
                    );
                  })}
                </div>

              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* SECTION 2: EDITOR'S CHOICE (Signature Circular Spotlight Row)*/}
        {/* ------------------------------------------------------------ */}
        <section className="border-b border-line/80 py-12 bg-bg">
          <div className="container-page max-w-[1400px]">
            {/* Header + Category Filter Pills + Carousel Arrows */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-8 border-b border-line/80">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-2xl lg:text-3xl font-black uppercase tracking-[0.06em] text-ink">
                    Editor's Choice
                  </h2>
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-text">
                    Curated
                  </span>
                </div>

                {/* Filter Pills below title (matching reference image) */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {(
                    [
                      { id: 'all', label: 'All Resources' },
                      { id: 'theology', label: 'Theology & Doctrine' },
                      { id: 'pastoral', label: 'Pastoral Shepherding' },
                      { id: 'sermons', label: 'Expository Sermons' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setEditorFilter(f.id);
                        setEditorPage(0);
                      }}
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-all cursor-pointer ${
                        editorFilter === f.id
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
                  aria-label="Previous editor's choice"
                  onClick={() => setEditorPage((p) => Math.max(0, p - 1))}
                  disabled={editorPage === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink hover:bg-surface-2 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeftIcon size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Next editor's choice"
                  onClick={() => setEditorPage((p) => p + 1)}
                  disabled={editorItems.length < 3}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink hover:bg-surface-2 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            </div>

            {/* 3 Circular Spotlight Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {editorItems.map((item) => (
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
                        {item.terms.category?.[0]?.name || item.type}
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
                        {item.speaker || item.author?.name || 'Equip Indian Churches'}
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
        {/* SECTION 3: LATEST NEWS (3-Card Row + 2 Wide Photo Cards)     */}
        {/* ------------------------------------------------------------ */}
        <section className="border-b border-line/80 py-12 bg-surface">
          <div className="container-page max-w-[1400px]">
            {/* Header + View More Pill */}
            <div className="flex items-center justify-between pb-4 mb-8 border-b border-line/80">
              <div>
                <h2 className="font-serif text-2xl lg:text-3xl font-black uppercase tracking-[0.06em] text-ink">
                  Latest Teaching
                </h2>
                <p className="text-xs text-muted mt-0.5">Fresh biblical articles, pastoral reflections, and expositions</p>
              </div>
              <Link
                to={`/${contentTypes.article.route}`}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:border-accent hover:text-accent-text transition shadow-xs"
              >
                ( View More → )
              </Link>
            </div>

            {/* Row 1: 3 Cards Side-by-Side (Middle is Signature Deep Dark Accent Card) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Card 1: Clean Light */}
              {latestRowTop1 && (
                <article className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-5 shadow-xs transition-all hover:border-accent">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-text block mb-1">
                      {latestRowTop1.terms.category?.[0]?.name || 'Pastoral Theology'}
                    </span>
                    <h3 className="font-serif text-lg font-bold leading-snug text-ink group-hover:text-accent-text transition-colors">
                      <Link to={itemPath(latestRowTop1.type, latestRowTop1.slug)}>
                        {latestRowTop1.title}
                      </Link>
                    </h3>
                    {latestRowTop1.excerpt && (
                      <p className="mt-2.5 text-xs text-body line-clamp-3 leading-relaxed">
                        {latestRowTop1.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-line/50 flex items-center justify-between text-xs text-muted">
                    <span className="font-medium text-ink">{latestRowTop1.author?.name || 'Author'}</span>
                    <time dateTime={latestRowTop1.date}>{formatDateShort(latestRowTop1.date)}</time>
                  </div>
                </article>
              )}

              {/* Card 2: Signature Deep Dark Navy Contrast Card */}
              {latestRowTop2 && (
                <article className="group flex flex-col justify-between rounded-lg bg-[#182541] dark:bg-[#111A2E] p-5 text-white shadow-xs border border-line/10 hover:border-accent/40 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="rounded bg-[#D9A62E]/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#D9A62E]">
                        {latestRowTop2.terms.category?.[0]?.name || 'Featured Study'}
                      </span>
                      <span className="text-[10px] text-white/50">EIC Essay</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold leading-snug text-white group-hover:text-[#F3E6BE] transition-colors">
                      <Link to={itemPath(latestRowTop2.type, latestRowTop2.slug)}>
                        {latestRowTop2.title}
                      </Link>
                    </h3>
                    {latestRowTop2.excerpt && (
                      <p className="mt-2.5 text-xs text-white/70 line-clamp-3 leading-relaxed">
                        {latestRowTop2.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                    <span className="font-medium text-white">{latestRowTop2.author?.name || 'Equip Indian Churches'}</span>
                    <time dateTime={latestRowTop2.date}>{formatDateShort(latestRowTop2.date)}</time>
                  </div>
                </article>
              )}

              {/* Card 3: Clean Light */}
              {latestRowTop3 && (
                <article className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-5 shadow-xs transition-all hover:border-accent">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-text block mb-1">
                      {latestRowTop3.terms.category?.[0]?.name || 'Church Doctrine'}
                    </span>
                    <h3 className="font-serif text-lg font-bold leading-snug text-ink group-hover:text-accent-text transition-colors">
                      <Link to={itemPath(latestRowTop3.type, latestRowTop3.slug)}>
                        {latestRowTop3.title}
                      </Link>
                    </h3>
                    {latestRowTop3.excerpt && (
                      <p className="mt-2.5 text-xs text-body line-clamp-3 leading-relaxed">
                        {latestRowTop3.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-line/50 flex items-center justify-between text-xs text-muted">
                    <span className="font-medium text-ink">{latestRowTop3.author?.name || 'Author'}</span>
                    <time dateTime={latestRowTop3.date}>{formatDateShort(latestRowTop3.date)}</time>
                  </div>
                </article>
              )}
            </div>

            {/* Row 2: 2 Large Photo Cards Side-by-Side (50/50 Split) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {latestRowBottom1 && (
                <article className="group flex flex-col rounded-xl border border-line bg-surface p-5 shadow-xs transition-all hover:border-accent hover:shadow-md">
                  <div className="overflow-hidden rounded-lg aspect-[16/10] bg-surface-2 mb-4">
                    <Link to={itemPath(latestRowBottom1.type, latestRowBottom1.slug)}>
                      <Img
                        image={latestRowBottom1.image}
                        alt={latestRowBottom1.title}
                        wrapperClassName="w-full h-full"
                        className="transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-text">
                      {latestRowBottom1.terms.category?.[0]?.name || 'Biblical Study'}
                    </span>
                    <span className="text-muted">•</span>
                    <span className="text-muted">{readingTimeMinutes(latestRowBottom1.html || latestRowBottom1.excerpt)} min read</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink leading-snug group-hover:text-accent-text transition-colors">
                    <Link to={itemPath(latestRowBottom1.type, latestRowBottom1.slug)}>
                      {latestRowBottom1.title}
                    </Link>
                  </h3>
                  {latestRowBottom1.excerpt && (
                    <p className="mt-2 text-sm text-body line-clamp-2 leading-relaxed">
                      {latestRowBottom1.excerpt}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs text-muted">
                    <span className="font-semibold text-ink">{latestRowBottom1.author?.name}</span>
                    <time dateTime={latestRowBottom1.date}>{formatDateShort(latestRowBottom1.date)}</time>
                  </div>
                </article>
              )}

              {latestRowBottom2 && (
                <article className="group flex flex-col rounded-xl border border-line bg-surface p-5 shadow-xs transition-all hover:border-accent hover:shadow-md">
                  <div className="overflow-hidden rounded-lg aspect-[16/10] bg-surface-2 mb-4">
                    <Link to={itemPath(latestRowBottom2.type, latestRowBottom2.slug)}>
                      <Img
                        image={latestRowBottom2.image}
                        alt={latestRowBottom2.title}
                        wrapperClassName="w-full h-full"
                        className="transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-text">
                      {latestRowBottom2.terms.category?.[0]?.name || 'Pastoral Ministry'}
                    </span>
                    <span className="text-muted">•</span>
                    <span className="text-muted">{readingTimeMinutes(latestRowBottom2.html || latestRowBottom2.excerpt)} min read</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink leading-snug group-hover:text-accent-text transition-colors">
                    <Link to={itemPath(latestRowBottom2.type, latestRowBottom2.slug)}>
                      {latestRowBottom2.title}
                    </Link>
                  </h3>
                  {latestRowBottom2.excerpt && (
                    <p className="mt-2 text-sm text-body line-clamp-2 leading-relaxed">
                      {latestRowBottom2.excerpt}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs text-muted">
                    <span className="font-semibold text-ink">{latestRowBottom2.author?.name}</span>
                    <time dateTime={latestRowBottom2.date}>{formatDateShort(latestRowBottom2.date)}</time>
                  </div>
                </article>
              )}
            </div>
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
        {/* SECTION 6: UPCOMING EVENTS & CONFERENCES (Assemblies in India)*/}
        {/* ------------------------------------------------------------ */}
        <section className="border-b border-line/80 py-12 bg-bg">
          <div className="container-page max-w-[1400px]">
            <div className="flex items-center justify-between pb-4 mb-8 border-b border-line/80">
              <div>
                <h2 className="font-serif text-2xl lg:text-3xl font-black uppercase tracking-[0.06em] text-ink">
                  Upcoming Events & Gatherings
                </h2>
                <p className="text-xs text-muted mt-0.5">National pastors conferences, regional roundtables, and preaching workshops</p>
              </div>
              <Link
                to={`/${contentTypes.event.route}`}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:border-accent hover:text-accent-text transition shadow-xs"
              >
                ( View All Gatherings → )
              </Link>
            </div>

            {eventsLoading ? (
              <CardGridSkeleton variant="event" count={3} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events?.items && events.items.length > 0 ? (
                  events.items.map((ev) => <EventCard key={ev.id} item={ev} />)
                ) : (
                  <>
                    {/* Event 1: AIPC */}
                    <article className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-6 shadow-xs transition-all duration-300 hover:border-accent hover:shadow-md">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col items-center justify-center h-16 w-16 rounded-lg border border-line/80 bg-surface-2 text-ink font-bold">
                            <span className="text-[10px] uppercase tracking-wider text-accent-text font-semibold">Annual</span>
                            <span className="text-lg font-black leading-none mt-0.5">AIPC</span>
                          </div>
                          <span className="rounded-full bg-accent/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-text">
                            National Summit
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-text mb-1.5">
                          <MapPinIcon size={13} />
                          <span>All India Pastoral Assembly</span>
                        </div>

                        <h3 className="font-serif text-xl font-bold leading-snug text-ink group-hover:text-accent-text transition-colors">
                          <Link to="/events">All India Pastors Conference</Link>
                        </h3>

                        <p className="mt-2.5 line-clamp-3 text-sm text-body leading-relaxed">
                          Gathering pastors, elders, and church leaders from across India for faithful expository preaching, mutual encouragement, and biblical fellowship.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs">
                        <span className="text-muted font-medium">Equipping Local Pastors</span>
                        <Link
                          to="/events"
                          className="inline-flex items-center gap-1 font-semibold text-ink hover:text-accent-text transition-colors"
                        >
                          <span>Conference Details</span>
                          <ArrowRightIcon size={13} />
                        </Link>
                      </div>
                    </article>

                    {/* Event 2: Regional Roundtables */}
                    <article className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-6 shadow-xs transition-all duration-300 hover:border-accent hover:shadow-md">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col items-center justify-center h-16 w-16 rounded-lg border border-line/80 bg-surface-2 text-ink font-bold">
                            <span className="text-[10px] uppercase tracking-wider text-accent-text font-semibold">Regional</span>
                            <span className="text-sm font-bold leading-none mt-0.5">Hubs</span>
                          </div>
                          <span className="rounded-full bg-surface-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted border border-line/60">
                            Fellowship
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-text mb-1.5">
                          <MapPinIcon size={13} />
                          <span>Delhi • Bangalore • Mumbai • Northeast</span>
                        </div>

                        <h3 className="font-serif text-xl font-bold leading-snug text-ink group-hover:text-accent-text transition-colors">
                          <Link to="/events">Regional Pastors Roundtables</Link>
                        </h3>

                        <p className="mt-2.5 line-clamp-3 text-sm text-body leading-relaxed">
                          Regional ministerial fellowships and roundtables connecting local church shepherds for prayer, theological study, and mutual accountability.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs">
                        <span className="text-muted font-medium">Regional Gatherings</span>
                        <Link
                          to="/events"
                          className="inline-flex items-center gap-1 font-semibold text-ink hover:text-accent-text transition-colors"
                        >
                          <span>Learn More</span>
                          <ArrowRightIcon size={13} />
                        </Link>
                      </div>
                    </article>

                    {/* Event 3: Preaching Seminars */}
                    <article className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-6 shadow-xs transition-all duration-300 hover:border-accent hover:shadow-md">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col items-center justify-center h-16 w-16 rounded-lg border border-line/80 bg-surface-2 text-ink font-bold">
                            <span className="text-[10px] uppercase tracking-wider text-accent-text font-semibold">Training</span>
                            <span className="text-sm font-bold leading-none mt-0.5">Seminars</span>
                          </div>
                          <span className="rounded-full bg-surface-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted border border-line/60">
                            Training
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-text mb-1.5">
                          <MapPinIcon size={13} />
                          <span>Preaching & Shepherding</span>
                        </div>

                        <h3 className="font-serif text-xl font-bold leading-snug text-ink group-hover:text-accent-text transition-colors">
                          <Link to="/events">Expository Preaching Workshops</Link>
                        </h3>

                        <p className="mt-2.5 line-clamp-3 text-sm text-body leading-relaxed">
                          Intensive hands-on preaching seminars equipping preachers to faithfully handle, study, and expound God's Word in local church pulpits.
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs">
                        <span className="text-muted font-medium">Workshops</span>
                        <Link
                          to="/events"
                          className="inline-flex items-center gap-1 font-semibold text-ink hover:text-accent-text transition-colors"
                        >
                          <span>View Workshops</span>
                          <ArrowRightIcon size={13} />
                        </Link>
                      </div>
                    </article>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* SECTION 7: TEACHING SERIES & THEOLOGICAL TOPICS DIRECTORY    */}
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
