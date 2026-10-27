import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authRepository, type AdminSession } from '../db/repositories/authRepository';
import type { AdminUser, AdminRole } from '../db/types';

interface AdminAuthContextValue {
  user: AdminUser | null;
  session: AdminSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, plainPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (roles: AdminRole[]) => boolean;
  can: (action: 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'manage_users' | 'manage_settings', entity?: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const current = authRepository.getCurrentSession();
    setSession(current);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (usernameOrEmail: string, plainPassword: string) => {
    const res = await authRepository.login(usernameOrEmail, plainPassword);
    if (res.success && res.session) {
      setSession(res.session);
      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed' };
  }, []);

  const logout = useCallback(() => {
    authRepository.logout();
    setSession(null);
  }, []);

  const user = session?.user || null;
  const isAuthenticated = !!user;

  const hasRole = useCallback(
    (allowedRoles: AdminRole[]) => {
      if (!user) return false;
      return allowedRoles.includes(user.role);
    },
    [user],
  );

  const can = useCallback(
    (action: 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'manage_users' | 'manage_settings', entity?: string) => {
      if (!user) return false;
      if (user.role === 'super_admin') return true;

      if (user.role === 'administrator') {
        if (action === 'manage_users' && entity === 'super_admin') return false;
        return true;
      }

      if (user.role === 'event_manager') {
        if (action === 'manage_users' || action === 'manage_settings') return false;
        return true;
      }

      if (user.role === 'editor') {
        if (action === 'delete') return false;
        if (action === 'manage_users' || action === 'manage_settings') return false;
        if (action === 'publish') return false; // Needs approval or higher role
        return true;
      }

      if (user.role === 'read_only') {
        return action === 'view';
      }

      return false;
    },
    [user],
  );

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasRole,
        can,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}
