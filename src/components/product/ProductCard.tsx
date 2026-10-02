import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, featured, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get all available images (prefer image_urls array, fallback to image_url)
  const images = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : product.image_url 
      ? [product.image_url] 
      : [];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
    >
      <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-4">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover product-image-zoom"
            />

            {/* Image Navigation Arrows - Only show if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Image Dots Indicator */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleDotClick(e, index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'bg-white w-6'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image available
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            {onQuickView && (
              <Button
                onClick={handleQuickView}
                variant="secondary"
                size="icon"
                className="bg-white/95 hover:bg-white text-black backdrop-blur-sm"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {product.stock_quantity > 0 && (
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>

        {/* Featured Badge */}
        {featured && (
          <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs px-3 py-1 font-medium">
            Bestseller
          </span>
        )}
        
        {/* Out of Stock Badge */}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground px-4 py-2 font-semibold text-sm rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-serif text-lg group-hover:text-muted-foreground transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm">
          ₹{product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
