import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Product } from '@/types';

interface RelatedProductsProps {
  currentProduct: Product;
  limit?: number;
}

export function RelatedProducts({ currentProduct, limit = 4 }: RelatedProductsProps) {
  const { data: allProducts, isLoading } = useProducts();

  if (isLoading) {
    return (
      <div className="py-12">
        <h2 className="font-serif text-2xl md:text-3xl mb-8">You May Also Like</h2>
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
      <ProductGrid products={productsToShow} />
    </div>
  );
}
