import { Link } from 'react-router-dom';
import {
  useContentList,
  useFeatured,
  useSeriesCards,
  useUsers,
} from '@/hooks/queries';
import {
  MobileHeroBanner,
  MobileSectionHeader,
  MobileVideoCard,
  MobileSpeakerAvatar,
  MobilePosterCard,
} from './MobileComponents';
import { itemPath } from '@/lib/routes';

export function MobileDiscoverView() {
  // Hero: Featured videos/sermons
  const { data: heroItems } = useFeatured('video', 5);

  // Watch This Week
  const { data: watchThisWeek } = useContentList('video', { perPage: 8 });

  // Preachers & Teachers (Circular Avatars)
  const { data: speakers } = useUsers({ perPage: 12 });

  // Start a Series / Shows (2:3 Vertical Poster Cards)
  const { data: seriesList } = useSeriesCards({ count: 6, coverType: 'video' });

  // Recent Articles
  const { data: articles } = useContentList('article', { perPage: 6 });

  // Book Reviews
  const { data: books } = useContentList('bookReview', { perPage: 6 });

  return (
    <div className="flex flex-col bg-[#070A0F] text-white min-h-screen pb-24 md:hidden">
      {/* 1. Hero Feature Banner */}
      {heroItems && heroItems.length > 0 && (
        <MobileHeroBanner items={heroItems} actionLabel="Watch Now" type="video" />
      )}

      {/* 2. Watch This Week */}
      <section>
        <MobileSectionHeader title="Watch This Week" seeAllLink="/videos" />
        <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
          {watchThisWeek?.items?.map((item) => (
            <MobileVideoCard key={item.id} item={item} variant="video" />
          ))}
        </div>
      </section>

      {/* 3. Featured Preachers & Authors (Circular Avatars) */}
      {speakers?.items && speakers.items.length > 0 && (
        <section className="mt-4">
          <MobileSectionHeader title="Equip Indian Preachers" seeAllLink="/authors" />
          <div className="flex gap-4 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {speakers.items.map((person) => (
              <MobileSpeakerAvatar key={person.id} person={person} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Start a Series (Vertical Posters - "Start a Show") */}
      {seriesList && seriesList.length > 0 && (
        <section className="mt-4">
          <MobileSectionHeader title="Start a Series" seeAllLink="/series" />
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

      {/* 5. Featured Articles & Publications */}
      {articles?.items && articles.items.length > 0 && (
        <section className="mt-4">
          <MobileSectionHeader title="Featured Articles" seeAllLink="/articles" />
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {articles.items.map((art) => (
              <Link
                key={art.id}
                to={itemPath('article', art.slug)}
                className="group w-64 shrink-0 rounded-xl border border-white/10 bg-white/5 p-4 snap-start select-none transition hover:border-[#F0F6FB]/50"
              >
                {art.terms.category?.[0] && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F0F6FB] block mb-1">
                    {art.terms.category[0].name}
                  </span>
                )}
                <h4
                  className="font-serif text-sm font-bold text-white !text-white line-clamp-2 leading-snug group-hover:text-[#F0F6FB] transition-colors"
                  style={{ color: '#FFFFFF' }}
                >
                  {art.title}
                </h4>
                {art.excerpt && (
                  <p className="mt-1.5 text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/10">
                  <span>{art.author?.name || 'EIC Contributor'}</span>
                  <span className="font-semibold text-white/70">Read &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. Book Reviews Shelf */}
      {books?.items && books.items.length > 0 && (
        <section className="mt-4">
          <MobileSectionHeader title="Book Reviews" seeAllLink="/book-reviews" />
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {books.items.map((book) => (
              <Link
                key={book.id}
                to={itemPath('bookReview', book.slug)}
                className="group relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow snap-start select-none"
              >
                {book.image ? (
                  <img
                    src={book.image.src}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs font-serif font-bold text-white !text-white" style={{ color: '#FFFFFF' }}>
                    {book.title}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-2 inset-x-2">
                  <h4
                    className="text-[11px] font-bold text-white !text-white line-clamp-1"
                    style={{ color: '#FFFFFF' }}
                  >
                    {book.bookTitle || book.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
