import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { cn } from '@/lib/format';
import { ErrorState } from './States';

interface Props<T> {
  query: Pick<UseQueryResult<T>, 'data' | 'isPending' | 'isError' | 'error' | 'refetch' | 'isFetching' | 'isPlaceholderData'>;
  skeleton: ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
  className?: string;
}

/**
 * One consistent loading / error / empty / content switch for every list.
 * While a new page loads (placeholder data) the old content stays, dimmed.
 */
export function QueryBoundary<T>({ query, skeleton, isEmpty, empty, children, className }: Props<T>) {
  if (query.isPending) return <>{skeleton}</>;
  if (query.isError && query.data === undefined) {
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }
  const data = query.data as T;
  if (isEmpty?.(data)) return <>{empty}</>;
  return (
    <div
      className={cn('transition-opacity', query.isPlaceholderData && query.isFetching && 'opacity-60', className)}
      aria-busy={query.isFetching}
    >
      {children(data)}
    </div>
  );
}
