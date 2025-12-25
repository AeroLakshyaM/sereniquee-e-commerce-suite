import { useState } from 'react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Package, User, Calendar, DollarSign, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

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
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status.',
        variant: 'destructive',
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: 'Order updated',
        description: `Order status changed to ${newStatus}.`,
      });
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl mb-2">Order Management</h2>
          <p className="text-muted-foreground">
            Total Orders: <span className="font-semibold">{orders?.length || 0}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter by status:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
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
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders?.map((order) => (
          <Card key={order.id} className="shadow-soft hover:shadow-elegant transition-shadow">
            <CardContent className="p-0">
              {/* Order Header */}
              <div
                className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex items-center justify-between">
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
                        <p className="font-semibold text-sm">${order.total_amount.toFixed(2)}</p>
                      </div>
                    </div>

                    <Badge className={STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>

                  <Button variant="ghost" size="icon">
                    {expandedOrders.has(order.id) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrders.has(order.id) && (
                <div className="border-t border-border p-6 bg-muted/20">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-background rounded-lg"
                          >
                            <div className="w-12 h-12 bg-secondary flex-shrink-0 overflow-hidden rounded">
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
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {item.product?.name || 'Unknown Product'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × ${item.price_at_time.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-semibold">
                              ${(item.quantity * item.price_at_time).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details & Actions */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3">Customer Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">{order.user?.full_name || 'N/A'}</p>
                              <p className="text-muted-foreground">{order.user?.email}</p>
                            </div>
                          </div>
                          {order.shipping_address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-muted-foreground">{order.shipping_address}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Update Order Status</h4>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusUpdate(order.id, value)}
                        >
                          <SelectTrigger>
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
                        <p className="text-xs text-muted-foreground">
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
