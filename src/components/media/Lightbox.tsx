import { useEffect } from 'react';
import type { ImageInfo } from '@/api/types';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '@/components/ui/Icons';

interface LightboxProps {
  images: ImageInfo[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ images, currentIndex, onClose, onNavigate }: LightboxProps) {
  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + images.length) % images.length);
      else if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % images.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentIndex, images.length, onClose, onNavigate]);

  if (currentIndex === null || !images[currentIndex]) return null;

  const current = images[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="absolute top-0 inset-x-0 flex items-center justify-between p-4 sm:p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-medium tracking-wider text-white/80">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Close lightbox"
        >
          <CloseIcon size={24} />
        </button>
      </div>

      {/* Prev / Next Buttons */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((currentIndex - 1 + images.length) % images.length);
            }}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Previous image"
          >
            <ChevronLeftIcon size={28} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((currentIndex + 1) % images.length);
            }}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Next image"
          >
            <ChevronRightIcon size={28} />
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        className="relative max-h-[85vh] max-w-[90vw] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.alt || `Gallery photo ${currentIndex + 1}`}
          className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl select-none"
        />
        {(current.caption || current.alt) && (
          <p className="mt-3 text-center text-sm text-white/80 max-w-xl">
            {current.caption || current.alt}
          </p>
        )}
      </div>
    </div>
  );
}
