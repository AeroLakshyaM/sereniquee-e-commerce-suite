import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, Heart, Maximize2, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useStorefrontBasePath, useStorefrontPath } from '@/contexts/StorefrontContext';
import { ScentPassportButton } from './ScentPassportButton';
import { ProductImageLightbox } from './ProductImageLightbox';
import { useOptionalMobileFavorites } from '@/contexts/MobileFavoritesContext';
import { useOptionalAuth } from '@/contexts/AuthContext';
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/hooks/use-toast';
import { cn, getProductRouteKey } from '@/lib/utils';
import { StorageImage } from '@/components/ui/storage-image';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
  spotlight?: boolean;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function formatPrice(price: number): string {
  return Number.isInteger(price) ? price.toLocaleString('en-IN') : price.toFixed(2);
}

function getCardBadge(product: Product, featured?: boolean): { label: string; soldOut?: boolean } {
  if (product.stock_quantity === 0) {
    return { label: 'SOLD OUT', soldOut: true };
  }
  if (featured || product.featured) {
    return { label: 'BEST SELLER' };
  }
  const createdMs = product.created_at ? new Date(product.created_at).getTime() : 0;
  if (createdMs && Date.now() - createdMs < THIRTY_DAYS_MS) {
    return { label: 'NEW' };
  }
  if (product.category) {
    return { label: product.category.replace(/[-_]/g, ' ').toUpperCase() };
  }
  return { label: 'SIGNATURE' };
}

