import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RelatedProductsProps {
  currentProduct: Product;
  limit?: number;
}

export function RelatedProducts({ currentProduct, limit = 4 }: RelatedProductsProps) {
  const { data: allProducts, isLoading } = useProducts();
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <h2 className="font-serif text-2xl md:text-3xl mb-8 text-center">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
              <div className="h-4 bg-muted animate-pulse w-3/4 rounded" />
              <div className="h-4 bg-muted animate-pulse w-1/4 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter related products by category, excluding current product
  const relatedProducts = allProducts
    ?.filter(
      (p) =>
        p.id !== currentProduct.id &&
        (p.category === currentProduct.category ||
          Math.abs(p.price - currentProduct.price) < currentProduct.price * 0.3)
    )
    .slice(0, limit);

  // If no related products by category, show random products
  const productsToShow =
    relatedProducts && relatedProducts.length > 0
      ? relatedProducts
      : allProducts?.filter((p) => p.id !== currentProduct.id).slice(0, limit);

  if (!productsToShow || productsToShow.length === 0) {
    return null;
  }

  return (
    <div className="py-12 border-t border-border">
      <h2 className="font-serif text-2xl md:text-3xl mb-8 text-center">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {productsToShow.map((product) => {
          // Get only the first image for mobile view
          const primaryImage = product.image_urls && product.image_urls.length > 0 
            ? product.image_urls[0] 
            : product.image_url;

          return (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="group block"
            >
              <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-4">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover product-image-zoom"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="font-serif text-lg">Sereniquee</span>
                  </div>
                )}
                
                {/* Quick Add Button */}
                {product.stock_quantity > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                )}

                {/* Out of Stock Badge */}
                {product.stock_quantity === 0 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-destructive text-destructive-foreground px-3 py-1 font-semibold text-xs rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-base group-hover:text-muted-foreground transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  ₹{product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
