import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductBySlug } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ArrowLeft } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProductBySlug(slug!);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  if (isLoading) {
    return (
      <div className="container-luxury py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse w-3/4" />
            <div className="h-6 bg-muted animate-pulse w-1/4" />
            <div className="h-32 bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-luxury py-12 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button onClick={() => navigate('/shop')} className="mt-4">
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="container-luxury py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square bg-secondary overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="font-serif text-2xl">Sereniquee</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          {product.category && (
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
              {product.category}
            </p>
          )}
          <h1 className="font-serif text-3xl md:text-4xl mb-4">{product.name}</h1>
          <p className="text-2xl font-serif mb-6">${product.price.toFixed(2)}</p>
          
          {product.description && (
            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          {/* Stock Status */}
          {product.stock_quantity > 0 ? (
            <p className="text-sm text-muted-foreground mb-6">
              {product.stock_quantity} in stock
            </p>
          ) : (
            <p className="text-sm text-destructive mb-6">Out of stock</p>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm text-muted-foreground">Quantity</span>
            <div className="flex items-center border border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="w-full bg-primary text-primary-foreground py-6 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          {/* Additional Info */}
          <div className="mt-12 pt-8 border-t border-border space-y-4">
            <div>
              <h3 className="font-medium mb-2">Materials</h3>
              <p className="text-sm text-muted-foreground">
                100% natural soy wax, cotton wick, premium fragrance oils
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Care</h3>
              <p className="text-sm text-muted-foreground">
                Trim wick to 1/4" before each burn. Burn for 2-4 hours at a time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