export function ProductCard({
  product,
  featured,
  spotlight = false,
  onQuickView,
  priority = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const productPath = useStorefrontPath(`/product/${getProductRouteKey(product)}`);
  const basePath = useStorefrontBasePath();
  const favorites = useOptionalMobileFavorites();
  const auth = useOptionalAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const images = product.image_urls?.length
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : [];
  const imageSource = images[currentImageIndex];
  const badge = getCardBadge(product, featured);
  const isOutOfStock = product.stock_quantity <= 0;

  const isMobileWishlisted = Boolean(basePath && favorites?.isSaved(product.id));
  const isDesktopWishlisted = Boolean(
    !basePath && auth?.user && wishlist?.some((item) => item.product_id === product.id),
  );
  const isWishlisted = isMobileWishlisted || isDesktopWishlisted;

  const hasReviews = (product.review_count ?? 0) > 0 && (product.average_rating ?? 0) > 0;
  const ratingText = hasReviews ? Number(product.average_rating).toFixed(1) : null;

  const showPreviousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  };

  const showNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (basePath && favorites) {
      favorites.toggleSaved(product);
      return;
    }

    if (!auth?.user) {
      toast({
        title: 'Sign in to save candles',
        description: 'Log in to keep your favorite scents in your wishlist.',
      });
      navigate('/auth');
      return;
    }

    try {
      if (isDesktopWishlisted) {
        await removeFromWishlist.mutateAsync(product.id);
        toast({ title: 'Removed from wishlist' });
      } else {
        await addToWishlist.mutateAsync({ productId: product.id });
        toast({ title: 'Saved to wishlist' });
      }
    } catch (error) {
      toast({
        title: 'Could not update wishlist',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <article
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-[24px] border bg-[#fdfaf5] p-0 transition-[transform,box-shadow,border-color] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] will-change-transform dark:bg-card',
          spotlight
            ? 'border-[#d6c2a8] shadow-[0_24px_48px_-18px_rgba(44,34,30,0.22)] md:scale-[1.03] hover:-translate-y-1.5 hover:scale-[1.03] md:hover:scale-[1.06] hover:z-20'
            : 'border-[#eadfd1] shadow-[0_10px_28px_-16px_rgba(44,34,30,0.14)] hover:-translate-y-1.5 hover:scale-[1.03] hover:z-20 hover:border-[#d8c4ab] hover:shadow-[0_22px_46px_-18px_rgba(44,34,30,0.24)] dark:border-border',
        )}
      >
        {/* Full-Bleed Top-Half Image Stage */}
        <div className="relative aspect-[4/4.6] sm:aspect-[4/4.5] w-full shrink-0 overflow-hidden bg-[#f4ede3] dark:bg-secondary/60">
          {/* Subtle top vignette so floating pill badge & icons stay readable on bright photos */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/20 via-black/5 to-transparent"
          />

          {/* Floating Top Controls: Pill Badge & Wishlist / Quick View */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center justify-between gap-2">
            <span
              className={cn(
                'pointer-events-auto inline-flex max-w-[65%] truncate rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] shadow-sm backdrop-blur-sm',
                badge.soldOut
                  ? 'bg-[#2c221e]/95 text-[#fdfaf5] dark:bg-destructive dark:text-destructive-foreground'
                  : 'bg-[#fdfaf5]/92 text-[#5b4632] dark:bg-card/90 dark:text-foreground',
              )}
            >
              {badge.label}
            </span>

            <div className="pointer-events-auto flex items-center gap-1.5">
              {onQuickView && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView(product);
                  }}
                  aria-label={`Quick view ${product.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fdfaf5]/90 text-[#4f4136] opacity-100 shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-[#2c221e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 dark:bg-card/90 dark:text-foreground"
                >
                  <Eye className="h-4 w-4" strokeWidth={1.8} />
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={
                  isWishlisted
                    ? `Remove ${product.name} from wishlist`
                    : `Save ${product.name} to wishlist`
                }
                aria-pressed={isWishlisted}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fdfaf5]/90 text-[#4f4136] shadow-sm backdrop-blur-sm transition hover:bg-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-card/90 dark:text-foreground"
              >
                <Heart
                  className={cn(
                    'h-[17px] w-[17px] transition-colors',
                    isWishlisted ? 'fill-rose-600 text-rose-600' : '',
                  )}
                  strokeWidth={1.75}
                />
              </button>
            </div>
          </div>

          {imageSource ? (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              aria-label={`Enlarge image of ${product.name}`}
              className="block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <StorageImage
                src={imageSource}
                widths={[360, 560, 720, 960]}
                defaultWidth={560}
                sizes="(max-width: 639px) 92vw, (max-width: 1023px) 33vw, 25vw"
                alt={product.name}
                width={560}
                height={630}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#fdfaf5]/90 text-[#3d3026] shadow-sm backdrop-blur-sm transition-opacity md:opacity-0 md:group-hover:opacity-100"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </span>
            </button>
          ) : (
            <Link
              to={productPath}
              className="flex h-full w-full items-center justify-center text-xs text-muted-foreground"
              aria-label={`View ${product.name}`}
            >
              No image available
            </Link>
          )}

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                className="absolute left-2.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#2c221e] shadow-sm opacity-100 transition hover:bg-white md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Previous image of ${product.name}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-2.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#2c221e] shadow-sm opacity-100 transition hover:bg-white md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Next image of ${product.name}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {isOutOfStock && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
              <span className="rounded-full bg-[#2c221e]/90 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white shadow">
                {basePath ? 'Sold out' : 'Out of Stock'}
              </span>
            </div>
          )}
        </div>

        {/* Lower Half: Details & Actions */}
        <div className="flex flex-1 flex-col justify-between p-4 pt-3 sm:p-5 sm:pt-3.5">
          <div>
            {/* Indicator Dots */}
            <div className="flex min-h-[10px] items-center justify-center gap-1.5">
              {images.length > 1 ? (
                images.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    aria-label={`View image ${index + 1} of ${product.name}`}
                    aria-current={index === currentImageIndex ? 'true' : undefined}
                    className={cn(
                      'h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      index === currentImageIndex
                        ? 'w-4 bg-[#9e7c56] dark:bg-amber-400'
                        : 'w-1.5 bg-[#dfd3c3] hover:bg-[#bfa07a] dark:bg-muted-foreground/30',
                    )}
                  />
                ))
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-[#dfd3c3]/70 dark:bg-muted-foreground/25" aria-hidden="true" />
              )}
            </div>

            {/* Details */}
            <Link
              to={productPath}
              className="mt-2 block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <h3 className="line-clamp-1 font-serif text-base sm:text-lg font-semibold leading-snug text-[#2c221e] transition-colors group-hover:text-[#7c5d3a] dark:text-foreground dark:group-hover:text-amber-300">
                {product.name}
              </h3>
              <p className="mt-1 line-clamp-2 min-h-[2.45em] text-xs sm:text-[13px] leading-relaxed text-[#7c6f63] dark:text-muted-foreground">
                {product.description || 'Hand-poured luxury soy candle crafted in small batches.'}
              </p>
            </Link>

            {/* Rating / Craft Tag */}
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {ratingText ? (
                <>
                  <Star className="h-3.5 w-3.5 fill-[#d4a348] text-[#d4a348]" />
                  <span className="font-semibold text-[#2c221e] dark:text-foreground">{ratingText}</span>
                  <span className="text-[#8a7c6e] dark:text-muted-foreground">
                    ({product.review_count})
                  </span>
                </>
              ) : (
                <>
                  <Star className="h-3.5 w-3.5 fill-[#d4a348]/70 text-[#d4a348]" />
                  <span className="truncate text-[#7c6f63] dark:text-muted-foreground">
                    {product.category ? product.category.replace(/[-_]/g, ' ') : 'Hand-poured soy'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bottom Row: Price & Cart Action */}
          <div className="mt-3 pt-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-base sm:text-lg font-bold tracking-tight text-[#2c221e] dark:text-foreground">
                ₹{formatPrice(product.price)}
              </span>

              {!isOutOfStock ? (
                spotlight ? (
                  <Button
                    type="button"
                    onClick={() => addItem(product, 1)}
                    className="h-9 rounded-xl bg-[#bfa07a] px-3.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#ad8c64] active:scale-[0.98]"
                  >
                    <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                    Add to Cart
                  </Button>
                ) : (
                  <button
                    type="button"
                    onClick={() => addItem(product, 1)}
                    aria-label={`Add ${product.name} to cart`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#efe3cf] text-[#5b4632] shadow-sm transition-all hover:bg-[#bfa07a] hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-secondary dark:text-foreground dark:hover:bg-primary dark:hover:text-primary-foreground"
                  >
                    <ShoppingCart className="h-4 w-4" strokeWidth={1.9} />
                  </button>
                )
              ) : (
                <span className="text-[11px] font-medium text-muted-foreground">Unavailable</span>
              )}
            </div>

            {basePath && (
              <div className="mt-2.5">
                <ScentPassportButton product={product} compact />
              </div>
            )}
          </div>
        </div>
      </article>

    <ProductImageLightbox
      open={isPreviewOpen}
      onOpenChange={setIsPreviewOpen}
      images={images}
      initialIndex={currentImageIndex}
      title={product.name}
      price={product.price}
      productPath={productPath}
      inStock={!isOutOfStock}
      onAddToCart={() => addItem(product, 1)}
    />
    </>
  );
}
