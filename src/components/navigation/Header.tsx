import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navItems, site } from '@/config/site';
import type { MegaColumn, NavItem } from '@/config/site';
import { useTheme } from '@/hooks/useTheme';
import { useTerms, useFilterTerms } from '@/hooks/queries';
import {
  ChevronDownIcon,
  CloseIcon,
  ExternalLinkIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from '@/components/ui/Icons';
import { cn } from '@/lib/format';

export function Header() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<number | null>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setActiveMega(null);
  }, [location.pathname, location.search]);

  // Close mega menu on outside click or Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMega(null);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setActiveMega(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (label: string) => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setActiveMega(label);
  };

  const handleMouseLeave = () => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = window.setTimeout(() => {
      setActiveMega(null);
    }, 180);
  };

  const checkIsActive = (label: string, to?: string) => {
    const p = location.pathname;
    if (label === 'Articles') {
      return p.startsWith('/articles') || p.startsWith('/series') || p.startsWith('/book-reviews');
    }
    if (label === 'Sermons & Media') {
      return p.startsWith('/sermons') || p.startsWith('/videos');
    }
    if (label === 'Events & Gallery') {
      return p.startsWith('/events') || p.startsWith('/gallery') || p.startsWith('/authors');
    }
    return to ? p.startsWith(to) : false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/80 bg-surface/98 backdrop-blur-md transition-colors">
      <div className="container-page flex h-20 items-center justify-between gap-6">
        {/* Brand Logo (Left) */}
        <Link
          to="/"
          className="flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm shrink-0"
        >
          <img
            src={site.logoUrl}
            alt={site.name}
            className="h-10 sm:h-11 w-auto object-contain transition-all group-hover:opacity-90 dark:brightness-0 dark:invert"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = site.logoFallback;
            }}
          />
          <span className="sr-only">{site.name} - Equipping the Church</span>
        </Link>

        {/* Desktop Navigation (Center - 4 Consolidated Pillars) */}
        <nav
          ref={megaRef}
          aria-label="Main Navigation"
          className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-1"
          onMouseLeave={handleMouseLeave}
        >
          {navItems.map((item) => {
            const isMegaOpen = activeMega === item.label;
            const hasMega = !!item.mega;
            const isActive = checkIsActive(item.label, item.to);

            if (!hasMega && item.to) {
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    'relative py-2.5 px-4 text-sm font-medium tracking-normal transition-colors',
                    isActive
                      ? 'text-ink font-semibold after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-accent after:rounded-full'
                      : 'text-ink/80 hover:text-ink',
                  )}
                >
                  {item.label}
                </Link>
              );
            }

            const colCount = item.mega ? item.mega.columns.length : 2;
            const widthClass = colCount >= 3 ? 'w-[780px] max-w-[92vw]' : 'w-[560px] max-w-[92vw]';
            const gridClass = colCount >= 3 ? 'grid-cols-3' : 'grid-cols-2';

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.label)}
              >
                <button
                  type="button"
                  onClick={() => setActiveMega(isMegaOpen ? null : item.label)}
                  aria-expanded={isMegaOpen}
                  aria-haspopup="true"
                  className={cn(
                    'relative inline-flex items-center gap-1.5 py-2.5 px-4 text-sm font-medium tracking-normal transition-colors cursor-pointer',
                    isMegaOpen || isActive
                      ? 'text-ink font-semibold after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-accent after:rounded-full'
                      : 'text-ink/80 hover:text-ink',
                  )}
                >
                  <span>{item.label}</span>
                  <ChevronDownIcon
                    size={14}
                    className={cn('transition-transform duration-200 text-muted', isMegaOpen && 'rotate-180 text-ink')}
                  />
                </button>

                {/* Mega Menu Dropdown */}
                {isMegaOpen && item.mega && (
                  <div
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    className={cn(
                      'absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-xl border border-line bg-surface p-6 sm:p-7 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-50',
                      widthClass,
                    )}
                  >
                    {/* Top blurb banner */}
                    <div className="mb-5 rounded-lg border border-line/60 bg-surface-2 px-4 py-2.5 flex items-center justify-between">
                      <p className="text-xs text-muted leading-relaxed">{item.mega.blurb}</p>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-text hidden sm:inline shrink-0 ml-3">
                        Equip Indian Churches
                      </span>
                    </div>

                    {/* Columns grid */}
                    <div className={cn('grid gap-7', gridClass)}>
                      {item.mega.columns.map((col, idx) => (
                        <MegaColumnRenderer key={idx} column={col} />
                      ))}
                    </div>

                    {/* Bottom CTA bar */}
                    {item.mega.cta && (
                      <div className="mt-6 border-t border-line/80 pt-3.5 flex items-center justify-between text-xs">
                        <span className="text-muted hidden sm:inline">
                          Sound biblical resources freely available
                        </span>
                        <Link
                          to={item.mega.cta.to}
                          className="font-semibold text-ink hover:text-accent-text hover:underline transition-colors ml-auto inline-flex items-center gap-1"
                        >
                          <span>{item.mega.cta.label}</span>
                          <span>→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Action Icons (Right) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search Button */}
          <Link
            to="/search"
            aria-label="Search all resources"
            className="flex h-10 w-10 items-center justify-center rounded-md text-ink/80 hover:bg-surface-2 hover:text-ink transition-colors border border-transparent hover:border-line"
          >
            <SearchIcon size={19} />
          </Link>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-10 w-10 items-center justify-center rounded-md text-ink/80 hover:bg-surface-2 hover:text-ink transition-colors border border-transparent hover:border-line cursor-pointer"
          >
            {theme === 'dark' ? <SunIcon size={19} /> : <MoonIcon size={19} />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center rounded-md text-ink lg:hidden hover:bg-surface-2 transition-colors cursor-pointer border border-transparent hover:border-line"
          >
            {mobileOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Accordion Style) */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-20 bottom-0 z-50 overflow-y-auto bg-surface border-t border-line p-6 lg:hidden animate-in slide-in-from-top-4 duration-200 shadow-2xl">
          <nav className="flex flex-col gap-2.5 pb-12" aria-label="Mobile Navigation">
            {navItems.map((item) => (
              <MobileNavItemRenderer key={item.label} item={item} />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function MegaColumnRenderer({ column }: { column: MegaColumn }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-text border-b border-line/60 pb-1.5">
        {column.title}
      </h4>

      {/* Static / Primary Links */}
      {column.links && column.links.length > 0 && (
        <ul className="space-y-1.5 text-sm">
          {column.links.map((link) => (
            <li key={link.to}>
              {link.external ? (
                <a
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-ink/90 hover:text-accent-text transition-colors"
                >
                  <span>{link.label}</span>
                  <ExternalLinkIcon size={12} className="text-muted" />
                </a>
              ) : (
                <Link
                  to={link.to}
                  className="font-medium text-ink/90 hover:text-accent-text hover:underline transition-colors block py-0.5"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Dynamic WordPress API Terms */}
      {column.source && (
        <div className="pt-0.5">
          {column.source.kind === 'sermonCategories' && (
            <DynamicTermsList taxonomy="videoCategory" filterFor="sermon" />
          )}
          {column.source.kind === 'videoCategories' && (
            <DynamicTermsList taxonomy="videoCategory" filterFor="video" />
          )}
          {column.source.kind === 'terms' && (
            <DynamicTermsList
              taxonomy={column.source.taxonomy}
              limit={column.source.limit}
              orderby={column.source.orderby}
            />
          )}
        </div>
      )}
    </div>
  );
}

function DynamicTermsList({
  taxonomy,
  limit = 6,
  orderby = 'count',
  filterFor,
}: {
  taxonomy: 'category' | 'series' | 'videoCategory' | 'topic';
  limit?: number;
  orderby?: 'count' | 'name';
  filterFor?: 'sermon' | 'video';
}) {
  const { data: regularTerms } = useTerms(taxonomy, { perPage: limit, orderby }, !filterFor);
  const { data: filteredTerms } = useFilterTerms(
    filterFor === 'sermon' ? 'sermon' : 'video',
    taxonomy,
    !!filterFor,
  );

  const list = filterFor ? (filteredTerms?.slice(0, limit) || []) : (regularTerms?.items || []);

  const getUrl = (t: { id: number; slug: string }) => {
    if (taxonomy === 'series') return `/series/${t.slug}`;
    if (taxonomy === 'category') return `/articles?category=${t.id}`;
    if (taxonomy === 'topic') return `/articles?topic=${t.id}`;
    if (filterFor === 'sermon') return `/sermons?videoCategory=${t.id}`;
    return `/videos?videoCategory=${t.id}`;
  };

  return (
    <ul className="space-y-1.5 text-xs text-muted">
      {list.map((term) => (
        <li key={term.id}>
          <Link
            to={getUrl(term)}
            className="hover:text-ink hover:underline truncate block py-0.5 transition-colors"
          >
            {term.name}
          </Link>
        </li>
      ))}
      {list.length === 0 && <li className="text-xs text-muted italic">Loading options...</li>}
    </ul>
  );
}

function MobileNavItemRenderer({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);

  if (!item.mega) {
    return (
      <Link
        to={item.to || '#'}
        className="rounded-lg px-4 py-3 text-base font-medium text-ink hover:bg-surface-2 transition-colors"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-base font-semibold text-ink"
      >
        <span>{item.label}</span>
        <ChevronDownIcon size={18} className={cn('transition-transform duration-200', open && 'rotate-180 text-accent-text')} />
      </button>

      {open && (
        <div className="border-t border-line px-4 py-4 bg-surface-2 space-y-5">
          {item.to && (
            <Link
              to={item.to}
              className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-accent-text"
            >
              <span>Explore All {item.label}</span>
              <span>→</span>
            </Link>
          )}
          {item.mega.columns.map((col, idx) => (
            <MegaColumnRenderer key={idx} column={col} />
          ))}
        </div>
      )}
    </div>
  );
}
