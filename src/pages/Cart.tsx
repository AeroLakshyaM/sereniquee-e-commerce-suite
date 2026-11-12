import { Link, useNavigate } from 'react-router-dom';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { useCart } from '@/contexts/CartContext';
import { useStorefrontPath } from '@/contexts/StorefrontContext';
import { Button } from '@/components/ui/button';
import { StorageImage } from '@/components/ui/storage-image';
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Gift,
  Truck,
  ArrowLeft,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 1499;

export default function Cart() {
  const navigate = useNavigate();
  const checkoutPath = useStorefrontPath('/checkout');
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progressPercent = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="container-luxury py-8 md:py-14 animate-fade-in space-y-8">
      <SeoHelmet
        title="Your Shopping Bag | Sereniquee Candles"
        description="Review your handcrafted luxury soy candles and bespoke gift hampers before secure checkout."
        url="/cart"
      />

      {/* Header breadcrumb & title */}
      <div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Continue Shopping</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-border pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              Your Shopping Bag
            </h1>
            <span className="text-sm text-muted-foreground font-sans">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors text-left sm:text-right"
            >
              Clear Bag
            </button>
          )}
        </div>
      </div>

      {/* Free Shipping Milestone Alert */}
      {items.length > 0 && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 dark:bg-amber-950/20 p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              {amountNeeded > 0 ? (
                <span>
                  Add <strong className="text-foreground font-bold">₹{amountNeeded.toFixed(0)}</strong> more for <strong>Free Express Shipping across India</strong>
                </span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  You&apos;ve unlocked Complimentary Express Delivery!
                </span>
              )}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">Free shipping at ₹{FREE_SHIPPING_THRESHOLD}</span>
          </div>
          <div className="h-2 w-full bg-amber-200/70 dark:bg-amber-900/40 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out rounded-full',
                amountNeeded === 0
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Cart Content */}
      {items.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 md:py-24 bg-card border border-border/70 rounded-2xl p-6 sm:p-12 max-w-2xl mx-auto shadow-xs">
          <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-700 dark:text-amber-400 mx-auto mb-6 shadow-inner">
            <Flame className="h-10 w-10 animate-pulse" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium mb-3 text-foreground">
            Your shopping bag is quiet
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
            There are no candles in your bag yet. Browse our handcrafted scents or build a bespoke gift box with personalized calligraphy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-xl">
                Explore Collection
              </Button>
            </Link>
            <Link to="/gift-box" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-amber-300 text-amber-900 hover:bg-amber-50 px-8 py-6 rounded-xl">
                <Gift className="h-4 w-4 mr-2 text-amber-700" />
                Build Gift Hamper
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Items & Summary Grid */
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Items List (Left Column) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="divide-y divide-border/80 border border-border/80 rounded-2xl bg-card overflow-hidden shadow-2xs">
              {items.map((item) => {
                const itemPrice = item.variant?.price ?? item.product.price;
                const lineTotal = itemPrice * item.quantity;
                const meta = item.product.metadata as Record<string, unknown> | undefined;
                const isGiftBox = meta?.is_gift_box;

                return (
                  <div
                    key={`${item.product.id}:${item.variant?.id ?? 'base'}`}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center hover:bg-muted/20 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl bg-secondary flex-shrink-0 overflow-hidden border border-border/70 relative">
                      {item.variant?.image_url || item.product.image_url ? (
                        <StorageImage
                          src={item.variant?.image_url || item.product.image_url || ''}
                          widths={[128, 256]}
                          defaultWidth={160}
                          sizes="112px"
                          alt={item.product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          Candle
                        </div>
                      )}
                      {isGiftBox && (
                        <span className="absolute top-2 left-2 bg-amber-600 text-white p-1.5 rounded-full shadow-xs">
                          <Gift className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-base sm:text-lg font-medium text-foreground">
                            {item.product.name}
                          </h3>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                          )}
                          {isGiftBox && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 px-2 py-0.5 rounded-md w-fit">
                              <Sparkles className="h-3 w-3 text-amber-600" />
                              <span>Bespoke Hamper Bundle</span>
                            </div>
                          )}
                        </div>
                        <p className="font-serif text-base sm:text-lg font-semibold text-foreground text-right">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.product.description}
                      </p>

                      {/* Controls bar */}
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/40">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-border rounded-lg bg-secondary/50">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none hover:bg-secondary text-muted-foreground hover:text-foreground"
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-sm font-semibold w-8 text-center select-none">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none hover:bg-secondary text-muted-foreground hover:text-foreground"
                              aria-label="Increase quantity"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ₹{itemPrice.toLocaleString('en-IN')} each
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id, item.variant?.id)}
                          className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gifting Guarantee Card */}
            <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 flex items-center gap-3 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-amber-700 shrink-0" />
              <span>
                Every order comes packaged with our artisanal wax seal, protective honeycombed cushioning, and a signature match vial.
              </span>
            </div>
          </div>

          {/* Sticky Order Summary (Right Column) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-soft space-y-5">
              <h2 className="font-serif text-xl font-semibold text-foreground">Order Summary</h2>

              <div className="space-y-3 text-sm divide-y divide-border/50">
                <div className="flex justify-between items-center pt-2 first:pt-0">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-medium text-foreground">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">Express Courier Shipping</span>
                  <span className="font-medium">
                    {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                      <span className="text-emerald-600 font-semibold">Free</span>
                    ) : (
                      'Calculated next step'
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">GST & Packaging</span>
                  <span className="text-muted-foreground">Included</span>
                </div>
                <div className="flex justify-between items-baseline pt-3">
                  <span className="font-serif text-lg font-semibold text-foreground">Estimated Total</span>
                  <div className="text-right">
                    <span className="font-serif text-2xl font-bold text-foreground">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Taxes included</p>
                  </div>
                </div>
              </div>

              {/* Checkout CTA */}
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 rounded-xl text-base font-medium shadow-md shadow-amber-950/20 group flex items-center justify-between px-6"
                onClick={() => navigate(checkoutPath)}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Guarantees */}
              <div className="space-y-2.5 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>100% Free Glass Breakage Replacement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>Dispatched via BlueDart / Delhivery Express</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>UPI, NetBanking, Credit/Debit & COD Accepted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
