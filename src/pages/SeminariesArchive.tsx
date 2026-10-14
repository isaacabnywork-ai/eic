import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';
import { seminariesData } from '@/data/recommendations';
import { ExternalLinkIcon, MapPinIcon, ArrowRightIcon, BookIcon } from '@/components/ui/Icons';

export function SeminariesArchivePage() {
  return (
    <>
      <SeoHead
        title="Recommended Seminaries & Bible Colleges"
        description="Faithful theological institutions and seminaries in India equipping pastors and church leaders with sound doctrine."
        path="/seminaries"
      />

      <PageHeader
        title="Recommended Seminaries"
        eyebrow="Theological Education"
        description="Institutions and bible colleges in India that we recommend for faithful, Scripture-centred pastoral training, biblical exposition, and theological clarity."
      />

      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {seminariesData.map((seminary) => (
            <article
              key={seminary.id}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-7 shadow-xs transition-all duration-300 hover:border-accent hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-text">
                    {seminary.categoryLabel}
                  </span>
                  {seminary.established && (
                    <span className="text-xs text-muted">Est. {seminary.established}</span>
                  )}
                </div>

                <h3 className="font-serif text-2xl font-bold text-ink group-hover:text-accent-text transition-colors leading-tight">
                  <Link to={`/seminaries/${seminary.slug}`}>{seminary.title}</Link>
                </h3>

                {seminary.location && (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <MapPinIcon size={13} className="text-accent-text" />
                    <span>{seminary.location}</span>
                  </p>
                )}

                <p className="mt-3.5 text-sm text-body leading-relaxed">
                  {seminary.description}
                </p>

                {seminary.focusAreas && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {seminary.focusAreas.map((area) => (
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
                  to={`/seminaries/${seminary.slug}`}
                  className="font-bold text-ink hover:text-accent-text transition-colors inline-flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRightIcon size={13} />
                </Link>

                <a
                  href={seminary.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted hover:text-accent-text transition-colors font-medium"
                >
                  <span>Official Website</span>
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
            Need Guidance on Theological Studies?
          </h4>
          <p className="mt-2 text-sm text-body leading-relaxed max-w-xl mx-auto">
            Equip Indian Churches recommends institutions rooted in the infallibility of God's Word, gospel-centred doctrine, and heart for local church ministry.
          </p>
          <div className="mt-5">
            <Link
              to="/bookstores"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-text hover:underline"
            >
              <span>Also explore recommended Christian Bookstores →</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
