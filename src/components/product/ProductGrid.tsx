import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
}

export function ProductGrid({ products, onQuickView }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-7">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="product-grid-item min-w-0"
          style={{ animationDelay: `${(index % 12) * 18}ms` }}
        >
          <ProductCard
            product={product}
            featured={product.featured}
            onQuickView={onQuickView}
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
