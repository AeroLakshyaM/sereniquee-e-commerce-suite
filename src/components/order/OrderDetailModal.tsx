import { X, Download, Package, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import OrderProgressTracker from '@/components/order/OrderProgressTracker';
import { openInvoiceInNewTab } from '@/lib/invoiceGenerator';

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', order.user_id)
        .single();

      if (userError) throw userError;

      return {
        ...order,
        order_items: items,
        user,
      };
    },
  });

  const handleDownloadInvoice = () => {
    if (orderDetails) {
      openInvoiceInNewTab(orderDetails);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background w-full max-w-4xl rounded-lg shadow-2xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background w-full max-w-4xl rounded-lg shadow-2xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl mb-1">Order Details</h2>
            <p className="text-purple-100 text-sm">
              Order #{orderDetails.id.slice(0, 8)} • {new Date(orderDetails.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadInvoice}
              className="text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Invoice
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Status Badge */}
          <div className="mb-6">
            <Badge className={`${STATUS_COLORS[orderDetails.status as keyof typeof STATUS_COLORS]} text-sm px-4 py-2`}>
              {orderDetails.status.toUpperCase()}
            </Badge>
          </div>

          {/* Progress Tracker */}
          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Order Status</h3>
            <OrderProgressTracker
              status={orderDetails.status}
              createdAt={orderDetails.created_at}
              updatedAt={orderDetails.updated_at}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Order Information */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                Order Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono">#{orderDetails.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date Placed:</span>
                  <span>{new Date(orderDetails.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{new Date(orderDetails.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-lg text-primary">₹{orderDetails.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                Shipping Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Deliver to:</p>
                  <p className="font-medium">{orderDetails.user?.full_name || 'N/A'}</p>
                  <p className="text-muted-foreground">{orderDetails.user?.email}</p>
                </div>
                {orderDetails.shipping_address && (
                  <div>
                    <p className="text-muted-foreground mb-1">Address:</p>
                    <p>{orderDetails.shipping_address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              Items Ordered ({orderDetails.order_items.length})
            </h3>
            <div className="space-y-3">
              {orderDetails.order_items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-16 h-16 bg-secondary flex-shrink-0 overflow-hidden rounded">
                    {item.product?.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.name || 'Product'}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ₹{item.price_at_time.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      ₹{(item.quantity * item.price_at_time).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>₹{orderDetails.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">₹{orderDetails.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleDownloadInvoice}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
