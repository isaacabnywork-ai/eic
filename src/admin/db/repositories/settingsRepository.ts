import { adminDb } from '../storage';
import { authRepository } from './authRepository';
import type { ApplicationSettings } from '../types';

export const settingsRepository = {
  getSettings(): ApplicationSettings {
    return adminDb.getState().settings;
  },

  updateSettings(updates: Partial<Omit<ApplicationSettings, 'updatedAt' | 'updatedBy'>>): ApplicationSettings {
    const session = authRepository.getCurrentSession();
    const current = adminDb.getState().settings;
    const updated: ApplicationSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: session?.user.email || 'admin@equipindianchurches.com',
    };

    adminDb.update('settings', () => updated);
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'settings.update',
      entity: 'settings',
      details: updates,
    });

    return updated;
  },
};
