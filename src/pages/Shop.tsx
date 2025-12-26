import { useState, useEffect, useMemo } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const { data: products, isLoading } = useProducts(selectedCategory);
  const { data: categories } = useCategories();

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  return (
    <div className="container-luxury py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Our Collection
        </p>
        <h1 className="font-serif text-4xl md:text-5xl">Shop Candles</h1>
        {searchQuery && (
          <p className="text-muted-foreground mt-4">
            Showing results for "{searchQuery}" ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'})
          </p>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : ''}
        >
          All
        </Button>
        {categories?.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? 'bg-primary text-primary-foreground' : ''}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-muted animate-pulse" />
              <div className="h-4 bg-muted animate-pulse w-3/4" />
              <div className="h-4 bg-muted animate-pulse w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} masonry />
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            {searchQuery 
              ? `No products found matching "${searchQuery}". Try different keywords.`
              : 'No products found in this category.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
