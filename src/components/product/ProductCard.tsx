import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useStorefrontBasePath, useStorefrontPath } from '@/contexts/StorefrontContext';
import { ScentPassportButton } from './ScentPassportButton';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
}

const STORAGE_IMAGE_PATH = '/storage/v1/object/public/';

function getOptimizedStorageImageUrl(source: string, width: number): string | null {
  try {
    const url = new URL(source);
    if (!url.pathname.includes(STORAGE_IMAGE_PATH)) return null;
    url.pathname = url.pathname.replace(STORAGE_IMAGE_PATH, '/storage/v1/render/image/public/');
    url.searchParams.set('width', String(width));
    url.searchParams.set('quality', '76');
    url.searchParams.set('format', 'webp');
    return url.toString();
  } catch {
    return null;
  }
}

function getStorageImageSrcSet(source: string): string | undefined {
  if (!getOptimizedStorageImageUrl(source, 320)) return undefined;
  return [320, 480, 720, 960]
    .map((width) => `${getOptimizedStorageImageUrl(source, width)} ${width}w`)
    .join(', ');
}

export function ProductCard({ product, featured, onQuickView, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const productPath = useStorefrontPath(`/product/${product.slug}`);
  const basePath = useStorefrontBasePath();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [failedTransformedSource, setFailedTransformedSource] = useState<string | null>(null);
  const images = product.image_urls?.length
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : [];
  const imageSource = images[currentImageIndex];
  const optimizedImageSource = imageSource ? getOptimizedStorageImageUrl(imageSource, 640) : null;
  const useOriginalImage = imageSource === failedTransformedSource;

  const showPreviousImage = () => {
    setCurrentImageIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  };

  const showNextImage = () => {
    setCurrentImageIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  };

  return (
    <article className="group">
      <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-secondary">
        <Link
          to={productPath}
          className="absolute inset-0 block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`View ${product.name}`}
        >
          {images.length > 0 ? (
            <img
              src={useOriginalImage ? imageSource : optimizedImageSource || imageSource}
              srcSet={useOriginalImage || !imageSource ? undefined : getStorageImageSrcSet(imageSource)}
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              alt={product.name}
              width={400}
              height={533}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              onError={() => {
                if (optimizedImageSource && optimizedImageSource !== imageSource && !useOriginalImage) {
                  setFailedTransformedSource(imageSource);
                }
              }}
              className="h-full w-full object-cover product-image-zoom"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image available
            </div>
          )}
        </Link>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-lg transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Previous image of ${product.name}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-lg transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Next image of ${product.name}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    index === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/90'
                  }`}
                  aria-label={`View image ${index + 1} of ${product.name}`}
                  aria-current={index === currentImageIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </>
        )}

        {featured && (
          <span className="absolute left-4 top-4 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            Bestseller
          </span>
        )}

        {product.stock_quantity === 0 && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 z-20 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <div className="flex gap-2">
            {onQuickView && (
              <Button
                type="button"
                onClick={() => onQuickView(product)}
                variant="secondary"
                size="icon"
                className="bg-white/95 text-black hover:bg-white focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Quick view ${product.name}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {product.stock_quantity > 0 && (
              <Button
                type="button"
                onClick={() => addItem(product, 1)}
                className="flex-1 bg-primary text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </div>

      <Link
        to={productPath}
        className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="space-y-1">
          <h3 className="font-serif text-lg transition-colors group-hover:text-muted-foreground">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">₹{product.price.toFixed(2)}</p>
          {basePath && <div className="pt-2"><ScentPassportButton product={product} compact /></div>}
        </div>
      </Link>
    </article>
  );
}
