import { adminDb } from '../storage';
import { authRepository } from './authRepository';
import type { EventCategory, EventTag, Speaker, Organizer, Venue } from '../types';

export const taxonomyRepository = {
  // --- Categories ---
  getCategories(): EventCategory[] {
    return adminDb.getState().categories;
  },
  saveCategory(cat: Omit<EventCategory, 'id' | 'createdAt'> & { id?: string }): EventCategory {
    const session = authRepository.getCurrentSession();
    const isNew = !cat.id;
    const category: EventCategory = {
      ...cat,
      id: cat.id || `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: isNew ? new Date().toISOString() : (cat as EventCategory).createdAt || new Date().toISOString(),
    };

    if (isNew) {
      adminDb.update('categories', (prev) => [...prev, category]);
      adminDb.logAudit({
        userId: session?.user.id || 'system',
        userEmail: session?.user.email || 'system',
        action: 'category.create',
        entity: 'category',
        entityId: category.id,
        entityTitle: category.name,
      });
    } else {
      adminDb.update('categories', (prev) => prev.map((c) => (c.id === category.id ? category : c)));
      adminDb.logAudit({
        userId: session?.user.id || 'system',
        userEmail: session?.user.email || 'system',
        action: 'category.update',
        entity: 'category',
        entityId: category.id,
        entityTitle: category.name,
      });
    }
    return category;
  },
  deleteCategory(id: string): boolean {
    const session = authRepository.getCurrentSession();
    const existing = adminDb.getState().categories.find((c) => c.id === id);
    if (!existing) return false;

    adminDb.update('categories', (prev) => prev.filter((c) => c.id !== id));
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'category.delete',
      entity: 'category',
      entityId: id,
      entityTitle: existing.name,
    });
    return true;
  },

  // --- Tags ---
  getTags(): EventTag[] {
    return adminDb.getState().tags;
  },
  saveTag(name: string, slug?: string): EventTag {
    const session = authRepository.getCurrentSession();
    const safeSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = adminDb.getState().tags.find((t) => t.slug === safeSlug);
    if (existing) return existing;

    const newTag: EventTag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      slug: safeSlug,
      createdAt: new Date().toISOString(),
    };
    adminDb.update('tags', (prev) => [...prev, newTag]);
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'tag.create',
      entity: 'tag',
      entityId: newTag.id,
      entityTitle: newTag.name,
    });
    return newTag;
  },
  deleteTag(id: string): boolean {
    const session = authRepository.getCurrentSession();
    const existing = adminDb.getState().tags.find((t) => t.id === id);
    if (!existing) return false;

    adminDb.update('tags', (prev) => prev.filter((t) => t.id !== id));
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'tag.delete',
      entity: 'tag',
      entityId: id,
      entityTitle: existing.name,
    });
    return true;
  },

  // --- Speakers ---
  getSpeakers(): Speaker[] {
    return adminDb.getState().speakers;
  },
  saveSpeaker(data: Omit<Speaker, 'id' | 'createdAt'> & { id?: string }): Speaker {
    const session = authRepository.getCurrentSession();
    const isNew = !data.id;
    const speaker: Speaker = {
      ...data,
      id: data.id || `speaker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: isNew ? new Date().toISOString() : (data as Speaker).createdAt || new Date().toISOString(),
    };

    if (isNew) {
      adminDb.update('speakers', (prev) => [...prev, speaker]);
      adminDb.logAudit({
        userId: session?.user.id || 'system',
        userEmail: session?.user.email || 'system',
        action: 'speaker.create',
        entity: 'speaker',
        entityId: speaker.id,
        entityTitle: speaker.name,
      });
    } else {
      adminDb.update('speakers', (prev) => prev.map((s) => (s.id === speaker.id ? speaker : s)));
      adminDb.logAudit({
        userId: session?.user.id || 'system',
        userEmail: session?.user.email || 'system',
        action: 'speaker.update',
        entity: 'speaker',
        entityId: speaker.id,
        entityTitle: speaker.name,
      });
    }
    return speaker;
  },
  deleteSpeaker(id: string): boolean {
    const session = authRepository.getCurrentSession();
    const existing = adminDb.getState().speakers.find((s) => s.id === id);
    if (!existing) return false;

    adminDb.update('speakers', (prev) => prev.filter((s) => s.id !== id));
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'speaker.delete',
      entity: 'speaker',
      entityId: id,
      entityTitle: existing.name,
    });
    return true;
  },

  // --- Organizers ---
  getOrganizers(): Organizer[] {
    return adminDb.getState().organizers;
  },
  saveOrganizer(data: Omit<Organizer, 'id' | 'createdAt'> & { id?: string }): Organizer {
    const session = authRepository.getCurrentSession();
    const isNew = !data.id;
    const organizer: Organizer = {
      ...data,
      id: data.id || `org-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: isNew ? new Date().toISOString() : (data as Organizer).createdAt || new Date().toISOString(),
    };

    if (isNew) {
      adminDb.update('organizers', (prev) => [...prev, organizer]);
      adminDb.logAudit({
        userId: session?.user.id || 'system',
        userEmail: session?.user.email || 'system',
        action: 'organizer.create',
        entity: 'organizer',
        entityId: organizer.id,
        entityTitle: organizer.name,
      });
    } else {
      adminDb.update('organizers', (prev) => prev.map((o) => (o.id === organizer.id ? organizer : o)));
      adminDb.logAudit({
        userId: session?.user.id || 'system',
        userEmail: session?.user.email || 'system',
        action: 'organizer.update',
        entity: 'organizer',
        entityId: organizer.id,
        entityTitle: organizer.name,
      });
    }
    return organizer;
  },
  deleteOrganizer(id: string): boolean {
    const session = authRepository.getCurrentSession();
    const existing = adminDb.getState().organizers.find((o) => o.id === id);
    if (!existing) return false;

    adminDb.update('organizers', (prev) => prev.filter((o) => o.id !== id));
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'organizer.delete',
      entity: 'organizer',
      entityId: id,
      entityTitle: existing.name,
    });
    return true;
  },

  // --- Venues ---
  getVenues(): Venue[] {
    return adminDb.getState().venues;
  },
  saveVenue(data: Omit<Venue, 'id' | 'createdAt'> & { id?: string }): Venue {
    const session = authRepository.getCurrentSession();
    const isNew = !data.id;
    const venue: Venue = {
      ...data,
      id: data.id || `venue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: isNew ? new Date().toISOString() : (data as Venue).createdAt || new Date().toISOString(),
    };

    if (isNew) {
      adminDb.update('venues', (prev) => [...prev, venue]);
      adminDb.logAudit({
        userId: session?.user.id || 'system',
        userEmail: session?.user.email || 'system',
        action: 'venue.create',
        entity: 'venue',
        entityId: venue.id,
        entityTitle: venue.name,
      });
    } else {
      adminDb.update('venues', (prev) => prev.map((v) => (v.id === venue.id ? venue : v)));
      adminDb.logAudit({
        userId: session?.user.id || 'system',
        userEmail: session?.user.email || 'system',
        action: 'venue.update',
        entity: 'venue',
        entityId: venue.id,
        entityTitle: venue.name,
      });
    }
    return venue;
  },
  deleteVenue(id: string): boolean {
    const session = authRepository.getCurrentSession();
    const existing = adminDb.getState().venues.find((v) => v.id === id);
    if (!existing) return false;

    adminDb.update('venues', (prev) => prev.filter((v) => v.id !== id));
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'venue.delete',
      entity: 'venue',
      entityId: id,
      entityTitle: existing.name,
    });
    return true;
  },
};
