import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CloseIcon,
  SunIcon,
  MoonIcon,
  ChurchEmblemIcon,
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
      <div className="relative z-10 flex h-full w-[85%] max-w-sm flex-col bg-[#090D14] border-r border-white/10 text-white shadow-2xl animate-in slide-in-from-left duration-250">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/15">
              <ChurchEmblemIcon size={24} />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold leading-tight">Equip Indian Churches</h2>
              <p className="text-[11px] text-white/50">Christian Ministry & Media</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile drawer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Mission Capsule */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/80">
            <span className="font-serif font-bold text-white block mb-1">Our Mission</span>
            Equipping pastors, leaders, and saints across India through sound biblical theology and gospel-centered resources.
          </div>

          {/* Core Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-2 block mb-2">
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
          <div className="border-t border-white/10 pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-2 block mb-2">
              Preferences
            </span>
            <button
              type="button"
              onClick={toggle}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/5 active:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <SunIcon size={18} className="text-[#FF533D]" /> : <MoonIcon size={18} className="text-[#FF533D]" />}
                <span>Appearance</span>
              </div>
              <span className="text-xs text-white/50 capitalize">{theme} Mode</span>
            </button>
          </div>

          {/* Social Links */}
          <div className="border-t border-white/10 pt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-2 block mb-3">
              Connect With Us
            </span>
            <div className="flex items-center gap-3 px-2">
              {env.social.youtube && (
                <a
                  href={env.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-[#FF533D] hover:text-white transition"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-[#FF533D] hover:text-white transition"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-[#FF533D] hover:text-white transition"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-[#FF533D] hover:text-white transition"
                  aria-label="X"
                >
                  <XIcon size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-white/10 p-4 text-[11px] text-white/40 text-center">
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
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5 hover:text-white active:bg-white/10 transition"
    >
      <Icon size={18} className="text-white/60" />
      <span>{label}</span>
    </Link>
  );
}
