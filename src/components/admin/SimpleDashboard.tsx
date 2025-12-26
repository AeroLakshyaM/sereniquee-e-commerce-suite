import { useAnalytics } from '@/hooks/useAnalytics';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ShoppingCart, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export default function SimpleDashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const todayOrders = orders?.filter((order) => {
    const orderDate = new Date(order.created_at);
    const today = new Date();
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  });

  const pendingOrders = orders?.filter((order) => order.status === 'pending');
  const recentOrders = orders?.slice(0, 5);

  const handleQuickStatusUpdate = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order.',
        variant: 'destructive',
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: 'Success!',
        description: `Order updated to ${newStatus}`,
      });
    }
  };

  if (analyticsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
        <h2 className="font-serif text-2xl mb-2">Welcome Back! 👋</h2>
        <p className="text-muted-foreground">
          Here's what's happening with your candle business today
        </p>
      </div>

      {/* Quick Stats - Big and Easy to Read */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Today's Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-700">
              ₹{todayOrders?.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2) || '0.00'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {todayOrders?.length || 0} orders today
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-700">
              {pendingOrders?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Need attention</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-700">
              {analytics?.totalProducts || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">In your store</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders Alert */}
      {pendingOrders && pendingOrders.length > 0 && (
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Action Needed: {pendingOrders.length} Pending {pendingOrders.length === 1 ? 'Order' : 'Orders'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="bg-white p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{order.total_amount.toFixed(2)} • {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleQuickStatusUpdate(order.id, 'processing')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start Processing
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[order.status]}`} />
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{order.total_amount.toFixed(2)}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700">💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">Click "Orders" tab to see all orders and update their status</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">Use "Products" tab to add new candles with photos</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm">Check "Analytics" for detailed sales reports</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
