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

export function SeminarySinglePage() {
  const { slug } = useParams<{ slug: string }>();
  const seminary = slug ? getRecommendationBySlug(slug) : undefined;

  if (!seminary || seminary.category !== 'seminary') {
    return <Navigate to="/seminaries" replace />;
  }

  return (
    <>
      <SeoHead
        title={`${seminary.title} - Recommended Seminary`}
        description={seminary.description}
        path={`/seminaries/${seminary.slug}`}
      />

      {/* Header Banner */}
      <section className="border-b border-line bg-surface py-12 sm:py-16">
        <div className="container-page max-w-4xl">
          <Link
            to="/seminaries"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors mb-6"
          >
            <ChevronLeftIcon size={16} />
            <span>Back to All Seminaries</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-text">
              {seminary.categoryLabel}
            </span>
            {seminary.established && (
              <span className="text-xs text-muted">Established {seminary.established}</span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight">
            {seminary.title}
          </h1>

          {seminary.location && (
            <p className="mt-3 text-sm font-semibold text-muted flex items-center gap-2">
              <MapPinIcon size={16} className="text-accent-text" />
              <span>{seminary.location}</span>
            </p>
          )}

          <p className="mt-4 text-base sm:text-lg text-body leading-relaxed max-w-3xl">
            {seminary.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={seminary.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#182541] dark:bg-[#F0F6FB] px-6 py-3.5 text-sm font-bold text-white dark:text-[#070A0F] hover:brightness-105 transition shadow-sm"
            >
              <span>Visit Official Website</span>
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
                About {seminary.title}
              </h2>
              <p className="text-base text-body leading-relaxed">
                {seminary.description}
              </p>

              {seminary.focusAreas && (
                <div className="mt-6 pt-6 border-t border-line">
                  <h3 className="font-serif text-lg font-bold text-ink mb-3">
                    Curriculum & Ministry Focus Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {seminary.focusAreas.map((area) => (
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
                Institution Profile & Admissions Info
              </h4>
              <p className="mt-1 text-xs text-muted max-w-md mx-auto">
                Detailed prospectus, faculty profiles, and admission guidelines will be displayed here.
              </p>
            </div>
          </div>

          {/* Quick Details Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
              <h3 className="font-serif text-base font-bold text-ink mb-4 pb-3 border-b border-line">
                Institution Summary
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-muted block mb-0.5">Category</span>
                  <span className="font-semibold text-ink">{seminary.categoryLabel}</span>
                </div>

                {seminary.location && (
                  <div>
                    <span className="text-muted block mb-0.5">Location</span>
                    <span className="font-semibold text-ink">{seminary.location}</span>
                  </div>
                )}

                {seminary.established && (
                  <div>
                    <span className="text-muted block mb-0.5">Year Established</span>
                    <span className="font-semibold text-ink">{seminary.established}</span>
                  </div>
                )}

                <div>
                  <span className="text-muted block mb-0.5">Web Portal</span>
                  <a
                    href={seminary.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-accent-text hover:underline inline-flex items-center gap-1"
                  >
                    <span>{seminary.website.replace('https://', '').replace('/', '')}</span>
                    <ExternalLinkIcon size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Other Seminaries Shortcut */}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
              <h4 className="font-serif text-sm font-bold text-ink mb-3">
                Explore Other Seminaries
              </h4>
              <Link
                to="/seminaries"
                className="text-xs font-semibold text-accent-text hover:underline inline-flex items-center gap-1"
              >
                <span>View all recommended institutions</span>
                <ArrowRightIcon size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
