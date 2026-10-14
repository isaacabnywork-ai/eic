import { useParams, Link, Navigate } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { getRecommendationBySlug } from '@/data/recommendations';
import {
  ExternalLinkIcon,
  MapPinIcon,
  ChevronLeftIcon,
  BookIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';

export function BookstoreSinglePage() {
  const { slug } = useParams<{ slug: string }>();
  const store = slug ? getRecommendationBySlug(slug) : undefined;

  if (!store || store.category !== 'bookstore') {
    return <Navigate to="/bookstores" replace />;
  }

  return (
    <>
      <SeoHead
        title={`${store.title} - Recommended Bookstore`}
        description={store.description}
        path={`/bookstores/${store.slug}`}
      />

      {/* Header Banner */}
      <section className="border-b border-line bg-surface py-12 sm:py-16">
        <div className="container-page max-w-4xl">
          <Link
            to="/bookstores"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors mb-6"
          >
            <ChevronLeftIcon size={16} />
            <span>Back to All Bookstores</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-text">
              {store.categoryLabel}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight">
            {store.title}
          </h1>

          {store.location && (
            <p className="mt-3 text-sm font-semibold text-muted flex items-center gap-2">
              <MapPinIcon size={16} className="text-accent-text" />
              <span>{store.location}</span>
            </p>
          )}

          <p className="mt-4 text-base sm:text-lg text-body leading-relaxed max-w-3xl">
            {store.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={store.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#182541] dark:bg-[#F0F6FB] px-6 py-3.5 text-sm font-bold text-white dark:text-[#070A0F] hover:brightness-105 transition shadow-sm"
            >
              <span>Visit Online Bookstore</span>
              <ExternalLinkIcon size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Content Body Area */}
      <div className="container-page max-w-4xl py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="rounded-2xl border border-line bg-surface p-7 sm:p-8 shadow-xs">
              <h2 className="font-serif text-2xl font-bold text-ink mb-4">
                About {store.title}
              </h2>
              <p className="text-base text-body leading-relaxed">
                {store.description}
              </p>

              {store.focusAreas && (
                <div className="mt-6 pt-6 border-t border-line">
                  <h3 className="font-serif text-lg font-bold text-ink mb-3">
                    Featured Titles & Literature Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {store.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="rounded-lg border border-line bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-ink"
                      >
                        ✓ {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content Placeholder for user's content */}
            <div className="rounded-2xl border border-dashed border-line bg-surface-2/40 p-8 text-center">
              <BookIcon size={32} className="mx-auto text-muted mb-2" />
              <h4 className="font-serif text-base font-bold text-ink">
                Publisher Catalogue & Ordering Instructions
              </h4>
              <p className="mt-1 text-xs text-muted max-w-md mx-auto">
                Detailed book categories, catalog links, and shipping details will be displayed here.
              </p>
            </div>
          </div>

          {/* Quick Details Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
              <h3 className="font-serif text-base font-bold text-ink mb-4 pb-3 border-b border-line">
                Bookstore Summary
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-muted block mb-0.5">Category</span>
                  <span className="font-semibold text-ink">{store.categoryLabel}</span>
                </div>

                {store.location && (
                  <div>
                    <span className="text-muted block mb-0.5">Distribution</span>
                    <span className="font-semibold text-ink">{store.location}</span>
                  </div>
                )}

                <div>
                  <span className="text-muted block mb-0.5">Website</span>
                  <a
                    href={store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-accent-text hover:underline inline-flex items-center gap-1"
                  >
                    <span>{store.website.replace('https://', '').replace('/', '')}</span>
                    <ExternalLinkIcon size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Other Bookstores Shortcut */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
              <h4 className="font-serif text-sm font-bold text-ink mb-3">
                Explore Other Bookstores
              </h4>
              <Link
                to="/bookstores"
                className="text-xs font-semibold text-accent-text hover:underline inline-flex items-center gap-1"
              >
                <span>View all recommended bookstores</span>
                <ArrowRightIcon size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
