import { Link } from 'react-router-dom';
import type { ContentItem } from '@/api/types';
import { formatDateShort } from '@/lib/format';
import { itemPath, termPath } from '@/lib/routes';
import { Img } from '@/components/ui/Img';
import { PlayIcon } from '@/components/ui/Icons';

interface VideoCardProps {
  item: ContentItem;
  variant?: 'video' | 'sermon';
}

export function VideoCard({ item, variant }: VideoCardProps) {
  const type = variant || (item.type === 'sermon' ? 'sermon' : 'video');
  const href = itemPath(type, item.slug);
  const category = item.terms.videoCategory?.[0];
  const speaker = item.speaker || item.author?.name;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-ink/20">
      {/* Thumbnail with Play Icon */}
      <div className="relative overflow-hidden aspect-video bg-surface-2">
        <Link to={href} tabIndex={-1} aria-hidden="true">
          <Img
            image={item.image}
            alt={item.title}
            thumb
            wrapperClassName="h-full w-full"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-black/25 transition-opacity group-hover:bg-black/15" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-ink shadow-md transition-transform group-hover:scale-110">
            <PlayIcon size={18} className="ml-0.5" />
          </span>
        </div>
        {category && (
          <div className="absolute top-3 left-3">
            <Link
              to={termPath('videoCategory', category, type)}
              className="rounded bg-black/75 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-black transition-colors"
            >
              {category.name}
            </Link>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug line-clamp-2 text-ink">
          <Link to={href} className="hover:text-accent-text transition-colors">
            {item.title}
          </Link>
        </h3>

        {speaker && (
          <p className="mt-2 text-sm font-medium text-body">
            {speaker}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted border-t border-line/60">
          <time dateTime={item.date}>{formatDateShort(item.date)}</time>
          <span className="capitalize font-semibold text-accent-text">{type}</span>
        </div>
      </div>
    </article>
  );
}
