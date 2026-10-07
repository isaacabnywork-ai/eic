import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/navigation/Footer';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink selection:bg-accent selection:text-accent-ink transition-colors">
      {/* Skip to Content for screen reader / keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <Footer />

      <ScrollRestoration />
    </div>
  );
}
