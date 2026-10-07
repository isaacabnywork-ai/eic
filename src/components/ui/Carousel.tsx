import { Children, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

/** Scroll-snap slider with accessible prev/next buttons. Touch swipe works natively. */
export function Carousel({ label, children }: { label: string; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const [canPrev, setPrev] = useState(false);
  const [canNext, setNext] = useState(true);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setPrev(el.scrollLeft > 4);
    setNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, children]);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const btn =
    'absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-card transition hover:bg-primary hover:text-primary-ink disabled:pointer-events-none disabled:opacity-0 md:flex';

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <ul
        ref={track}
        onScroll={update}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
      >
        {Children.map(children, (child) => (
          <li className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-[calc(25%-15px)]" aria-roledescription="slide">
            {child}
          </li>
        ))}
      </ul>
      <button type="button" className={`${btn} -left-5`} onClick={() => scrollBy(-1)} disabled={!canPrev} aria-label="Previous">
        <ChevronLeftIcon />
      </button>
      <button type="button" className={`${btn} -right-5`} onClick={() => scrollBy(1)} disabled={!canNext} aria-label="Next">
        <ChevronRightIcon />
      </button>
    </div>
  );
}
