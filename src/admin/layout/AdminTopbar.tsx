import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ExternalLink, Plus, Menu } from 'lucide-react';

export function AdminTopbar({
  onOpenMobile,
  isCollapsed: _isCollapsed,
}: {
  onOpenMobile: () => void;
  isCollapsed: boolean;
}) {
  const { user } = useAdminAuth();
  const location = useLocation();

  // Compute breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbTitle =
    pathParts.length <= 1
      ? 'Dashboard'
      : pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1).replace('-', ' ');

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#D0E1F0] bg-white/95 px-4 sm:px-6 backdrop-blur-md shadow-xs">
      {/* Left: Mobile Drawer Trigger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-[#D0E1F0] bg-[#F0F6FB] text-[#182541] hover:bg-slate-100 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium">
          <Link to="/admin" className="text-slate-500 hover:text-[#094899] transition font-semibold">
            Admin
          </Link>
          {pathParts.length > 1 && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-[#182541] font-bold capitalize">{breadcrumbTitle}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* View Public Website */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#D0E1F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#182541] hover:bg-[#F0F6FB] hover:border-slate-300 transition shadow-xs"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>

        {/* Quick Add Event (routes to Events Hub with editor tab) */}
        <Link
          to="/admin/events?tab=editor"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#094899] hover:bg-[#07397b] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Event</span>
        </Link>

        {/* Profile Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#D0E1F0]">
          <div className="h-8 w-8 rounded-full bg-[#094899] text-white flex items-center justify-center text-xs font-bold shadow-xs overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'A'
            )}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-[#182541] truncate max-w-[130px]">
              {user?.name}
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
