import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { eventRepository } from '../db/repositories/eventRepository';
import { formRepository } from '../db/repositories/formRepository';
import { useState, useEffect } from 'react';
import { adminDb } from '../db/storage';
import { 
  LayoutDashboard, 
  Calendar, 
  Image as ImageIcon, 
  Compass, 
  FileText, 
  Users, 
  Activity, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  X,
  ClipboardList,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
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
  const [formsStats, setFormsStats] = useState(formRepository.getStats());

  useEffect(() => {
    return adminDb.subscribe(() => {
      setStats(eventRepository.getStats());
      setFormsStats(formRepository.getStats());
    });
  }, []);

  const navItems: { section: string; items: NavItem[] }[] = [
    {
      section: 'Overview',
      items: [
        { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      section: 'Content & Navigation',
      items: [
        { label: 'Events Hub', to: '/admin/events', icon: Calendar, badge: stats.total },
        { label: 'Registration Forms', to: '/admin/forms', icon: ClipboardList, badge: formsStats.totalForms },
        { label: 'Media Library', to: '/admin/media', icon: ImageIcon },
        { label: 'Header Menu', to: '/admin/menus/header', icon: Compass },
        { label: 'Footer Menu', to: '/admin/menus/footer', icon: FileText },
      ],
    },
    {
      section: 'System Administration',
      items: [
        { label: 'Admin Users', to: '/admin/users', icon: Users, allowedRoles: ['super_admin', 'administrator'] },
        { label: 'Activity Logs', to: '/admin/activity', icon: Activity },
        { label: 'Settings & Backups', to: '/admin/settings', icon: Settings, allowedRoles: ['super_admin', 'administrator'] },
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[#10182E] bg-[#182541] text-slate-200 transition-all duration-300 shadow-xl ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10 bg-[#10182E]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#094899] text-white font-black shadow-md border border-white/15">
              EIC
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-sm font-bold text-white tracking-wide truncate">
                  Admin Console
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#D9A62E]">
                  Equip Indian Churches
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar width"
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((group) => {
            const filteredItems = group.items.filter((item) => {
              if (!item.allowedRoles) return true;
              return hasRole(item.allowedRoles as any);
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.section} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/45 mb-2">
                    {group.section}
                  </p>
                )}
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/admin'}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#094899] text-white font-bold shadow-md'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`
                      }
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-white" />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge !== undefined && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Footer with Logout */}
        <div className="p-3 border-t border-white/10 bg-[#10182E]/70">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#094899] text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{user?.name}</span>
                  <span className="text-[10px] uppercase font-semibold text-[#D9A62E] truncate">
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
