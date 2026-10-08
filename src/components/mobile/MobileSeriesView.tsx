import {
  useSeriesCards,
  useTerms,
  useContentList,
} from '@/hooks/queries';
import {
  MobileSectionHeader,
  MobilePosterCard,
} from './MobileComponents';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@/components/ui/Icons';

export function MobileSeriesView() {
  const { data: seriesList } = useSeriesCards({ count: 12, coverType: 'video' });
  const { data: categories } = useTerms('category', { perPage: 8 });
  const { data: featuredArticles } = useContentList('article', { perPage: 4 });

  const heroSeries = seriesList?.[0];

  return (
    <div className="flex flex-col bg-[#F0F6FB] dark:bg-[#070A0F] text-[#182541] dark:text-white min-h-screen pb-24 md:hidden transition-colors">
      {/* 1. Series Hero matching Screenshot 1 */}
      {heroSeries && (
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-black select-none">
          {heroSeries.cover?.src ? (
            <img
              src={heroSeries.cover.src}
              alt={heroSeries.term.name}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-[#1E293B] to-[#0A0E17]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Hero text */}
          <div className="absolute bottom-6 inset-x-0 px-5 flex flex-col justify-end text-white">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F0F6FB] mb-1">
              Featured Teaching Series
            </span>
            <h2 className="font-serif text-3xl font-black leading-tight drop-shadow-md text-white">
              {heroSeries.term.name}
            </h2>
            {heroSeries.term.description && (
              <p className="mt-2 text-xs text-white/90 line-clamp-2 max-w-sm">
                {heroSeries.term.description}
              </p>
            )}
            <div className="mt-4">
              <Link
                to={`/series/${heroSeries.term.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-white hover:text-[#F0F6FB] group transition-colors"
              >
                <span>Explore Series</span>
                <ChevronRightIcon size={16} className="text-[#F0F6FB] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. "Go on an Adventure with..." / "Explore by Category" Circular Avatars matching Screenshot 1 */}
      {categories?.items && categories.items.length > 0 && (
        <section className="mt-3">
          <MobileSectionHeader title="Explore Topics & Themes" />
          <div className="flex gap-4 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {categories.items.map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/articles?category=${cat.slug}`}
                className="group flex flex-col items-center shrink-0 w-20 text-center snap-start select-none"
              >
                <div className={`relative h-20 w-20 overflow-hidden rounded-full border-2 border-slate-300 dark:border-white/15 shadow-xs dark:shadow-md flex items-center justify-center font-serif text-xl font-bold transition-transform group-hover:scale-105 group-hover:border-primary dark:group-hover:border-[#F0F6FB] ${
                  idx % 3 === 0
                    ? 'bg-gradient-to-br from-amber-600 to-amber-900 text-amber-100'
                    : idx % 3 === 1
                    ? 'bg-gradient-to-br from-sky-600 to-sky-900 text-sky-100'
                    : 'bg-gradient-to-br from-rose-600 to-rose-900 text-rose-100'
                }`}>
                  {cat.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="mt-2 text-xs font-medium text-[#182541] dark:text-white/90 line-clamp-1 group-hover:text-primary dark:group-hover:text-[#F0F6FB] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. All Series Poster Shelf */}
      {seriesList && seriesList.length > 0 && (
        <section className="mt-4">
          <MobileSectionHeader title="All Series & Expositions" count={seriesList.length} />
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {seriesList.map((series) => (
              <MobilePosterCard
                key={series.term.id}
                item={{
                  id: series.term.id,
                  slug: series.term.slug,
                  title: series.term.name,
                  image: series.cover?.src,
                  count: series.term.count,
                  to: `/series/${series.term.slug}`,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Series Articles Highlights */}
      {featuredArticles?.items && featuredArticles.items.length > 0 && (
        <section className="mt-6 px-4">
          <h3 className="font-serif text-lg font-bold tracking-tight text-[#182541] dark:text-white mb-3">
            Foundational Guides
          </h3>
          <div className="space-y-3">
            {featuredArticles.items.map((art) => (
              <Link
                key={art.id}
                to={`/articles/${art.slug}`}
                className="flex items-center justify-between rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-3.5 hover:bg-[#E5EFF8] dark:hover:bg-white/10 shadow-xs dark:shadow-none transition"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="font-serif text-sm font-bold text-[#182541] dark:text-white line-clamp-1">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-white/50 truncate mt-0.5">
                    Foundational Series Article
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#182541] dark:text-[#F0F6FB] shrink-0">Read &rarr;</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
