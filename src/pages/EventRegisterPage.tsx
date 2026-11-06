import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formRepository } from '@/admin/db/repositories/formRepository';
import { eventRepository } from '@/admin/db/repositories/eventRepository';
import { taxonomyRepository } from '@/admin/db/repositories/taxonomyRepository';
import { adminDb } from '@/admin/db/storage';
import { usePublishedEvents } from '@/lib/publicEvents';
import { useContentItem, useContentList } from '@/hooks/queries';
import { EventRegistrationFormCard } from '@/components/forms/EventRegistrationFormCard';
import { RichContent } from '@/components/content/RichContent';
import { SeoHead } from '@/components/seo/SeoHead';
import type { EventRegistrationForm, CustomEvent, Venue, Organizer, EventCategory } from '@/admin/db/types';
import { ArrowLeft, ArrowRight, ChevronRight, AlertCircle } from 'lucide-react';

function getGoogleCalendarUrl(event: {
  title: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  description?: string;
}) {
  const start = event.startDate.replace(/-/g, '');
  const end = (event.endDate || event.startDate).replace(/-/g, '');
  const startTime = (event.startTime || '09:30').replace(/:/g, '') + '00';
  const endTime = (event.endTime || '16:30').replace(/:/g, '') + '00';

  const dates = `${start}T${startTime}/${end}T${endTime}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates,
    details: event.description || '',
    location: event.venue || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function EventRegisterPage() {
  const { formId, slug } = useParams<{ formId?: string; slug?: string }>();

  const [form, setForm] = useState<EventRegistrationForm | null>(null);
  const [matchedCustomEvent, setMatchedCustomEvent] = useState<CustomEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Reactive subscription to all custom published events
  const customEvents = usePublishedEvents();

  const loadData = () => {
    let matchedForm: EventRegistrationForm | null = null;
    let matchedEvent: CustomEvent | null = null;

    if (formId) {
      matchedForm = formRepository.getFormById(formId) || formRepository.getFormBySlug(formId);
      if (matchedForm) {
        matchedEvent = eventRepository.getById(matchedForm.eventId);
      }
    } else if (slug) {
      matchedEvent = eventRepository.getBySlug(slug);
      if (matchedEvent) {
        matchedForm = formRepository.getFormByEventId(matchedEvent.id);
      }
    }

    // Fallback: if no specific form matched, pick the first active form
    if (!matchedForm) {
      const allActive = formRepository.getAllForms({ status: 'active' });
      if (allActive.length > 0) {
        matchedForm = allActive[0];
        matchedEvent = eventRepository.getById(matchedForm.eventId);
      }
    }

    setForm(matchedForm);
    setMatchedCustomEvent(matchedEvent);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    return adminDb.subscribe(loadData);
  }, [formId, slug]);

  // Fallback to WordPress query if event is from WordPress
  const eventSlug = matchedCustomEvent?.slug || slug;
  const { data: wpEvent } = useContentItem(
    'event',
    matchedCustomEvent ? undefined : eventSlug,
  );

  // Query all events for Related / Prev / Next navigation
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
  const currentIndex = allEventList.findIndex((e) => e.slug.toLowerCase() === eventSlug?.toLowerCase());
  const prevEvent = currentIndex > 0 ? allEventList[currentIndex - 1] : allEventList[allEventList.length - 1];
  const nextEvent = currentIndex >= 0 && currentIndex < allEventList.length - 1 ? allEventList[currentIndex + 1] : allEventList[0];

  // Resolve custom entity relations
  const venue: Venue | null = useMemo(() => {
    if (!matchedCustomEvent?.venueId) return null;
    return taxonomyRepository.getVenues().find((v) => v.id === matchedCustomEvent.venueId) || null;
  }, [matchedCustomEvent?.venueId, customEvents]);

  const organizer: Organizer | null = useMemo(() => {
    if (!matchedCustomEvent?.organizerIds?.[0]) return null;
    return taxonomyRepository.getOrganizers().find((o) => o.id === matchedCustomEvent.organizerIds[0]) || null;
  }, [matchedCustomEvent?.organizerIds, customEvents]);

  const category: EventCategory | null = useMemo(() => {
    if (!matchedCustomEvent?.categoryIds?.[0]) return null;
    return taxonomyRepository.getCategories().find((c) => c.id === matchedCustomEvent.categoryIds[0]) || null;
  }, [matchedCustomEvent?.categoryIds, customEvents]);

  // Unified event representation identical to EventSingle
  const event = useMemo(() => {
    if (matchedCustomEvent) {
      const isPast = new Date(matchedCustomEvent.endDate || matchedCustomEvent.startDate).getTime() < Date.now() - 86400000;
      const customName = matchedCustomEvent.customVenueName?.trim();
      const customAddr = matchedCustomEvent.customVenueAddress?.trim();

      const venueName = customName || (!customAddr && venue ? venue.name : '');
      const venueAddress = customAddr || (!customName && venue ? venue.address : '');

      return {
        id: matchedCustomEvent.id,
        title: matchedCustomEvent.title,
        eyebrow: category?.name || 'One Day Conference',
        slug: matchedCustomEvent.slug,
        subtitle: matchedCustomEvent.shortDescription,
        description: matchedCustomEvent.fullDescription || matchedCustomEvent.shortDescription,
        featuredImage: matchedCustomEvent.featuredPosterUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&h=1600&q=80',
        startDate: matchedCustomEvent.startDate,
        endDate: matchedCustomEvent.endDate,
        startTime: matchedCustomEvent.startTime,
        endTime: matchedCustomEvent.endTime,
        isExpired: isPast,
        venueName,
        venueAddress,
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
        venueName: typeof wpEvent.meta?.venue === 'string' ? wpEvent.meta.venue : '',
        venueAddress: '',
      };
    }

    return null;
  }, [matchedCustomEvent, wpEvent, category, organizer, venue]);

  useEffect(() => {
    if (form && event) {
      document.title = `Register for ${event.title} | Equip Indian Churches`;
    } else if (form) {
      document.title = `${form.title} | ${form.eventTitle} - Equip Indian Churches`;
    } else {
      document.title = 'Event Registration | Equip Indian Churches';
    }
  }, [form, event]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#094899] border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500">Loading registration form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold font-serif text-slate-900">Registration Form Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            The registration form you are trying to access is currently unavailable, closed, or has been updated.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-lg bg-[#094899] text-white px-5 py-2.5 text-xs font-semibold hover:bg-[#073877] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Events</span>
          </Link>
        </div>
      </div>
    );
  }

  const googleCalLink = event
    ? getGoogleCalendarUrl({
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: [event.venueName, event.venueAddress].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', '),
        description: event.subtitle || event.title,
      })
    : '#';

  return (
    <>
      <SeoHead
        title={event ? `Register for ${event.title} — Equip Indian Churches` : `${form.title} — Equip Indian Churches`}
        description={event?.subtitle || `Register online for ${form.eventTitle}`}
        path={event ? `/events/${event.slug}/register` : `/register/${form.slug}`}
        image={event?.featuredImage}
      />

      <div className="bg-[#F0F6FB] dark:bg-[#070A0F] text-[#182541] dark:text-white min-h-screen py-8 sm:py-12 transition-colors">
        <div className="container-page max-w-7xl px-4 sm:px-6">
          {/* Breadcrumbs matching image 3 */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-white/60 mb-6">
            <Link to="/" className="hover:text-primary dark:hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/events" className="hover:text-primary dark:hover:text-white transition">Events</Link>
            {event && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to={`/events/${event.slug}`} className="hover:text-primary dark:hover:text-white transition truncate max-w-xs">
                  {event.title}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-white font-bold">Register</span>
          </nav>

          {/* 2-Column Responsive Layout: ~60% Left Main Content (7 cols), ~40% Right Form (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* ======================================================== */}
            {/* LEFT / MAIN COLUMN (~60%): Flyer & Rich Event Body       */}
            {/* ======================================================== */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-8">
              {event?.featuredImage && (
                <div className="overflow-hidden rounded-2xl bg-slate-950 border border-[#D0E1F0] dark:border-white/10 shadow-xl flex items-center justify-center">
                  <img
                    src={event.featuredImage}
                    alt={event.title}
                    className="w-full h-auto max-h-[920px] object-contain block mx-auto transition-transform duration-300 hover:scale-[1.01]"
                    loading="eager"
                  />
                </div>
              )}

              {/* Event Title & Content */}
              {event && (
                <div className="space-y-4 pt-2">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#094899] dark:text-sky-400 block">
                    {event.eyebrow}
                  </span>

                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#182541] dark:text-white leading-tight">
                    {event.subtitle || event.title}
                  </h1>

                  {event.subtitle && event.subtitle !== event.title && (
                    <p className="font-serif text-lg text-slate-600 dark:text-white/70 italic">
                      {event.title}
                    </p>
                  )}

                  <div className="pt-2 text-sm sm:text-base text-slate-700 dark:text-white/80 leading-relaxed space-y-4 font-sans">
                    {typeof event.description === 'string' && event.description.includes('<') ? (
                      <RichContent html={event.description} />
                    ) : (
                      event.description.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))
                    )}

                    {(event.venueName || event.venueAddress) && (
                      <div className="pt-3 font-semibold text-slate-900 dark:text-white">
                        <span>Venue: </span>
                        <span className="font-bold">{event.venueName || event.venueAddress}</span>
                        {event.venueAddress && event.venueName && event.venueAddress.trim().toLowerCase() !== event.venueName.trim().toLowerCase() && (
                          <span>, {event.venueAddress}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add to Google Calendar Box */}
              {event && (
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
              )}

              {/* Related Events Navigation */}
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
            {/* RIGHT SIDEBAR (~40%): Balanced Registration Form (5 cols) */}
            {/* ======================================================== */}
            <aside className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 w-full">
              <EventRegistrationFormCard
                form={form}
                isPreview={false}
              />
            </aside>

          </div>
        </div>
      </div>
    </>
  );
}
