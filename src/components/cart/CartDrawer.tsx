import { X, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Flame, Gift, Truck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useStorefrontPath } from '@/contexts/StorefrontContext';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { StorageImage } from '@/components/ui/storage-image';

const FREE_SHIPPING_THRESHOLD = 1499;

export function CartDrawer() {
  const navigate = useNavigate();
  const checkoutPath = useStorefrontPath('/checkout');
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate(checkoutPath);
  };

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const freeShippingProgress = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <>
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-50 animate-in fade-in duration-300"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-border"
        role="dialog"
        aria-label="Shopping bag"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/80 bg-background/95">
          <div className="flex items-baseline gap-2">
            <h2 className="font-serif text-xl font-semibold tracking-wide text-foreground">Your Shopping Bag</h2>
            <span className="text-xs text-muted-foreground font-sans font-medium">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCartOpen(false)}
            className="rounded-full h-8 w-8 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/50 px-6 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-900 dark:text-amber-200 mb-1.5">
            <Truck className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
            {amountNeededForFreeShipping > 0 ? (
              <span>
                Add <span className="font-bold">₹{amountNeededForFreeShipping.toFixed(0)}</span> more for <span className="font-semibold">Free Express Shipping</span>
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                You&apos;ve unlocked Free Express Shipping!
              </span>
            )}
          </div>
          <div className="h-1.5 w-full bg-amber-200/70 dark:bg-amber-900/60 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out rounded-full',
                amountNeededForFreeShipping === 0
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500'
              )}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border/60">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-4 shadow-inner">
                <Flame className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className="font-serif text-lg font-medium text-foreground mb-1">Your bag is quiet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                Discover our hand-poured natural soy candles, or curate a bespoke luxury gift hamper.
              </p>
              <div className="flex flex-col w-full gap-2.5 max-w-xs">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5 text-sm"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                >
                  Explore Collection
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-900 hover:bg-amber-50 rounded-full py-5 text-sm"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/gift-box');
                  }}
                >
                  <Gift className="h-4 w-4 mr-1.5 text-amber-700" />
                  Build Gift Box
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {items.map((item) => {
                const itemPrice = item.variant?.price ?? item.product.price;
                const lineTotal = itemPrice * item.quantity;
                const isGiftBox = item.product.metadata && (item.product.metadata as Record<string, unknown>).is_gift_box;

                return (
                  <div
                    key={`${item.product.id}:${item.variant?.id ?? 'base'}`}
                    className="flex gap-4 pt-4 first:pt-0 group animate-in fade-in-50 duration-200"
                  >
                    {/* Product Thumbnail */}
                    <div className="w-20 h-24 rounded-lg bg-secondary flex-shrink-0 overflow-hidden border border-border/60 relative">
                      {item.variant?.image_url || item.product.image_url ? (
                        <StorageImage
                          src={item.variant?.image_url || item.product.image_url || ''}
                          widths={[128, 256]}
                          defaultWidth={160}
                          sizes="80px"
                          alt={item.product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          Candle
                        </div>
                      )}
                      {isGiftBox && (
                        <span className="absolute top-1 left-1 bg-amber-600 text-white p-1 rounded-full shadow-xs">
                          <Gift className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>

                    {/* Line Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif text-sm font-medium text-foreground leading-snug line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-1"
                            onClick={() => removeItem(item.product.id, item.variant?.id)}
                            aria-label={`Remove ${item.product.name} from bag`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {item.variant && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.variant.name}</p>
                        )}

                        {isGiftBox && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-100/70 border border-amber-200 px-1.5 py-0.5 rounded-sm">
                            <Sparkles className="h-2.5 w-2.5 text-amber-700" />
                            <span>Bespoke Hamper Bundle</span>
                          </div>
                        )}
                      </div>

                      {/* Pricing and Quantity Buttons */}
                      <div className="flex items-center justify-between mt-3 pt-1">
                        <div className="flex items-center border border-border rounded-md bg-secondary/40">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none hover:bg-secondary text-muted-foreground hover:text-foreground"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-semibold w-7 text-center select-none">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none hover:bg-secondary text-muted-foreground hover:text-foreground"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            ₹{lineTotal.toFixed(0)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-muted-foreground">
                              ₹{itemPrice.toFixed(0)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {items.length > 0 && (
          <div className="border-t border-border bg-card/70 p-5 space-y-3.5">
            {/* Complimentary Matches Perk Badge */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-secondary/50 rounded-lg p-2.5 border border-border/50">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Complimentary matchstick vial & fragrance note included with your order.</span>
            </div>

            {/* Subtotal Calculation */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground font-serif text-base">
                  ₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                    <span className="text-emerald-600 font-medium">Free</span>
                  ) : (
                    'Calculated at checkout'
                  )}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99] transition-all py-6 rounded-xl text-sm font-medium shadow-md shadow-amber-950/10 group flex items-center justify-between px-6"
              onClick={handleCheckout}
            >
              <span>Proceed to Checkout</span>
              <span className="flex items-center gap-1.5 font-semibold">
                ₹{totalPrice.toLocaleString('en-IN')}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            {/* View Full Cart Link */}
            <div className="text-center">
              <Link
                to="/cart"
                onClick={() => setIsCartOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
              >
                View full bag details
              </Link>
            </div>

            {/* Trust Assurance Strip */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-amber-700" /> Breakage Guaranteed
              </span>
              <span>•</span>
              <span>100% Soy Wax</span>
              <span>•</span>
              <span>Instant UPI / COD</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
