import { useState } from 'react';
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
import {
  HeadphonesIcon,
  PlayIcon,
  WatchScreenIcon,
  LayersIcon,
} from '@/components/ui/Icons';
import type { ContentItem } from '@/api/types';

interface MobileWatchListenViewProps {
  initialTab?: 'all' | 'watch' | 'listen';
}

export function MobileWatchListenView({ initialTab = 'all' }: MobileWatchListenViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'watch' | 'listen'>(initialTab);

  // Video data
  const { data: featuredVideos } = useFeatured('video', 5);
  const { data: videosList } = useContentList('video', { perPage: 8 });

  // Sermon / Audio data
  const { data: featuredSermons } = useFeatured('sermon', 5);
  const { data: sermonsList } = useContentList('sermon', { perPage: 8 });

  // Curated hero items combining top videos and sermons
  const heroItems: ContentItem[] = [
    ...(featuredVideos || []),
    ...(featuredSermons || []),
  ].slice(0, 6);

  return (
    <div className="flex flex-col bg-[#F0F6FB] dark:bg-[#070A0F] text-[#182541] dark:text-white min-h-screen pb-24 md:hidden transition-colors">
      {/* 1. Full-Bleed Media Hero Feature */}
      {heroItems.length > 0 && (
        <MobileHeroBanner
          items={heroItems}
          actionLabel="Watch & Listen"
          type="video"
        />
      )}

      {/* 2. Interactive Segmented Switcher (All / Watch / Listen) */}
      <div className="sticky top-14 z-30 bg-[#F0F6FB]/95 dark:bg-[#070A0F]/95 backdrop-blur-md px-4 py-3 border-b border-[#D0E1F0] dark:border-white/10 shadow-xs">
        <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-white dark:bg-white/10 p-1 border border-[#D0E1F0] dark:border-white/10 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#182541] text-white dark:bg-[#F0F6FB] dark:text-[#070A0F] shadow-sm'
                : 'text-slate-600 dark:text-white/70 hover:text-[#182541] dark:hover:text-white'
            }`}
          >
            <LayersIcon size={14} />
            <span>All Media</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('watch')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'watch'
                ? 'bg-[#182541] text-white dark:bg-[#F0F6FB] dark:text-[#070A0F] shadow-sm'
                : 'text-slate-600 dark:text-white/70 hover:text-[#182541] dark:hover:text-white'
            }`}
          >
            <WatchScreenIcon size={14} />
            <span>Watch</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listen')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'listen'
                ? 'bg-[#182541] text-white dark:bg-[#F0F6FB] dark:text-[#070A0F] shadow-sm'
                : 'text-slate-600 dark:text-white/70 hover:text-[#182541] dark:hover:text-white'
            }`}
          >
            <HeadphonesIcon size={14} />
            <span>Listen</span>
          </button>
        </div>
      </div>

      {/* 3. Section: Watch Video Teachings & Discussions */}
      {(activeTab === 'all' || activeTab === 'watch') && (
        <section className="mt-1">
          <MobileSectionHeader
            title={activeTab === 'all' ? 'Watch: Video Teachings' : 'Video Teachings & Discussions'}
            seeAllLink="/videos"
            count={videosList?.total}
          />
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {videosList?.items?.map((item) => (
              <MobileVideoCard key={item.id} item={item} variant="video" />
            ))}
          </div>
        </section>
      )}

      {/* 4. Section: Listen Expository Sermons & Audio Podcasts */}
      {(activeTab === 'all' || activeTab === 'listen') && (
        <section className={activeTab === 'all' ? 'mt-4' : 'mt-1'}>
          <MobileSectionHeader
            title={activeTab === 'all' ? 'Listen: Expository Sermons' : 'Expository Sermons & Podcasts'}
            seeAllLink="/sermons"
            count={sermonsList?.total}
          />
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {sermonsList?.items?.map((item) => (
              <Link
                key={item.id}
                to={itemPath('sermon', item.slug)}
                className="group relative w-60 shrink-0 flex flex-col rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-3.5 snap-start select-none transition hover:border-[#182541]/40 dark:hover:border-[#F0F6FB]/50 shadow-xs dark:shadow-none"
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
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/75 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    <HeadphonesIcon size={11} />
                    <span>Audio</span>
                  </div>
                  <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#182541] text-white dark:bg-[#F0F6FB] dark:text-[#070A0F] shadow-sm">
                    <PlayIcon size={10} className="ml-0.5" />
                  </div>
                </div>

                {/* Title & speaker */}
                <div className="mt-2.5">
                  <h4 className="font-serif text-sm font-bold text-[#182541] dark:text-white line-clamp-2 leading-snug group-hover:text-primary dark:group-hover:text-[#F0F6FB] transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-white/50 line-clamp-1">
                    {item.speaker || item.author?.name || 'Expository Message'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. Audio Message Stream & Playlist (Listen) */}
      {(activeTab === 'all' || activeTab === 'listen') && sermonsList?.items && sermonsList.items.length > 3 && (
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-lg font-bold tracking-tight text-[#182541] dark:text-white flex items-center gap-2">
              <HeadphonesIcon size={18} className="text-primary dark:text-[#F0F6FB]" />
              <span>Audio Message Playlist</span>
            </h3>
            <Link
              to="/sermons"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-[#182541] dark:text-white/50 dark:hover:text-white transition-colors"
            >
              See All
            </Link>
          </div>
          <div className="space-y-2.5">
            {sermonsList.items.slice(3, 8).map((item) => (
              <Link
                key={item.id}
                to={itemPath('sermon', item.slug)}
                className="group flex items-center gap-3.5 rounded-xl border border-[#D0E1F0] dark:border-white/10 bg-white dark:bg-white/5 p-3 hover:bg-[#E5EFF8] dark:hover:bg-white/10 shadow-xs dark:shadow-none transition"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-black/40 text-primary dark:text-[#F0F6FB]">
                  <PlayIcon size={16} className="ml-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-[#182541] dark:text-white line-clamp-1 group-hover:text-primary dark:group-hover:text-[#F0F6FB] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-white/50 truncate mt-0.5">
                    {item.speaker || item.author?.name || 'Equip Indian Churches'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. More Video Discussions Grid (Watch) */}
      {(activeTab === 'all' || activeTab === 'watch') && videosList?.items && videosList.items.length > 4 && (
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-lg font-bold tracking-tight text-[#182541] dark:text-white flex items-center gap-2">
              <WatchScreenIcon size={18} className="text-primary dark:text-[#F0F6FB]" />
              <span>More Video Messages & Q&A</span>
            </h3>
            <Link
              to="/videos"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-[#182541] dark:text-white/50 dark:hover:text-white transition-colors"
            >
              See All
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {videosList.items.slice(4).map((item) => (
              <div key={item.id} className="w-full">
                <MobileVideoCard item={item} variant="video" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Quick Series Banner */}
      <section className="mt-8 px-4">
        <Link
          to="/series"
          className="group block rounded-2xl border border-[#D0E1F0] dark:border-white/10 bg-gradient-to-r from-[#182541] to-[#253966] text-white p-5 shadow-md transition-all active:scale-98"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F0F6FB] block mb-1">
            Systematic Expositions
          </span>
          <h4 className="font-serif text-lg font-bold text-white group-hover:text-[#F0F6FB] transition-colors">
            Explore Preaching Series & Multi-part Studies →
          </h4>
          <p className="text-xs text-white/75 mt-1 leading-relaxed">
            Follow chapter-by-chapter verse expositions preached across local pulpits and conferences.
          </p>
        </Link>
      </section>
    </div>
  );
}
