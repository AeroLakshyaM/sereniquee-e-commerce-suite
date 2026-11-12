import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from './ProductCardSkeleton';

interface RelatedProductsProps {
  currentProduct: Product;
  limit?: number;
}

export function RelatedProducts({ currentProduct, limit = 4 }: RelatedProductsProps) {
  const { data: productsData, isLoading } = useProducts(undefined, undefined, { listing: true });
  const allProducts = productsData?.pages.flatMap((page) => page.products) ?? [];

  if (isLoading) {
    return (
      <div className="border-t border-border py-12">
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-[#8a7560] dark:text-muted-foreground">
          Curated Pairings
        </p>
        <h2 className="mb-8 text-center font-serif text-2xl md:text-3xl">You May Also Like</h2>
        <ProductGridSkeleton count={limit} />
      </div>
    );
  }

  // Filter related products by category, excluding current product
  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== currentProduct.id &&
        (p.category === currentProduct.category ||
          Math.abs(p.price - currentProduct.price) < currentProduct.price * 0.3),
    )
    .slice(0, limit);

  // If no related products by category, show random products
  const productsToShow =
    relatedProducts && relatedProducts.length > 0
      ? relatedProducts
      : allProducts.filter((p) => p.id !== currentProduct.id).slice(0, limit);

  if (!productsToShow || productsToShow.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border py-12">
      <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-[#8a7560] dark:text-muted-foreground">
        Curated Pairings
      </p>
      <h2 className="mb-8 text-center font-serif text-2xl md:text-3xl">You May Also Like</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-7">
        {productsToShow.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            featured={product.featured}
          />
        ))}
      </div>
    </div>
  );
}
