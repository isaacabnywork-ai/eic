import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import type { AdminRole } from '../db/types';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AdminRole[];
}

export function AdminProtectedRoute({ children, allowedRoles }: AdminProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 m-6 text-white">
        <h2 className="text-xl font-bold text-rose-400">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          Your account role (<span className="font-mono text-amber-300">{user.role}</span>) does not have authorization to view this administrative module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
