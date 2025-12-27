import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CategorySection() {
  const { activeCategories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeCategories || activeCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container-luxury">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of handcrafted candles, each category offering unique scents and experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCategories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative overflow-hidden bg-background border border-border hover:border-primary transition-all duration-300 hover:shadow-lg"
            >
              {/* Category Image/Video */}
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                {category.video_url ? (
                  <video
                    src={category.video_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="font-serif text-2xl">Sereniquee</span>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Category Info */}
              <div className="p-6">
                <h3 className="font-serif text-xl mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                  <span>Explore Collection</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link to="/shop">
              View All Products
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
