import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContentItem, useContentList } from '@/hooks/queries';
import { SeoHead } from '@/components/seo/SeoHead';
import { RichContent } from '@/components/content/RichContent';
import { ErrorState } from '@/components/ui/States';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { eventRepository } from '@/admin/db/repositories/eventRepository';
import { taxonomyRepository } from '@/admin/db/repositories/taxonomyRepository';
import { usePublishedEvents } from '@/lib/publicEvents';
import type { CustomEvent, Venue, Organizer, EventCategory } from '@/admin/db/types';
import { 
  Calendar as CalendarIcon, 
  Clock as ClockIcon, 
  MapPin as MapPinIcon, 
  Users as UsersIcon, 
  DollarSign as CostIcon, 
  Share2, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

// Brand & Social Icons matching reference images
function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function TwitterXIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.031 2C6.518 2 2.03 6.49 2.03 12.007c0 1.956.564 3.864 1.635 5.518L2 22l4.633-1.619a9.98 9.98 0 005.398 1.563h.004c5.513 0 10.002-4.49 10.002-10.007A9.998 9.998 0 0012.031 2zm0 18.293h-.003a8.3 8.3 0 01-4.227-1.157l-.303-.18-3.14.823.837-3.059-.197-.314A8.28 8.28 0 013.725 12.01c0-4.577 3.727-8.305 8.31-8.305 2.217 0 4.301.864 5.867 2.433a8.27 8.27 0 012.428 5.875c0 4.58-3.728 8.31-8.299 8.31z" />
    </svg>
  );
}

function EmailIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return 'Upcoming Gathering';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return '';
  try {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
}

