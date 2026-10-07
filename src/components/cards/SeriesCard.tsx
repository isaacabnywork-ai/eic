import { Link } from 'react-router-dom';
import type { SeriesCard as SeriesCardType } from '@/api/series';
import { seriesPath } from '@/lib/routes';
import { plural } from '@/lib/format';
import { Img } from '@/components/ui/Img';
import { LayersIcon } from '@/components/ui/Icons';

interface SeriesCardProps {
  series: SeriesCardType;
}

export function SeriesCard({ series }: SeriesCardProps) {
  const { term, cover } = series;
  const href = seriesPath(term.slug);
  const count = term.count ?? 0;

  return (
    <article className="group relative flex h-60 flex-col justify-end overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-7 text-ink shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-accent">
      {/* Background image if available */}
      {cover ? (
        <>
          <div className="absolute inset-0">
            <Img
              image={cover}
              alt={term.name}
              wrapperClassName="h-full w-full"
              className="opacity-25 transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/85 to-surface/40" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-bg to-surface" />
      )}

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-text">
          <LayersIcon size={14} />
          <span>Teaching Series • {plural(count, 'resource')}</span>
        </div>

        <h3 className="font-serif text-2xl font-bold leading-tight text-ink">
          <Link to={href} className="hover:text-accent-text transition-colors">
            {term.name}
          </Link>
        </h3>
      </div>
    </article>
  );
}
