import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  masonry?: boolean;
}

export function ProductGrid({ products, masonry }: ProductGridProps) {
  if (masonry) {
    return (
      <div className="masonry-grid">
        {products.map((product, index) => (
          <div 
            key={product.id} 
            className="masonry-item animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard product={product} featured={product.featured} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
      {products.map((product, index) => (
        <div 
          key={product.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ProductCard product={product} featured={product.featured} />
        </div>
      ))}
    </div>
  );
}
