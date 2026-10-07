import { cn } from '@/lib/format';

interface SkeletonProps {
  className?: string;
}

/** Shimmering placeholder block. Decorative, so hidden from assistive tech. */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

type Variant = 'article' | 'video' | 'book' | 'gallery' | 'event' | 'person' | 'series';

/** Card-shaped skeleton matching each card variant (prevents layout shift). */
export function CardSkeleton({ variant = 'article' }: { variant?: Variant }) {
  switch (variant) {
    case 'video':
      return (
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
      );
    case 'book':
      return (
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="aspect-[2/3] w-full rounded-md" />
          <Skeleton className="h-5 w-10/12" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
      );
    case 'gallery':
      return <Skeleton className="aspect-[4/3] w-full rounded-xl" />;
    case 'event':
      return (
        <div className="flex gap-4 rounded-xl border border-line p-4" aria-hidden="true">
          <Skeleton className="h-16 w-16 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        </div>
      );
    case 'person':
      return (
        <div className="flex items-center gap-4 rounded-xl border border-line p-4" aria-hidden="true">
          <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      );
    case 'series':
      return <Skeleton className="h-44 w-full rounded-2xl" />;
    default:
      return (
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="aspect-[3/2] w-full rounded-xl" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-11/12" />
          <SkeletonText lines={2} />
        </div>
      );
  }
}

const gridClass: Record<Variant, string> = {
  article: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
  video: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
  book: 'grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4',
  gallery: 'grid grid-cols-2 gap-4 lg:grid-cols-3',
  event: 'grid gap-4 md:grid-cols-2',
  person: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
  series: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
};

export function CardGridSkeleton({ variant = 'article', count = 6 }: { variant?: Variant; count?: number }) {
  return (
    <div className={gridClass[variant]} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} variant={variant} />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export { gridClass };
export type { Variant as SkeletonVariant };
