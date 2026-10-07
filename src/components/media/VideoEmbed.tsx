import { useState } from 'react';
import type { VideoSource } from '@/lib/video';
import { ExternalLinkIcon, HeadphonesIcon, PlayIcon } from '@/components/ui/Icons';
import { Img } from '@/components/ui/Img';

interface VideoEmbedProps {
  video?: VideoSource;
  audioUrl?: string;
  title: string;
  className?: string;
}

export function VideoEmbed({ video, audioUrl, title, className = '' }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!video?.embedUrl && !video?.fileUrl && !audioUrl) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Video Player */}
      {video && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
          {video.embedUrl ? (
            isPlaying ? (
              <iframe
                src={`${video.embedUrl}${video.embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
              />
            ) : (
              <div className="relative h-full w-full">
                {video.thumbnail ? (
                  <Img
                    image={{ src: video.thumbnailLarge || video.thumbnail, alt: title }}
                    className="h-full w-full object-cover"
                    wrapperClassName="h-full w-full"
                    eager
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-2" />
                )}
                <div className="absolute inset-0 bg-black/30 transition-colors hover:bg-black/40" />
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="group absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-ink shadow-2xl transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent"
                  aria-label={`Play video: ${title}`}
                >
                  <PlayIcon size={32} className="ml-1" />
                </button>
              </div>
            )
          ) : video.fileUrl ? (
            <video
              src={video.fileUrl}
              controls
              className="h-full w-full"
              title={title}
              poster={video.thumbnail}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white">
              <p className="mb-4">This video cannot be embedded directly.</p>
              <a
                href={video.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-ink hover:brightness-110"
              >
                Watch on {video.provider} <ExternalLinkIcon size={16} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Audio player if available */}
      {audioUrl && (
        <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-link">
            <HeadphonesIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Audio Recording</p>
            <audio src={audioUrl} controls className="h-9 w-full" preload="metadata">
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      )}
    </div>
  );
}
