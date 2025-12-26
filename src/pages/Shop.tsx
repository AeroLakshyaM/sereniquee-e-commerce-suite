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

  // Advanced search function with keyword matching
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery) return products;

    const query = searchQuery.toLowerCase().trim();
    const keywords = query.split(/\s+/); // Split by spaces to get individual keywords

    return products.filter(product => {
      // Create searchable text from all product fields
      const searchableText = [
        product.name,
        product.description || '',
        product.category || '',
      ].join(' ').toLowerCase();

      // Check if ALL keywords are present (AND logic)
      const matchesAllKeywords = keywords.every(keyword => 
        searchableText.includes(keyword)
      );

      // Also check if ANY keyword matches (OR logic for more results)
      const matchesAnyKeyword = keywords.some(keyword => 
        searchableText.includes(keyword)
      );

      // Return products that match all keywords first, then any keyword
      return matchesAllKeywords || matchesAnyKeyword;
    }).sort((a, b) => {
      // Prioritize products that match ALL keywords
      const aMatchesAll = keywords.every(keyword => 
        [a.name, a.description || '', a.category || ''].join(' ').toLowerCase().includes(keyword)
      );
      const bMatchesAll = keywords.every(keyword => 
        [b.name, b.description || '', b.category || ''].join(' ').toLowerCase().includes(keyword)
      );

      if (aMatchesAll && !bMatchesAll) return -1;
      if (!aMatchesAll && bMatchesAll) return 1;

      // Then prioritize name matches over description matches
      const aNameMatch = a.name.toLowerCase().includes(query);
      const bNameMatch = b.name.toLowerCase().includes(query);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      return 0;
    });
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
          <div className="mt-4 space-y-2">
            <p className="text-muted-foreground">
              Showing results for <span className="font-semibold text-foreground">"{searchQuery}"</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>
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
        <div className="text-center py-16 space-y-4">
          <p className="text-lg text-muted-foreground">
            {searchQuery 
              ? `No products found matching "${searchQuery}"`
              : 'No products found in this category.'
            }
          </p>
          {searchQuery && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Search tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Try using different keywords (e.g., "lavender", "vanilla", "relaxing")</li>
                <li>Check your spelling</li>
                <li>Use more general terms</li>
                <li>Try searching by scent, color, or mood</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
