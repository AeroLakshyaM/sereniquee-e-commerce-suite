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

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const clearWishlist = useClearWishlist();
  const moveToCart = useMoveWishlistToCart();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <Card key={item.id} className="group relative overflow-hidden">
            {/* Remove Button */}
            <button
              onClick={() => handleRemove(item.product_id, item.product?.name || 'Product')}
              className="absolute top-2 right-2 z-10 p-2 bg-background/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>

            <Link to={`/product/${item.product?.slug}`}>
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                {item.product?.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
                )}
              </div>
            </Link>

            <div className="p-4 space-y-3">
              <div>
                <Link to={`/product/${item.product?.slug}`}>
                  <h3 className="font-medium hover:text-primary transition-colors">
                    {item.product?.name}
                  </h3>
                </Link>
                <p className="text-lg font-semibold mt-1">
                  ₹{item.product?.price.toFixed(2)}
                </p>
              </div>

              {/* Stock Status */}
              {item.product && (
                <div>
                  {item.product.stock_quantity === 0 ? (
                    <Badge variant="destructive">Out of Stock</Badge>
                  ) : item.product.stock_quantity <= 5 ? (
                    <Badge variant="secondary" className="text-orange-600">
                      Only {item.product.stock_quantity} left
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-green-600">
                      In Stock
                    </Badge>
                  )}
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <p className="text-sm text-muted-foreground italic">
                  Note: {item.notes}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleMoveToCart(item)}
                  disabled={!item.product || item.product.stock_quantity === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {/* Notifications */}
              {(item.notify_on_sale || item.notify_on_restock) && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {item.notify_on_sale && <p>✓ Notify on sale</p>}
                  {item.notify_on_restock && <p>✓ Notify when back in stock</p>}
                </div>
              )}
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
    </div>
  );
}
