import { useState, useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/navigation/Footer';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileProfileDrawer } from '@/components/mobile/MobileProfileDrawer';

export function Layout() {
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  // Close profile drawer on navigation
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink selection:bg-accent selection:text-accent-ink transition-colors">
      {/* Skip to Content for screen reader / keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Mobile Top App Bar (Native Streaming Header on < md) */}
      <MobileTopBar onOpenProfile={() => setProfileOpen(true)} />
      <MobileProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Desktop Header (>= md) */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Main Content View */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Mobile Bottom Streaming Navigation Bar (< md) */}
      <MobileBottomNav />

      {/* Desktop Footer (>= md) */}
      <div className="hidden md:block">
        <Footer />
      </div>

      <ScrollRestoration />
    </div>
  );
}
