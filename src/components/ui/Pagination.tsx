import { cn } from '@/lib/format';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** 1 … 4 5 [6] 7 8 … 20 */
function pageList(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (page >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => set.add(n));
  const sorted = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push('gap');
    out.push(n);
  });
  return out;
}

/** Numbered pagination driven by the X-WP-TotalPages header. */
export function Pagination({ page, totalPages, onChange, className }: Props) {
  if (totalPages <= 1) return null;
  const item =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors';
  return (
    <nav aria-label="Pagination" className={cn('mt-12 flex flex-wrap items-center justify-center gap-1.5', className)}>
      <button
        type="button"
        className={cn(item, 'border border-line bg-surface hover:border-primary disabled:opacity-40')}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon size={18} />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-muted" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              item,
              p === page
                ? 'bg-primary text-primary-ink'
                : 'border border-transparent text-ink hover:border-line hover:bg-surface',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={cn(item, 'border border-line bg-surface hover:border-primary disabled:opacity-40')}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon size={18} />
      </button>
      <p className="sr-only" aria-live="polite">
        Page {page} of {totalPages}
      </p>
    </nav>
  );
}
