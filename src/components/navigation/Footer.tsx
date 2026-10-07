import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { site, socialLinks, wpLink } from '@/config/site';
import { wpPages, contentTypes } from '@/config/content';
import { env } from '@/config/env';
import {
  ExternalLinkIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  XIcon,
  YoutubeIcon,
} from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: FormEvent) => {
    if (!env.newsletterActionUrl) {
      e.preventDefault();
      setSubscribed(true);
      return;
    }
  };

  return (
    <footer className="border-t border-line bg-bg text-body transition-colors">
      {/* Newsletter Section */}
      <div className="border-b border-line bg-surface py-14 sm:py-16">
        <div className="container-page max-w-4xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-ink shadow-xs">
            <MailIcon size={22} />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight">
            Stay Equipped. Stay Encouraged.
          </h3>
          <p className="mt-2.5 text-sm sm:text-base text-muted max-w-xl mx-auto leading-relaxed">
            Subscribe to receive new articles, expository sermons, and ministry resources directly in your inbox.
          </p>

          {subscribed ? (
            <div className="mt-6 rounded-md bg-accent/15 border border-accent/40 p-4 text-sm font-semibold text-accent-text">
              Thank you for subscribing! We look forward to staying connected.
            </div>
          ) : (
            <form
              action={env.newsletterActionUrl || undefined}
              method={env.newsletterActionUrl ? 'POST' : undefined}
              onSubmit={handleNewsletterSubmit}
              className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                name={env.newsletterEmailField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                className="h-11 w-full rounded-[6px] border border-line bg-bg px-4 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full sm:w-auto shrink-0 rounded-[6px] bg-accent text-accent-ink hover:brightness-105 font-semibold h-11 px-6 shadow-xs"
              >
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer Links: Clean Light Blue Background */}
      <div className="container-page py-14 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Column 1: Mission & Brand (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="inline-block group">
              <img
                src={site.logoUrl}
                alt={site.name}
                className="h-10 w-auto object-contain transition-all group-hover:opacity-90 dark:brightness-0 dark:invert"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = site.logoFallback;
                }}
              />
              <span className="sr-only">{site.name} - Equipping the Church</span>
            </Link>
            <p className="text-sm leading-relaxed text-body max-w-md">
              {site.mission}
            </p>
            {env.contactEmail && (
              <p className="text-xs text-muted">
                Contact:{' '}
                <a
                  href={`mailto:${env.contactEmail}`}
                  className="text-ink hover:text-accent-text underline transition-colors"
                >
                  {env.contactEmail}
                </a>
              </p>
            )}

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
                <li>
                  <Link to={`/${contentTypes.gallery.route}`} className="hover:text-ink transition-colors">
                    Photo Galleries
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
                  <a
                    href={wpLink(wpPages.about)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-ink transition-colors"
                  >
                    <span>About Us</span>
                    <ExternalLinkIcon size={12} className="opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href={wpLink(wpPages.whatIsEic)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-ink transition-colors"
                  >
                    <span>What is EIC?</span>
                    <ExternalLinkIcon size={12} className="opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href={wpLink(wpPages.whatWeBelieve)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-ink transition-colors"
                  >
                    <span>What We Believe</span>
                    <ExternalLinkIcon size={12} className="opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href={wpLink(wpPages.contact)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-ink transition-colors"
                  >
                    <span>Contact & Inquiries</span>
                    <ExternalLinkIcon size={12} className="opacity-60" />
                  </a>
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
