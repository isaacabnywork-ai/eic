import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { bookstoresData } from '@/data/recommendations';
import { ExternalLinkIcon, MapPinIcon, ArrowRightIcon, BookIcon } from '@/components/ui/Icons';

export function BookstoresArchivePage() {
  return (
    <>
      <SeoHead
        title="Recommended Christian Bookstores & Publishers"
        description="Trusted Christian bookstores, literature distributors, and publishers in India providing sound biblical theology."
        path="/bookstores"
      />

      <PageHeader
        title="Recommended Bookstores"
        eyebrow="Sound Christian Literature"
        description="Faithful bookstores, publishers, and distributors in India that we recommend for solid biblical theology, commentaries, Bibles, and edifying Christian books."
      />

      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {bookstoresData.map((store) => (
            <article
              key={store.id}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-7 shadow-xs transition-all duration-300 hover:border-accent hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-text">
                    {store.categoryLabel}
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-ink group-hover:text-accent-text transition-colors leading-tight">
                  <Link to={`/bookstores/${store.slug}`}>{store.title}</Link>
                </h3>

                {store.location && (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <MapPinIcon size={13} className="text-accent-text" />
                    <span>{store.location}</span>
                  </p>
                )}

                <p className="mt-3.5 text-sm text-body leading-relaxed">
                  {store.description}
                </p>

                {store.focusAreas && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {store.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="rounded-md border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-7 pt-5 border-t border-line/80 flex items-center justify-between text-xs">
                <Link
                  to={`/bookstores/${store.slug}`}
                  className="font-bold text-ink hover:text-accent-text transition-colors inline-flex items-center gap-1"
                >
                  <span>Store Details</span>
                  <ArrowRightIcon size={13} />
                </Link>

                <a
                  href={store.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted hover:text-accent-text transition-colors font-medium"
                >
                  <span>Visit Online Store</span>
                  <ExternalLinkIcon size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Informational Callout */}
        <div className="mt-14 rounded-2xl border border-line bg-surface-2/60 p-8 text-center max-w-3xl mx-auto">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent-text">
            <BookIcon size={24} />
          </div>
          <h4 className="font-serif text-xl font-bold text-ink">
            Looking for Book Recommendations?
          </h4>
          <p className="mt-2 text-sm text-body leading-relaxed max-w-xl mx-auto">
            Explore our curated book reviews for guidance on biblical titles, commentaries, and pastoral works reviewed by Indian leaders.
          </p>
          <div className="mt-5">
            <Link
              to="/book-reviews"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-text hover:underline"
            >
              <span>Explore EIC Book Reviews →</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
