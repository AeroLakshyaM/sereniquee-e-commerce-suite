import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductBySlug } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ui/share-button';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { Minus, Plus, ArrowLeft, Flame, Clock, AlertTriangle, Sparkles, Heart, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProductBySlug(slug!);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  if (isLoading) {
    return (
      <div className="container-luxury py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse w-3/4" />
            <div className="h-6 bg-muted animate-pulse w-1/4" />
            <div className="h-32 bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-luxury py-12 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button onClick={() => navigate('/shop')} className="mt-4">
          Back to Shop
        </Button>
      </div>
    );
  }

  // Get all available images
  const images = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : product.image_url 
      ? [product.image_url] 
      : [];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="container-luxury py-12">
      <SeoHelmet
        title={product.seo_title || `${product.name} - ${product.category || 'Handmade Candles'}`}
        description={product.seo_description || product.description || `Shop ${product.name} from Sereniquee. Luxury handmade candles crafted with love.`}
        keywords={product.seo_keywords || `${product.name}, ${product.category}, handmade candles, luxury candles, scented candles`}
        image={product.image_url || undefined}
        url={`/products/${product.slug}`}
        type="product"
      />
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Product Name and Price - Mobile Only (Above Images) */}
      <div className="md:hidden mb-8">
        {product.category && (
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {product.category}
          </p>
        )}
        <h1 className="font-serif text-3xl mb-3">{product.name}</h1>
        <p className="text-2xl font-serif mb-4">₹{product.price.toFixed(2)}</p>
        <div className="mb-4">
          <ShareButton 
            url={`/product/${product.slug}`}
            title={product.name}
            description={product.description || `Check out ${product.name} from Sereniquee Candles`}
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-secondary overflow-hidden group">
            {images.length > 0 ? (
              <>
                <img
                  src={images[selectedImageIndex]}
                  alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows - Only show if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="font-serif text-2xl">Sereniquee</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery - Only show if multiple images */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square overflow-hidden border-2 transition-all ${
                    index === selectedImageIndex
                      ? 'border-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          {/* Desktop Only - Product Name Section */}
          <div className="hidden md:block">
            {product.category && (
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
                {product.category}
              </p>
            )}
            <h1 className="font-serif text-3xl md:text-4xl mb-4">{product.name}</h1>
            <p className="text-2xl font-serif mb-6">₹{product.price.toFixed(2)}</p>
            
            {/* Share Button */}
            <div className="mb-6">
              <ShareButton 
                url={`/product/${product.slug}`}
                title={product.name}
                description={product.description || `Check out ${product.name} from Sereniquee Candles`}
                variant="outline"
                size="sm"
              />
            </div>
          </div>
          
          {product.description && (
            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          {/* Stock Status */}
          {product.stock_quantity > 0 ? (
            <div className="mb-6">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="h-2 w-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✓ In Stock - Ready to Ship
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive">
                Out of stock - We'll restock soon
              </p>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm text-muted-foreground">Quantity</span>
            <div className="flex items-center border border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={() => setQuantity(quantity + 1)}
                disabled={product.stock_quantity === 0}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="w-full bg-primary text-primary-foreground py-6 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          {/* Product Highlights */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center p-4 border border-border rounded">
              <Flame className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Natural Soy Wax</p>
            </div>
            <div className="text-center p-4 border border-border rounded">
              <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">40-50 Hour Burn</p>
            </div>
            <div className="text-center p-4 border border-border rounded">
              <Heart className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Hand-Poured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Section */}
      <div className="mt-16">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description">
            <AccordionTrigger className="text-lg font-serif">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Full Description
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed space-y-4">
              <p>
                {product.description || 
                  `Immerse yourself in the enchanting aroma of ${product.name}. Each candle is meticulously 
                  hand-poured using premium 100% natural soy wax and infused with carefully selected fragrance 
                  oils to create a luxurious sensory experience. Our artisanal approach ensures consistent quality 
                  and an exceptional burn time of 40-50 hours.`
                }
              </p>
              <p>
                Crafted with attention to every detail, this candle features a natural cotton wick that provides 
                a clean, even burn. The elegant design makes it a perfect addition to any room, whether you're 
                seeking relaxation, focus, or simply want to create a welcoming ambiance in your home.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="benefits">
            <AccordionTrigger className="text-lg font-serif">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Benefits & Uses
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              <ul className="space-y-3 list-none">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Creates Ambiance:</strong> Perfect for setting a relaxing mood in living rooms, bedrooms, or bathrooms</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Aromatherapy Benefits:</strong> Natural fragrances can help reduce stress and promote well-being</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Meditation & Yoga:</strong> Ideal companion for mindfulness practices and relaxation routines</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Special Occasions:</strong> Enhance dinner parties, romantic evenings, or celebrations</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Gift-Worthy:</strong> Beautifully packaged and perfect for housewarming, birthdays, or holidays</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Work from Home:</strong> Creates a pleasant atmosphere for focus and productivity</span>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ingredients">
            <AccordionTrigger className="text-lg font-serif">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Ingredients & Materials
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Premium Quality Components:</h4>
                <ul className="space-y-2 ml-4">
                  <li><strong>Wax:</strong> 100% Natural Soy Wax - Renewable, biodegradable, and cleaner burning than paraffin</li>
                  <li><strong>Wick:</strong> Natural Cotton Wick - Lead-free and provides consistent, even burn</li>
                  <li><strong>Fragrance:</strong> Premium Phthalate-Free Fragrance Oils - Safe, long-lasting scent throw</li>
                  <li><strong>Container:</strong> High-Quality Glass Vessel - Reusable after candle is finished</li>
                  <li><strong>Weight:</strong> Approximately 8 oz (227g) of premium wax</li>
                </ul>
              </div>
              <p className="text-sm italic">
                Free from parabens, sulfates, and harmful chemicals. Vegan-friendly and cruelty-free.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="care">
            <AccordionTrigger className="text-lg font-serif">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Care Instructions & Tips
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">For Best Results:</h4>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li><strong>First Burn:</strong> Allow the wax to melt completely across the entire surface (2-4 hours) to prevent tunneling</li>
                    <li><strong>Wick Maintenance:</strong> Trim wick to 1/4 inch (6mm) before each lighting for optimal burn</li>
                    <li><strong>Burn Time:</strong> Burn for 2-4 hours at a time, never exceed 4 hours continuously</li>
                    <li><strong>Placement:</strong> Keep on a stable, heat-resistant surface away from drafts</li>
                    <li><strong>Extinguishing:</strong> Use a candle snuffer or gently blow out to avoid smoke</li>
                    <li><strong>Storage:</strong> Store in a cool, dry place away from direct sunlight when not in use</li>
                  </ul>
                </div>
                <p className="text-sm">
                  <strong>Pro Tip:</strong> To maximize fragrance throw, burn your candle in smaller rooms or 
                  during the first few hours of lighting when scent distribution is strongest.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="safety">
            <AccordionTrigger className="text-lg font-serif">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Safety & Precautions
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              <div className="space-y-4">
                <p className="font-semibold text-foreground">Please read these safety guidelines carefully:</p>
                <ul className="space-y-2 ml-4 list-disc">
                  <li><strong>Never leave a burning candle unattended</strong> - Always extinguish before leaving the room</li>
                  <li><strong>Keep away from children and pets</strong> - Place on surfaces out of reach</li>
                  <li><strong>Fire hazard:</strong> Keep away from flammable materials, curtains, and papers</li>
                  <li><strong>Surface protection:</strong> Always place on a heat-resistant surface; glass can become hot</li>
                  <li><strong>Ventilation:</strong> Burn in well-ventilated areas to prevent soot buildup</li>
                  <li><strong>Discontinue use:</strong> Stop burning when 1/2 inch (12mm) of wax remains at the bottom</li>
                  <li><strong>Never move a burning candle</strong> - Wait until completely cool before relocating</li>
                  <li><strong>Keep wax pool free:</strong> Remove wick trimmings and debris from wax</li>
                  <li><strong>Distance:</strong> Keep candles at least 3 inches (7.6cm) apart when burning multiple candles</li>
                </ul>
                <div className="bg-muted p-4 rounded-lg border border-border mt-4">
                  <p className="text-sm">
                    <strong>⚠️ Warning:</strong> Failure to follow safety instructions could result in fire, 
                    personal injury, or property damage. Keep instructions for future reference.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shipping">
            <AccordionTrigger className="text-lg font-serif">
              Shipping & Returns
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed space-y-3">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Shipping Information:</h4>
                <p>Free standard shipping on all orders across India. Most orders are processed within 1-2 business 
                days and typically arrive within 5-7 business days. Each candle is carefully packaged to ensure 
                safe delivery to your doorstep.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Returns & Exchanges:</h4>
                <p>We stand behind the quality of our products. If you're not completely satisfied with your 
                purchase, we accept returns within 30 days of delivery for a full refund or exchange. Candles 
                must be unused and in original packaging. Contact our customer service for assistance.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Why Choose Sereniquee Section */}
      <div className="mt-16 bg-gradient-to-br from-primary/5 via-secondary to-accent/5 p-8 md:p-12 rounded-lg border border-primary/10">
        <h2 className="font-serif text-2xl md:text-3xl mb-8 text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Why Choose Sereniquee Candles?
        </h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-3 text-foreground">Handcrafted Excellence</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each candle is hand-poured with care and attention to detail, ensuring premium quality in every product.
            </p>
          </div>
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-3 text-foreground">Natural Ingredients</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use only 100% natural soy wax and phthalate-free fragrances for a clean, safe burn.
            </p>
          </div>
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
              <Home className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-3 text-foreground">Long-Lasting Fragrance</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enjoy 40-50 hours of beautiful aroma that fills your space with luxury and tranquility.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-12 pt-8 border-t border-border">
        <p className="text-center text-sm text-muted-foreground">
          Have questions about this product? <a href="/contact" className="text-primary hover:underline">Contact our customer service</a> - 
          we're here to help you find the perfect candle for your needs.
        </p>
      </div>

      {/* Related Products Section */}
      <RelatedProducts currentProduct={product} limit={4} />
    </div>
  );
}
