import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  SearchIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
} from '@/components/ui/Icons';
import { useTheme } from '@/hooks/useTheme';
import { site } from '@/config/site';

interface MobileTopBarProps {
  onOpenProfile: () => void;
}

export function MobileTopBar({ onOpenProfile }: MobileTopBarProps) {
  const { theme, toggle } = useTheme();
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

  const isHeroRoute = isHome || isWatch || isListen || isSeries;
  const isOverHero = isHeroRoute && !scrolled;

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

  const actionBtnClass = `flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-xs transition active:scale-95 cursor-pointer ${
    isOverHero
      ? 'bg-black/35 border border-white/20 text-white hover:bg-black/55'
      : 'bg-white/80 dark:bg-black/35 border border-[#D0E1F0] dark:border-white/20 text-[#182541] dark:text-white hover:bg-white dark:hover:bg-black/55 shadow-xs dark:shadow-none'
  }`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 flex h-14 w-full items-center justify-between px-4 md:hidden transition-all duration-300 ${
        isOverHero
          ? 'bg-gradient-to-b from-black/85 via-black/40 to-transparent border-b-0 text-white'
          : 'bg-[#F0F6FB]/90 dark:bg-[#070A0F]/90 backdrop-blur-md border-b border-[#D0E1F0] dark:border-white/10 shadow-xs dark:shadow-md text-[#182541] dark:text-white'
      }`}
    >
      {/* Left Action: Profile Drawer or Back Arrow on Single Pages */}
      <div className="flex w-20 items-center justify-start">
        {isSingle ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className={actionBtnClass}
          >
            <ChevronLeftIcon size={22} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open profile & menu"
            className={actionBtnClass}
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
              className={`font-serif text-lg font-bold tracking-wider drop-shadow-md transition-colors ${
                isOverHero
                  ? 'text-white group-hover:text-[#F0F6FB]'
                  : 'text-[#182541] dark:text-white group-hover:text-primary dark:group-hover:text-[#F0F6FB]'
              }`}
            >
              EIC
            </span>
          </Link>
        ) : (
          <h1
            className={`font-serif text-xl font-bold tracking-tight drop-shadow-md transition-colors ${
              isOverHero
                ? 'text-white'
                : 'text-[#182541] dark:text-white'
            }`}
          >
            {title || 'Equip'}
          </h1>
        )}
      </div>

      {/* Right Actions: Theme Toggle & Search */}
      <div className="flex w-20 items-center justify-end gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className={actionBtnClass}
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
        <Link
          to="/search"
          aria-label="Search resources"
          className={actionBtnClass}
        >
          <SearchIcon size={18} />
        </Link>
      </div>
    </header>
  );
}
