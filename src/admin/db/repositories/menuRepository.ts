import { adminDb } from '../storage';
import { authRepository } from './authRepository';
import type { CustomMenuConfig, CustomFooterMenuConfig, CustomMenuItem, CustomFooterGroup } from '../types';

export const menuRepository = {
  // Header Menu
  getHeaderMenu(): CustomMenuConfig {
    return adminDb.getState().headerMenu;
  },

  saveHeaderMenu(items: CustomMenuItem[]): CustomMenuConfig {
    const session = authRepository.getCurrentSession();
    const updated: CustomMenuConfig = {
      id: 'header_menu',
      name: 'Custom Desktop & Mobile Header Navigation',
      updatedAt: new Date().toISOString(),
      updatedBy: session?.user.email || 'admin@equipindianchurches.com',
      items,
    };

    adminDb.update('headerMenu', () => updated);
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'menu.header_update',
      entity: 'menu',
      entityId: 'header_menu',
      details: { itemCount: items.length },
    });

    return updated;
  },

  // Footer Menu
  getFooterMenu(): CustomFooterMenuConfig {
    return adminDb.getState().footerMenu;
  },

  saveFooterMenu(groups: CustomFooterGroup[]): CustomFooterMenuConfig {
    const session = authRepository.getCurrentSession();
    const updated: CustomFooterMenuConfig = {
      id: 'footer_menu_config',
      updatedAt: new Date().toISOString(),
      updatedBy: session?.user.email || 'admin@equipindianchurches.com',
      groups,
    };

    adminDb.update('footerMenu', () => updated);
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'menu.footer_update',
      entity: 'menu',
      entityId: 'footer_menu_config',
      details: { groupCount: groups.length },
    });

    return updated;
  },
};
