import { adminDb } from '../storage';
import type { AuditLog } from '../types';

export const auditRepository = {
  getAll(limit = 100): AuditLog[] {
    return adminDb.getState().auditLogs.slice(0, limit);
  },

  filter(params: { entity?: string; action?: string; limit?: number }): AuditLog[] {
    let logs = adminDb.getState().auditLogs;
    if (params.entity && params.entity !== 'all') {
      logs = logs.filter((l) => l.entity === params.entity);
    }
    if (params.action && params.action !== 'all') {
      logs = logs.filter((l) => l.action.includes(params.action!));
    }
    return logs.slice(0, params.limit || 100);
  },
};
