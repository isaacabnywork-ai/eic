import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useContentList } from '@/hooks/queries';
import { dateParts } from '@/lib/format';
import { itemPath } from '@/lib/routes';
import { usePublishedEvents } from '@/lib/publicEvents';
import {
  CalendarIcon,
  MapPinIcon,
  ArrowRightIcon,
  PlayIcon,
  HeadphonesIcon,
  ImageIcon,
  MailIcon,
  ChevronRightIcon,
} from '@/components/ui/Icons';
import { MobileSectionHeader } from './MobileComponents';

export function MobileEventsView() {
  const { data: eventsData } = useContentList('event', { perPage: 12 });
  const customEvents = usePublishedEvents();
  const { data: conferenceSermons } = useContentList('sermon', { perPage: 6 });
  const { data: galleryAlbums } = useContentList('gallery', { perPage: 4 });

  const [activeCategory, setActiveCategory] = useState<'all' | 'conferences' | 'roundtables' | 'workshops'>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitted(true);
  };

  const apiEvents = eventsData?.items || [];

  // Merge custom events from admin panel first, so latest events are always shown
  const events = useMemo(() => {
    if (customEvents.length > 0) {
      const customMapped = customEvents.map((ce) => ({
        id: ce.id,
        title: ce.title,
        slug: ce.slug,
        date: ce.date,
        eventDate: ce.date,
        excerpt: ce.excerpt,
        venue: ce.venue,
        href: ce.registrationUrl,
        image: ce.image,
      }));
      return customMapped;
    }
    return apiEvents;
  }, [customEvents, apiEvents]);

  return (
    <div className="flex flex-col bg-[#F0F6FB] dark:bg-[#070A0F] text-[#182541] dark:text-white min-h-screen pb-24 md:hidden transition-colors">
      {/* 1. Full-Bleed Conference Hero Banner */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] overflow-hidden bg-black select-none">
        <img
          src="https://equipindianchurches.com/wp-content/uploads/2021/03/DSCF1061-3-1024x683-1.jpg"
          alt="All India Pastors Conference"
          className="h-full w-full object-cover object-center"
        />
        {/* Cinematic gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-[#070A0F]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute bottom-6 inset-x-0 px-5 flex flex-col justify-end text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded bg-[#182541]/80 dark:bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F0F6FB]">
              National Gathering
            </span>
            <span className="text-xs font-semibold text-white/80">All India</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-black leading-tight drop-shadow-md text-white">
            All India Pastors Conference
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-white/90 line-clamp-2 leading-relaxed max-w-sm drop-shadow">
            Gathering pastors, church planters, and leaders across India for expository preaching, sound doctrine, and pastoral fellowship.
          </p>

          <div className="mt-3.5 flex items-center gap-3">
            <a
              href="#upcoming-events"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white text-[#070A0F] px-4 py-2 text-xs font-bold shadow-md hover:bg-[#F0F6FB] transition active:scale-95"
            >
              <span>View Gatherings</span>
              <ChevronRightIcon size={14} />
            </a>
            <Link
              to="/sermons"
              className="inline-flex items-center gap-1.5 rounded-xl bg-black/40 border border-white/25 backdrop-blur-xs text-white px-4 py-2 text-xs font-semibold hover:bg-black/60 transition"
            >
              <HeadphonesIcon size={13} />
              <span>Listen to Messages</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Interactive Category Filter Chips */}
      <div id="upcoming-events" className="sticky top-14 z-30 bg-[#F0F6FB]/95 dark:bg-[#070A0F]/95 backdrop-blur-md px-4 py-3 border-b border-[#D0E1F0] dark:border-white/10 shadow-xs">
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-0.5">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'conferences', label: 'Conferences' },
            { id: 'roundtables', label: 'Pastors Roundtables' },
            { id: 'workshops', label: 'Seminars & Workshops' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#182541] text-white dark:bg-[#F0F6FB] dark:text-[#070A0F] shadow-xs'
                  : 'bg-white dark:bg-white/10 text-slate-700 dark:text-white/80 border border-[#D0E1F0] dark:border-white/10 hover:border-[#182541]/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Upcoming Events & Conferences Stream */}
      <section className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-serif text-lg font-bold tracking-tight text-[#182541] dark:text-white flex items-center gap-2">
            <CalendarIcon size={18} className="text-primary dark:text-[#F0F6FB]" />
            <span>Upcoming Gatherings & Conferences</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-white/50">
            {events.length} Listed
          </span>
        </div>

        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event: any) => {
              const { day, month, year } = dateParts(event.eventDate || event.date);
              const href = `/events/${event.slug}`;
              const venueText = event.venue || 'All India / Regional Gathering';

              return (
                <article
                  key={event.id}
                  className="group relative flex flex-col rounded-2xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-xs dark:shadow-none transition hover:border-[#182541]/40 dark:hover:border-[#F0F6FB]/50"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Date Block */}
                    <div className="flex flex-col items-center justify-center h-14 w-14 shrink-0 rounded-xl bg-[#F0F6FB] dark:bg-white/10 border border-[#D0E1F0] dark:border-white/10 text-[#182541] dark:text-white font-bold">
                      <span className="text-lg leading-none font-bold">{day}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-white/70 mt-0.5">
                        {month}
                      </span>
                    </div>

                    {/* Event Summary */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60 mb-1">
                        <MapPinIcon size={12} />
                        <span className="truncate">{venueText}</span>
                      </div>

                      <h4 className="font-serif text-base font-bold text-[#182541] dark:text-white leading-snug group-hover:text-primary dark:group-hover:text-[#F0F6FB] transition-colors">
                        <Link to={href}>{event.title}</Link>
                      </h4>
                    </div>
                  </div>

                  {event.excerpt && (
                    <p className="mt-2.5 text-xs text-slate-600 dark:text-white/75 line-clamp-2 leading-relaxed">
                      {event.excerpt}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 dark:text-white/40">
                      Year: {year}
                    </span>
                    <Link
                      to={href}
                      className="inline-flex items-center gap-1 font-bold text-[#182541] dark:text-[#F0F6FB] hover:underline"
                    >
                      <span>Event details</span>
                      <ArrowRightIcon size={13} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Evergreen Curated Conference Cards */
          <div className="space-y-4">
            {/* Card 1: Annual AIPC */}
            <article className="group relative flex flex-col rounded-2xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-xs dark:shadow-none transition hover:border-[#182541]/40">
              <div className="flex items-start gap-3.5">
                <div className="flex flex-col items-center justify-center h-14 w-14 shrink-0 rounded-xl bg-[#F0F6FB] dark:bg-white/10 border border-[#D0E1F0] dark:border-white/10 text-[#182541] dark:text-white font-bold">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-white/70">
                    Annual
                  </span>
                  <span className="text-sm font-black mt-0.5">AIPC</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60 mb-1">
                    <MapPinIcon size={12} />
                    <span>National Pastoral Assembly</span>
                  </div>

                  <h4 className="font-serif text-base font-bold text-[#182541] dark:text-white leading-snug">
                    All India Pastors Conference
                  </h4>
                </div>
              </div>

              <p className="mt-2.5 text-xs text-slate-600 dark:text-white/75 leading-relaxed">
                The flagship national conference gathering pastors, church planters, and leaders from across India for expository preaching and mutual fellowship.
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  ● Upcoming Session
                </span>
                <Link
                  to="/sermons"
                  className="inline-flex items-center gap-1 font-bold text-[#182541] dark:text-[#F0F6FB] hover:underline"
                >
                  <span>Listen to Past AIPC Sermons</span>
                  <ArrowRightIcon size={13} />
                </Link>
              </div>
            </article>

            {/* Card 2: Regional Roundtables */}
            <article className="group relative flex flex-col rounded-2xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-xs dark:shadow-none transition hover:border-[#182541]/40">
              <div className="flex items-start gap-3.5">
                <div className="flex flex-col items-center justify-center h-14 w-14 shrink-0 rounded-xl bg-[#F0F6FB] dark:bg-white/10 border border-[#D0E1F0] dark:border-white/10 text-[#182541] dark:text-white font-bold">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-white/70">
                    Regional
                  </span>
                  <span className="text-xs font-bold mt-0.5">Hubs</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60 mb-1">
                    <MapPinIcon size={12} />
                    <span>Regional Pastors Roundtables</span>
                  </div>

                  <h4 className="font-serif text-base font-bold text-[#182541] dark:text-white leading-snug">
                    Regional Fellowship & Ministry Roundtables
                  </h4>
                </div>
              </div>

              <p className="mt-2.5 text-xs text-slate-600 dark:text-white/75 leading-relaxed">
                Regional gatherings across Delhi, Bangalore, Mumbai, and Northeast India to encourage local pastors in expository preaching.
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 dark:text-white/40">
                  Regional Chapters
                </span>
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-1 font-bold text-[#182541] dark:text-[#F0F6FB] hover:underline"
                >
                  <span>View Gathering Photos</span>
                  <ArrowRightIcon size={13} />
                </Link>
              </div>
            </article>
          </div>
        )}
      </section>

      {/* 4. Past Conference Sermons & Preaching Shelf */}
      {conferenceSermons?.items && conferenceSermons.items.length > 0 && (
        <section className="mt-7">
          <MobileSectionHeader
            title="AIPC Conference Expositions"
            seeAllLink="/sermons"
          />
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {conferenceSermons.items.map((item) => (
              <Link
                key={item.id}
                to={itemPath('sermon', item.slug)}
                className="group relative w-56 shrink-0 flex flex-col snap-start select-none"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5 border border-[#D0E1F0] dark:border-white/10">
                  {item.image ? (
                    <img
                      src={item.image.src}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/40">
                      <PlayIcon size={24} />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-black/25" />
                  <div className="pointer-events-none absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs">
                    <PlayIcon size={12} className="ml-0.5" />
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                    <HeadphonesIcon size={10} />
                    <span>Conference Message</span>
                  </div>
                </div>

                <h4 className="mt-2 font-serif text-xs sm:text-sm font-bold text-[#182541] dark:text-white line-clamp-2 leading-snug group-hover:text-primary dark:group-hover:text-[#F0F6FB] transition-colors">
                  {item.title}
                </h4>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-white/50 line-clamp-1">
                  {item.speaker || 'Conference Preacher'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. Photo Gallery Preview */}
      {galleryAlbums?.items && galleryAlbums.items.length > 0 && (
        <section className="mt-7 px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-lg font-bold tracking-tight text-[#182541] dark:text-white flex items-center gap-2">
              <ImageIcon size={18} className="text-primary dark:text-[#F0F6FB]" />
              <span>Conference Moments & Memories</span>
            </h3>
            <Link
              to="/gallery"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-[#182541] dark:text-white/50 dark:hover:text-white transition-colors"
            >
              See All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {galleryAlbums.items.slice(0, 4).map((album) => (
              <Link
                key={album.id}
                to={itemPath('gallery', album.slug)}
                className="group relative overflow-hidden rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 aspect-[4/3] block"
              >
                {album.image ? (
                  <img
                    src={album.image.src}
                    alt={album.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-white/10 text-slate-400">
                    <ImageIcon size={28} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5">
                  <h5 className="font-serif text-xs font-bold text-white line-clamp-1">
                    {album.title}
                  </h5>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. Event Notification / Stay Connected Form */}
      <section className="mt-8 px-4">
        <div className="rounded-2xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-primary dark:text-[#F0F6FB] mb-2">
            <MailIcon size={18} />
            <h4 className="font-serif text-base font-bold text-[#182541] dark:text-white">
              Stay Notified on Upcoming Events
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-white/75 leading-relaxed">
            Get email announcements whenever new regional pastor roundtables, conferences, or theological seminars are scheduled in your state.
          </p>

          {newsletterSubmitted ? (
            <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 dark:border-emerald-500/40 p-3 text-center text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              ✓ You will receive notices for upcoming EIC conferences!
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="mt-3.5 space-y-2.5">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                required
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/10 px-3.5 py-2.5 text-xs text-[#182541] dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-[#182541] dark:bg-[#F0F6FB] py-2.5 text-xs font-bold text-white dark:text-[#070A0F] active:scale-98 transition shadow-xs cursor-pointer"
              >
                Notify Me of Conferences
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
