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
      className="fixed bottom-0 inset-x-0 z-50 h-16 border-t border-white/10 bg-[#070A0F]/95 backdrop-blur-xl px-2 flex items-center justify-around md:hidden select-none transition-colors"
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
                ? 'text-[#FF533D]'
                : 'text-white/45 hover:text-white/80'
            }`}
          >
            <div className="relative">
              <Icon size={22} className={active ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FF533D] text-[9px] font-bold text-white">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </div>
            <span
              className={`mt-1 text-[10px] font-medium tracking-tight ${
                active ? 'font-semibold text-[#FF533D]' : 'text-white/55'
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
