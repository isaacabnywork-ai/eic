import { useState, useEffect } from 'react';
import { adminDb } from '@/admin/db/storage';
import type { CustomEvent, Venue, EventCategory } from '@/admin/db/types';
import type { ContentItem } from '@/api/types';

export interface PublicDisplayEvent {
  id: string;
  title: string;
  slug: string;
  eventUrl: string;
  formattedDate: string;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venue: string;
  venueAddress?: string;
  badge: string;
  excerpt: string;
  shortDescription?: string;
  fullDescription?: string;
  image: {
    src: string;
    alt: string;
  };
  registrationUrl: string;
  registrationButtonLabel?: string;
  isUpcoming: boolean;
  isCustom: boolean;
  isFree?: boolean;
  price?: number;
  currency?: string;
  currencySymbol?: string;
}

const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&h=1067&q=80';

function formatEventDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return 'Upcoming';
  try {
    const s = new Date(startDate);
    const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
    const sDay = s.getDate();
    const sYear = s.getFullYear();

    if (!endDate || endDate === startDate) {
      return `${sMonth} ${sDay}, ${sYear}`;
    }

    const e = new Date(endDate);
    const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
    const eDay = e.getDate();
    const eYear = e.getFullYear();

    if (sMonth === eMonth && sYear === eYear) {
      return `${sMonth} ${sDay} – ${eDay}, ${sYear}`;
    }
    return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${eYear}`;
  } catch {
    return startDate;
  }
}

export function getPublishedCustomEvents(): PublicDisplayEvent[] {
  try {
    const state = adminDb.getState();
    const published = state.events.filter((e) => e.status === 'published');
    const venuesMap = new Map<string, Venue>(state.venues.map((v) => [v.id, v]));
    const categoriesMap = new Map<string, EventCategory>(state.categories.map((c) => [c.id, c]));

    // Sort by start date (earliest/latest upcoming first)
    const sorted = [...published].sort((a, b) => {
      const timeA = new Date(a.startDate || a.createdAt).getTime();
      const timeB = new Date(b.startDate || b.createdAt).getTime();
      return timeB - timeA;
    });

    return sorted.map((ev: CustomEvent) => {
      // Resolve venue (prioritize custom venue info entered directly on the event)
      let venueLabel = '';
      let venueAddress = '';
      if (ev.customVenueName?.trim()) {
        venueLabel = ev.customVenueName.trim();
        venueAddress = ev.customVenueAddress?.trim() || '';
      } else if (ev.venueId && venuesMap.has(ev.venueId)) {
        const v = venuesMap.get(ev.venueId)!;
        venueLabel = `${v.name}, ${v.city}`;
        venueAddress = `${v.address ? v.address + ', ' : ''}${v.city}${v.state ? ', ' + v.state : ''}`;
      } else if (ev.customVenueAddress?.trim()) {
        venueAddress = ev.customVenueAddress.trim();
        venueLabel = ev.customVenueAddress.trim();
      } else {
        venueLabel = 'Equip Indian Churches Gathering';
        venueAddress = '';
      }

      // Resolve category
      let badgeLabel = 'National Assembly';
      if (ev.categoryIds && ev.categoryIds.length > 0 && categoriesMap.has(ev.categoryIds[0])) {
        badgeLabel = categoriesMap.get(ev.categoryIds[0])!.name;
      }

      const formattedDate = formatEventDateRange(ev.startDate, ev.endDate);

      return {
        id: ev.id,
        title: ev.title,
        slug: ev.slug,
        eventUrl: `/events/${ev.slug}`,
        formattedDate,
        date: ev.startDate || '2026-11-12',
        endDate: ev.endDate,
        startTime: ev.startTime,
        endTime: ev.endTime,
        venue: venueLabel,
        venueAddress,
        badge: badgeLabel,
        excerpt:
          ev.shortDescription ||
          ev.fullDescription?.slice(0, 160) ||
          'Gathering pastors, church planters, and believers across India for sound doctrine and expository preaching.',
        shortDescription: ev.shortDescription,
        fullDescription: ev.fullDescription,
        image: {
          src: ev.featuredPosterUrl || DEFAULT_EVENT_IMAGE,
          alt: ev.title,
        },
        registrationUrl: ev.registrationUrl || `/events/${ev.slug}`,
        registrationButtonLabel: ev.registrationButtonLabel || 'Register for Event',
        isUpcoming: new Date(ev.endDate || ev.startDate || '2026-11-12').getTime() >= Date.now() - 86400000,
        isCustom: true,
        isFree: ev.isFree,
        price: ev.price,
        currency: ev.currency || 'INR',
        currencySymbol: ev.currencySymbol || '₹',
      };
    });
  } catch (err) {
    console.warn('Could not read published custom events:', err);
    return [];
  }
}

/**
 * Converts custom events into standard ContentItem objects
 * for rendering in public archives and cards.
 */
export function customEventToContentItem(ev: PublicDisplayEvent): ContentItem {
  let numericId = 999900;
  for (let i = 0; i < ev.id.length; i++) {
    numericId = (numericId * 31 + ev.id.charCodeAt(i)) % 1000000;
  }

  return {
    id: numericId,
    type: 'event',
    slug: ev.slug,
    title: ev.title,
    excerpt: ev.excerpt,
    html: `<p>${ev.excerpt}</p>`,
    date: ev.date,
    modified: ev.date,
    sticky: true,
    image: ev.image,
    terms: {},
    termIds: {},
    meta: {
      registrationUrl: ev.registrationUrl,
      venue: ev.venue,
      badge: ev.badge,
      formattedDate: ev.formattedDate,
      isCustom: true,
      price: ev.price,
      isFree: ev.isFree,
      cost:
        ev.isFree || !ev.price || Number(ev.price) <= 0
          ? 'Free'
          : `${ev.currencySymbol || '₹'} ${Number(ev.price).toLocaleString('en-IN')}`,
    },
    eventDate: ev.date,
  };
}

/**
 * Reactive hook that subscribes to custom admin DB state changes
 * ensuring any event published or updated in the Admin Console instantly
 * updates the public website.
 */
export function usePublishedEvents(): PublicDisplayEvent[] {
  const [events, setEvents] = useState<PublicDisplayEvent[]>(() => getPublishedCustomEvents());

  useEffect(() => {
    const update = () => {
      setEvents(getPublishedCustomEvents());
    };
    update();
    return adminDb.subscribe(update);
  }, []);

  return events;
}
