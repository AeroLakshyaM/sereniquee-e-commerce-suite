import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

interface FeaturedShowcaseCarouselProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
}

const AUTO_SCROLL_PX_PER_SEC = 34;

export function FeaturedShowcaseCarousel({
  products,
  onQuickView,
}: FeaturedShowcaseCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const floatScrollRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const total = products.length;
  const shouldLoop = total > 1;
  const loopItems = shouldLoop ? [...products, ...products] : products;

  useEffect(() => {
    if (!shouldLoop) return;
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    if (isPaused) return;

    const el = scrollerRef.current;
    if (!el) return;

    let rafId = 0;
    let lastTime = performance.now();
    floatScrollRef.current = el.scrollLeft;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;

      const halfWidth = el.scrollWidth / 2;
      if (halfWidth > 0) {
        floatScrollRef.current += AUTO_SCROLL_PX_PER_SEC * dt;
        if (floatScrollRef.current >= halfWidth) {
          floatScrollRef.current -= halfWidth;
        }
        el.scrollLeft = floatScrollRef.current;

        const approxCardWidth = halfWidth / total;
        if (approxCardWidth > 0) {
          const nextIdx = Math.floor((floatScrollRef.current + approxCardWidth * 0.4) / approxCardWidth) % total;
          setActiveIndex((prev) => (prev === nextIdx ? prev : nextIdx));
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [shouldLoop, isPaused, total]);

  if (!total) return null;

  const stepBy = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    const nextIdx = (activeIndex + direction + total) % total;
    setActiveIndex(nextIdx);
    if (!el) return;

    const cardStep = Math.max(280, Math.round(el.scrollWidth / Math.max(1, loopItems.length)));
    const halfWidth = el.scrollWidth / 2;

    if (shouldLoop && halfWidth > 0) {
      if (direction === -1 && el.scrollLeft <= cardStep) {
        el.scrollLeft += halfWidth;
      } else if (direction === 1 && el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth;
      }
    }

    if (typeof el.scrollBy === 'function') {
      el.scrollBy({ left: direction * cardStep, behavior: 'smooth' });
    }
  };

  const scrollToProduct = (index: number) => {
    setActiveIndex(index);
    const el = scrollerRef.current;
    if (!el || !shouldLoop) return;
    const halfWidth = el.scrollWidth / 2;
    const targetLeft = (halfWidth / total) * index;
    floatScrollRef.current = targetLeft;
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({ left: targetLeft, behavior: 'smooth' });
    } else {
      el.scrollLeft = targetLeft;
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      {/* Edge fades on larger viewports */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r from-[#f6efe5] to-transparent sm:block dark:from-background"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-[#f6efe5] to-transparent sm:block dark:from-background"
      />

      {shouldLoop && (
        <button
          type="button"
          onClick={() => stepBy(-1)}
          aria-label="Previous featured candle"
          className="absolute -left-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e6dac9] bg-white/95 text-[#3d3026] shadow-md transition-all duration-300 hover:scale-110 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-2 dark:border-border dark:bg-card dark:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        ref={scrollerRef}
        onScroll={() => {
          if (scrollerRef.current && isPaused) {
            floatScrollRef.current = scrollerRef.current.scrollLeft;
          }
        }}
        className="scrollbar-hide -my-6 flex gap-5 overflow-x-auto px-2 py-6 sm:gap-6 sm:px-6"
        aria-label="Featured products infinite showcase"
      >
        {loopItems.map((product, index) => {
          const isDuplicate = shouldLoop && index >= total;
          return (
            <div
              key={`${product.id}-${index}`}
              aria-hidden={isDuplicate || undefined}
              className="w-[82vw] max-w-[320px] shrink-0 sm:w-[275px] md:w-[290px] lg:w-[305px]"
            >
              <ProductCard
                product={product}
                featured={product.featured}
                onQuickView={onQuickView}
                priority={index === 0 || index === 1}
              />
            </div>
          );
        })}
      </div>

      {shouldLoop && (
        <button
          type="button"
          onClick={() => stepBy(1)}
          aria-label="Next featured candle"
          className="absolute -right-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e6dac9] bg-white/95 text-[#3d3026] shadow-md transition-all duration-300 hover:scale-110 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-2 dark:border-border dark:bg-card dark:text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Pagination Dots */}
      {shouldLoop && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => scrollToProduct(index)}
              aria-label={`Show ${product.name}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              className={cn(
                'h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                index === activeIndex
                  ? 'w-6 bg-[#bfa07a] dark:bg-amber-400'
                  : 'w-2 border border-[#cdb9a0] bg-transparent hover:bg-[#dfd3c3] dark:border-muted-foreground/40',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
