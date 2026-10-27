import { adminDb } from '../storage';
import { authRepository } from './authRepository';
import type { CustomEvent, EventStatus } from '../types';

export interface EventFilterParams {
  search?: string;
  status?: EventStatus | 'all';
  categoryId?: string;
  venueId?: string;
  page?: number;
  perPage?: number;
}

export const eventRepository = {
  getAllEvents(): CustomEvent[] {
    return adminDb.getState().events;
  },

  getAll(params: EventFilterParams = {}): { items: CustomEvent[]; total: number; totalPages: number } {
    const state = adminDb.getState();
    let events = [...state.events];

    // Status filter
    if (params.status && params.status !== 'all') {
      events = events.filter((e) => e.status === params.status);
    } else {
      // By default exclude 'trash' unless specifically requested
      events = events.filter((e) => e.status !== 'trash');
    }

    // Category filter
    if (params.categoryId && params.categoryId !== 'all') {
      events = events.filter((e) => e.categoryIds.includes(params.categoryId!));
    }

    // Venue filter
    if (params.venueId && params.venueId !== 'all') {
      events = events.filter((e) => e.venueId === params.venueId);
    }

    // Search query filter (title, slug, description)
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.slug.toLowerCase().includes(q) ||
          e.shortDescription.toLowerCase().includes(q),
      );
    }

    // Sort by start date (ascending for upcoming, descending for created)
    events.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const total = events.length;
    const perPage = params.perPage || 10;
    const page = params.page || 1;
    const totalPages = Math.ceil(total / perPage) || 1;
    const startIndex = (page - 1) * perPage;
    const items = events.slice(startIndex, startIndex + perPage);

    return { items, total, totalPages };
  },

  getById(id: string): CustomEvent | null {
    const state = adminDb.getState();
    return state.events.find((e) => e.id === id) || null;
  },

  getBySlug(slug: string): CustomEvent | null {
    const state = adminDb.getState();
    const clean = slug.trim().toLowerCase();
    return state.events.find((e) => e.slug.trim().toLowerCase() === clean) || null;
  },

  create(eventData: Omit<CustomEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'createdByEmail'>): CustomEvent {
    const session = authRepository.getCurrentSession();
    const newEvent: CustomEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdById: session?.user.id || 'system',
      createdByEmail: session?.user.email || 'system@equipindianchurches.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    adminDb.update('events', (prev) => [newEvent, ...prev]);

    adminDb.logAudit({
      userId: newEvent.createdById,
      userEmail: newEvent.createdByEmail,
      action: 'event.create',
      entity: 'event',
      entityId: newEvent.id,
      entityTitle: newEvent.title,
      details: { status: newEvent.status, startDate: newEvent.startDate },
    });

    return newEvent;
  },

  update(id: string, updates: Partial<Omit<CustomEvent, 'id' | 'createdAt' | 'createdById' | 'createdByEmail'>>): CustomEvent | null {
    const state = adminDb.getState();
    const existing = state.events.find((e) => e.id === id);
    if (!existing) return null;

    const updated: CustomEvent = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    adminDb.update('events', (prev) => prev.map((e) => (e.id === id ? updated : e)));

    const session = authRepository.getCurrentSession();
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'event.update',
      entity: 'event',
      entityId: id,
      entityTitle: updated.title,
      details: updates,
    });

    return updated;
  },

  save(eventData: Partial<CustomEvent> & { title: string }): CustomEvent {
    if (eventData.id) {
      const existing = this.getById(eventData.id);
      if (existing) {
        return this.update(eventData.id, eventData) || existing;
      }
    }
    return this.create(eventData as any);
  },

  setStatus(id: string, status: EventStatus): CustomEvent | null {
    return this.update(id, { status });
  },

  duplicate(id: string): CustomEvent | null {
    const original = this.getById(id);
    if (!original) return null;

    const timestamp = Date.now().toString(36).slice(-4);
    const duplicatedData: Omit<CustomEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdById' | 'createdByEmail'> = {
      ...original,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${timestamp}`,
      status: 'draft',
    };

    const newEvent = this.create(duplicatedData);

    const session = authRepository.getCurrentSession();
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'event.duplicate',
      entity: 'event',
      entityId: newEvent.id,
      entityTitle: newEvent.title,
      details: { originalId: id },
    });

    return newEvent;
  },

  moveToTrash(id: string): boolean {
    const updated = this.setStatus(id, 'trash');
    return !!updated;
  },

  restoreFromTrash(id: string): boolean {
    const updated = this.setStatus(id, 'draft');
    return !!updated;
  },

  permanentlyDelete(id: string): boolean {
    const state = adminDb.getState();
    const existing = state.events.find((e) => e.id === id);
    if (!existing) return false;

    adminDb.update('events', (prev) => prev.filter((e) => e.id !== id));

    const session = authRepository.getCurrentSession();
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'event.permanently_delete',
      entity: 'event',
      entityId: id,
      entityTitle: existing.title,
    });

    return true;
  },

  // KPI statistics for Dashboard
  getStats(): {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
    upcoming: number;
    expired: number;
    archived: number;
    trash: number;
  } {
    const state = adminDb.getState();
    const today = new Date().toISOString().slice(0, 10);
    const all = state.events;

    let published = 0;
    let draft = 0;
    let upcoming = 0;
    let expired = 0;
    let archived = 0;
    let trash = 0;

    for (const e of all) {
      if (e.status === 'trash') {
        trash++;
        continue;
      }
      if (e.status === 'archived') archived++;
      if (e.status === 'draft') draft++;
      if (e.status === 'published') {
        published++;
        if (e.startDate >= today) {
          upcoming++;
        } else {
          expired++;
        }
      }
    }

    return {
      total: all.filter((e) => e.status !== 'trash').length,
      published,
      draft,
      scheduled: upcoming,
      upcoming,
      expired,
      archived,
      trash,
    };
  },
};
