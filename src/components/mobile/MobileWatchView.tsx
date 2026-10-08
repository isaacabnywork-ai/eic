import {
  useContentList,
  useFeatured,
} from '@/hooks/queries';
import {
  MobileHeroBanner,
  MobileSectionHeader,
  MobileVideoCard,
} from './MobileComponents';

export function MobileWatchView() {
  const { data: featuredVideos } = useFeatured('video', 5);
  const { data: justAdded } = useContentList('video', { perPage: 8 });
  const { data: sermons } = useContentList('sermon', { perPage: 8 });

  return (
    <div className="flex flex-col bg-[#F0F6FB] dark:bg-[#070A0F] text-[#182541] dark:text-white min-h-screen pb-24 md:hidden transition-colors">
      {/* 1. Watch Hero Feature matching Screenshot 4 */}
      {featuredVideos && featuredVideos.length > 0 && (
        <MobileHeroBanner items={featuredVideos} actionLabel="Watch Now" type="video" />
      )}

      {/* 2. Just Added Video Shelf */}
      <section>
        <MobileSectionHeader title="Just Added" seeAllLink="/videos" />
        <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
          {justAdded?.items?.map((item) => (
            <MobileVideoCard key={item.id} item={item} variant="video" />
          ))}
        </div>
      </section>

      {/* 3. Expository Sermons & Preaching */}
      {sermons?.items && sermons.items.length > 0 && (
        <section className="mt-4">
          <MobileSectionHeader title="Expository Sermons" seeAllLink="/sermons" />
          <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 scrollbar-none snap-x">
            {sermons.items.map((item) => (
              <MobileVideoCard key={item.id} item={item} variant="sermon" />
            ))}
          </div>
        </section>
      )}

      {/* 4. More Videos Grid */}
      {justAdded?.items && justAdded.items.length > 4 && (
        <section className="mt-6 px-4">
          <h3 className="font-serif text-lg font-bold tracking-tight text-[#182541] dark:text-white mb-3">
            All Video Messages
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {justAdded.items.slice(4).map((item) => (
              <div key={item.id} className="w-full">
                <MobileVideoCard item={item} variant="video" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
