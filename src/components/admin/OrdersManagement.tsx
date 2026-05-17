import { useState } from 'react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Package, User, Calendar, DollarSign, MapPin, ChevronDown, ChevronUp, Printer, CheckCircle, Clock, Truck, FileText } from 'lucide-react';
import { openInvoiceInNewTab } from '@/lib/invoiceGenerator';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersManagement() {
  const { data: orders, isLoading } = useAdminOrders();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const toggleOrder = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status.',
        variant: 'destructive',
      });
    } else {
      queryClient.setQueryData(['admin-orders'], (existing: typeof orders | undefined) => {
        if (!existing) return existing;
        return existing.map((order) =>
          order.id === orderId
            ? { ...order, status: updatedOrder.status, updated_at: updatedOrder.updated_at }
            : order
        );
      });
      queryClient.setQueryData(['order-details', orderId], (existing: any) => {
        if (!existing) return existing;
        return { ...existing, status: updatedOrder.status, updated_at: updatedOrder.updated_at };
      });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: 'Order updated',
        description: `Order status changed to ${newStatus}.`,
      });
    }
  };

  const handlePrintOrder = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order #${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #8b5cf6; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; }
            .order-info { margin: 20px 0; }
            .order-info div { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Sereniquee Candles - Order Receipt</h1>
          <div class="order-info">
            <div><strong>Order ID:</strong> #${order.id.slice(0, 8)}</div>
            <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</div>
            <div><strong>Status:</strong> ${order.status.toUpperCase()}</div>
            <div><strong>Customer:</strong> ${order.user?.full_name || order.user?.email || 'N/A'}</div>
            ${order.user?.email ? `<div><strong>Email:</strong> ${order.user.email}</div>` : ''}
            ${order.shipping_address ? `<div><strong>Shipping Address:</strong> ${order.shipping_address}</div>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map((item: any) => `
                <tr>
                  <td>${item.product?.name || 'Unknown Product'}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price_at_time.toFixed(2)}</td>
                  <td>₹${(item.quantity * item.price_at_time).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">Total: ₹${order.total_amount.toFixed(2)}</div>
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Order</button>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleQuickStatusUpdate = async (orderId: string, newStatus: string) => {
    await handleStatusUpdate(orderId, newStatus);
  };

  const handleDownloadInvoice = (order: any) => {
    openInvoiceInNewTab(order);
  };

  const filteredOrders = orders?.filter((order) =>
    filterStatus === 'all' ? true : order.status === filterStatus
  );

  const statusCounts = orders?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl md:text-2xl mb-2">Order Management</h2>
          <p className="text-sm text-muted-foreground">
            Total Orders: <span className="font-semibold">{orders?.length || 0}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <span className="text-xs md:text-sm text-muted-foreground">Filter by status:</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({orders?.length || 0})</SelectItem>
              <SelectItem value="pending">Pending ({statusCounts?.pending || 0})</SelectItem>
              <SelectItem value="processing">Processing ({statusCounts?.processing || 0})</SelectItem>
              <SelectItem value="shipped">Shipped ({statusCounts?.shipped || 0})</SelectItem>
              <SelectItem value="delivered">Delivered ({statusCounts?.delivered || 0})</SelectItem>
              <SelectItem value="cancelled">Cancelled ({statusCounts?.cancelled || 0})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders?.map((order) => (
          <Card key={order.id} className="shadow-soft hover:shadow-elegant transition-shadow">
            <CardContent className="p-0">
              {/* Order Header */}
              <div
                className="p-4 md:p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleOrder(order.id)}
              >
                {/* Mobile Layout */}
                <div className="block md:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <p className="font-mono text-xs">#{order.id.slice(0, 8)}</p>
                    </div>
                    <Badge className={`text-xs ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="font-medium truncate">
                        {order.user?.full_name || order.user?.email?.split('@')[0] || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-semibold">₹{order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadInvoice(order);
                        }}
                        title="Download Invoice"
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintOrder(order);
                        }}
                        title="Print Order"
                      >
                        <Printer className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        {expandedOrders.has(order.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Order ID</p>
                        <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Customer</p>
                        <p className="font-medium text-sm">
                          {order.user?.full_name || order.user?.email || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-semibold text-sm">₹{order.total_amount.toFixed(2)}</p>
                      </div>
                    </div>

                    <Badge className={STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadInvoice(order);
                      }}
                      title="Download Invoice"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintOrder(order);
                      }}
                      title="Print Order"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      {expandedOrders.has(order.id) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrders.has(order.id) && (
                <div className="border-t border-border p-4 md:p-6 bg-muted/20">
                  <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm md:text-base">Order Items</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-background rounded-lg"
                          >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary flex-shrink-0 overflow-hidden rounded">
                              {item.product?.image_url ? (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                  No img
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs md:text-sm truncate">
                                {item.product?.name || 'Unknown Product'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × ₹{item.price_at_time.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-semibold text-sm md:text-base whitespace-nowrap">
                              ₹{(item.quantity * item.price_at_time).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details & Actions */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3 text-sm md:text-base">Customer Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{order.user?.full_name || 'N/A'}</p>
                              <p className="text-muted-foreground truncate">{order.user?.email}</p>
                            </div>
                          </div>
                          {order.shipping_address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <p className="text-muted-foreground break-words">{order.shipping_address}</p>
                            </div>
                          )}
                          {order.special_requirements && (
                            <div className="flex items-start gap-2 mt-4 p-2 md:p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                              <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-amber-900 dark:text-amber-100 text-xs uppercase tracking-wide mb-1">
                                  Special Requirements
                                </p>
                                <p className="text-xs md:text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap break-words">
                                  {order.special_requirements}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 text-sm md:text-base">Quick Status Update</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={order.status === 'processing' ? 'default' : 'outline'}
                            onClick={() => handleQuickStatusUpdate(order.id, 'processing')}
                            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                          >
                            <Clock className="h-3 w-3 md:h-4 md:w-4" />
                            Processing
                          </Button>
                          <Button
                            size="sm"
                            variant={order.status === 'shipped' ? 'default' : 'outline'}
                            onClick={() => handleQuickStatusUpdate(order.id, 'shipped')}
                            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                          >
                            <Truck className="h-3 w-3 md:h-4 md:w-4" />
                            Shipped
                          </Button>
                          <Button
                            size="sm"
                            variant={order.status === 'delivered' ? 'default' : 'outline'}
                            onClick={() => handleQuickStatusUpdate(order.id, 'delivered')}
                            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                          >
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                            Delivered
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 text-sm md:text-base">Or Select Status</h4>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusUpdate(order.id, value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground break-words">
                          Last updated: {new Date(order.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found.</p>
        </div>
      )}
    </div>
  );
}
