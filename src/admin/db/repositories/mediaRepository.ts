import { adminDb } from '../storage';
import { authRepository } from './authRepository';
import type { MediaRecord } from '../types';

export const mediaRepository = {
  getAll(): MediaRecord[] {
    return adminDb.getState().media;
  },

  getById(id: string): MediaRecord | null {
    return adminDb.getState().media.find((m) => m.id === id) || null;
  },

  async uploadFile(file: File, altText?: string): Promise<MediaRecord> {
    const session = authRepository.getCurrentSession();

    // Read as Base64 Data URL for persistent local/staging storage
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read media file'));
      reader.readAsDataURL(file);
    });

    const record: MediaRecord = {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
      url: dataUrl,
      mimeType: file.type || 'image/jpeg',
      sizeBytes: file.size,
      altText: altText || file.name.replace(/\.[^/.]+$/, ''),
      uploadedById: session?.user.id || 'system',
      uploadedByEmail: session?.user.email || 'system@equipindianchurches.com',
      createdAt: new Date().toISOString(),
    };

    adminDb.update('media', (prev) => [record, ...prev]);
    adminDb.logAudit({
      userId: record.uploadedById,
      userEmail: record.uploadedByEmail,
      action: 'media.upload',
      entity: 'media',
      entityId: record.id,
      entityTitle: record.name,
      details: { sizeBytes: record.sizeBytes, mimeType: record.mimeType },
    });

    return record;
  },

  addExternalMedia(name: string, url: string, altText?: string): MediaRecord {
    const session = authRepository.getCurrentSession();
    const record: MediaRecord = {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      url,
      mimeType: 'image/jpeg',
      sizeBytes: 0,
      altText: altText || name,
      uploadedById: session?.user.id || 'system',
      uploadedByEmail: session?.user.email || 'system@equipindianchurches.com',
      createdAt: new Date().toISOString(),
    };

    adminDb.update('media', (prev) => [record, ...prev]);
    adminDb.logAudit({
      userId: record.uploadedById,
      userEmail: record.uploadedByEmail,
      action: 'media.add_external',
      entity: 'media',
      entityId: record.id,
      entityTitle: record.name,
      details: { url },
    });

    return record;
  },

  deleteMedia(id: string): boolean {
    const session = authRepository.getCurrentSession();
    const existing = adminDb.getState().media.find((m) => m.id === id);
    if (!existing) return false;

    adminDb.update('media', (prev) => prev.filter((m) => m.id !== id));
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'media.delete',
      entity: 'media',
      entityId: id,
      entityTitle: existing.name,
    });

    return true;
  },
};
