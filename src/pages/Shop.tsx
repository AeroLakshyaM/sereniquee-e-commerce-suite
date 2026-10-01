import { useState, useEffect, useMemo, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton';
import { ProductQuickView } from '@/components/product/ProductQuickView';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams } from 'react-router-dom';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { Product } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const searchQuery = searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category');
  
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProducts(selectedCategory, searchQuery);
  const { activeCategories } = useCategories();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const allProducts = useMemo(
    () => data?.pages.flatMap((page) => page.products) || [],
    [data],
  );

  // Set category from URL on mount
  useEffect(() => {
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl, selectedCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '600px' },
    );

    const loadMoreElement = loadMoreRef.current;
    if (loadMoreElement) observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container-luxury py-12">
      <SeoHelmet
        title="Shop Luxury Handmade Candles - Sereniquee"
        description="Browse our curated collection of luxury handmade soy candles. Discover unique scents crafted with natural ingredients, essential oils, and sustainable materials. Free shipping available."
        keywords="buy handmade candles, luxury candles shop, soy wax candles, scented candles online, natural candles, eco-friendly candles, aromatherapy candles"
        url="/shop"
      />
      
      {/* Top Right Custom Orders Button */}
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          asChild 
          className="border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:border-amber-500 transition-all duration-300 group bg-amber-50/50 dark:bg-amber-950/20"
        >
          <Link to="/custom-orders" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
            <span className="font-medium text-amber-900 dark:text-amber-100">Custom Orders</span>
          </Link>
        </Button>
      </div>

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
              {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'} loaded
            </p>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => handleCategoryChange('all')}
          className={selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : ''}
        >
          All Products
        </Button>
        {activeCategories?.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? 'default' : 'outline'}
            onClick={() => handleCategoryChange(category.slug)}
            className={selectedCategory === category.slug ? 'bg-primary text-primary-foreground' : ''}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : allProducts.length > 0 ? (
        <ProductGrid 
          products={allProducts}
          masonry 
          onQuickView={setQuickViewProduct}
        />
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

      {allProducts.length > 0 && hasNextPage && (
        <div ref={loadMoreRef} className="mt-8">
          {isFetchingNextPage && <ProductGridSkeleton count={4} />}
        </div>
      )}

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Custom Orders Teaser (Bottom) */}
      <section className="bg-primary/5 py-12 sm:py-16 md:py-20 -mx-4 lg:mx-0 rounded-2xl mt-16 mb-8">
        <div className="container-luxury text-center max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Personalized for You
            </p>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">
            Didn't Find What You're Looking For?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you need bulk orders for an event, personalized wedding favors, or a custom scent blended just for you, our bespoke service can bring your unique vision to life.
          </p>
          <Link to="/custom-orders">
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-sm sm:text-base transition-all group">
              Request a Custom Order
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
