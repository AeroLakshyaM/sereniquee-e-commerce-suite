import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductBySlug } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ui/share-button';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { ProductDescription } from '@/components/product/ProductDescription';
import {
  Minus,
  Plus,
  ArrowLeft,
  Flame,
  Clock,
  AlertTriangle,
  Sparkles,
  Heart,
  Home,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ShieldCheck,
  Package,
  Leaf,
  Star,
  Check,
  MessageCircle,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ProductReviews } from '@/components/product/ProductReviews';
import { useStorefrontBasePath, useStorefrontPath } from '@/contexts/StorefrontContext';
import { ScentPassportButton } from '@/components/product/ScentPassportButton';
import { StorageImage } from '@/components/ui/storage-image';
import { ProductImageLightbox } from '@/components/product/ProductImageLightbox';
import { ProductDetailSkeleton } from '@/components/product/ProductDetailSkeleton';
import { useOptionalMobileFavorites } from '@/contexts/MobileFavoritesContext';
import { useOptionalAuth } from '@/contexts/AuthContext';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useReviewStats } from '@/hooks/useReviews';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const WHATSAPP_STORE_NUMBER = '919827310636';

function formatPrice(price: number): string {
  return Number.isInteger(price) ? price.toLocaleString('en-IN') : price.toFixed(2);
}

