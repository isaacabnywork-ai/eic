import {
  SEED_ADMIN_USERS,
  SEED_CATEGORIES,
  SEED_TAGS,
  SEED_VENUES,
  SEED_SPEAKERS,
  SEED_ORGANIZERS,
  SEED_EVENTS,
  SEED_HEADER_MENU,
  SEED_FOOTER_MENU,
  SEED_SETTINGS,
  SEED_MEDIA,
  SEED_AUDIT_LOGS,
} from './seed';
import type {
  AdminUser,
  CustomEvent,
  EventCategory,
  EventTag,
  Speaker,
  Organizer,
  Venue,
  CustomMenuConfig,
  CustomFooterMenuConfig,
  ApplicationSettings,
  MediaRecord,
  AuditLog,
} from './types';

const STORAGE_PREFIX = 'eic_admin_v1_';

export interface AdminDatabaseState {
  users: AdminUser[];
  events: CustomEvent[];
  categories: EventCategory[];
  tags: EventTag[];
  speakers: Speaker[];
  organizers: Organizer[];
  venues: Venue[];
  headerMenu: CustomMenuConfig;
  footerMenu: CustomFooterMenuConfig;
  settings: ApplicationSettings;
  media: MediaRecord[];
  auditLogs: AuditLog[];
}

type Listener = () => void;

class AdminStorageEngine {
  private memoryCache: AdminDatabaseState | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.init();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error in AdminStorageEngine listener:', err);
      }
    }
  }

  private init(): AdminDatabaseState {
    if (this.memoryCache) return this.memoryCache;

    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}state`);
      if (stored) {
        const parsed = JSON.parse(stored) as AdminDatabaseState;
        // Basic schema validation check
        if (parsed.events && parsed.users && parsed.settings) {
          // Sync check: ensure 'a-day-in-the-word' has no assigned speakers
          const ditw = parsed.events.find(
            (e) => e.id === 'event-day-in-the-word' || e.slug === 'a-day-in-the-word',
          );
          if (ditw && ditw.speakerIds && ditw.speakerIds.length > 0) {
            ditw.speakerIds = [];
            if (ditw.schedules) {
              ditw.schedules.forEach((s) => {
                s.speakerIds = [];
              });
            }
            try {
              localStorage.setItem(`${STORAGE_PREFIX}state`, JSON.stringify(parsed));
            } catch {
              // Ignore localStorage write error
            }
          }

          this.memoryCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read custom admin database from localStorage, initializing fresh seed.', e);
    }

    // Default Seed State
    const freshState: AdminDatabaseState = {
      users: [...SEED_ADMIN_USERS],
      events: [...SEED_EVENTS],
      categories: [...SEED_CATEGORIES],
      tags: [...SEED_TAGS],
      speakers: [...SEED_SPEAKERS],
      organizers: [...SEED_ORGANIZERS],
      venues: [...SEED_VENUES],
      headerMenu: { ...SEED_HEADER_MENU },
      footerMenu: { ...SEED_FOOTER_MENU },
      settings: { ...SEED_SETTINGS },
      media: [...SEED_MEDIA],
      auditLogs: [...SEED_AUDIT_LOGS],
    };

    this.saveState(freshState);
    this.memoryCache = freshState;
    return freshState;
  }

  public getState(): AdminDatabaseState {
    if (!this.memoryCache) {
      return this.init();
    }
    return this.memoryCache;
  }

  public saveState(nextState: AdminDatabaseState) {
    this.memoryCache = nextState;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}state`, JSON.stringify(nextState));
    } catch (e) {
      console.error('Failed to write admin state to localStorage:', e);
    }
    this.notify();
  }

  public update<K extends keyof AdminDatabaseState>(key: K, updater: (prev: AdminDatabaseState[K]) => AdminDatabaseState[K]) {
    const current = this.getState();
    const nextVal = updater(current[key]);
    const nextState = {
      ...current,
      [key]: nextVal,
    };
    this.saveState(nextState);
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const entry: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    this.update('auditLogs', (prev) => [entry, ...prev].slice(0, 500));
  }

  public resetToSeed(): AdminDatabaseState {
    const freshState: AdminDatabaseState = {
      users: [...SEED_ADMIN_USERS],
      events: [...SEED_EVENTS],
      categories: [...SEED_CATEGORIES],
      tags: [...SEED_TAGS],
      speakers: [...SEED_SPEAKERS],
      organizers: [...SEED_ORGANIZERS],
      venues: [...SEED_VENUES],
      headerMenu: { ...SEED_HEADER_MENU },
      footerMenu: { ...SEED_FOOTER_MENU },
      settings: { ...SEED_SETTINGS },
      media: [...SEED_MEDIA],
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          userId: 'system',
          userEmail: 'system@equipindianchurches.com',
          action: 'database.reset',
          entity: 'database',
          details: { reason: 'manual_reset' },
          timestamp: new Date().toISOString(),
        },
      ],
    };
    this.saveState(freshState);
    return freshState;
  }

  public exportJson(): string {
    return JSON.stringify(this.getState(), null, 2);
  }

  public importJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as AdminDatabaseState;
      if (Array.isArray(parsed.events) && Array.isArray(parsed.users)) {
        this.saveState(parsed);
        this.logAudit({
          userId: 'system',
          userEmail: 'system@equipindianchurches.com',
          action: 'database.import',
          entity: 'database',
          details: { eventCount: parsed.events.length },
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse imported JSON database:', e);
      return false;
    }
  }
}

export const adminDb = new AdminStorageEngine();
