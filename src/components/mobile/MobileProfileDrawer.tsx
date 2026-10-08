import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CloseIcon,
  SunIcon,
  MoonIcon,
  BookIcon,
  UserIcon,
  CalendarIcon,
  ImageIcon,
  SearchIcon,
  YoutubeIcon,
  FacebookIcon,
  InstagramIcon,
  XIcon,
  WatchScreenIcon,
  HeadphonesIcon,
  SailboatIcon,
  BookmarkIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  MapPinIcon,
  MailIcon,
} from '@/components/ui/Icons';
import { useTheme } from '@/hooks/useTheme';
import { useBookmarks } from '@/lib/bookmarks';
import { useTerms } from '@/hooks/queries';
import { env } from '@/config/env';
import { site, wpLink } from '@/config/site';
import { wpPages } from '@/config/content';

interface MobileProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileProfileDrawer({ open, onClose }: MobileProfileDrawerProps) {
  const { theme, toggle } = useTheme();
  const { count: savedCount } = useBookmarks();
  const { data: categories } = useTerms('category', { perPage: 12, orderby: 'count' });
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

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

  const displayedCategories = showAllCategories
    ? categories?.items || []
    : (categories?.items || []).slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative z-10 flex h-full w-[88%] max-w-sm flex-col bg-[#F0F6FB] dark:bg-[#090D14] border-r border-[#D0E1F0] dark:border-white/10 text-[#182541] dark:text-white shadow-2xl animate-in slide-in-from-left duration-250 transition-colors">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#D0E1F0] dark:border-white/10 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-white/10 border border-[#D0E1F0] dark:border-white/15 p-2 shadow-xs">
              <img
                src={site.mobileLogoUrl}
                alt={site.name}
                className="h-full w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = site.mobileLogoFallback;
                }}
              />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold leading-tight">Equip Indian Churches</h2>
              <p className="text-[11px] text-slate-500 dark:text-white/50">Christian Ministry & Media</p>
            </div>
          </div>

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
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Feature 1: Fast Quick Search */}
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

          {/* Mission Capsule */}
          <div className="rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-3.5 text-xs leading-relaxed text-slate-600 dark:text-white/80 shadow-2xs dark:shadow-none">
            <span className="font-serif font-bold text-[#182541] dark:text-white block mb-0.5">Our Mission</span>
            Equipping pastors, leaders, and churches across India with sound biblical theology and gospel-centered preaching.
          </div>

          {/* Section 1: Media & Streaming */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 px-2 block mb-1.5">
              Audio & Video Media
            </span>
            <DrawerLink to="/sermons" icon={HeadphonesIcon} label="Expository Sermons" onClick={onClose} />
            <DrawerLink to="/videos" icon={WatchScreenIcon} label="Video Messages & Q&A" onClick={onClose} />
            <DrawerLink to="/series" icon={SailboatIcon} label="Teaching Series & Expositions" onClick={onClose} />
            <DrawerLink
              to="/library"
              icon={BookmarkIcon}
              label="Saved in My Library"
              onClick={onClose}
              badge={savedCount > 0 ? `${savedCount}` : undefined}
            />
          </div>

          {/* Section 2: Articles & Publications with Sub-Categories */}
          <div className="space-y-1 border-t border-[#D0E1F0] dark:border-white/10 pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 px-2 block mb-1.5">
              Theological Library & Publications
            </span>
            <DrawerLink to="/articles" icon={BookIcon} label="All Articles & Essays" onClick={onClose} />
            <DrawerLink to="/book-reviews" icon={BookIcon} label="Book Reviews" onClick={onClose} />

            {/* Sub-categories & Theological Topics */}
            {categories?.items && categories.items.length > 0 && (
              <div className="mt-2.5 rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white/70 dark:bg-white/5 p-3">
                <span className="text-[11px] font-semibold text-ink dark:text-white block mb-2">
                  Browse by Theological Category:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {displayedCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/articles?category=${cat.id}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-white/85 hover:border-primary hover:text-primary dark:hover:border-[#F0F6FB] dark:hover:text-[#F0F6FB] shadow-2xs transition"
                    >
                      <span>{cat.name}</span>
                      {cat.count !== undefined && (
                        <span className="text-[9px] text-slate-400 dark:text-white/40">({cat.count})</span>
                      )}
                    </Link>
                  ))}
                </div>

                {categories.items.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllCategories((prev) => !prev)}
                    className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-[#F0F6FB] hover:underline cursor-pointer"
                  >
                    <span>{showAllCategories ? 'Show fewer topics' : `+ Show ${categories.items.length - 6} more topics`}</span>
                    <ChevronDownIcon size={12} className={`transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Fellowship & Community */}
          <div className="space-y-1 border-t border-[#D0E1F0] dark:border-white/10 pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 px-2 block mb-1.5">
              Fellowship & Ministry Network
            </span>
            <DrawerLink to="/authors" icon={UserIcon} label="Preachers & Authors Directory" onClick={onClose} />
            <DrawerLink to="/events" icon={CalendarIcon} label="Conferences & Pastors Roundtables" onClick={onClose} />
            <DrawerLink to="/gallery" icon={ImageIcon} label="Conference Photos & Albums" onClick={onClose} />
            <DrawerLink to="/churches" icon={MapPinIcon} label="Church Directory" onClick={onClose} />
          </div>

          {/* Section 4: About & Statement of Faith */}
          <div className="space-y-1 border-t border-[#D0E1F0] dark:border-white/10 pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 px-2 block mb-1.5">
              About EIC & Doctrine
            </span>
            <DrawerExternalLink
              href={wpLink(wpPages.whatWeBelieve)}
              label="What We Believe (Statement of Faith)"
            />
            <DrawerExternalLink
              href={wpLink(wpPages.about)}
              label="About Equip Indian Churches"
            />
            <DrawerExternalLink
              href={wpLink(wpPages.whatIsEic)}
              label="What is EIC? (Our Vision & Story)"
            />
            <DrawerExternalLink
              href={wpLink(wpPages.contact)}
              label="Contact & Inquiries"
            />
          </div>

          {/* Feature 2: Weekly Gospel Digest Newsletter */}
          <div className="rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-3.5 shadow-2xs dark:shadow-none">
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
          <div className="border-t border-[#D0E1F0] dark:border-white/10 pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 px-2 block mb-2">
              Display Preferences
            </span>
            <button
              type="button"
              onClick={toggle}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#182541] dark:text-white/90 hover:bg-white/70 dark:hover:bg-white/5 active:bg-white dark:active:bg-white/10 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <SunIcon size={18} className="text-primary dark:text-[#F0F6FB]" />
                ) : (
                  <MoonIcon size={18} className="text-primary dark:text-[#F0F6FB]" />
                )}
                <span>Appearance</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-white/50 capitalize font-medium">{theme} Mode</span>
            </button>
          </div>

          {/* Social Links */}
          <div className="border-t border-[#D0E1F0] dark:border-white/10 pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 px-2 block mb-3">
              Connect With Us
            </span>
            <div className="flex items-center gap-2.5 px-1">
              {env.social.youtube && (
                <a
                  href={env.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-transparent text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-2xs dark:shadow-none transition"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-transparent text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-2xs dark:shadow-none transition"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-transparent text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-2xs dark:shadow-none transition"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-transparent text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-2xs dark:shadow-none transition"
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

function DrawerLink({
  to,
  icon: Icon,
  label,
  onClick,
  badge,
}: {
  to: string;
  icon: any;
  label: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-[#182541] dark:text-white/85 hover:bg-white/70 dark:hover:bg-white/5 hover:text-[#182541] dark:hover:text-white active:bg-white dark:active:bg-white/10 transition"
    >
      <div className="flex items-center gap-3">
        <Icon size={17} className="text-slate-400 dark:text-white/60 shrink-0" />
        <span>{label}</span>
      </div>
      {badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#182541] dark:bg-[#F0F6FB] px-1.5 text-[10px] font-bold text-white dark:text-[#070A0F]">
          {badge}
        </span>
      )}
    </Link>
  );
}

function DrawerExternalLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-[#182541] dark:text-white/85 hover:bg-white/70 dark:hover:bg-white/5 hover:text-[#182541] dark:hover:text-white transition"
    >
      <span>{label}</span>
      <ExternalLinkIcon size={14} className="text-slate-400 dark:text-white/50 shrink-0" />
    </a>
  );
}
