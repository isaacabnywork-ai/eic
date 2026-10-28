import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CloseIcon,
  SunIcon,
  MoonIcon,
  BookIcon,
  CalendarIcon,
  SearchIcon,
  YoutubeIcon,
  FacebookIcon,
  InstagramIcon,
  XIcon,
  WatchScreenIcon,
  BookmarkIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  MailIcon,
  StarIcon,
  UserIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';
import { useTheme } from '@/hooks/useTheme';
import { useBookmarks } from '@/lib/bookmarks';
import { useTerms, useFilterTerms } from '@/hooks/queries';
import { env } from '@/config/env';
import { site, navItems } from '@/config/site';
import type { MegaColumn, NavItem } from '@/config/site';

interface MobileProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileProfileDrawer({ open, onClose }: MobileProfileDrawerProps) {
  const { theme, toggle } = useTheme();
  const { count: savedCount } = useBookmarks();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Auto-expand the accordion matching the current route or default to Articles
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const path = location.pathname;
    const initial: Record<string, boolean> = {};
    if (path.startsWith('/articles') || path.startsWith('/book-reviews') || path.startsWith('/series')) {
      initial['Articles'] = true;
    } else if (path.startsWith('/sermons') || path.startsWith('/videos')) {
      initial['Sermons & Media'] = true;
    } else if (path.startsWith('/events')) {
      initial['Events'] = true;
    } else if (path.startsWith('/seminaries') || path.startsWith('/bookstores')) {
      initial['Recommendations'] = true;
    } else if (path.startsWith('/about') || path.startsWith('/statement-of-faith') || path.startsWith('/contact')) {
      initial['About'] = true;
    } else {
      initial['Articles'] = true;
    }
    return initial;
  });

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content - Responsive for Mobile & Tablet */}
      <div className="relative z-10 flex h-full w-[88%] max-w-sm sm:max-w-md flex-col bg-[#F0F6FB] dark:bg-[#090D14] border-r border-[#D0E1F0] dark:border-white/10 text-[#182541] dark:text-white shadow-2xl animate-in slide-in-from-left duration-250 transition-colors">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#D0E1F0] dark:border-white/10 p-4 sm:p-5">
          <Link to="/" onClick={onClose} className="flex flex-col gap-1 focus:outline-none">
            <img
              src={site.mobileLogoUrl}
              alt={site.name}
              className="h-10 sm:h-11 w-auto object-contain object-left invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = site.mobileLogoFallback;
              }}
            />
            <p className="text-[11px] text-slate-500 dark:text-white/50">Christian Ministry & Media</p>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu drawer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Quick Search */}
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 pointer-events-none"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sermons, articles, series..."
              className="h-10 w-full rounded-xl border border-[#D0E1F0] dark:border-white/15 bg-white dark:bg-white/5 pl-9 pr-3 text-xs text-[#182541] dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-primary dark:focus:border-[#F0F6FB] focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-[#F0F6FB] shadow-2xs"
            />
          </form>

          {/* Quick Actions Bar: Library & Saved */}
          <div className="flex items-center gap-2">
            <Link
              to="/library"
              onClick={onClose}
              className="flex-1 flex items-center justify-between rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-xs font-semibold text-[#182541] dark:text-white shadow-2xs hover:border-primary dark:hover:border-white/30 transition"
            >
              <div className="flex items-center gap-2">
                <BookmarkIcon size={15} className="text-primary dark:text-[#F0F6FB]" />
                <span>My Saved Library</span>
              </div>
              {savedCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#182541] dark:bg-[#F0F6FB] px-1.5 text-[10px] font-bold text-white dark:text-[#070A0F]">
                  {savedCount}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 dark:text-white/40">0 saved</span>
              )}
            </Link>
          </div>

          {/* All Desktop Navigation Menus */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/40 px-1 block">
              Navigation Menu
            </span>

            {navItems.map((item) => (
              <DrawerNavItem
                key={item.label}
                item={item}
                isOpen={!!openSections[item.label]}
                onToggle={() => toggleSection(item.label)}
                onClose={onClose}
              />
            ))}
          </div>

          {/* Weekly Gospel Digest Newsletter */}
          <div className="rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-3.5 shadow-2xs dark:shadow-none mt-2">
            <div className="flex items-center gap-2 mb-1.5 text-primary dark:text-[#F0F6FB]">
              <MailIcon size={16} />
              <span className="font-serif text-xs font-bold text-ink dark:text-white">
                Weekly Gospel Digest
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-white/70 leading-relaxed">
              Get sound biblical sermons, articles, and book reviews in your inbox every Saturday.
            </p>

            {newsletterSubscribed ? (
              <div className="mt-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 dark:border-emerald-500/40 p-2 text-center text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                ✓ You're subscribed to EIC updates!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="mt-2.5 flex gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address..."
                  required
                  className="h-8.5 flex-1 rounded-lg border border-[#D0E1F0] dark:border-white/15 bg-slate-50 dark:bg-white/10 px-2.5 text-xs text-[#182541] dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-8.5 rounded-lg bg-[#182541] dark:bg-[#F0F6FB] px-3 text-[11px] font-bold text-white dark:text-[#070A0F] active:scale-95 transition cursor-pointer"
                >
                  Join
                </button>
              </form>
            )}
          </div>

          {/* Quick Preferences */}
          <div className="border-t border-[#D0E1F0] dark:border-white/10 pt-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 px-1 block mb-1.5">
              Display Preferences
            </span>
            <button
              type="button"
              onClick={toggle}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-[#182541] dark:text-white/90 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 active:bg-white dark:active:bg-white/10 transition cursor-pointer border border-[#D0E1F0]/70 dark:border-white/5"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <SunIcon size={17} className="text-primary dark:text-[#F0F6FB]" />
                ) : (
                  <MoonIcon size={17} className="text-primary dark:text-[#F0F6FB]" />
                )}
                <span>Appearance</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-white/50 capitalize font-medium">{theme} Mode</span>
            </button>
          </div>

          {/* Social Links */}
          <div className="border-t border-[#D0E1F0] dark:border-white/10 pt-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 px-1 block mb-2.5">
              Connect With Us
            </span>
            <div className="flex items-center gap-2 px-1">
              {env.social.youtube && (
                <a
                  href={env.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-white/10 text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-2xs dark:shadow-none transition"
                  aria-label="YouTube"
                >
                  <YoutubeIcon size={18} />
                </a>
              )}
              {env.social.facebook && (
                <a
                  href={env.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-white/10 text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-2xs dark:shadow-none transition"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={18} />
                </a>
              )}
              {env.social.instagram && (
                <a
                  href={env.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-white/10 text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-2xs dark:shadow-none transition"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={18} />
                </a>
              )}
              {env.social.x && (
                <a
                  href={env.social.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-white/10 text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-2xs dark:shadow-none transition"
                  aria-label="X"
                >
                  <XIcon size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-[#D0E1F0] dark:border-white/10 p-4 text-[11px] text-slate-400 dark:text-white/40 text-center">
          © {new Date().getFullYear()} Equip Indian Churches • All Rights Reserved
        </div>
      </div>
    </div>
  );
}

function getNavItemIcon(label: string) {
  switch (label.toLowerCase()) {
    case 'articles':
      return BookIcon;
    case 'sermons & media':
      return WatchScreenIcon;
    case 'events':
      return CalendarIcon;
    case 'recommendations':
      return StarIcon;
    case 'about':
      return UserIcon;
    default:
      return BookIcon;
  }
}

function DrawerNavItem({
  item,
  isOpen,
  onToggle,
  onClose,
}: {
  item: NavItem;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const Icon = getNavItemIcon(item.label);

  if (!item.mega) {
    return (
      <Link
        to={item.to || '#'}
        onClick={onClose}
        className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold text-[#182541] dark:text-white/90 hover:bg-white dark:hover:bg-white/10 transition border border-[#D0E1F0]/70 dark:border-white/5 bg-white/60 dark:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-primary dark:text-[#F0F6FB] shrink-0" />
          <span>{item.label}</span>
        </div>
        <ArrowRightIcon size={14} className="text-slate-400 dark:text-white/40" />
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white/60 dark:bg-white/5 overflow-hidden shadow-2xs transition-all">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-3.5 py-3 text-sm font-bold text-[#182541] dark:text-white hover:bg-white/80 dark:hover:bg-white/10 transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-primary dark:text-[#F0F6FB] shrink-0" />
          <span>{item.label}</span>
        </div>
        <ChevronDownIcon
          size={16}
          className={`transition-transform duration-200 text-slate-500 dark:text-white/60 ${
            isOpen ? 'rotate-180 text-primary dark:text-[#F0F6FB]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-[#D0E1F0] dark:border-white/10 p-3.5 bg-white/80 dark:bg-black/20 space-y-4 animate-in fade-in duration-200">
          {item.mega.blurb && (
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-white/70 italic px-1">
              "{item.mega.blurb}"
            </p>
          )}

          {item.to && (
            <Link
              to={item.to}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-[#F0F6FB] hover:underline px-1"
            >
              <span>Explore All {item.label}</span>
              <span>→</span>
            </Link>
          )}

          <div className="space-y-4 pt-1">
            {item.mega.columns.map((col, idx) => (
              <DrawerColumnRenderer key={idx} column={col} onClose={onClose} />
            ))}
          </div>

          {item.mega.cta && (
            <div className="pt-2 border-t border-[#D0E1F0]/70 dark:border-white/10">
              <Link
                to={item.mega.cta.to}
                onClick={onClose}
                className="flex items-center justify-between text-xs font-semibold text-primary dark:text-[#F0F6FB] hover:underline px-1 py-0.5"
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
}

function DrawerColumnRenderer({
  column,
  onClose,
}: {
  column: MegaColumn;
  onClose: () => void;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-[#F0F6FB] pb-1 border-b border-[#D0E1F0]/70 dark:border-white/10">
        {column.title}
      </h4>

      {column.links && column.links.length > 0 && (
        <div className="space-y-1">
          {column.links.map((link) =>
            link.external ? (
              <a
                key={link.to}
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-white/80 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition"
              >
                <span>{link.label}</span>
                <ExternalLinkIcon size={12} className="text-slate-400 dark:text-white/40 shrink-0" />
              </a>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-white/80 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition"
              >
                <span>{link.label}</span>
                <ArrowRightIcon size={11} className="text-slate-400 dark:text-white/30 shrink-0" />
              </Link>
            ),
          )}
        </div>
      )}

      {column.source && <DrawerDynamicTerms source={column.source} onClose={onClose} />}
    </div>
  );
}

function DrawerDynamicTerms({
  source,
  onClose,
}: {
  source: MegaColumn['source'];
  onClose: () => void;
}) {
  if (!source) return null;

  const taxonomy = source.kind === 'terms' ? source.taxonomy : 'videoCategory';
  const filterFor =
    source.kind === 'sermonCategories' ? 'sermon' : source.kind === 'videoCategories' ? 'video' : undefined;
  const limit = source.kind === 'terms' ? source.limit || 6 : 6;
  const orderby = source.kind === 'terms' ? source.orderby || 'count' : 'count';

  const { data: regularTerms } = useTerms(taxonomy, { perPage: limit, orderby }, !filterFor);
  const { data: filteredTerms } = useFilterTerms(
    filterFor === 'sermon' ? 'sermon' : 'video',
    taxonomy,
    !!filterFor,
  );

  const list = filterFor ? filteredTerms?.slice(0, limit) || [] : regularTerms?.items || [];

  if (!list || list.length === 0) {
    return null;
  }

  const getUrl = (t: { id: number; slug: string }) => {
    if (taxonomy === 'series') return `/series/${t.slug}`;
    if (taxonomy === 'category') return `/articles?category=${t.id}`;
    if (taxonomy === 'topic') return `/articles?topic=${t.id}`;
    if (filterFor === 'sermon') return `/sermons?videoCategory=${t.id}`;
    return `/videos?videoCategory=${t.id}`;
  };

  // For category / topic, render as neat compact interactive chips
  if (taxonomy === 'category' || taxonomy === 'topic') {
    return (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {list.map((term) => (
          <Link
            key={term.id}
            to={getUrl(term)}
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-md border border-[#D0E1F0] dark:border-white/10 bg-white/80 dark:bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-white/85 hover:border-primary hover:text-primary dark:hover:border-[#F0F6FB] dark:hover:text-[#F0F6FB] transition shadow-2xs"
          >
            <span className="truncate max-w-[130px]">{term.name}</span>
            {'count' in term && typeof term.count === 'number' && term.count > 0 && (
              <span className="text-[9px] text-slate-400 dark:text-white/40">({term.count})</span>
            )}
          </Link>
        ))}
      </div>
    );
  }

  // For series / sermon / video categories, render as clean sub-links
  return (
    <div className="space-y-1 pt-1">
      {list.map((term) => (
        <Link
          key={term.id}
          to={getUrl(term)}
          onClick={onClose}
          className="flex items-center justify-between text-xs text-slate-600 dark:text-white/70 hover:text-primary dark:hover:text-[#F0F6FB] hover:underline py-0.5 transition-colors pl-1"
        >
          <span className="truncate">{term.name}</span>
          <span className="text-slate-400 dark:text-white/30 text-[10px]">→</span>
        </Link>
      ))}
    </div>
  );
}
