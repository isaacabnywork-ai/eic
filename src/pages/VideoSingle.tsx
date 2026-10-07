import { useParams, Link } from 'react-router-dom';
import { useContentItem, useRelated } from '@/hooks/queries';
import { formatDate } from '@/lib/format';
import { termPath, authorPath } from '@/lib/routes';
import { SeoHead } from '@/components/seo/SeoHead';
import { VideoEmbed } from '@/components/media/VideoEmbed';
import { RichContent } from '@/components/content/RichContent';
import { VideoCard } from '@/components/cards/VideoCard';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/States';
import { UserIcon } from '@/components/ui/Icons';

export function VideoSinglePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: video, isLoading, isError, error, refetch } = useContentItem('video', slug);
  const { data: related } = useRelated(video, 3);

  if (isLoading) {
    return (
      <div className="container-page max-w-4xl py-12 space-y-6">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-10 w-3/4" />
        <SkeletonText lines={4} />
      </div>
    );
  }

  if (isError || !video) {
    return (
      <div className="container-page max-w-2xl py-16">
        <ErrorState
          title="Video Not Found"
          error={error || new Error('The video you requested could not be found.')}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const category = video.terms.videoCategory?.[0];
  const topics = video.terms.topic || [];
  const speaker = video.speaker || video.author?.name;

  return (
    <>
      <SeoHead
        title={video.title}
        description={video.excerpt || `Watch ${video.title} on Equip Indian Churches.`}
        path={`/videos/${video.slug}`}
        image={video.image?.src}
        type="video.other"
        publishedTime={video.date}
        author={speaker}
      />

      <article className="py-8 sm:py-12">
        <div className="container-page max-w-4xl">
          {/* Embedded Video Player */}
          <div className="mb-8">
            <VideoEmbed
              video={video.video}
              audioUrl={video.audioUrl}
              title={video.title}
            />
          </div>

          {/* Details & Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Link
                  to={termPath('videoCategory', category, 'video')}
                  className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-link"
                >
                  {category.name}
                </Link>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-ink">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 border-b border-line pb-4 text-sm text-muted">
              {speaker && (
                <div className="flex items-center gap-2 font-medium text-ink">
                  {video.author ? (
                    <Link to={authorPath(video.author.id)} className="hover:text-link flex items-center gap-2">
                      <UserIcon size={16} />
                      <span>{speaker}</span>
                    </Link>
                  ) : (
                    <>
                      <UserIcon size={16} />
                      <span>{speaker}</span>
                    </>
                  )}
                </div>
              )}
              <span>•</span>
              <time dateTime={video.date}>{formatDate(video.date)}</time>
            </div>
          </div>

          {/* Description or content */}
          {video.html ? (
            <div className="mt-8 border-b border-line pb-8">
              <h2 className="font-serif text-xl font-bold mb-4">Notes & Discussion</h2>
              <RichContent html={video.html} />
            </div>
          ) : video.excerpt ? (
            <div className="mt-8 border-b border-line pb-8 text-muted leading-relaxed">
              <p>{video.excerpt}</p>
            </div>
          ) : null}

          {/* Topics */}
          {topics.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {topics.map((top) => (
                <Link
                  key={top.id}
                  to={termPath('topic', top, 'video')}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink hover:border-primary hover:text-link"
                >
                  #{top.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Related Videos */}
        {related && related.items.length > 0 && (
          <section className="mt-16 border-t border-line bg-surface-2/30 py-16">
            <div className="container-page">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-text mb-1">
                  Keep Watching
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                  Related Videos
                </h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.items.map((item) => (
                  <VideoCard key={item.id} item={item} variant="video" />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
