import { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <header
      className={`fixed top-0 inset-x-0 z-40 flex h-14 w-full items-center justify-between px-4 md:hidden transition-all duration-300 ${
        scrolled
          ? 'bg-[#070A0F]/90 backdrop-blur-md border-b border-white/10 shadow-md'
          : 'bg-gradient-to-b from-black/85 via-black/40 to-transparent border-b-0'
      }`}
    >
      {/* Left Action: Profile Drawer or Back Arrow on Single Pages */}
      <div className="flex w-10 items-center justify-start">
        {isSingle ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 backdrop-blur-xs border border-white/20 text-white hover:bg-black/55 active:scale-95 transition"
          >
            <ChevronLeftIcon size={22} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open profile & menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 backdrop-blur-xs border border-white/20 text-white hover:bg-black/55 active:scale-95 transition"
          >
            <UserIcon size={18} />
          </button>
        )}
      </div>

      {/* Center: Official Mobile Logo with EIC or Serif Title */}
      <div className="flex flex-1 items-center justify-center">
        {isHome ? (
          <Link
            to="/"
            className="flex items-center gap-2 group focus:outline-none"
            aria-label="Equip Indian Churches"
          >
            <img
              src={site.mobileLogoUrl}
              alt={site.name}
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = site.mobileLogoFallback;
              }}
            />
            <span
              className="font-serif text-lg font-bold tracking-wider text-white !text-white drop-shadow-md group-hover:text-[#FF533D] transition-colors"
              style={{ color: '#FFFFFF' }}
            >
              EIC
            </span>
          </Link>
        ) : (
          <h1
            className="font-serif text-xl font-bold tracking-tight text-white !text-white drop-shadow-md"
            style={{ color: '#FFFFFF' }}
          >
            {title || 'Equip'}
          </h1>
        )}
      </div>

      {/* Right Action: Search */}
      <div className="flex w-10 items-center justify-end">
        <Link
          to="/search"
          aria-label="Search resources"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 backdrop-blur-xs border border-white/20 text-white hover:bg-black/55 active:scale-95 transition"
        >
          <SearchIcon size={19} />
        </Link>
      </div>
    </header>
  );
}
