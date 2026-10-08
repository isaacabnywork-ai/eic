import { Link } from 'react-router-dom';
import {
  useContentList,
  useFeatured,
} from '@/hooks/queries';
import {
  MobileHeroBanner,
  MobileSectionHeader,
  MobileVideoCard,
} from './MobileComponents';
import { itemPath } from '@/lib/routes';
import { HeadphonesIcon, PlayIcon } from '@/components/ui/Icons';

export function MobileListenView() {
  const { data: featuredSermons } = useFeatured('sermon', 5);
  const { data: audioSermons } = useContentList('sermon', { perPage: 8 });
  const { data: podcastAudio } = useContentList('video', { perPage: 6 });

  return (
    <div className="flex flex-col bg-[#070A0F] text-white min-h-screen pb-24 md:hidden">
      {/* 1. Listen Hero Feature matching Screenshot 3 */}
      {featuredSermons && featuredSermons.length > 0 && (
        <MobileHeroBanner items={featuredSermons} actionLabel="Listen Now" type="sermon" />
      )}

      {/* 2. New Audio Shelf matching Screenshot 3 */}
      <section>
        <MobileSectionHeader title="New Audio & Sermons" seeAllLink="/sermons" />
        <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
          {audioSermons?.items?.map((item) => (
            <Link
              key={item.id}
              to={itemPath('sermon', item.slug)}
              className="group relative w-60 shrink-0 flex flex-col rounded-xl border border-white/10 bg-white/5 p-3.5 snap-start select-none transition hover:border-[#FF533D]/50"
            >
              {/* Audio Card graphic header */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-[#111927]">
                {item.image ? (
                  <img
                    src={item.image.src}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/40">
                    <HeadphonesIcon size={32} />
                  </div>
                )}
                {/* Audio pill */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  <HeadphonesIcon size={11} />
                  <span>Audio</span>
                </div>
                <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF533D] text-white">
                  <PlayIcon size={10} className="ml-0.5" />
                </div>
              </div>

              {/* Title & speaker */}
              <div className="mt-2.5">
                <h4 className="font-serif text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#FF533D] transition-colors">
                  {item.title}
                </h4>
                <p className="mt-1 text-xs text-white/50 line-clamp-1">
                  {item.speaker || item.author?.name || 'Expository Sermon'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Audio Messages Shelf */}
      {podcastAudio?.items && podcastAudio.items.length > 0 && (
        <section className="mt-4">
          <MobileSectionHeader title="Ministry Teachings" seeAllLink="/videos" />
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {podcastAudio.items.map((item) => (
              <MobileVideoCard key={item.id} item={item} variant="video" />
            ))}
          </div>
        </section>
      )}

      {/* 4. Audio Playlist List */}
      {audioSermons?.items && audioSermons.items.length > 3 && (
        <section className="mt-6 px-4">
          <h3 className="font-serif text-lg font-bold tracking-tight text-white mb-3">
            Recent Recordings
          </h3>
          <div className="space-y-2.5">
            {audioSermons.items.slice(3).map((item) => (
              <Link
                key={item.id}
                to={itemPath('sermon', item.slug)}
                className="group flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-black/40 text-[#FF533D]">
                  <PlayIcon size={16} className="ml-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-[#FF533D] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-white/50 truncate mt-0.5">
                    {item.speaker || item.author?.name || 'Equip Indian Churches'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
