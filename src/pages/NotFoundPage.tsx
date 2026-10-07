import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';

export function NotFoundPage() {
  return (
    <>
      <SeoHead title="Page Not Found" noindex />

      <div className="container-page py-24 sm:py-32 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-accent-text">
          404 Error
        </p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink">
          Page Not Found
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted max-w-md mx-auto">
          The page or resource you are looking for may have been moved, renamed, or is temporarily unavailable.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-ink hover:bg-primary-hover shadow-md transition-colors"
          >
            Back to Home
          </Link>
          <Link
            to="/articles"
            className="rounded-full border border-line bg-surface px-6 py-3 font-semibold text-ink hover:border-primary hover:text-link shadow-sm transition-colors"
          >
            Browse Articles
          </Link>
          <Link
            to="/search"
            className="rounded-full border border-line bg-surface px-6 py-3 font-semibold text-ink hover:border-primary hover:text-link shadow-sm transition-colors"
          >
            Search Library
          </Link>
        </div>
      </div>
    </>
  );
}
