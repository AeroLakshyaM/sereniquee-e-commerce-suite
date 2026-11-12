import { useState } from 'react';
import { useWishlist, useRemoveFromWishlist, useClearWishlist, useMoveWishlistToCart } from '@/hooks/useWishlist';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, Share2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { StorageImage } from '@/components/ui/storage-image';
import { ProductImageLightbox } from '@/components/product/ProductImageLightbox';
import { getProductRouteKey } from '@/lib/utils';

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const clearWishlist = useClearWishlist();
  const moveToCart = useMoveWishlistToCart();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  const handleRemove = async (productId: string, productName: string) => {
    try {
      await removeFromWishlist.mutateAsync(productId);
      toast({ title: `${productName} removed from wishlist` });
    } catch (error: any) {
      toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
    }
  };

  const handleMoveToCart = async (item: any) => {
    try {
      await moveToCart.mutateAsync({
        wishlistItem: item,
        addToCart: addItem,
      });
      toast({ title: `${item.product.name} added to cart` });
    } catch (error: any) {
      toast({ title: "Failed to move to cart", description: error.message, variant: "destructive" });
    }
  };

  const handleClearAll = async () => {
    try {
      await clearWishlist.mutateAsync();
      toast({ title: "Wishlist cleared" });
      setShowClearDialog(false);
    } catch (error: any) {
      toast({ title: "Failed to clear wishlist", description: error.message, variant: "destructive" });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'My Sereniquee Wishlist',
        text: 'Check out my favorite candles!',
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  if (isLoading) {
    return (
      <div className="container-luxury py-12">
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48 mx-auto" />
            <div className="h-4 bg-muted rounded w-32 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="container-luxury py-12">
        <Card className="max-w-md mx-auto p-12 text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-serif mb-2">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground mb-6">
            Save your favorite products for later
          </p>
          <Link to="/shop">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-luxury py-12">
      <SeoHelmet
        title="My Wishlist - Saved Candles - Sereniquee"
        description="View your saved candles and favorite products from Sereniquee. Keep track of your desired handmade soy candles and move them to cart when ready."
        keywords="wishlist, saved candles, favorite products, candle wishlist"
        url="/wishlist"
      />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-serif mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(true)}
              disabled={wishlist.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((item) => (
          <Card
            key={item.id}
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] border-[#eadfd1] bg-[#fdfaf5] p-0 shadow-[0_10px_28px_-16px_rgba(44,34,30,0.14)] transition-[transform,box-shadow,border-color] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:scale-[1.025] hover:shadow-[0_22px_44px_-18px_rgba(44,34,30,0.22)] dark:border-border dark:bg-card"
          >
            <div>
              {/* Full-Bleed Top-Half Product Image */}
              <div className="relative aspect-[4/4.6] sm:aspect-[4/4.5] w-full overflow-hidden bg-[#f4ede3] dark:bg-muted">
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/20 via-black/5 to-transparent" />
                <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center justify-between gap-2">
                  {item.product ? (
                    item.product.stock_quantity === 0 ? (
                      <Badge className="pointer-events-auto rounded-full border-0 bg-[#2c221e]/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#fdfaf5] shadow-sm backdrop-blur-sm">
                        Sold Out
                      </Badge>
                    ) : item.product.stock_quantity <= 5 ? (
                      <Badge className="pointer-events-auto rounded-full border-0 bg-[#fdfaf5]/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a5526] shadow-sm backdrop-blur-sm">
                        Only {item.product.stock_quantity} left
                      </Badge>
                    ) : (
                      <Badge className="pointer-events-auto rounded-full border-0 bg-[#fdfaf5]/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5b4632] shadow-sm backdrop-blur-sm">
                        Saved
                      </Badge>
                    )
                  ) : (
                    <span />
                  )}

                  <button
                    onClick={() => handleRemove(item.product_id, item.product?.name || 'Product')}
                    aria-label={`Remove ${item.product?.name || 'Product'} from wishlist`}
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#fdfaf5]/90 text-[#4f4136] shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-[#2c221e] dark:bg-card/90 dark:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => item.product && setPreviewItem(item)}
                  aria-label={`Enlarge image of ${item.product?.name || 'product'}`}
                  className="block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.product?.image_url ? (
                    <StorageImage
                      src={item.product.image_url}
                      widths={[360, 560, 720]}
                      defaultWidth={560}
                      sizes="(max-width: 639px) 92vw, (max-width: 1023px) 50vw, 25vw"
                      alt={item.product.name}
                      className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-muted to-muted-foreground/20" />
                  )}
                </button>
              </div>

              <div className="space-y-1.5 p-4 pb-0 pt-3 sm:p-5 sm:pb-0 sm:pt-3.5">
                <Link to={item.product ? `/product/${getProductRouteKey(item.product)}` : '/shop'}>
                  <h3 className="line-clamp-1 font-serif text-lg font-semibold text-[#2c221e] transition-colors hover:text-[#7c5d3a] dark:text-foreground">
                    {item.product?.name}
                  </h3>
                </Link>
                {item.product?.description && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-[#7c6f63] dark:text-muted-foreground">
                    {item.product.description}
                  </p>
                )}
                {item.notes && (
                  <p className="text-xs italic text-muted-foreground">
                    Note: {item.notes}
                  </p>
                )}
                {(item.notify_on_sale || item.notify_on_restock) && (
                  <div className="space-y-0.5 text-[11px] text-muted-foreground">
                    {item.notify_on_sale && <p>✓ Notify on sale</p>}
                    {item.notify_on_restock && <p>✓ Notify when back in stock</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 p-4 pt-2 sm:p-5 sm:pt-2">
              <p className="text-lg font-bold text-[#2c221e] dark:text-foreground">
                ₹{item.product?.price.toFixed(2)}
              </p>
              <Button
                className="h-9 rounded-xl bg-[#bfa07a] px-3.5 text-xs font-medium text-white shadow-sm hover:bg-[#ad8c64]"
                onClick={() => handleMoveToCart(item)}
                disabled={!item.product || item.product.stock_quantity === 0}
              >
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                Add to Cart
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Wishlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {wishlist.length} items from your wishlist. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewItem?.product && (
        <ProductImageLightbox
          open={Boolean(previewItem)}
          onOpenChange={(open) => {
            if (!open) setPreviewItem(null);
          }}
          images={
            previewItem.product.image_urls?.length
              ? previewItem.product.image_urls
              : previewItem.product.image_url
                ? [previewItem.product.image_url]
                : []
          }
          title={previewItem.product.name}
          price={previewItem.product.price}
          productPath={`/product/${getProductRouteKey(previewItem.product)}`}
          inStock={previewItem.product.stock_quantity > 0}
          onAddToCart={() => handleMoveToCart(previewItem)}
        />
      )}
    </div>
  );
}
