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
  SEED_FORMS,
  SEED_SUBMISSIONS,
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
  EventRegistrationForm,
  FormSubmission,
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
  forms: EventRegistrationForm[];
  submissions: FormSubmission[];
}

type Listener = () => void;

class AdminStorageEngine {
  private memoryCache: AdminDatabaseState | null = null;
  private listeners: Set<Listener> = new Set();
  private isPushing = false;
  private lastLocalSaveTime = 0;
  private isSyncing = false;
  private syncSetupDone = false;

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

  private setupSync() {
    if (this.syncSetupDone || typeof window === 'undefined') return;
    this.syncSetupDone = true;

    // Immediately trigger background server synchronization
    this.syncFromServer();

    // Re-synchronize when tab regains focus or visibility changes
    window.addEventListener('focus', () => {
      this.syncFromServer();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.syncFromServer();
      }
    });

    // Periodic sync poll every 30 seconds
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.syncFromServer();
      }
    }, 30000);
  }

  /**
   * Fetches latest database state from the server endpoint (/api/admin/db)
   */
  public async syncFromServer(): Promise<boolean> {
    if (typeof window === 'undefined' || this.isSyncing) return false;
    this.isSyncing = true;

    try {
      const res = await fetch('/api/admin/db', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!res.ok) return false;

      const serverState = (await res.json()) as AdminDatabaseState;
      if (serverState && Array.isArray(serverState.events) && Array.isArray(serverState.users)) {
        // Prevent race condition: don't overwrite if a local save happened in the last 3 seconds while pushing
        if (Date.now() - this.lastLocalSaveTime < 3000 && this.isPushing) {
          return false;
        }

        const currentJson = JSON.stringify(this.memoryCache);
        const serverJson = JSON.stringify(serverState);

        if (currentJson !== serverJson) {
          this.memoryCache = serverState;
          try {
            localStorage.setItem(`${STORAGE_PREFIX}state`, serverJson);
          } catch {
            // ignore localStorage quota errors
          }
          this.notify();
        }
        return true;
      }
    } catch {
      // Server down or offline; gracefully fallback to memory & localStorage
    } finally {
      this.isSyncing = false;
    }

    return false;
  }

  /**
   * Pushes the current database state to the server (/api/admin/db)
   */
  private async pushToServer(state: AdminDatabaseState): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    this.isPushing = true;
    this.lastLocalSaveTime = Date.now();

    try {
      const res = await fetch('/api/admin/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state),
      });

      return res.ok;
    } catch (err) {
      console.warn('Could not push admin changes to server, saved in local cache:', err);
      return false;
    } finally {
      this.isPushing = false;
    }
  }

  private init(): AdminDatabaseState {
    if (this.memoryCache) return this.memoryCache;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}state`);
        if (stored) {
          const parsed = JSON.parse(stored) as AdminDatabaseState;
          // Basic schema validation check
          if (parsed.events && parsed.users && parsed.settings) {
            // Auto-merge any newly added seed events (e.g. Modern Events Calendar suite)
            const existingSlugs = new Set(parsed.events.map((e) => e.slug));
            const missingSeed = SEED_EVENTS.filter((e) => !existingSlugs.has(e.slug));
            if (missingSeed.length > 0) {
              parsed.events = [...parsed.events, ...missingSeed];
            }

            // Ensure forms and submissions collections exist
            if (!parsed.forms || !Array.isArray(parsed.forms) || parsed.forms.length === 0) {
              parsed.forms = [...SEED_FORMS];
            }
            if (!parsed.submissions || !Array.isArray(parsed.submissions)) {
              parsed.submissions = [...SEED_SUBMISSIONS];
            }

            try {
              localStorage.setItem(`${STORAGE_PREFIX}state`, JSON.stringify(parsed));
            } catch {
              // ignore
            }

            this.memoryCache = parsed;
            this.setupSync();
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Could not read custom admin database from localStorage, initializing fresh seed.', e);
      }
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
      forms: [...SEED_FORMS],
      submissions: [...SEED_SUBMISSIONS],
    };

    this.memoryCache = freshState;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}state`, JSON.stringify(freshState));
      } catch {
        // ignore
      }
      this.setupSync();
    }
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
    this.lastLocalSaveTime = Date.now();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}state`, JSON.stringify(nextState));
      } catch (e) {
        console.error('Failed to write admin state to localStorage:', e);
      }
    }
    this.notify();
    this.pushToServer(nextState);
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
      forms: [...SEED_FORMS],
      submissions: [...SEED_SUBMISSIONS],
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