function getGoogleCalendarUrl(event: {
  title: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  description?: string;
}) {
  const cleanDate = (d: string) => d.replace(/-/g, '');
  const cleanTime = (t?: string) => (t ? t.replace(/:/g, '') + '00' : '090000');
  
  const startStr = `${cleanDate(event.startDate)}T${cleanTime(event.startTime)}`;
  const endStr = `${cleanDate(event.endDate || event.startDate)}T${cleanTime(event.endTime || '17:00')}`;
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startStr}/${endStr}`,
    details: event.description || '',
    location: event.venue || '',
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function EventSinglePage() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);

  // 1. Reactive subscription to custom published events
  const customEvents = usePublishedEvents();
  const customEvent = useMemo(() => {
    if (!slug) return null;
    const clean = slug.trim().toLowerCase();
    return customEvents.find((e) => e.slug.trim().toLowerCase() === clean) || null;
  }, [customEvents, slug]);

  // Direct DB lookup for full entity relational data
  const rawCustomEvent: CustomEvent | null = useMemo(() => {
    if (!slug) return null;
    return eventRepository.getBySlug(slug);
  }, [slug]);

  // 2. Fallback to WordPress query if not in custom database
  const { data: wpEvent, isLoading: wpLoading, isError: wpIsError, error: wpError, refetch } = useContentItem(
    'event',
    customEvent || rawCustomEvent ? undefined : slug,
  );

  // 3. Query all events for Related / Prev / Next Navigation
  const { data: allWpEvents } = useContentList('event', { perPage: 10 });
  const allEventList = useMemo(() => {
    const list: Array<{ slug: string; title: string }> = [];
    customEvents.forEach((ce) => list.push({ slug: ce.slug, title: ce.title }));
    if (allWpEvents?.items) {
      allWpEvents.items.forEach((item) => {
        if (!list.some((l) => l.slug === item.slug)) {
          list.push({ slug: item.slug, title: item.title });
        }
      });
    }
    return list;
  }, [customEvents, allWpEvents]);

  // Calculate Previous and Next event slugs
  const currentIndex = allEventList.findIndex((e) => e.slug.toLowerCase() === slug?.toLowerCase());
  const prevEvent = currentIndex > 0 ? allEventList[currentIndex - 1] : allEventList[allEventList.length - 1];
  const nextEvent = currentIndex >= 0 && currentIndex < allEventList.length - 1 ? allEventList[currentIndex + 1] : allEventList[0];

  // Resolve custom entity relations
  const venue: Venue | null = useMemo(() => {
    if (!rawCustomEvent?.venueId) return null;
    return taxonomyRepository.getVenues().find((v) => v.id === rawCustomEvent.venueId) || null;
  }, [rawCustomEvent?.venueId]);

  const organizer: Organizer | null = useMemo(() => {
    if (!rawCustomEvent?.organizerIds?.[0]) return null;
    return taxonomyRepository.getOrganizers().find((o) => o.id === rawCustomEvent.organizerIds[0]) || null;
  }, [rawCustomEvent?.organizerIds]);

  const category: EventCategory | null = useMemo(() => {
    if (!rawCustomEvent?.categoryIds?.[0]) return null;
    return taxonomyRepository.getCategories().find((c) => c.id === rawCustomEvent.categoryIds[0]) || null;
  }, [rawCustomEvent?.categoryIds]);

  // Unified event representation
  const event = useMemo(() => {
    if (customEvent && rawCustomEvent) {
      const isPast = new Date(rawCustomEvent.endDate || rawCustomEvent.startDate).getTime() < Date.now() - 86400000;
      return {
        id: rawCustomEvent.id,
        title: rawCustomEvent.title,
        eyebrow: category?.name || customEvent.badge || 'One Day Conference',
        slug: rawCustomEvent.slug,
        subtitle: rawCustomEvent.shortDescription,
        description: rawCustomEvent.fullDescription || rawCustomEvent.shortDescription,
        featuredImage: rawCustomEvent.featuredPosterUrl || customEvent.image.src,
        startDate: rawCustomEvent.startDate,
        endDate: rawCustomEvent.endDate,
        startTime: rawCustomEvent.startTime,
        endTime: rawCustomEvent.endTime,
        isExpired: isPast,
        cost: rawCustomEvent.isFree ? 'Free' : `${rawCustomEvent.currency || 'INR'}${rawCustomEvent.price ? rawCustomEvent.price.toFixed(2) : '300.00'}`,
        organizerName: organizer?.name || 'Equip Indian Churches',
        organizerBio: organizer?.description || 'Serving local churches across India through expository preaching and sound doctrine.',
        venueName: venue?.name || rawCustomEvent.customVenueName || 'Grace Salvation Nagamese Church',
        venueAddress: venue?.address || rawCustomEvent.customVenueAddress || 'Near BSF Transit camp. Half Nagarjan, Dimapur.',
        venueCity: venue?.city || 'Dimapur',
        venueState: venue?.state || 'Nagaland',
        googleMapsUrl: venue?.mapUrl,
        registrationUrl: rawCustomEvent.registrationUrl || '',
        registrationButtonLabel: rawCustomEvent.registrationButtonLabel || 'Register Now',
        registrationAvailable: rawCustomEvent.registrationAvailable && !isPast,
        schedules: rawCustomEvent.schedules || [],
        faqs: rawCustomEvent.faqs || [],
      };
    }

    if (wpEvent) {
      const eventDate = wpEvent.eventDate || wpEvent.date;
      const isPast = new Date(eventDate).getTime() < Date.now() - 86400000;
      return {
        id: String(wpEvent.id),
        title: wpEvent.title,
        eyebrow: wpEvent.terms.category?.[0]?.name || 'Equip Conference',
        slug: wpEvent.slug,
        subtitle: wpEvent.excerpt,
        description: wpEvent.html || `<p>${wpEvent.excerpt}</p>`,
        featuredImage: wpEvent.image?.src || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&h=1600&q=80',
        startDate: eventDate,
        endDate: eventDate,
        startTime: '09:30',
        endTime: '16:00',
        isExpired: isPast,
        cost: 'INR300.00',
        organizerName: 'Equip Indian Churches',
        organizerBio: 'Serving local churches across India through expository preaching and sound doctrine.',
        venueName: typeof wpEvent.meta?.venue === 'string' ? wpEvent.meta.venue : 'All India Pastors Assembly',
        venueAddress: 'National Conference Hall, New Delhi, India',
        venueCity: 'New Delhi',
        venueState: 'Delhi',
        googleMapsUrl: undefined,
        registrationUrl: typeof wpEvent.meta?.registrationUrl === 'string' ? wpEvent.meta.registrationUrl : '',
        registrationButtonLabel: 'Register for Event',
        registrationAvailable: !isPast,
        schedules: [],
        faqs: [],
      };
    }

    return null;
  }, [customEvent, rawCustomEvent, wpEvent, category, organizer, venue]);

  // Loading state
  if (wpLoading && !event) {
    return (
      <div className="container-page max-w-6xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="aspect-[3/4] max-h-[500px] w-full rounded-2xl" />
            <SkeletonText lines={8} />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error / Not Found state
  if ((wpIsError && !event) || (!event && !wpLoading)) {
    return (
      <div className="container-page max-w-2xl py-16 text-center">
        <ErrorState
          title="Event Not Found"
          error={wpError || new Error(`The event "${slug}" could not be located.`)}
          onRetry={() => void refetch()}
        />
        <div className="mt-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#182541] text-white font-bold text-sm shadow hover:bg-[#094899] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Events Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://equipindianchurches.com/events/${event.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const googleCalLink = getGoogleCalendarUrl({
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime,
    venue: `${event.venueName}, ${event.venueAddress}`,
    description: event.subtitle || event.title,
  });

  return (
    <>
      <SeoHead
        title={`${event.title} — Equip Indian Churches`}
        description={event.subtitle || `Join Equip Indian Churches for ${event.title}`}
        path={`/events/${event.slug}`}
        image={event.featuredImage}
      />

      <div className="bg-[#F0F6FB] dark:bg-[#070A0F] text-[#182541] dark:text-white min-h-screen py-8 sm:py-12 transition-colors">
        <div className="container-page max-w-6xl px-4 sm:px-6">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-white/60 mb-6">
            <Link to="/" className="hover:text-primary dark:hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/events" className="hover:text-primary dark:hover:text-white transition">Events</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-white font-bold truncate max-w-xs">{event.title}</span>
          </nav>

          {/* 2-Column Responsive Layout (Main Content + Right Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* ======================================================== */}
            {/* LEFT / MAIN COLUMN (8 cols): Flyer & Rich Event Body     */}
            {/* ======================================================== */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">

              {/* 1. Large High-Resolution Flyer Poster (Never Cut Off) */}
              <div className="overflow-hidden rounded-2xl bg-slate-950 border border-[#D0E1F0] dark:border-white/10 shadow-xl flex items-center justify-center">
                <img
                  src={event.featuredImage}
                  alt={event.title}
                  className="w-full h-auto max-h-[920px] object-contain block mx-auto transition-transform duration-300 hover:scale-[1.01]"
                  loading="eager"
                />
              </div>

              {/* 2. Event Title & Content (Matches Reference Image 3) */}
              <div className="space-y-4 pt-2">
                {/* Eyebrow / Category Tag */}
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#094899] dark:text-sky-400 block">
                  {event.eyebrow}
                </span>

                {/* Main Headline */}
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#182541] dark:text-white leading-tight">
                  {event.subtitle || event.title}
                </h1>

                {/* Subtitle if distinct */}
                {event.subtitle && event.subtitle !== event.title && (
                  <p className="font-serif text-lg text-slate-600 dark:text-white/70 italic">
                    {event.title}
                  </p>
                )}

                {/* Rich Description */}
                <div className="pt-2 text-sm sm:text-base text-slate-700 dark:text-white/80 leading-relaxed space-y-4 font-sans">
                  {typeof event.description === 'string' && event.description.includes('<') ? (
                    <RichContent html={event.description} />
                  ) : (
                    event.description.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))
                  )}

                  {/* Venue Callout Block */}
                  {event.venueName && (
                    <div className="pt-3 font-semibold text-slate-900 dark:text-white">
                      <span>Venue: </span>
                      <span className="font-bold">{event.venueName}</span>
                      {event.venueAddress && <span>, {event.venueAddress}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Add to Google Calendar Box (Matches Reference Image 3) */}
              <div className="rounded-2xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-[#182541] dark:text-white">
                    Save to your schedule
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">
                    Sync this conference directly to your personal calendar.
                  </p>
                </div>

                <a
                  href={googleCalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-[#182541] dark:text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                >
                  <span>+ Add to Google Calendar</span>
                </a>
              </div>

              {/* 5. Schedule Sessions (if present) */}
              {event.schedules.length > 0 && (
                <div className="pt-4 border-t border-[#D0E1F0] dark:border-white/10 space-y-4">
                  <h3 className="font-serif text-xl font-bold text-[#182541] dark:text-white flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-[#094899] dark:text-sky-400" />
                    <span>Schedule & Agenda</span>
                  </h3>
                  <div className="space-y-3">
                    {event.schedules.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-4 rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-xs font-bold text-[#094899] dark:text-sky-400 block mb-0.5">
                            {formatTimeDisplay(sess.startTime)} – {formatTimeDisplay(sess.endTime)}
                          </span>
                          <h4 className="font-bold text-sm text-[#182541] dark:text-white">
                            {sess.title}
                          </h4>
                          {sess.description && (
                            <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
                              {sess.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Related Events Navigation (Matches Reference Image 3) */}
              <div className="pt-8 border-t border-[#D0E1F0] dark:border-white/10">
                <div className="border-b-2 border-[#182541] dark:border-white pb-2 mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#182541] dark:text-white">
                    Related Events
                  </h2>
                </div>

                <div className="flex items-center justify-between">
                  {prevEvent ? (
                    <Link
                      to={`/events/${prevEvent.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-white hover:border-[#182541] dark:hover:border-white transition shadow-xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>PRV Event</span>
                    </Link>
                  ) : <div />}

                  {nextEvent ? (
                    <Link
                      to={`/events/${nextEvent.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-white hover:border-[#182541] dark:hover:border-white transition shadow-xs"
                    >
                      <span>NXT Event</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : <div />}
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* RIGHT SIDEBAR (4 cols): Meta Cards & Social Share        */}
            {/* Matches Reference Image 2 pixel-for-pixel                */}
            {/* ======================================================== */}
            <aside className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">

              {/* 1. Main Event Meta Information Box */}
              <div className="rounded-2xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm space-y-6">

                {/* DATE */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-[#182541] dark:text-white shrink-0 mt-0.5">
                    <CalendarIcon className="w-5 h-5 text-slate-700 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Date
                    </h3>
                    <p className="text-sm font-semibold text-slate-700 dark:text-white/90 mt-1">
                      {formatDateDisplay(event.startDate)}
                    </p>
                    {/* Expired vs Upcoming status */}
                    {event.isExpired ? (
                      <span className="inline-block mt-1 text-xs font-bold text-rose-500">
                        Expired!
                      </span>
                    ) : (
                      <span className="inline-block mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ● Upcoming
                      </span>
                    )}
                  </div>
                </div>

                {/* TIME (if available) */}
                {event.startTime && (
                  <div className="flex items-start gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-[#182541] dark:text-white shrink-0 mt-0.5">
                      <ClockIcon className="w-5 h-5 text-slate-700 dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Time
                      </h3>
                      <p className="text-sm font-semibold text-slate-700 dark:text-white/90 mt-1">
                        {formatTimeDisplay(event.startTime)}
                        {event.endTime ? ` – ${formatTimeDisplay(event.endTime)}` : ''}
                      </p>
                      <span className="text-[11px] text-slate-400 dark:text-white/50 block">
                        Indian Standard Time (IST)
                      </span>
                    </div>
                  </div>
                )}

                {/* COST */}
                <div className="flex items-start gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-[#182541] dark:text-white shrink-0 mt-0.5">
                    <CostIcon className="w-5 h-5 text-slate-700 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Cost
                    </h3>
                    <p className="text-sm font-semibold text-slate-700 dark:text-white/90 mt-1">
                      {event.cost}
                    </p>
                  </div>
                </div>

                {/* ORGANIZER */}
                <div className="flex items-start gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-[#182541] dark:text-white shrink-0 mt-0.5">
                    <UsersIcon className="w-5 h-5 text-slate-700 dark:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Organizer
                    </h3>
                    <p className="text-sm font-semibold text-slate-700 dark:text-white/90 mt-1 truncate">
                      {event.organizerName}
                    </p>

                    {/* Social Media Links for Organizer */}
                    <div className="flex items-center gap-2.5 mt-2.5 text-slate-500 dark:text-white/60">
                      <a
                        href="https://facebook.com/equipindianchurches"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#3b5998] transition p-1"
                        aria-label="Facebook"
                      >
                        <FacebookIcon className="w-4 h-4" />
                      </a>
                      <a
                        href="https://twitter.com/equipindchurches"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-black dark:hover:text-white transition p-1"
                        aria-label="X (Twitter)"
                      >
                        <TwitterXIcon className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href="https://instagram.com/equipindianchurches"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#e1306c] transition p-1"
                        aria-label="Instagram"
                      >
                        <InstagramIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* VENUE (Physical Address) */}
                {event.venueName && (
                  <div className="flex items-start gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-[#182541] dark:text-white shrink-0 mt-0.5">
                      <MapPinIcon className="w-5 h-5 text-slate-700 dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Venue
                      </h3>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">
                        {event.venueName}
                      </p>
                      {event.venueAddress && (
                        <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5 leading-relaxed">
                          {event.venueAddress}
                        </p>
                      )}
                      {event.googleMapsUrl && (
                        <a
                          href={event.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#094899] dark:text-sky-400 mt-2 hover:underline"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Primary Registration Action Button */}
                {event.registrationUrl ? (
                  <div className="pt-2">
                    <a
                      href={event.registrationUrl}
                      target={event.registrationUrl.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#094899] hover:bg-[#07397b] text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
                    >
                      <span>{event.registrationButtonLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                ) : null}

              </div>

              {/* 2. Share This Event Box (Matches Reference Image 2) */}
              <div className="rounded-2xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
                <div className="relative flex py-2 items-center mb-4">
                  <div className="flex-grow border-t border-slate-200 dark:border-white/15" />
                  <span className="flex-shrink mx-4 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-white/70">
                    Share This Event
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-white/15" />
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-center rounded-xl bg-[#3b5998] text-white hover:opacity-90 transition shadow-xs cursor-pointer"
                    aria-label="Share on Facebook"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>

                  {/* X / Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(event.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-center rounded-xl bg-[#182541] dark:bg-black text-white hover:opacity-90 transition shadow-xs cursor-pointer border border-black/20"
                    aria-label="Share on X"
                  >
                    <TwitterXIcon className="w-3.5 h-3.5" />
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(event.title + ' ' + currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-center rounded-xl bg-[#25D366] text-white hover:opacity-90 transition shadow-xs cursor-pointer"
                    aria-label="Share on WhatsApp"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent('Check out this event: ' + currentUrl)}`}
                    className="flex h-11 items-center justify-center rounded-xl bg-[#e05244] text-white hover:opacity-90 transition shadow-xs cursor-pointer"
                    aria-label="Share via Email"
                  >
                    <EmailIcon className="w-4 h-4" />
                  </a>
                </div>

                {/* Copy Link button */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 text-center">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-white/60 hover:text-primary dark:hover:text-white transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Event Link'}</span>
                  </button>
                </div>
              </div>

            </aside>

          </div>
        </div>
      </div>
    </>
  );
}
