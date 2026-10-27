import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { eventRepository } from '../db/repositories/eventRepository';
import { useState, useEffect } from 'react';
import { adminDb } from '../db/storage';

interface NavItem {
  label: string;
  to: string;
  icon: string;
  badge?: number | string;
  allowedRoles?: string[];
}

export function AdminSidebar({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const { user, logout, hasRole } = useAdminAuth();
  const [stats, setStats] = useState(eventRepository.getStats());

  useEffect(() => {
    return adminDb.subscribe(() => {
      setStats(eventRepository.getStats());
    });
  }, []);

  const navItems: { section: string; items: NavItem[] }[] = [
    {
      section: 'Overview',
      items: [{ label: 'Dashboard', to: '/admin', icon: '📊' }],
    },
    {
      section: 'Custom Events',
      items: [
        { label: 'All Events', to: '/admin/events', icon: '📅', badge: stats.total },
        { label: 'Categories', to: '/admin/categories', icon: '🏷️' },
        { label: 'Speakers', to: '/admin/speakers', icon: '🎙️' },
        { label: 'Organizers', to: '/admin/organizers', icon: '🏛️' },
        { label: 'Venues', to: '/admin/venues', icon: '📍' },
      ],
    },
    {
      section: 'Media & Navigation',
      items: [
        { label: 'Media Library', to: '/admin/media', icon: '🖼️' },
        { label: 'Header Menu', to: '/admin/menus/header', icon: '🧭' },
        { label: 'Footer Menu', to: '/admin/menus/footer', icon: '📑' },
      ],
    },
    {
      section: 'Administration',
      items: [
        { label: 'Admin Users', to: '/admin/users', icon: '👥', allowedRoles: ['super_admin', 'administrator'] },
        { label: 'Activity Logs', to: '/admin/activity', icon: '📜' },
        { label: 'Settings', to: '/admin/settings', icon: '⚙️', allowedRoles: ['super_admin', 'administrator'] },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-[#0B111E] text-slate-300 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80 bg-[#070A0F]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20">
              EIC
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-sm font-bold text-white tracking-wide truncate">
                  Admin Console
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-400">
                  Custom CMS
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar width"
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            {isCollapsed ? '→' : '←'}
          </button>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex lg:hidden text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map((group) => {
            const filteredItems = group.items.filter((item) => {
              if (!item.allowedRoles) return true;
              return hasRole(item.allowedRoles as any);
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.section} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {group.section}
                  </p>
                )}
                {filteredItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-base shrink-0">{item.icon}</span>
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge !== undefined && (
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070A0F]">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'A'
                )}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-amber-400 uppercase font-mono tracking-wider truncate">
                    {user?.role?.replace('_', ' ') || 'Staff'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
