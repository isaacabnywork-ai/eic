import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  useContentList,
  useFeatured,
  useSeriesCards,
} from '@/hooks/queries';
import {
  MobileHeroBanner,
  MobileSectionHeader,
  MobileVideoCard,
  MobilePosterCard,
  type MobileHeroSlide,
} from './MobileComponents';
import { itemPath } from '@/lib/routes';
import { formatDateShort } from '@/lib/format';
import { Img } from '@/components/ui/Img';
import { CalendarIcon, MapPinIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { usePublishedEvents } from '@/lib/publicEvents';

export function MobileDiscoverView() {
  // 1. Featured items across all categories for the Hero Banner
  const { data: featuredArticles } = useFeatured('article', 2);
  const { data: featuredSermons } = useFeatured('sermon', 2);
  const { data: featuredVideos } = useFeatured('video', 2);

  // 2. Answers To EIC Videos (category 2268)
  const { data: answersData } = useContentList('video', {
    terms: { videoCategory: [2268] },
    perPage: 8,
  });
  const answersList = answersData?.items || [];

  // General video pool fallback for Answers To EIC
  const { data: generalVideos } = useContentList('video', { perPage: 8 });
  const videoPool = generalVideos?.items || [];

  const displayedAnswers = useMemo(() => {
    if (answersList.length >= 4) return answersList;
    if (answersList.length > 0) {
      const fill = videoPool.filter((v) => !answersList.some((a) => a.id === v.id));
      return [...answersList, ...fill].slice(0, 6);
    }
    return videoPool;
  }, [answersList, videoPool]);

  // 3. Upcoming Events & Conferences (Custom Admin Database + Live WordPress Fallback)
  const { data: eventsData } = useContentList('event', { perPage: 4 });
  const customEvents = usePublishedEvents();
  const liveEvents = eventsData?.items || [];

  const upcomingEventsList = useMemo(() => {
    const DEFAULT_EVENTS = [
      {
        id: 'upcoming-1',
        title: 'All India Pastors Conference (AIPC) 2026: Proclaiming Christ Faithfully',
        formattedDate: 'Nov 12 – 14, 2026',
        date: '2026-11-12',
        venue: 'New Delhi • National Summit',
        excerpt:
          'Gathering pastors, church planters, and elders across India for three days of rigorous expository preaching and pastoral fellowship.',
        image: {
          src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&h=600&q=80',
          alt: 'AIPC 2026',
        },
        registrationUrl: '/events',
        badge: 'National Summit',
      },
      {
        id: 'upcoming-2',
        title: 'Regional Pastors Roundtable: South India',
        formattedDate: 'Aug 22, 2026',
        date: '2026-08-22',
        venue: 'Bangalore, Karnataka',
        excerpt:
          'A focused regional assembly for church leaders in South India to address local ecclesiological challenges and mutual encouragement.',
        image: {
          src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&h=600&q=80',
          alt: 'Regional Pastors Roundtable',
        },
        registrationUrl: '/events',
        badge: 'Regional Assembly',
      },
      {
        id: 'upcoming-3',
        title: 'Expository Preaching Seminar & Workshop',
        formattedDate: 'Oct 5 – 7, 2026',
        date: '2026-10-05',
        venue: 'Mumbai, Maharashtra',
        excerpt:
          'Intensive hands-on hermeneutical training on sermon structure, faithful exegesis, and preaching Christ from all of Scripture.',
        image: {
          src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&h=600&q=80',
          alt: 'Expository Preaching Seminar',
        },
        registrationUrl: '/events',
        badge: 'Training Workshop',
      },
      {
        id: 'upcoming-4',
        title: 'Church Leaders Theological Colloquium',
        formattedDate: 'Dec 4 – 6, 2026',
        date: '2026-12-04',
        venue: 'Kolkata, West Bengal',
        excerpt:
          'Elders and pastoral teams gathering to discuss theological foundations, gospel renewal, and ministry integrity in urban centers.',
        image: {
          src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&h=600&q=80',
          alt: 'Theological Colloquium',
        },
        registrationUrl: '/events',
        badge: 'Leadership Colloquium',
      },
    ];

    if (customEvents.length > 0) {
      const mappedCustom = customEvents.map((ev) => ({
        id: ev.id,
        title: ev.title,
        formattedDate: ev.formattedDate,
        date: ev.date,
        venue: ev.venue,
        excerpt: ev.excerpt,
        image: ev.image,
        registrationUrl: ev.registrationUrl,
        badge: ev.badge,
      }));

      if (mappedCustom.length >= 4) {
        return mappedCustom.slice(0, 4);
      }
      const existingTitles = new Set(mappedCustom.map((e) => e.title.toLowerCase()));
      const fill = DEFAULT_EVENTS.filter((e) => !existingTitles.has(e.title.toLowerCase()));
      return [...mappedCustom, ...fill].slice(0, 4);
    }

    if (!liveEvents.length) return DEFAULT_EVENTS;

    const mappedLive = liveEvents.map((item) => ({
      id: item.id,
      title: item.title,
      formattedDate: item.eventDate ? formatDateShort(item.eventDate) : formatDateShort(item.date),
      date: item.eventDate || item.date,
      venue: typeof item.meta?.venue === 'string' ? item.meta.venue : 'All India / Regional Gathering',
      excerpt: item.excerpt || 'Equipping the local church in India with sound doctrine and gospel-centered ministry.',
      image: item.image || DEFAULT_EVENTS[0].image,
      registrationUrl: itemPath('event', item.slug),
      badge: 'Upcoming Event',
    }));

    const existingIds = new Set<string | number>(mappedLive.map((e) => e.id));
    const fill = DEFAULT_EVENTS.filter((e) => !existingIds.has(e.id));
    return [...mappedLive, ...fill].slice(0, 4);
  }, [liveEvents, customEvents]);

  // 4. Start a Series / Shows (2:3 Vertical Poster Cards)
  const { data: seriesList } = useSeriesCards({ count: 6, coverType: 'article' });

  // 5. Recent Articles
  const { data: articles } = useContentList('article', { perPage: 6 });

  // 6. Book Reviews
  const { data: books } = useContentList('bookReview', { perPage: 6 });

  // Multi-category advertising Hero Banner slides (Events, Sermons, Podcasts/Videos, Articles, Book Reviews)
  const heroSlides = useMemo<MobileHeroSlide[]>(() => {
    const slides: MobileHeroSlide[] = [];

    // 1. Events Slide
    const eventItem = upcomingEventsList[0];
    if (eventItem) {
      slides.push({
        id: `hero-event-${eventItem.id}`,
        category: 'Upcoming Event',
        categoryDot: 'bg-amber-400',
        badge: eventItem.badge || 'National Conference',
        title: eventItem.title,
        excerpt: eventItem.excerpt,
        image: eventItem.image,
        to: eventItem.registrationUrl,
        actionLabel: 'Register / Details',
      });
    }

    // 2. Sermons Slide
    const sermonItem = featuredSermons?.[0];
    if (sermonItem) {
      slides.push({
        id: `hero-sermon-${sermonItem.id}`,
        category: 'Expository Sermon',
        categoryDot: 'bg-red-500',
        badge: sermonItem.speaker ? `Speaker: ${sermonItem.speaker}` : 'Preaching God’s Word',
        title: sermonItem.title,
        excerpt: sermonItem.excerpt,
        image: sermonItem.image || {
          src: 'https://i.ytimg.com/vi/TbustDjFSyU/hqdefault.jpg',
          alt: sermonItem.title,
        },
        to: itemPath('sermon', sermonItem.slug),
        actionLabel: 'Watch Sermon',
      });
    }

    // 3. Podcasts & Videos Slide (Answers To EIC)
    const videoItem = answersList[0] || featuredVideos?.[0];
    if (videoItem) {
      slides.push({
        id: `hero-video-${videoItem.id}`,
        category: 'Answers To EIC',
        categoryDot: 'bg-sky-400',
        badge: 'Video & Podcast',
        title: videoItem.title,
        excerpt: videoItem.excerpt,
        image: videoItem.image || {
          src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
          alt: videoItem.title,
        },
        to: itemPath('video', videoItem.slug),
        actionLabel: 'Watch Now',
      });
    }

    // 4. Articles Slide
    const leadArticle = featuredArticles?.[0] || articles?.items?.[0];
    if (leadArticle) {
      slides.push({
        id: `hero-article-${leadArticle.id}`,
        category: 'Featured Article',
        categoryDot: 'bg-emerald-400',
        badge: leadArticle.terms.category?.[0]?.name || 'Theological Essay',
        title: leadArticle.title,
        excerpt: leadArticle.excerpt,
        image: leadArticle.image,
        to: itemPath('article', leadArticle.slug),
        actionLabel: 'Read Article',
      });
    }

    // 5. Book Reviews Slide
    const bookItem = books?.items?.[0];
    if (bookItem) {
      slides.push({
        id: `hero-book-${bookItem.id}`,
        category: 'Book Review',
        categoryDot: 'bg-purple-400',
        badge: bookItem.bookAuthor ? `By ${bookItem.bookAuthor}` : 'Staff Recommendation',
        title: bookItem.bookTitle || bookItem.title,
        excerpt:
          bookItem.excerpt ||
          'Biblical assessments and evaluations of essential theological, pastoral, and devotional books.',
        image: bookItem.image || {
          src: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
          alt: bookItem.title,
        },
        to: itemPath('bookReview', bookItem.slug),
        actionLabel: 'Read Review',
      });
    }

    return slides;
  }, [upcomingEventsList, featuredSermons, answersList, featuredVideos, featuredArticles, articles, books]);

  return (
    <div className="flex flex-col bg-[#F0F6FB] dark:bg-[#070A0F] text-[#182541] dark:text-white min-h-screen pb-24 md:hidden transition-colors">
      {/* 1. Hero Feature Banner across all categories (Events, Sermons, Videos, Articles, Books) */}
      {heroSlides.length > 0 && (
        <MobileHeroBanner slides={heroSlides} />
      )}

      {/* 2. Answers To EIC */}
      <section className="mt-4">
        <MobileSectionHeader title="Answers To EIC" seeAllLink="/videos" />
        <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
          {displayedAnswers.map((item) => (
            <MobileVideoCard key={item.id} item={item} variant="video" />
          ))}
        </div>
      </section>

      {/* 3. Upcoming Events & Conferences */}
      <section className="mt-5">
        <MobileSectionHeader title="Upcoming Events" seeAllLink="/events" />
        <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
          {upcomingEventsList.map((event) => (
            <article
              key={event.id}
              className="group w-64 shrink-0 rounded-2xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-3.5 snap-start select-none shadow-xs dark:shadow-none hover:border-[#182541]/40 dark:hover:border-[#F0F6FB]/50 transition flex flex-col justify-between"
            >
              <div>
                {/* Flyer Image Container (Portrait Rectangle like a Book / Flyer) */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-900 border border-black/10 shadow-xs">
                  <Img
                    image={event.image}
                    alt={event.title}
                    wrapperClassName="h-full w-full"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/20 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>{event.badge}</span>
                  </div>

                  {/* Bottom Date Pill */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-black/85 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white border border-white/15">
                    <CalendarIcon size={12} className="text-amber-400" />
                    <span>{event.formattedDate}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="pt-2.5">
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary dark:text-[#F0F6FB] mb-1">
                    <MapPinIcon size={11} />
                    <span className="truncate">{event.venue}</span>
                  </div>

                  <h4 className="font-serif text-sm font-bold text-[#182541] dark:text-white line-clamp-2 leading-snug group-hover:text-primary dark:group-hover:text-[#F0F6FB] transition-colors">
                    <Link to={event.registrationUrl}>{event.title}</Link>
                  </h4>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-[#D0E1F0] dark:border-white/10 flex items-center justify-between">
                <Link
                  to={event.registrationUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182541] dark:bg-white text-white dark:text-[#182541] text-xs font-bold transition shadow-xs hover:opacity-90"
                >
                  <span>Register</span>
                  <ArrowRightIcon size={10} />
                </Link>

                <Link
                  to="/events"
                  className="text-xs font-semibold text-slate-500 dark:text-white/60 hover:text-[#182541] dark:hover:text-white inline-flex items-center gap-1 transition"
                >
                  <span>All Events</span>
                  <ArrowRightIcon size={10} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Start a Series (Vertical Posters - "Start a Show") */}
      {seriesList && seriesList.length > 0 && (
        <section className="mt-5">
          <MobileSectionHeader title="Start a Series" seeAllLink="/series" />
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {seriesList.map((series) => (
              <MobilePosterCard
                key={series.term.id}
                item={{
                  id: series.term.id,
                  slug: series.term.slug,
                  title: series.term.name,
                  image: series.cover?.src,
                  count: series.term.count,
                  to: `/series/${series.term.slug}`,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Featured Articles & Publications */}
      {articles?.items && articles.items.length > 0 && (
        <section className="mt-5">
          <MobileSectionHeader title="Featured Articles" seeAllLink="/articles" />
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {articles.items.map((art) => (
              <Link
                key={art.id}
                to={itemPath('article', art.slug)}
                className="group w-64 shrink-0 rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-4 snap-start select-none transition hover:border-[#182541]/40 dark:hover:border-[#F0F6FB]/50 shadow-xs dark:shadow-none flex flex-col justify-between"
              >
                <div>
                  {art.terms.category?.[0] && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-[#F0F6FB] block mb-1">
                      {art.terms.category[0].name}
                    </span>
                  )}
                  <h4 className="font-serif text-sm font-bold text-[#182541] dark:text-white line-clamp-2 leading-snug group-hover:text-primary dark:group-hover:text-[#F0F6FB] transition-colors">
                    {art.title}
                  </h4>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-white/40 pt-2.5 border-t border-[#D0E1F0] dark:border-white/10">
                  <span>{art.date ? formatDateShort(art.date) : 'Equip Article'}</span>
                  <span className="font-semibold text-[#182541] dark:text-white/70">Read &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. Book Reviews Shelf */}
      {books?.items && books.items.length > 0 && (
        <section className="mt-5">
          <MobileSectionHeader title="Book Reviews" seeAllLink="/book-reviews" />
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {books.items.map((book) => (
              <Link
                key={book.id}
                to={itemPath('bookReview', book.slug)}
                className="group relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-lg border border-[#D0E1F0] dark:border-white/10 bg-slate-100 dark:bg-white/5 shadow snap-start select-none"
              >
                {book.image ? (
                  <img
                    src={book.image.src}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs font-serif font-bold text-white">
                    {book.title}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-2 inset-x-2">
                  <h4 className="text-[11px] font-bold text-white line-clamp-1">
                    {book.bookTitle || book.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
