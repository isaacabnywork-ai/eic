import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import type { ImageInfo } from '@/api/types';
import { cn } from '@/lib/format';
import { ImageIcon } from './Icons';

interface ImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'alt'> {
  image?: ImageInfo;
  alt?: string;
  /** Use the small rendition (cards) instead of the large one. */
  thumb?: boolean;
  /** Tailwind classes for the wrapper (aspect ratio etc). */
  wrapperClassName?: string;
  /** Load immediately (above the fold). */
  eager?: boolean;
  /** Replacement image tried once if the first one fails (e.g. YouTube maxres -> mq). */
  fallbackSrc?: string;
}

/**
 * Lazy-loaded image with reserved space (no layout shift), responsive srcset,
 * and a graceful placeholder when the image is missing or fails to load.
 */
export function Img(props: ImgProps) {
  // key => internal load/error state resets when a different image is passed in
  return <ImgInner key={props.image?.src} {...props} />;
}

function ImgInner({
  image,
  alt,
  thumb,
  className,
  wrapperClassName,
  eager,
  fallbackSrc,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  ...rest
}: ImgProps) {
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const base = thumb ? (image?.thumb ?? image?.src) : image?.src;
  const current = src ?? base;

  return (
    <div className={cn('relative overflow-hidden bg-surface-2', wrapperClassName)}>
      {current && !failed ? (
        <img
          src={current}
          srcSet={src ? undefined : image?.srcSet}
          sizes={image?.srcSet && !src ? sizes : undefined}
          width={image?.width}
          height={image?.height}
          alt={alt ?? image?.alt ?? ''}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : undefined}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (fallbackSrc && current !== fallbackSrc) setSrc(fallbackSrc);
            else setFailed(true);
          }}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...rest}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center bg-surface-2 text-muted"
          role="img"
          aria-label={alt ?? image?.alt ?? 'No image available'}
        >
          <ImageIcon size={36} />
        </div>
      )}
    </div>
  );
}