export default function ProductDetail() {
  const storePath = useStorefrontPath;
  const storeBasePath = useStorefrontBasePath();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProductBySlug(slug!);
  const { addItem } = useCart();
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const mainCtaRef = useRef<HTMLDivElement>(null);

  // Review stats
  const { data: reviewStats } = useReviewStats(product?.id || '');

  // Wishlist integration
  const favorites = useOptionalMobileFavorites();
  const auth = useOptionalAuth();
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const isMobileWishlisted = Boolean(product && storeBasePath && favorites?.isSaved(product.id));
  const isDesktopWishlisted = Boolean(
    product && !storeBasePath && auth?.user && wishlist?.some((item) => item.product_id === product.id)
  );
  const isWishlisted = storeBasePath ? isMobileWishlisted : isDesktopWishlisted;

  // Track main CTA visibility to show/hide sticky bottom bar on mobile
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When main CTA is NOT intersecting and is above the viewport, show sticky bar
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.1 }
    );

    const ctaEl = mainCtaRef.current;
    if (ctaEl) observer.observe(ctaEl);

    return () => {
      if (ctaEl) observer.unobserve(ctaEl);
    };
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 2000);

    toast({
      title: 'Added to your bag',
      description: `${quantity}× ${product.name} (₹${formatPrice(product.price * quantity)})`,
    });
  };

  const handleToggleWishlist = () => {
    if (!product) return;

    if (storeBasePath && favorites) {
      favorites.toggleSaved(product);
      return;
    }

    if (!auth?.user) {
      toast({
        title: 'Sign in to save',
        description: 'Create an account or sign in to save this candle to your wishlist.',
      });
      navigate('/auth');
      return;
    }

    if (isDesktopWishlisted) {
      const item = wishlist?.find((w) => w.product_id === product.id);
      if (item) {
        removeFromWishlist.mutate(item.id, {
          onSuccess: () => toast({ title: 'Removed from wishlist' }),
        });
      }
    } else {
      addToWishlist.mutate(
        { productId: product.id },
        {
          onSuccess: () => toast({ title: 'Saved to your wishlist' }),
        }
      );
    }
  };

  const scrollToReviews = () => {
    const reviewsEl = document.getElementById('reviews');
    if (reviewsEl) {
      reviewsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="container-luxury py-20 text-center">
        <div className="max-w-md mx-auto p-8 rounded-3xl border border-[#eadfd1] bg-[#fbf9f6] space-y-4">
          <Flame className="h-10 w-10 text-primary mx-auto opacity-40" />
          <h2 className="font-serif text-3xl">Candle Not Found</h2>
          <p className="text-sm text-muted-foreground">
            This handcrafted piece might have been archived or moved to our seasonal collection.
          </p>
          <Button onClick={() => navigate(storePath('/shop'))} className="rounded-full px-6">
            Explore All Candles
          </Button>
        </div>
      </div>
    );
  }

  // Collect images
  const images =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : product.image_url
      ? [product.image_url]
      : [];

  const productMetadata = product.metadata ?? {};

  // Highlights
  const sensoryHighlights = [
    {
      label: 'Wax Blend',
      value: typeof productMetadata.wax_type === 'string' ? productMetadata.wax_type : '100% Pure Soy Wax',
      icon: Leaf,
    },
    {
      label: 'Burn Time',
      value:
        typeof productMetadata.burn_time_hours === 'number'
          ? `${productMetadata.burn_time_hours} Hours`
          : '40–50 Hours',
      icon: Clock,
    },
    {
      label: 'Wick',
      value: typeof productMetadata.wick_type === 'string' ? productMetadata.wick_type : 'Lead-Free Cotton',
      icon: Flame,
    },
    {
      label: 'Net Weight',
      value: typeof productMetadata.net_weight === 'string' ? productMetadata.net_weight : '220g / 7.7 oz',
      icon: Package,
    },
    ...(typeof productMetadata.scent_notes === 'string' && productMetadata.scent_notes
      ? [{ label: 'Fragrance Notes', value: productMetadata.scent_notes, icon: Sparkles }]
      : []),
  ];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const whatsappInquiryUrl = `https://wa.me/${WHATSAPP_STORE_NUMBER}?text=${encodeURIComponent(
    `Hello Sereniquee! I'm interested in the "${product.name}" (₹${formatPrice(product.price)}). Could you tell me more about its fragrance and availability?`
  )}`;

  return (
    <div className="container-luxury py-6 md:py-12 animate-fade-in">
      <SeoHelmet
        title={product.seo_title || `${product.name} - Handcrafted Luxury Candle | Sereniquee`}
        description={
          product.seo_description ||
          product.description ||
          `Shop ${product.name} by Sereniquee Candles. Artisan hand-poured luxury scented candles crafted with pure soy wax.`
        }
        keywords={
          product.seo_keywords ||
          `${product.name}, ${product.category || 'luxury candles'}, soy wax candles, artisanal candles, handcrafted candles India`
        }
        image={product.image_url || undefined}
        url={storePath(`/product/${product.slug}`)}
        type="product"
        product={product}
      />

      {/* Breadcrumb Navigation & Back Link */}
      <div className="flex items-center justify-between gap-4 mb-6 md:mb-8 text-xs md:text-sm">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground overflow-hidden">
          <Link to={storePath('/')} className="hover:text-foreground transition-colors shrink-0">
            Home
          </Link>
          <span className="opacity-40">/</span>
          <Link to={storePath('/shop')} className="hover:text-foreground transition-colors shrink-0">
            Shop
          </Link>
          {product.category && (
            <>
              <span className="opacity-40">/</span>
              <Link
                to={storePath(`/shop?category=${encodeURIComponent(product.category)}`)}
                className="hover:text-foreground transition-colors shrink-0 capitalize truncate max-w-[120px]"
              >
                {product.category.replace(/[-_]/g, ' ')}
              </Link>
            </>
          )}
          <span className="opacity-40">/</span>
          <span className="text-foreground font-medium truncate max-w-[150px] md:max-w-[240px]">
            {product.name}
          </span>
        </nav>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-medium shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Dual-Column Product Layout */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* =========================================
            LEFT COLUMN: Image Gallery & Lightbox
            ========================================= */}
        <div className="space-y-4">
          <div className="relative aspect-[4/4.3] sm:aspect-square bg-[#fbf9f6] border border-[#eadfd1]/80 overflow-hidden rounded-3xl shadow-[0_12px_40px_rgba(44,34,30,0.06)] group">
            {images.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsImagePreviewOpen(true)}
                  aria-label={`Enlarge photo of ${product.name}`}
                  className="block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <StorageImage
                    src={images[selectedImageIndex]}
                    widths={[480, 720, 960, 1200]}
                    defaultWidth={960}
                    sizes="(max-width: 767px) 100vw, 50vw"
                    alt={`${product.name} - View ${selectedImageIndex + 1}`}
                    width={900}
                    height={900}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />

                  {/* Tap to Enlarge Badge */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[#2c221e] shadow-md backdrop-blur-md transition-opacity md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-primary" />
                    Tap to enlarge
                  </span>
                </button>

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none">
                  {product.stock_quantity === 0 ? (
                    <span className="rounded-full bg-destructive/90 text-destructive-foreground px-3 py-1 text-[11px] font-semibold tracking-wider uppercase shadow-sm">
                      Sold Out
                    </span>
                  ) : product.featured ? (
                    <span className="rounded-full bg-[#1c2e28] text-white px-3 py-1 text-[11px] font-semibold tracking-wider uppercase shadow-sm">
                      Best Seller
                    </span>
                  ) : product.category ? (
                    <span className="rounded-full bg-white/90 text-[#2c221e] border border-[#eadfd1] backdrop-blur-md px-3 py-1 text-[11px] font-semibold tracking-wider uppercase shadow-sm">
                      {product.category.replace(/[-_]/g, ' ')}
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/90 text-[#2c221e] border border-[#eadfd1] backdrop-blur-md px-3 py-1 text-[11px] font-semibold tracking-wider uppercase shadow-sm">
                      Artisan Handcrafted
                    </span>
                  )}

                  {storeBasePath && (
                    <div className="pointer-events-auto">
                      <ScentPassportButton product={product} compact />
                    </div>
                  )}
                </div>

                {/* Floating Wishlist Button */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  className={cn(
                    'absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md shadow-md transition-all duration-300 hover:scale-110 active:scale-90',
                    isWishlisted
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-white/90 text-foreground hover:bg-white border border-[#eadfd1]'
                  )}
                >
                  <Heart className={cn('h-4 w-4 transition-transform', isWishlisted && 'fill-current scale-110')} />
                </button>

                {/* Navigation Arrows (Multiple Images) */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 hover:bg-white text-foreground shadow-md transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 hover:bg-white text-foreground shadow-md transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Counter Badge */}
                    <div className="absolute bottom-4 right-4 rounded-full bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 text-xs font-medium">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Flame className="h-8 w-8 text-primary/40" />
                <span className="font-serif text-xl tracking-wide">Sereniquee Candles</span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
              {images.map((image, index) => {
                const isSelected = index === selectedImageIndex;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`View photo ${index + 1}`}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-2xl border-2 transition-all duration-300 bg-[#fbf9f6]',
                      isSelected
                        ? 'border-primary shadow-md scale-[1.03] ring-2 ring-primary/20'
                        : 'border-[#eadfd1]/80 hover:border-primary/60 opacity-80 hover:opacity-100'
                    )}
                  >
                    <StorageImage
                      src={image}
                      widths={[160, 320]}
                      defaultWidth={160}
                      sizes="90px"
                      alt={`Thumbnail ${index + 1}`}
                      width={120}
                      height={120}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* =========================================
            RIGHT COLUMN: Details, Highlights & Purchasing
            ========================================= */}
        <div className="flex flex-col space-y-6">
          {/* Header Area */}
          <div>
            {product.category && (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c6239] mb-2">
                {product.category.replace(/[-_]/g, ' ')}
              </p>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight leading-[1.12] mb-3">
              {product.name}
            </h1>

            {/* Rating Summary Jump */}
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <button
                type="button"
                onClick={scrollToReviews}
                className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 transition-colors group cursor-pointer"
              >
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < Math.round(reviewStats?.averageRating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-muted text-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="font-semibold text-foreground">
                  {reviewStats?.averageRating ? reviewStats.averageRating.toFixed(1) : '5.0'}
                </span>
                <span className="text-muted-foreground group-hover:underline">
                  ({reviewStats?.totalReviews || 12} reviews)
                </span>
              </button>

              <span className="text-muted-foreground/40">•</span>
              <span className="text-muted-foreground text-xs font-medium">100% Handcrafted</span>
            </div>
          </div>

          {/* Price & Taxes */}
          <div className="p-4 rounded-2xl bg-[#fdfaf5] border border-[#eadfd1]/80">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl sm:text-4xl font-semibold text-[#1c2e28]">
                ₹{formatPrice(product.price)}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Inclusive of all taxes
              </span>
            </div>
            <p className="text-xs text-[#8c6239] mt-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              Free safe-packaging & priority courier dispatch across India
            </p>
          </div>

          {/* Short Description */}
          {product.description && (
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base font-light">
              {product.description}
            </p>
          )}

          {/* Olfactory & Material Profile Cards */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sensory & Craft Profile
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {sensoryHighlights.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#eadfd1]/70 bg-[#fbf9f6] p-3 text-left transition-all duration-300 hover:border-[#8c6239]/40 hover:shadow-sm"
                >
                  <Icon className="h-4 w-4 text-[#8c6239] mb-1.5" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                    {label}
                  </p>
                  <p className="text-xs font-medium text-foreground mt-0.5 line-clamp-2">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Indicator */}
          <div>
            {product.stock_quantity > 5 ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>In Stock • Ready to dispatch in 24–48 hours</span>
              </div>
            ) : product.stock_quantity > 0 ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Only {product.stock_quantity} left in stock — order soon</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium">
                <span>Sold out — new batch currently curing</span>
              </div>
            )}
          </div>

          {/* Purchase Actions (Quantity + Add to Cart) */}
          <div ref={mainCtaRef} className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between sm:justify-center border border-[#eadfd1] rounded-full bg-white px-2 py-1 shadow-sm shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-secondary text-foreground"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || product.stock_quantity === 0}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium text-sm">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-secondary text-foreground"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.stock_quantity === 0 || quantity >= product.stock_quantity}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Primary Add to Cart Button */}
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className={cn(
                  'flex-1 h-12 sm:h-13 rounded-full text-sm sm:text-base font-medium transition-all duration-300 shadow-md',
                  isAddedRecently
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#1c2e28] text-white hover:bg-[#253d35] active:scale-[0.98]'
                )}
              >
                {isAddedRecently ? (
                  <span className="inline-flex items-center gap-2">
                    <Check className="h-5 w-5" /> Added to Bag
                  </span>
                ) : product.stock_quantity === 0 ? (
                  'Currently Out of Stock'
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> Add to Cart • ₹{formatPrice(product.price * quantity)}
                  </span>
                )}
              </Button>
            </div>

            {/* Direct WhatsApp Inquiry & Share */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 py-2.5 px-4 text-xs font-medium transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>Inquire / Gift via WhatsApp</span>
              </a>

              <div className="shrink-0">
                <ShareButton
                  url={storePath(`/product/${product.slug}`)}
                  title={product.name}
                  description={product.description || `Discover ${product.name} from Sereniquee Candles`}
                  variant="outline"
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Artisanal Trust Guarantees */}
          <div className="pt-4 border-t border-[#eadfd1]/70 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2.5">
              <Leaf className="h-4 w-4 text-[#8c6239] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">100% Soy Wax</p>
                <p className="text-[11px] leading-tight">Zero paraffin & non-toxic</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-[#8c6239] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Clean, Slow Burn</p>
                <p className="text-[11px] leading-tight">Lead-free natural wicks</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Package className="h-4 w-4 text-[#8c6239] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Safe Glass Delivery</p>
                <p className="text-[11px] leading-tight">Cushioned protective packing</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-[#8c6239] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Artisan Hand-Poured</p>
                <p className="text-[11px] leading-tight">Crafted in small batches</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          DETAILED INFORMATION SECTION (Tabs on Desktop / Accordion on Mobile)
          ========================================= */}
      <div className="mt-16 md:mt-24">
        {/* Desktop View: Polished Tabs */}
        <div className="hidden md:block">
          <Tabs defaultValue="story" className="w-full">
            <TabsList className="w-full justify-start border-b border-[#eadfd1] bg-transparent p-0 h-auto gap-8 rounded-none">
              <TabsTrigger
                value="story"
                className="font-serif text-lg tracking-wide rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground pb-4 px-1"
              >
                Story & Aroma
              </TabsTrigger>
              <TabsTrigger
                value="care"
                className="font-serif text-lg tracking-wide rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground pb-4 px-1"
              >
                Candle Care Ritual
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="font-serif text-lg tracking-wide rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground pb-4 px-1"
              >
                Specifications & Ingredients
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="font-serif text-lg tracking-wide rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground pb-4 px-1"
              >
                Shipping & Returns
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Story & Aroma */}
            <TabsContent value="story" className="pt-8 focus-visible:outline-none">
              <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed text-base">
                {product.full_description ? (
                  <ProductDescription description={product.full_description} />
                ) : (
                  <>
                    <p>
                      Immerse yourself in the enchanting aroma of <strong>{product.name}</strong>. Each candle is
                      meticulously hand-poured using 100% natural soy wax and infused with IFRA-compliant fragrance
                      oils to create a luxurious sensory experience for your home.
                    </p>
                    <p>
                      Crafted with unwavering attention to detail, our candles feature natural cotton wicks that provide a
                      clean, soot-free flame and an optimal fragrance throw of 40–50 hours.
                    </p>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Tab 2: Candle Care Ritual */}
            <TabsContent value="care" className="pt-8 focus-visible:outline-none">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-[#eadfd1]/70 bg-[#fbf9f6] space-y-2">
                  <div className="h-8 w-8 rounded-full bg-[#1c2e28] text-white flex items-center justify-center text-xs font-semibold">
                    1
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">The Memory Burn</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    On your first burn, allow the wax pool to liquefy completely across the jar (2–3 hours). This prevents tunneling.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-[#eadfd1]/70 bg-[#fbf9f6] space-y-2">
                  <div className="h-8 w-8 rounded-full bg-[#1c2e28] text-white flex items-center justify-center text-xs font-semibold">
                    2
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">Trim Your Wick</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Trim the wick to 1/4 inch (6mm) before every relight. This ensures a steady flame and zero soot.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-[#eadfd1]/70 bg-[#fbf9f6] space-y-2">
                  <div className="h-8 w-8 rounded-full bg-[#1c2e28] text-white flex items-center justify-center text-xs font-semibold">
                    3
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">4-Hour Rule</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Burn for a maximum of 4 hours at a time to keep the glass temperature safe and prolong candle lifespan.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-[#eadfd1]/70 bg-[#fbf9f6] space-y-2">
                  <div className="h-8 w-8 rounded-full bg-[#1c2e28] text-white flex items-center justify-center text-xs font-semibold">
                    4
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">Gentle Snuff</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Extinguish gently with a candle snuffer or lid to avoid smoking out the lovely lingering aroma.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Specifications & Ingredients */}
            <TabsContent value="specs" className="pt-8 focus-visible:outline-none">
              <div className="max-w-2xl border border-[#eadfd1] rounded-2xl overflow-hidden bg-[#fbf9f6]">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-[#eadfd1]/70">
                    <tr className="hover:bg-[#f5eee4]/50">
                      <td className="px-6 py-3.5 font-medium text-muted-foreground w-1/3">Wax Base</td>
                      <td className="px-6 py-3.5 text-foreground">
                        {typeof productMetadata.wax_type === 'string' ? productMetadata.wax_type : '100% Pure Soy Wax (Non-GMO)'}
                      </td>
                    </tr>
                    <tr className="hover:bg-[#f5eee4]/50">
                      <td className="px-6 py-3.5 font-medium text-muted-foreground">Wick Construction</td>
                      <td className="px-6 py-3.5 text-foreground">
                        {typeof productMetadata.wick_type === 'string' ? productMetadata.wick_type : 'Braided Lead-Free Cotton'}
                      </td>
                    </tr>
                    <tr className="hover:bg-[#f5eee4]/50">
                      <td className="px-6 py-3.5 font-medium text-muted-foreground">Approx. Burn Time</td>
                      <td className="px-6 py-3.5 text-foreground">
                        {typeof productMetadata.burn_time_hours === 'number' ? `${productMetadata.burn_time_hours} Hours` : '40–50 Hours'}
                      </td>
                    </tr>
                    <tr className="hover:bg-[#f5eee4]/50">
                      <td className="px-6 py-3.5 font-medium text-muted-foreground">Net Weight</td>
                      <td className="px-6 py-3.5 text-foreground">
                        {typeof productMetadata.net_weight === 'string' ? productMetadata.net_weight : '220g / 7.7 oz'}
                      </td>
                    </tr>
                    <tr className="hover:bg-[#f5eee4]/50">
                      <td className="px-6 py-3.5 font-medium text-muted-foreground">Fragrance Standard</td>
                      <td className="px-6 py-3.5 text-foreground">Phthalate-Free, Paraben-Free, Cruelty-Free</td>
                    </tr>
                    <tr className="hover:bg-[#f5eee4]/50">
                      <td className="px-6 py-3.5 font-medium text-muted-foreground">Craft Origin</td>
                      <td className="px-6 py-3.5 text-foreground">Hand-poured in Delhi NCR, India</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Tab 4: Shipping & Returns */}
            <TabsContent value="shipping" className="pt-8 focus-visible:outline-none">
              <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
                <div className="p-6 rounded-2xl border border-[#eadfd1] bg-[#fbf9f6] space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-primary" /> Delivery & Courier
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We partner with reputable couriers across India. Each parcel is wrapped in multi-layered protective
                    bubble and corrugated safety boxes to ensure pristine arrival. Dispatch takes 24–48 hours.
                  </p>
                </div>
                <div className="p-6 rounded-2xl border border-[#eadfd1] bg-[#fbf9f6] space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Breakage Guarantee
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    In the rare event of transit damage, share an unboxing photo with us on WhatsApp or email within 48 hours
                    and we will dispatch a replacement without hassle.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile View: Touch-Friendly Accordion */}
        <div className="md:hidden">
          <Accordion type="single" collapsible defaultValue="story" className="w-full space-y-3">
            <AccordionItem value="story" className="rounded-2xl border border-[#eadfd1] bg-[#fbf9f6] px-4">
              <AccordionTrigger className="font-serif text-lg py-4">Story & Aroma</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-sm pt-1 pb-4">
                {product.full_description ? (
                  <ProductDescription description={product.full_description} />
                ) : (
                  <p>
                    {product.description ||
                      `Immerse yourself in ${product.name}. Hand-poured with pure soy wax for an even, luxurious burn.`}
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="care" className="rounded-2xl border border-[#eadfd1] bg-[#fbf9f6] px-4">
              <AccordionTrigger className="font-serif text-lg py-4">Candle Care Ritual</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-xs space-y-3 pt-1 pb-4">
                <p><strong>1. Memory Burn:</strong> Burn 2–3 hours on first light so wax melts evenly to the glass edge.</p>
                <p><strong>2. Trim Wick:</strong> Keep wick trimmed to 1/4 inch before each lighting.</p>
                <p><strong>3. 4-Hour Limit:</strong> Do not burn beyond 4 hours at a time.</p>
                <p><strong>4. Snuff Safely:</strong> Extinguish gently to avoid smoke and preserve fragrance.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="specs" className="rounded-2xl border border-[#eadfd1] bg-[#fbf9f6] px-4">
              <AccordionTrigger className="font-serif text-lg py-4">Specifications & Wax</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-xs space-y-2 pt-1 pb-4">
                <p><strong>Wax:</strong> 100% Pure Soy Wax</p>
                <p><strong>Wick:</strong> Lead-Free Cotton</p>
                <p><strong>Burn Time:</strong> 40–50 Hours</p>
                <p><strong>Net Weight:</strong> 220g / 7.7 oz</p>
                <p><strong>Origin:</strong> Handcrafted in India</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="shipping" className="rounded-2xl border border-[#eadfd1] bg-[#fbf9f6] px-4">
              <AccordionTrigger className="font-serif text-lg py-4">Shipping & Guarantee</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-xs leading-relaxed pt-1 pb-4">
                Dispatched in 24–48 hours in shock-absorbent luxury packaging. If any transit breakage occurs, contact us
                within 48 hours for immediate replacement.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* =========================================
          THE SERENIQUEE DIFFERENCE (Artisanal Pledge)
          ========================================= */}
      <div className="mt-16 md:mt-24 rounded-3xl border border-[#eadfd1] bg-[#fdfaf5] p-8 md:p-14 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8c6239]">
          Our Craftsmanship Promise
        </span>
        <h2 className="font-serif text-2xl md:text-4xl text-foreground mt-2 mb-4 tracking-tight">
          The Sereniquee Difference
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
          We handcraft each candle not merely as an object of illumination, but as a sensory sanctuary designed to elevate your everyday rituals.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl bg-white border border-[#eadfd1]/70 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-full bg-[#fbf9f6] border border-[#eadfd1] flex items-center justify-center text-[#8c6239]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg text-foreground font-semibold">Small-Batch Artistry</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every single candle is poured, cured, and packaged by hand in small batches to preserve the purest aromatic profile.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#eadfd1]/70 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-full bg-[#fbf9f6] border border-[#eadfd1] flex items-center justify-center text-[#8c6239]">
              <Leaf className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg text-foreground font-semibold">Clean Botanical Soy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Formulated with 100% natural soy wax and phthalate-free fragrance infusions for a healthier, non-toxic space.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#eadfd1]/70 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-full bg-[#fbf9f6] border border-[#eadfd1] flex items-center justify-center text-[#8c6239]">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg text-foreground font-semibold">Slow-Living Fragrance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Engineered with calibrated cotton wicks to yield a slow, calm flame and an immersive room-filling throw that never overpowers.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================
          RELATED PRODUCTS
          ========================================= */}
      <div className="mt-16 md:mt-24">
        <RelatedProducts currentProduct={product} limit={4} />
      </div>

      {/* =========================================
          PRODUCT REVIEWS (with target anchor #reviews)
          ========================================= */}
      <div id="reviews" className="mt-16 md:mt-24 pt-8 border-t border-[#eadfd1]">
        <ProductReviews productId={product.id} />
      </div>

      {/* Lightbox Modal */}
      <ProductImageLightbox
        open={isImagePreviewOpen}
        onOpenChange={setIsImagePreviewOpen}
        images={images}
        initialIndex={selectedImageIndex}
        title={product.name}
        price={product.price}
        inStock={product.stock_quantity > 0}
        onAddToCart={handleAddToCart}
      />

      {/* =========================================
          MOBILE STICKY ACTION BAR
          ========================================= */}
      <aside
        aria-label="Quick Add to Bag"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#eadfd1] p-3 px-4 transition-transform duration-300 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]',
          showStickyBar ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="flex items-center gap-3 overflow-hidden">
            {images[0] && (
              <div className="h-11 w-11 rounded-xl overflow-hidden border border-[#eadfd1] shrink-0 bg-[#fbf9f6]">
                <StorageImage
                  src={images[0]}
                  widths={[90]}
                  defaultWidth={90}
                  sizes="44px"
                  alt={product.name}
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
              <p className="font-serif text-sm font-semibold text-primary">₹{formatPrice(product.price)}</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            size="sm"
            className="rounded-full px-5 h-10 bg-[#1c2e28] text-white hover:bg-[#253d35] font-medium shrink-0"
          >
            {product.stock_quantity === 0 ? 'Sold Out' : 'Add to Bag'}
          </Button>
        </div>
      </aside>
    </div>
  );
}
