import { Link, useLocation } from 'react-router-dom';
import {
  DiscoverIcon,
  WatchScreenIcon,
  ListenHeadphonesIcon,
  SailboatIcon,
  LibraryBookIcon,
} from '@/components/ui/Icons';
import { useBookmarks } from '@/lib/bookmarks';

export function MobileBottomNav() {
  const location = useLocation();
  const path = location.pathname;
  const { count: savedCount } = useBookmarks();

  const tabs = [
    {
      id: 'discover',
      label: 'Discover',
      to: '/',
      icon: DiscoverIcon,
      isActive: path === '/' || path === '/discover',
    },
    {
      id: 'watch',
      label: 'Watch',
      to: '/videos',
      icon: WatchScreenIcon,
      isActive: path.startsWith('/videos'),
    },
    {
      id: 'listen',
      label: 'Listen',
      to: '/sermons',
      icon: ListenHeadphonesIcon,
      isActive: path.startsWith('/sermons'),
    },
    {
      id: 'series',
      label: 'Series',
      to: '/series',
      icon: SailboatIcon,
      isActive: path.startsWith('/series'),
    },
    {
      id: 'library',
      label: 'Library',
      to: '/library',
      icon: LibraryBookIcon,
      isActive: path.startsWith('/library'),
      badge: savedCount > 0 ? savedCount : undefined,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-50 h-16 border-t border-[#D0E1F0] dark:border-white/10 bg-white/95 dark:bg-[#070A0F]/95 backdrop-blur-xl px-2 flex items-center justify-around md:hidden select-none transition-colors shadow-[0_-4px_16px_rgba(24,37,65,0.06)] dark:shadow-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.isActive;
        return (
          <Link
            key={tab.id}
            to={tab.to}
            className={`group relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 ${
              active
                ? 'text-[#182541] dark:text-[#F0F6FB]'
                : 'text-slate-500 hover:text-slate-900 dark:text-white/45 dark:hover:text-white/80'
            }`}
          >
            <div className="relative">
              <Icon size={22} className={active ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#182541] text-white dark:bg-[#F0F6FB] dark:text-[#070A0F] text-[9px] font-bold">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </div>
            <span
              className={`mt-1 text-[10px] tracking-tight ${
                active
                  ? 'font-bold text-[#182541] dark:text-[#F0F6FB]'
                  : 'font-medium text-slate-500 dark:text-white/55'
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
