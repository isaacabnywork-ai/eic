import { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from '@/components/ui/Icons';
import { useTheme } from '@/hooks/useTheme';
import { env } from '@/config/env';
import { site } from '@/config/site';

interface MobileProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileProfileDrawer({ open, onClose }: MobileProfileDrawerProps) {
  const { theme, toggle } = useTheme();

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

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative z-10 flex h-full w-[85%] max-w-sm flex-col bg-[#F0F6FB] dark:bg-[#090D14] border-r border-[#D0E1F0] dark:border-white/10 text-[#182541] dark:text-white shadow-2xl animate-in slide-in-from-left duration-250 transition-colors">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#D0E1F0] dark:border-white/10 p-5">
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
            aria-label="Close profile drawer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Mission Capsule */}
          <div className="rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-4 text-xs leading-relaxed text-slate-600 dark:text-white/80 shadow-xs dark:shadow-none">
            <span className="font-serif font-bold text-[#182541] dark:text-white block mb-1">Our Mission</span>
            Equipping pastors, leaders, and saints across India through sound biblical theology and gospel-centered resources.
          </div>

          {/* Core Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 px-2 block mb-2">
              Browse Ministry Sections
            </span>

            <DrawerLink to="/articles" icon={BookIcon} label="Articles & Essays" onClick={onClose} />
            <DrawerLink to="/authors" icon={UserIcon} label="Preachers & Authors" onClick={onClose} />
            <DrawerLink to="/book-reviews" icon={BookIcon} label="Book Reviews" onClick={onClose} />
            <DrawerLink to="/events" icon={CalendarIcon} label="Conferences & Events" onClick={onClose} />
            <DrawerLink to="/gallery" icon={ImageIcon} label="Ministry Photos & Gallery" onClick={onClose} />
            <DrawerLink to="/search" icon={SearchIcon} label="Search All Content" onClick={onClose} />
          </div>

          {/* Quick Preferences */}
          <div className="border-t border-[#D0E1F0] dark:border-white/10 pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 px-2 block mb-2">
              Preferences
            </span>
            <button
              type="button"
              onClick={toggle}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#182541] dark:text-white/90 hover:bg-white/70 dark:hover:bg-white/5 active:bg-white dark:active:bg-white/10 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <SunIcon size={18} className="text-primary dark:text-[#F0F6FB]" /> : <MoonIcon size={18} className="text-primary dark:text-[#F0F6FB]" />}
                <span>Appearance</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-white/50 capitalize">{theme} Mode</span>
            </button>
          </div>

          {/* Social Links */}
          <div className="border-t border-[#D0E1F0] dark:border-white/10 pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/40 px-2 block mb-3">
              Connect With Us
            </span>
            <div className="flex items-center gap-3 px-2">
              {env.social.youtube && (
                <a
                  href={env.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-transparent text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-xs dark:shadow-none transition"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-transparent text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-xs dark:shadow-none transition"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-transparent text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-xs dark:shadow-none transition"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-[#D0E1F0] dark:border-transparent text-slate-700 dark:text-white/70 hover:bg-[#182541] hover:text-white dark:hover:bg-[#F0F6FB] dark:hover:text-[#070A0F] shadow-xs dark:shadow-none transition"
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
          © {new Date().getFullYear()} Equip Indian Churches
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
}: {
  to: string;
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#182541] dark:text-white/85 hover:bg-white/70 dark:hover:bg-white/5 hover:text-[#182541] dark:hover:text-white active:bg-white dark:active:bg-white/10 transition"
    >
      <Icon size={18} className="text-slate-400 dark:text-white/60" />
      <span>{label}</span>
    </Link>
  );
}
