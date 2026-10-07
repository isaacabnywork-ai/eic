import { useMemo } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { sanitizeHtml } from '@/lib/html';
import { cn } from '@/lib/format';

interface RichContentProps {
  html: string | undefined | null;
  className?: string;
}

export function RichContent({ html, className }: RichContentProps) {
  const navigate = useNavigate();
  const clean = useMemo(() => sanitizeHtml(html), [html]);

  if (!clean) return null;

  // Intercept clicks on internal links created by the sanitizer's hook
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('a');
    if (!target) return;
    const route = target.getAttribute('data-route');
    if (route) {
      e.preventDefault();
      navigate(route);
    }
  };

  return (
    <div
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: clean }}
      className={cn(
        'prose max-w-none text-ink',
        'prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-tight',
        'prose-a:text-link prose-a:font-medium hover:prose-a:underline',
        'prose-img:rounded-xl prose-img:shadow-sm',
        'prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:italic',
        className,
      )}
    />
  );
}
