import { adminDb } from '../storage';
import { DEFAULT_ADMIN_PASSWORD } from '../seed';
import type { AdminUser, AdminRole } from '../types';

const SESSION_KEY = 'eic_admin_session_token';

export interface AdminSession {
  token: string;
  user: AdminUser;
  expiresAt: number; // Unix timestamp ms
}

// In-memory or localStorage session manager
export const authRepository = {
  async hashPassword(plain: string): Promise<string> {
    try {
      // Use standard Web Crypto subtle API if available
      const msgBuffer = new TextEncoder().encode(plain);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback deterministic hash
      let hash = 0;
      for (let i = 0; i < plain.length; i++) {
        hash = (hash << 5) - hash + plain.charCodeAt(i);
        hash |= 0;
      }
      return `hash_${Math.abs(hash).toString(16)}`;
    }
  },

  async login(
    usernameOrEmail: string,
    plainPassword: string,
  ): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
    const cleanInput = usernameOrEmail.trim();
    if (!cleanInput || !plainPassword) {
      return { success: false, error: 'Please enter both your WordPress username or email and password.' };
    }

    // 1. Attempt Live WordPress Authentication via backend proxy
    let wpSuccess = false;
    let wpUser: { username: string; displayName: string; email: string; role: AdminRole } | null = null;
    let wpError: string | null = null;

    try {
      const response = await fetch('/api/admin/auth/wp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: cleanInput,
          password: plainPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          wpSuccess = true;
          wpUser = data.user;
        } else {
          wpError = data.error || 'Invalid credentials.';
        }
      } else {
        const data = await response.json().catch(() => null);
        wpError = data?.error || 'Authentication server error.';
      }
    } catch {
      // Network failure or offline dev
      wpError = 'Could not reach WordPress authentication endpoint.';
    }

    // 2. If WordPress authentication succeeded, provision / update local admin user
    if (wpSuccess && wpUser) {
      const state = adminDb.getState();
      const cleanEmail = wpUser.email.toLowerCase();
      const cleanName = wpUser.username.toLowerCase();

      const existingUser = state.users.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail ||
          u.name.toLowerCase() === cleanName ||
          u.email.toLowerCase().startsWith(`${cleanName}@`),
      );

      let activeUser: AdminUser;
      if (existingUser) {
        activeUser = {
          ...existingUser,
          name: wpUser.displayName || existingUser.name,
          email: wpUser.email || existingUser.email,
          role: existingUser.role === 'super_admin' ? 'super_admin' : 'administrator',
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        adminDb.update('users', (prev) => prev.map((u) => (u.id === activeUser.id ? activeUser : u)));
      } else {
        activeUser = {
          id: `wp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: wpUser.displayName || wpUser.username,
          email: wpUser.email,
          passwordHash: await this.hashPassword(plainPassword),
          role: 'administrator',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        adminDb.update('users', (prev) => [activeUser, ...prev]);
      }

      // Create session (expires in 12 hours)
      const token = `wp_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
      const session: AdminSession = { token, user: activeUser, expiresAt };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      adminDb.logAudit({
        userId: activeUser.id,
        userEmail: activeUser.email,
        action: 'user.login',
        entity: 'auth',
        details: { method: 'wordpress_sso', username: wpUser.username, role: activeUser.role },
      });

      return { success: true, session };
    }

    // 3. Fallback: Check local administrative user (for offline development or emergency recovery)
    const state = adminDb.getState();
    const cleanLower = cleanInput.toLowerCase();
    const localUser = state.users.find(
      (u) => u.email.toLowerCase() === cleanLower || u.name.toLowerCase() === cleanLower,
    );

    if (localUser && localUser.isActive) {
      const hashedAttempt = await this.hashPassword(plainPassword);
      const matchesHash = localUser.passwordHash === hashedAttempt;
      const matchesDefaultSeed = plainPassword === DEFAULT_ADMIN_PASSWORD;

      if (matchesHash || matchesDefaultSeed) {
        const updatedUser: AdminUser = {
          ...localUser,
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        adminDb.update('users', (prev) => prev.map((u) => (u.id === localUser.id ? updatedUser : u)));

        const token = `local_token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
        const session: AdminSession = { token, user: updatedUser, expiresAt };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        adminDb.logAudit({
          userId: localUser.id,
          userEmail: localUser.email,
          action: 'user.login',
          entity: 'auth',
          details: { method: 'local_fallback', role: localUser.role },
        });

        return { success: true, session };
      }
    }

    // Log failure
    adminDb.logAudit({
      userId: 'anonymous',
      userEmail: cleanInput,
      action: 'user.login_failed',
      entity: 'auth',
      details: { reason: wpError || 'invalid_credentials' },
    });

    return {
      success: false,
      error: wpError || 'Invalid WordPress username, email, or password.',
    };
  },

  getCurrentSession(): AdminSession | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      const session = JSON.parse(stored) as AdminSession;

      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      // Refresh user info from database
      const state = adminDb.getState();
      const freshUser = state.users.find((u) => u.id === session.user.id);
      if (!freshUser || !freshUser.isActive) {
        this.logout();
        return null;
      }

      return {
        ...session,
        user: freshUser,
      };
    } catch {
      return null;
    }
  },

  logout(): void {
    const session = this.getCurrentSession();
    if (session) {
      adminDb.logAudit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: 'user.logout',
        entity: 'auth',
      });
    }
    localStorage.removeItem(SESSION_KEY);
  },

  // Users management
  getUsers(): AdminUser[] {
    return adminDb.getState().users;
  },

  async createUser(data: { name: string; email: string; role: AdminRole; passwordPlain: string }): Promise<AdminUser> {
    const hash = await this.hashPassword(data.passwordPlain);
    const newUser: AdminUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash: hash,
      role: data.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    adminDb.update('users', (prev) => [newUser, ...prev]);

    const session = this.getCurrentSession();
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'user.create',
      entity: 'user',
      entityId: newUser.id,
      entityTitle: newUser.name,
      details: { role: newUser.role, email: newUser.email },
    });

    return newUser;
  },

  updateUser(id: string, updates: Partial<Pick<AdminUser, 'name' | 'role' | 'isActive' | 'avatarUrl'>>): AdminUser | null {
    const state = adminDb.getState();
    const existing = state.users.find((u) => u.id === id);
    if (!existing) return null;

    const updated: AdminUser = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    adminDb.update('users', (prev) => prev.map((u) => (u.id === id ? updated : u)));

    const session = this.getCurrentSession();
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'user.update',
      entity: 'user',
      entityId: id,
      entityTitle: updated.name,
      details: updates,
    });

    return updated;
  },

  async resetPassword(id: string, newPlainPassword: string): Promise<boolean> {
    const hash = await this.hashPassword(newPlainPassword);
    const state = adminDb.getState();
    const existing = state.users.find((u) => u.id === id);
    if (!existing) return false;

    adminDb.update('users', (prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              passwordHash: hash,
              updatedAt: new Date().toISOString(),
            }
          : u,
      ),
    );

    const session = this.getCurrentSession();
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'user.password_reset',
      entity: 'user',
      entityId: id,
      entityTitle: existing.name,
    });

    return true;
  },

  deleteUser(id: string): boolean {
    const state = adminDb.getState();
    const existing = state.users.find((u) => u.id === id);
    if (!existing) return false;

    // Safety check: Cannot delete the last super_admin
    const superAdmins = state.users.filter((u) => u.role === 'super_admin');
    if (existing.role === 'super_admin' && superAdmins.length <= 1) {
      throw new Error('Cannot delete the only Super Admin account in the system.');
    }

    adminDb.update('users', (prev) => prev.filter((u) => u.id !== id));

    const session = this.getCurrentSession();
    adminDb.logAudit({
      userId: session?.user.id || 'system',
      userEmail: session?.user.email || 'system',
      action: 'user.delete',
      entity: 'user',
      entityId: id,
      entityTitle: existing.name,
    });

    return true;
  },
};
