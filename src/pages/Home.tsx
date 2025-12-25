import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const { data: featuredProducts, isLoading } = useFeaturedProducts();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-secondary">
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </div>
        
        <div className="container-luxury relative z-10">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-6 animate-fade-in">
              Artisan Candles
            </p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.1] mb-8 animate-slide-up">
              Illuminate Your
              <span className="italic"> Serenity</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Hand-poured luxury candles crafted with the finest natural ingredients,
              designed to transform your space into a sanctuary of calm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/shop">
                <Button className="bg-primary text-primary-foreground px-8 py-6 text-sm hover:bg-primary/90 active:scale-[0.98] transition-all">
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="px-8 py-6 text-sm border-foreground hover:bg-foreground hover:text-background transition-all">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-luxury py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Curated Selection
            </p>
            <h2 className="font-serif text-3xl md:text-4xl">Bestsellers</h2>
          </div>
          <Link to="/shop" className="hidden sm:flex items-center gap-2 text-sm hover:text-muted-foreground transition-colors">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-muted animate-pulse" />
                <div className="h-4 bg-muted animate-pulse w-3/4" />
                <div className="h-4 bg-muted animate-pulse w-1/4" />
              </div>
            ))}
          </div>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <ProductGrid products={featuredProducts} />
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No featured products yet. Add some in the admin dashboard.</p>
            <Link to="/admin">
              <Button className="mt-4">Go to Admin</Button>
            </Link>
          </div>
        )}

        <div className="sm:hidden mt-8 text-center">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm hover:text-muted-foreground transition-colors">
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Brand Story Teaser */}
      <section className="bg-secondary py-24">
        <div className="container-luxury">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Our Craft
              </p>
              <h2 className="font-serif text-3xl md:text-4xl mb-6">
                Made with Intention
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Each Sereniquee candle is hand-poured in small batches using premium
                soy wax and carefully curated fragrance oils. We believe in slow
                craftsmanship and sustainable practices that honor both our customers
                and the environment.
              </p>
              <Link to="/about">
                <Button variant="outline" className="border-foreground hover:bg-foreground hover:text-background transition-all">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="aspect-square bg-muted/50">
              {/* Placeholder for brand image */}
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-serif text-2xl text-muted-foreground/50">Sereniquee</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
