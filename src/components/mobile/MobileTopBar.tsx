import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  SearchIcon,
  UserIcon,
} from '@/components/ui/Icons';
import { site } from '@/config/site';

interface MobileTopBarProps {
  onOpenProfile: () => void;
}

export function MobileTopBar({ onOpenProfile }: MobileTopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Determine center title/logo based on route
  const isHome = path === '/' || path === '/discover';
  const isWatch = path.startsWith('/videos');
  const isListen = path.startsWith('/sermons');
  const isSeries = path.startsWith('/series');
  const isLibrary = path.startsWith('/library');
  const isSingle =
    path.startsWith('/articles/') ||
    path.startsWith('/videos/') ||
    path.startsWith('/sermons/') ||
    path.startsWith('/series/') ||
    path.startsWith('/book-reviews/') ||
    path.startsWith('/gallery/') ||
    path.startsWith('/authors/');

  let title = '';
  if (isWatch && !isSingle) title = 'Watch';
  else if (isListen && !isSingle) title = 'Listen';
  else if (isSeries && !isSingle) title = 'Series';
  else if (isLibrary && !isSingle) title = 'Library';
  else if (path.startsWith('/articles') && !isSingle) title = 'Articles';
  else if (path.startsWith('/book-reviews') && !isSingle) title = 'Book Reviews';
  else if (path.startsWith('/gallery') && !isSingle) title = 'Gallery';
  else if (path.startsWith('/events') && !isSingle) title = 'Events';
  else if (path.startsWith('/authors') && !isSingle) title = 'Teachers';
  else if (path.startsWith('/search')) title = 'Search';

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-white/10 bg-[#090D14]/95 px-4 backdrop-blur-md md:hidden transition-colors">
      {/* Left Action: Profile Drawer or Back Arrow on Single Pages */}
      <div className="flex w-10 items-center justify-start">
        {isSingle ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 active:scale-95 transition"
          >
            <ChevronLeftIcon size={22} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open profile & menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/90 hover:bg-white/10 active:scale-95 transition"
          >
            <UserIcon size={18} />
          </button>
        )}
      </div>

      {/* Center: Official Mobile Logo or Serif Title */}
      <div className="flex flex-1 items-center justify-center">
        {isHome ? (
          <Link to="/" className="flex items-center justify-center group" aria-label="Equip Indian Churches">
            <img
              src={site.mobileLogoUrl}
              alt={site.name}
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = site.mobileLogoFallback;
              }}
            />
          </Link>
        ) : (
          <h1 className="font-serif text-xl font-bold tracking-tight text-white">
            {title || 'Equip'}
          </h1>
        )}
      </div>

      {/* Right Action: Search */}
      <div className="flex w-10 items-center justify-end">
        <Link
          to="/search"
          aria-label="Search resources"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 active:scale-95 transition"
        >
          <SearchIcon size={20} />
        </Link>
      </div>
    </header>
  );
}
