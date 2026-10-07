import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { cn } from '@/lib/format';
import { ArrowRightIcon } from './Icons';

interface SectionProps {
  title: string;
  eyebrow?: string;
  description?: string;
  /** "View all" link */
  to?: string;
  toLabel?: string;
  tone?: 'default' | 'soft' | 'dark';
  id?: string;
  children: ReactNode;
  className?: string;
}

/** Home / page section with consistent heading + "view all" link. */
export function Section({
  title,
  eyebrow,
  description,
  to,
  toLabel = 'View all',
  tone = 'default',
  id,
  children,
  className,
}: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        'py-16 sm:py-20 lg:py-24',
        tone === 'default' && 'bg-surface',
        (tone === 'soft' || tone === 'dark') && 'border-y border-line bg-bg',
        className,
      )}
    >
      <div className="container-page">
        <header className="mb-10 sm:mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
                {eyebrow}
              </p>
            )}
            <h2
              id={headingId}
              className="font-serif text-3xl font-bold sm:text-4xl lg:text-[40px] leading-tight text-ink"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-3 text-base sm:text-lg leading-relaxed text-body">
                {description}
              </p>
            )}
          </div>
          {to && (
            <Link
              to={to}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold transition-colors text-ink hover:text-accent-text"
            >
              <span>{toLabel}</span>
              <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </header>
        {children}
      </div>
    </section>
  );
}

/** Page title block for archive / index pages. */
export function PageHeader({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-line bg-bg">
      <div className="container-page py-12 sm:py-16">
        {eyebrow && (
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent-text">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-body leading-relaxed">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  );
}

export function Badge({
  children,
  tone = 'soft',
  className,
}: {
  children: ReactNode;
  tone?: 'soft' | 'gold' | 'dark';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-xs font-semibold',
        tone === 'soft' && 'bg-surface-2 text-ink',
        tone === 'gold' && 'bg-accent/20 text-accent-text',
        tone === 'dark' && 'bg-[#182541] text-white',
        className,
      )}
    >
      {children}
    </span>
  );
}
