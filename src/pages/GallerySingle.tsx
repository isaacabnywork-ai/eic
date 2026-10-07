import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContentItem, useGalleryImages } from '@/hooks/queries';
import { formatDate, plural } from '@/lib/format';
import { SeoHead } from '@/components/seo/SeoHead';
import { Lightbox } from '@/components/media/Lightbox';
import { Img } from '@/components/ui/Img';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ArrowRightIcon, CalendarIcon, ImageIcon } from '@/components/ui/Icons';

export function GallerySinglePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: album, isLoading: albumLoading, isError: albumError, error: albumErr, refetch } = useContentItem(
    'gallery',
    slug,
  );
  const { data: images, isLoading: imagesLoading } = useGalleryImages(album);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isLoading = albumLoading || imagesLoading;

  if (albumLoading) {
    return (
      <div className="container-page py-12 space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-2/3" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-6">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (albumError || !album) {
    return (
      <div className="container-page max-w-2xl py-16">
        <ErrorState
          title="Album Not Found"
          error={albumErr || new Error('The requested photo gallery could not be found.')}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const photoList = images || (album.image ? [album.image] : []);

  return (
    <>
      <SeoHead
        title={`Gallery: ${album.title}`}
        description={`Photo album from ${album.title} on Equip Indian Churches.`}
        path={`/gallery/${album.slug}`}
        image={album.image?.src}
      />

      <div className="border-b border-line bg-surface-2/40 py-10 sm:py-14">
        <div className="container-page">
          <Link
            to="/gallery"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-link hover:underline"
          >
            ← Back to all albums
          </Link>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-ink">
            {album.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <CalendarIcon size={16} />
              <time dateTime={album.date}>{formatDate(album.date)}</time>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ImageIcon size={16} />
              <span>{plural(photoList.length, 'photograph')}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : photoList.length > 0 ? (
          <>
            {/* Masonry / Responsive Photo Grid */}
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {photoList.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl break-inside-avoid border border-line bg-surface shadow-sm transition-all hover:shadow-lg hover:border-primary/40"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setLightboxIndex(idx);
                    }
                  }}
                  aria-label={`View photo ${idx + 1}: ${img.alt || album.title}`}
                >
                  <Img
                    image={img}
                    alt={img.alt || `${album.title} photo ${idx + 1}`}
                    wrapperClassName="w-full"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white">
                      Enlarge
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lightbox Modal */}
            <Lightbox
              images={photoList}
              currentIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onNavigate={(nextIdx) => setLightboxIndex(nextIdx)}
            />
          </>
        ) : (
          <EmptyState
            title="No photos in this album"
            message="Check back soon as high-resolution images are uploaded."
          />
        )}

        <div className="mt-14 border-t border-line pt-6 text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink hover:border-primary hover:text-link shadow-sm"
          >
            <span>Browse More Albums</span>
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}
