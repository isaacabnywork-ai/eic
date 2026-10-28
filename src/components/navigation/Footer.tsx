import { Link } from 'react-router-dom';
import { site, socialLinks } from '@/config/site';
import { contentTypes } from '@/config/content';
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from '@/components/ui/Icons';

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg text-body transition-colors">
      {/* Main Footer Links: Clean Light Blue Background */}
      <div className="container-page py-14 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Column 1: Mission & Brand (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="inline-block group">
              <img
                src={site.logoUrl}
                alt={site.name}
                className="h-14 sm:h-16 w-auto object-contain transition-all group-hover:opacity-90 invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = site.logoFallback;
                }}
              />
              <span className="sr-only">{site.name} - Equipping the Church</span>
            </Link>

            <p className="text-sm text-body leading-relaxed max-w-sm">
              A ministry in which several pastors have partnered together to help provide a direction &amp; momentum to the Biblical gospel growth to the Indian Church.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {socialLinks.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-muted hover:border-accent hover:text-ink transition-colors shadow-xs"
                >
                  {s.id === 'youtube' && <YoutubeIcon size={17} />}
                  {s.id === 'facebook' && <FacebookIcon size={17} />}
                  {s.id === 'instagram' && <InstagramIcon size={17} />}
                  {s.id === 'x' && <XIcon size={17} />}
                </a>
              ))}
            </div>
          </div>

          {/* Columns 2-4: Clean Navigation (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
            {/* Resources Column */}
            <div>
              <h4 className="font-serif text-base font-semibold text-ink mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5 text-sm text-body">
                <li>
                  <Link to={`/${contentTypes.article.route}`} className="hover:text-ink transition-colors">
                    Articles & Essays
                  </Link>
                </li>
                <li>
                  <Link to={`/${contentTypes.sermon.route}`} className="hover:text-ink transition-colors">
                    Sermons & Expositions
                  </Link>
                </li>
                <li>
                  <Link to={`/${contentTypes.video.route}`} className="hover:text-ink transition-colors">
                    Videos & Discussions
                  </Link>
                </li>
                <li>
                  <Link to="/series" className="hover:text-ink transition-colors">
                    Teaching Series
                  </Link>
                </li>
                <li>
                  <Link to={`/${contentTypes.bookReview.route}`} className="hover:text-ink transition-colors">
                    Book Reviews
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ministry & Community */}
            <div>
              <h4 className="font-serif text-base font-semibold text-ink mb-4">
                Ministry
              </h4>
              <ul className="space-y-2.5 text-sm text-body">
                <li>
                  <Link to="/authors" className="hover:text-ink transition-colors">
                    Authors & Speakers
                  </Link>
                </li>
                <li>
                  <Link to={`/${contentTypes.event.route}`} className="hover:text-ink transition-colors">
                    Conferences & Events
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="hover:text-ink transition-colors">
                    Resource Library Search
                  </Link>
                </li>
                {contentTypes.church.enabled && (
                  <li>
                    <Link to={`/${contentTypes.church.route}`} className="hover:text-ink transition-colors">
                      Church Directory
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* About & Beliefs */}
            <div>
              <h4 className="font-serif text-base font-semibold text-ink mb-4">
                About EIC
              </h4>
              <ul className="space-y-2.5 text-sm text-body">
                <li>
                  <Link to="/about" className="hover:text-ink transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-ink transition-colors">
                    What is EIC?
                  </Link>
                </li>
                <li>
                  <Link to="/statement-of-faith" className="hover:text-ink transition-colors">
                    What We Believe
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-ink transition-colors">
                    Contact & Inquiries
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="mt-14 border-t border-line pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Equipping the Church, Uniting the Saints.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
