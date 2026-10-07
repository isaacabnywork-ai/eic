import type { ReactNode } from 'react';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/format';
import { AlertIcon, InboxIcon } from './Icons';
import { Button } from './Button';

export function EmptyState({
  title = 'Nothing here yet',
  message,
  action,
  className,
}: {
  title?: string;
  message?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center',
        className,
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-link">
        <InboxIcon size={24} />
      </span>
      <h3 className="text-xl font-semibold">{title}</h3>
      {message && <p className="mt-2 max-w-md text-muted">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  title = 'We couldn’t load this',
  className,
}: {
  error?: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  const message =
    error instanceof ApiError || error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center rounded-2xl border border-red-300/60 bg-red-50 px-6 py-12 text-center dark:border-red-400/30 dark:bg-red-950/30',
        className,
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
        <AlertIcon size={24} />
      </span>
      <h3 className="text-xl font-semibold text-red-900 dark:text-red-100">{title}</h3>
      <p className="mt-2 max-w-lg text-sm text-red-800 dark:text-red-200">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
