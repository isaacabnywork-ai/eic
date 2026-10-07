import { Link } from 'react-router-dom';
import type { ContentItem } from '@/api/types';
import { formatDateShort } from '@/lib/format';
import { itemPath } from '@/lib/routes';
import { Img } from '@/components/ui/Img';
import { ImageIcon } from '@/components/ui/Icons';

interface GalleryCardProps {
  item: ContentItem;
}

export function GalleryCard({ item }: GalleryCardProps) {
  const href = itemPath('gallery', item.slug);

  return (
    <article className="group relative overflow-hidden rounded-xl border border-line bg-surface shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
        <Link to={href} tabIndex={-1} aria-hidden="true">
          <Img
            image={item.image}
            alt={item.title}
            thumb
            wrapperClassName="h-full w-full"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded bg-black/70 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          <ImageIcon size={13} />
          <span>Photos</span>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-5 text-white">
          <time dateTime={item.date} className="text-xs font-medium text-white/70">
            {formatDateShort(item.date)}
          </time>
          <h3 className="mt-1 font-serif text-xl font-bold leading-snug">
            <Link to={href} className="text-white hover:text-accent transition-colors">
              {item.title}
            </Link>
          </h3>
        </div>
      </div>
    </article>
  );
}
