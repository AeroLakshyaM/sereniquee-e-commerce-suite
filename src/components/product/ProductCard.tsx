import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product, featured }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
    >
      <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-4">
        {product.image_url ? (
          <img
            src={product.image_url}
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
              onClick={handleAddToCart}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        )}

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
        
        {/* Low Stock Badge */}
        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs px-3 py-1 font-medium rounded-full">
            Only {product.stock_quantity} left
          </span>
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
