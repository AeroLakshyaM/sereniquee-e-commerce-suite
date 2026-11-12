import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StorageImage } from '@/components/ui/storage-image';
import { cn } from '@/lib/utils';

interface ProductImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  initialIndex?: number;
  title: string;
  price?: number;
  productPath?: string;
  onAddToCart?: () => void;
  inStock?: boolean;
}

function formatPrice(price: number): string {
  return Number.isInteger(price) ? price.toLocaleString('en-IN') : price.toFixed(2);
}

export function ProductImageLightbox({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  title,
  price,
  productPath,
  onAddToCart,
  inStock = true,
}: ProductImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setActiveIndex(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
    }
  }, [open, initialIndex, images.length]);

  useEffect(() => {
    if (!open || images.length <= 1) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (event.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, images.length]);

  if (!images.length) return null;

  const currentSrc = images[activeIndex] ?? images[0];
  const goPrev = () => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goNext = () => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="lightbox-overlay bg-black/80 backdrop-blur-md"
        className="lightbox-panel max-w-4xl w-[95vw] gap-0 overflow-hidden rounded-[24px] border border-[#e6dac9]/25 bg-[#1b1613] p-3 text-[#fdfaf5] shadow-2xl sm:p-5 [&>button]:hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title} image preview</DialogTitle>
          <DialogDescription>Enlarged product photograph preview</DialogDescription>
        </DialogHeader>

        {/* Close & Counter Bar */}
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-serif text-base font-medium text-[#fdfaf5] sm:text-lg">
              {title}
            </p>
            {typeof price === 'number' && (
              <p className="text-xs text-[#dfd3c3] sm:text-sm">₹{formatPrice(price)}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {images.length > 1 && (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-[#fdfaf5]">
                {activeIndex + 1} / {images.length}
              </span>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close image preview"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Enlarged Image Stage */}
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#110e0c]"
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null || images.length <= 1) return;
            const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
            touchStartX.current = null;
            if (delta > 45) goPrev();
            else if (delta < -45) goNext();
          }}
        >
          <StorageImage
            key={currentSrc}
            src={currentSrc}
            widths={[480, 720, 960, 1280]}
            defaultWidth={1080}
            sizes="95vw"
            alt={`${title} - preview ${activeIndex + 1}`}
            className="lightbox-image-swap max-h-[65vh] w-full object-contain sm:max-h-[72vh]"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous preview image"
                className="absolute left-2.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next preview image"
                className="absolute right-2.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails + Footer Actions */}
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {images.length > 1 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Select preview image ${index + 1}`}
                  className={cn(
                    'h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 transition',
                    index === activeIndex
                      ? 'border-[#bfa07a] opacity-100'
                      : 'border-transparent opacity-55 hover:opacity-90',
                  )}
                >
                  <StorageImage
                    src={image}
                    widths={[120, 200]}
                    defaultWidth={160}
                    sizes="48px"
                    alt={`${title} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs text-[#bcae9d]">Tap outside or press Esc to close</span>
          )}

          <div className="flex items-center gap-2 sm:ml-auto">
            {productPath && (
              <Link to={productPath} onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  View Details
                </Button>
              </Link>
            )}
            {onAddToCart && (
              <Button
                type="button"
                disabled={!inStock}
                onClick={() => {
                  onAddToCart();
                  onOpenChange(false);
                }}
                className="flex-1 rounded-xl bg-[#bfa07a] text-white hover:bg-[#ad8c64] sm:flex-none"
              >
                <ShoppingCart className="mr-1.5 h-4 w-4" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
