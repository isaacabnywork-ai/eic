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
import { MicIcon, UserIcon } from '@/components/ui/Icons';

export function SermonSinglePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: sermon, isLoading, isError, error, refetch } = useContentItem('sermon', slug);
  const { data: related } = useRelated(sermon, 3);

  if (isLoading) {
    return (
      <div className="container-page max-w-4xl py-12 space-y-6">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-10 w-3/4" />
        <SkeletonText lines={4} />
      </div>
    );
  }

  if (isError || !sermon) {
    return (
      <div className="container-page max-w-2xl py-16">
        <ErrorState
          title="Sermon Not Found"
          error={error || new Error('The sermon you requested could not be found.')}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const category = sermon.terms.videoCategory?.[0];
  const topics = sermon.terms.topic || [];
  const speaker = sermon.speaker || sermon.author?.name;

  return (
    <>
      <SeoHead
        title={sermon.title}
        description={sermon.excerpt || `Listen to ${sermon.title} on Equip Indian Churches.`}
        path={`/sermons/${sermon.slug}`}
        image={sermon.image?.src}
        type="video.other"
        publishedTime={sermon.date}
        author={speaker}
      />

      <article className="py-8 sm:py-12">
        <div className="container-page max-w-4xl">
          {/* Embedded Video/Audio Player */}
          <div className="mb-8">
            <VideoEmbed
              video={sermon.video}
              audioUrl={sermon.audioUrl}
              title={sermon.title}
            />
          </div>

          {/* Details & Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent-text">
                <MicIcon size={14} />
                <span>Exposition</span>
              </span>
              {category && (
                <Link
                  to={termPath('videoCategory', category, 'sermon')}
                  className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-link"
                >
                  {category.name}
                </Link>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-ink">
              {sermon.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 border-b border-line pb-4 text-sm text-muted">
              {speaker && (
                <div className="flex items-center gap-2 font-medium text-ink">
                  {sermon.author ? (
                    <Link to={authorPath(sermon.author.id)} className="hover:text-link flex items-center gap-2">
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
              <time dateTime={sermon.date}>{formatDate(sermon.date)}</time>
            </div>
          </div>

          {/* Sermon Outline or Manuscript */}
          {sermon.html ? (
            <div className="mt-8 border-b border-line pb-8">
              <h2 className="font-serif text-xl font-bold mb-4">Sermon Notes & Transcript</h2>
              <RichContent html={sermon.html} />
            </div>
          ) : sermon.excerpt ? (
            <div className="mt-8 border-b border-line pb-8 text-muted leading-relaxed">
              <p>{sermon.excerpt}</p>
            </div>
          ) : null}

          {/* Topics */}
          {topics.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {topics.map((top) => (
                <Link
                  key={top.id}
                  to={termPath('topic', top, 'sermon')}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink hover:border-primary hover:text-link"
                >
                  #{top.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Related Sermons */}
        {related && related.items.length > 0 && (
          <section className="mt-16 border-t border-line bg-surface-2/30 py-16">
            <div className="container-page">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-text mb-1">
                  More Expositions
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                  Related Sermons
                </h3>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.items.map((item) => (
                  <VideoCard key={item.id} item={item} variant="sermon" />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
