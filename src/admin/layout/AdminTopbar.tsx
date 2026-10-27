import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#070A0F]/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Drawer Trigger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
        >
          ☰
        </button>

        <div className="flex items-center gap-2 text-xs font-medium">
          <Link to="/admin" className="text-slate-400 hover:text-white transition">
            Admin
          </Link>
          {pathParts.length > 1 && (
            <>
              <span className="text-slate-600">/</span>
              <span className="text-amber-400 font-semibold capitalize">{breadcrumbTitle}</span>
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
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition shadow-xs"
        >
          <span>View Public Site</span>
          <span className="text-[10px]">↗</span>
        </a>

        {/* Quick Add Event */}
        <Link
          to="/admin/events/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm shadow-amber-500/20 transition cursor-pointer"
        >
          <span>+</span>
          <span className="hidden sm:inline">Add Event</span>
        </Link>

        {/* Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'A'
            )}
          </div>
          <span className="text-xs font-semibold text-slate-300 hidden md:inline truncate max-w-[120px]">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}
