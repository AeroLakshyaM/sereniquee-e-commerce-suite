import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { useProducts } from '@/hooks/useProducts';
import { useBlogs } from '@/hooks/useBlogs';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton';
import { ProductQuickView } from '@/components/product/ProductQuickView';
import { BlogCard } from '@/components/blog/BlogCard';
import { InstagramFeed } from '@/components/social/InstagramFeed';
import { CategorySection } from '@/components/CategorySection';
import { galleryImages } from '@/data/galleryImages';
import { Product } from '@/types';
import { ArrowRight, BookOpen, Flame, Heart, Leaf, Sparkles, Star, Timer } from 'lucide-react';

export default function Home() {
  const { data, isLoading } = useProducts();
  const products = data?.pages.flatMap((page) => page.products);
  const { data: latestBlogs, isLoading: blogsLoading } = useBlogs({ limit: 3 });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <div className="overflow-x-hidden">
      <SeoHelmet
        title="Luxury Handmade Soy Candles"
        description="Discover Sereniquee's collection of handcrafted, aromatic soy candles. Transform your home into a sanctuary of warmth and relaxation with our eco-friendly candles."
        keywords="handmade candles, luxury candles, soy wax candles, scented candles, aromatic candles, eco-friendly candles, home decor, aromatherapy"
        url="/"
      />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-background to-stone-100/20 dark:from-amber-950/10 dark:via-background dark:to-stone-950/20">
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          {/* Subtle animated glow effect */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-amber-200/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/3 w-56 h-56 sm:w-80 sm:h-80 bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container-luxury relative z-10 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4 sm:mb-6 animate-fade-in">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Artisan Luxury Candles
              </p>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.05] mb-6 sm:mb-8 animate-slide-up bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
              Illuminate Your
              <span className="italic block mt-1 sm:mt-2 text-amber-700 dark:text-amber-500"> Serenity</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 sm:mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
              Hand-poured luxury candles crafted with the finest natural ingredients.
              Transform your space into a sanctuary of calm and elegance.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-xl animate-slide-up" style={{ animationDelay: '150ms' }}>
              <div className="text-center">
                <div className="font-serif text-xl sm:text-2xl md:text-3xl font-medium mb-1">100%</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Natural Soy</div>
              </div>
              <div className="text-center border-x border-border/50">
                <div className="font-serif text-xl sm:text-2xl md:text-3xl font-medium mb-1">10h+</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Burn Time</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-xl sm:text-2xl md:text-3xl font-medium mb-1">Hand</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Poured</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/shop" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground px-8 sm:px-10 py-6 sm:py-7 text-sm sm:text-base hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] transition-all group">
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto px-8 sm:px-10 py-6 sm:py-7 text-sm sm:text-base border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-luxury py-12 sm:py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Curated Selection
            </p>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl mb-3 sm:mb-4">Our Bestsellers</h2>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Discover our most loved scents, handpicked for their exceptional quality and captivating aromas.
          </p>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={6} />
        ) : products && products.length > 0 ? (
          <>
            <div
              className="product-marquee scrollbar-hide overflow-x-auto"
              aria-label="All products"
            >
              <div className="product-marquee-track">
                {[0, 1].map((groupIndex) => (
                  <div
                    key={groupIndex}
                    className="product-marquee-group"
                    aria-hidden={groupIndex === 1}
                  >
                    {products.map((product) => (
                      <div
                        key={`${groupIndex}-${product.id}`}
                        className="w-[220px] shrink-0 sm:w-[240px] lg:w-[280px]"
                      >
                        <ProductCard
                          product={product}
                          featured={product.featured}
                          onQuickView={setQuickViewProduct}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 sm:mt-12 text-center">
              <Link to="/shop">
                <Button variant="outline" className="px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all group">
                  View Full Collection
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-secondary/30 rounded-lg mx-4">
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-4">No products yet. Add some in the admin dashboard.</p>
            <Link to="/admin">
              <Button className="text-sm sm:text-base">Go to Admin Dashboard</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Custom Orders Teaser */}
      <section className="bg-primary/5 py-12 sm:py-16 md:py-20 lg:mx-0">
        <div className="container-luxury text-center max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Personalized for You
            </p>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">
            Looking for Something Special?
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

      {/* Dynamic Category Section from Database */}
      <CategorySection />

      {/* Why Choose Us - Features Grid */}
      <section className="container-luxury py-12 sm:py-16 md:py-20 border-b border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="group text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/30 mb-4 group-hover:scale-110 transition-transform">
              <Leaf className="h-6 w-6 text-amber-700 dark:text-amber-500" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl mb-2 sm:mb-3">100% Natural</h3>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              Made with pure soy wax and premium essential oils, free from harmful chemicals and toxins.
            </p>
          </div>
          
          <div className="group text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/30 mb-4 group-hover:scale-110 transition-transform">
              <Heart className="h-6 w-6 text-amber-700 dark:text-amber-500" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl mb-2 sm:mb-3">Handcrafted Care</h3>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              Each candle is lovingly hand-poured in small batches to ensure exceptional quality.
            </p>
          </div>
          
          <div className="group text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/30 mb-4 group-hover:scale-110 transition-transform">
              <Timer className="h-6 w-6 text-amber-700 dark:text-amber-500" />
            </div>
            <h3 className="font-serif text-lg sm:text-xl mb-2 sm:mb-3">Long Lasting</h3>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              45+ hours of clean, even burn time to fill your space with beautiful fragrance.
            </p>
          </div>
        </div>
      </section>

      {/* Signature Scents Preview */}
      <section className="bg-gradient-to-b from-secondary/50 to-transparent py-12 sm:py-16 md:py-24">
        <div className="container-luxury">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3 sm:mb-4">
              Signature Collection
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl mb-3 sm:mb-4 px-4">Crafted Aromas</h2>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Each scent tells a story, carefully composed to evoke emotion and create atmosphere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="group relative overflow-hidden rounded-lg bg-background border border-border/50 p-6 sm:p-8 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-amber-100 dark:bg-amber-950/20 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500" />
              <div className="mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-3 sm:mb-4">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl mb-2">Warm & Cozy</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Vanilla, Amber, Sandalwood
                </p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Envelop yourself in comfort with rich, creamy notes that create an intimate, welcoming atmosphere perfect for quiet evenings.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-lg bg-background border border-border/50 p-6 sm:p-8 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-green-100 dark:bg-green-950/20 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500" />
              <div className="mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center mb-3 sm:mb-4">
                  <Leaf className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl mb-2">Fresh & Clean</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Eucalyptus, Mint, Sage
                </p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Revitalize your space with crisp, invigorating scents that bring the freshness of nature indoors.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-lg bg-background border border-border/50 p-6 sm:p-8 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-purple-100 dark:bg-purple-950/20 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500" />
              <div className="mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mb-3 sm:mb-4">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl mb-2">Floral & Light</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Lavender, Rose, Jasmine
                </p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Experience delicate, romantic fragrances that uplift the spirit and create an airy, elegant ambiance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Teaser */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container-luxury">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  Our Craft
                </p>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl mb-4 sm:mb-6 leading-tight">
                Made with Intention & Love
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                Each Sereniquee candle is hand-poured in small batches using premium
                soy wax and carefully curated fragrance oils. We believe in slow
                craftsmanship and sustainable practices that honor both our customers
                and the environment.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 sm:mb-8">
                From selecting the finest ingredients to the final packaging, every step
                is infused with care and attention to detail. Our candles aren't just
                products—they're an experience, a moment of peace in your busy day.
              </p>
              <Link to="/about">
                <Button variant="outline" className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all group">
                  Discover Our Story
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="aspect-square rounded-lg overflow-hidden relative group shadow-xl">
                {/* Main Image */}
                <img 
                  src="/landing-candles.jpg" 
                  alt="Hand-poured luxury candles by Sereniquee"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-500/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="bg-secondary/50 py-12 sm:py-16 md:py-24 overflow-hidden">
        <div className="container-luxury">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3 sm:mb-4">
              Customer Love
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl mb-3 sm:mb-4 px-4">What Our Customers Say</h2>
          </div>

          <div className="relative">
            {/* Gradient overlays for smooth fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-secondary/50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-secondary/50 to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling container */}
            <div className="flex gap-4 sm:gap-8 animate-scroll">
              {/* First set of testimonials */}
              <div className="flex gap-4 sm:gap-8 shrink-0">
                <div className="bg-background rounded-lg p-6 sm:p-8 border border-border/50 hover:border-amber-500/30 transition-colors w-[280px] sm:w-[350px] shrink-0">
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    "Absolutely divine! The lavender candle has transformed my evening routine. 
                    The scent is so calming and natural, nothing artificial about it."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium text-sm">
                      P
                    </div>
                    <div>
                      <div className="font-medium text-xs sm:text-sm">Priya S.</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Mumbai</div>
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-6 sm:p-8 border border-border/50 hover:border-amber-500/30 transition-colors w-[280px] sm:w-[350px] shrink-0">
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    "Best candles I've ever purchased! They burn evenly, last long, and the 
                    packaging is beautiful. Perfect for gifting too."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-medium text-sm">
                      A
                    </div>
                    <div>
                      <div className="font-medium text-xs sm:text-sm">Ananya R.</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Bangalore</div>
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-6 sm:p-8 border border-border/50 hover:border-amber-500/30 transition-colors w-[280px] sm:w-[350px] shrink-0">
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    "The attention to detail is remarkable. You can tell each candle is made 
                    with care. The scents are sophisticated and not overwhelming."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                      R
                    </div>
                    <div>
                      <div className="font-medium text-xs sm:text-sm">Rahul M.</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Delhi</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex gap-4 sm:gap-8 shrink-0" aria-hidden="true">
                <div className="bg-background rounded-lg p-6 sm:p-8 border border-border/50 hover:border-amber-500/30 transition-colors w-[280px] sm:w-[350px] shrink-0">
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    "Absolutely divine! The lavender candle has transformed my evening routine. 
                    The scent is so calming and natural, nothing artificial about it."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium text-sm">
                      P
                    </div>
                    <div>
                      <div className="font-medium text-xs sm:text-sm">Priya S.</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Mumbai</div>
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-6 sm:p-8 border border-border/50 hover:border-amber-500/30 transition-colors w-[280px] sm:w-[350px] shrink-0">
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    "Best candles I've ever purchased! They burn evenly, last long, and the 
                    packaging is beautiful. Perfect for gifting too."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-medium text-sm">
                      A
                    </div>
                    <div>
                      <div className="font-medium text-xs sm:text-sm">Ananya R.</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Bangalore</div>
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-6 sm:p-8 border border-border/50 hover:border-amber-500/30 transition-colors w-[280px] sm:w-[350px] shrink-0">
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    "The attention to detail is remarkable. You can tell each candle is made 
                    with care. The scents are sophisticated and not overwhelming."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                      R
                    </div>
                    <div>
                      <div className="font-medium text-xs sm:text-sm">Rahul M.</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Delhi</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Highlights */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-background via-amber-50/40 to-background dark:from-background dark:via-amber-950/10 dark:to-background">
        <div className="container-luxury space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-background/80 backdrop-blur">
              <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">From the Blog</span>
            </div>
            <div className="space-y-3 px-4">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl">Notes From Our Studio</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Candle care rituals, scent stories, and memory-filled essays crafted by Mom. Catch up on the latest posts from the Sereniquee blog.
              </p>
            </div>
          </div>

          {blogsLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="rounded-3xl border border-border/40 bg-card/50 p-4 sm:p-6">
                  <div className="h-48 rounded-2xl bg-muted animate-pulse mb-4" />
                  <div className="h-4 w-1/3 bg-muted animate-pulse mb-3" />
                  <div className="h-6 w-3/4 bg-muted animate-pulse mb-2" />
                  <div className="h-6 w-1/2 bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : latestBlogs && latestBlogs.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                {latestBlogs.map((blog, index) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    variant={index === 0 ? 'featured' : 'default'}
                  />
                ))}
              </div>
              <div className="text-center">
                <Link to="/blogs">
                  <Button variant="outline" className="px-8 py-6 text-sm sm:text-base border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all">
                    View All Blogs
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/50 p-10 text-center text-muted-foreground">
              No blog stories yet. Publish your first post from the admin dashboard to see it appear here.
            </div>
          )}
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-12 sm:py-16 md:py-24 bg-secondary/30">
        <div className="container-luxury">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Visual Stories
              </p>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl mb-3 sm:mb-4 px-4">Behind the Scenes</h2>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Peek into our studio, see our craftsmanship, and discover the artistry behind each candle.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {galleryImages.slice(0, 4).map((image) => (
              <div key={image.id} className="group relative aspect-square rounded-xl overflow-hidden bg-secondary border border-border/50 hover:border-amber-500/50 transition-all duration-300">
                <img
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/gallery">
              <Button variant="outline" className="px-8 py-6 text-sm sm:text-base border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all group">
                View Full Gallery
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Final CTA */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container-luxury px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-amber-50 to-stone-50 dark:from-amber-950/20 dark:to-stone-950/20 rounded-2xl p-8 sm:p-12 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-amber-600 dark:text-amber-400 mx-auto mb-4 sm:mb-6" />
              <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl mb-4 sm:mb-6 px-4">
                Begin Your Journey to Serenity
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Explore our collection and find the perfect candle to transform your space 
                into a haven of peace and tranquility.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Link to="/shop" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto px-8 sm:px-10 py-6 sm:py-7 text-sm sm:text-base hover:shadow-lg transition-all group">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 sm:px-10 py-6 sm:py-7 text-sm sm:text-base border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background transition-all">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
