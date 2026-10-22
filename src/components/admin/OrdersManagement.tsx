import { useEffect, useMemo, useState } from 'react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Package, User, Calendar, DollarSign, MapPin, ChevronDown, ChevronUp, Printer, CheckCircle, Clock, Truck, FileText, Banknote } from 'lucide-react';
import { openInvoiceInNewTab } from '@/lib/invoiceGenerator';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Download, Trash2, Send, Mail } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character);

export default function OrdersManagement() {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { data: orders, isLoading } = useAdminOrders(search, startDate, endDate ? new Date(`${endDate}T00:00:00Z`).toISOString().slice(0, 10) : undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [adminOrderView, setAdminOrderView] = useState<'orders' | 'payment-attempts'>('orders');
  const [emailingOrderId, setEmailingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deleteOrder, setDeleteOrder] = useState<any | null>(null);
  const [giftDetails, setGiftDetails] = useState<any | null>(null);
  const [statusHistory, setStatusHistory] = useState<Array<{ status: string; created_at: string }>>([]);
  const [bankUtrs, setBankUtrs] = useState<Record<string, string>>({});
  const [shippingQuoteInputs, setShippingQuoteInputs] = useState<Record<string, string>>({});
  const [shippingCourierInputs, setShippingCourierInputs] = useState<Record<string, string>>({});
  const [shippingBankUtrs, setShippingBankUtrs] = useState<Record<string, string>>({});
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});
  const statuses = ORDER_STATUSES;

  useEffect(() => {
    if (!selectedOrder) return;
    Promise.all([
      supabase.from('order_gift_details').select('*').eq('order_id', selectedOrder.id).maybeSingle(),
      supabase.from('order_status_history').select('status, created_at').eq('order_id', selectedOrder.id).order('created_at', { ascending: true }),
    ]).then(([giftResult, historyResult]) => {
      setGiftDetails(giftResult.data);
      setStatusHistory(historyResult.data || []);
    });
  }, [selectedOrder]);

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
    const currentOrder = orders?.find(order => order.id === orderId);
    if (currentOrder?.order_source === 'online' && currentOrder.payment_method !== 'cod' && currentOrder.payment_status !== 'paid' && !['pending', 'cancelled'].includes(newStatus)) {
      toast({ title: 'Payment still needs verification', description: 'Mark the UPI payment received before moving this order into fulfillment.', variant: 'destructive' });
      return;
    }
    if (currentOrder?.order_source === 'online' && ['shipped', 'delivered'].includes(newStatus) && currentOrder.shipping_quote_status !== 'paid') {
      toast({ title: 'Shipping payment still pending', description: 'Confirm the courier charge is received before dispatch.', variant: 'destructive' });
      return;
    }

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

  const markPaymentReceived = async (order: any) => {
    const bankUtr = (bankUtrs[order.id] || '').trim();
    if (!bankUtr || bankUtr.toUpperCase() !== (order.utr_number || '').trim().toUpperCase()) {
      toast({ title: 'UTR does not match', description: 'Enter the UTR shown in your bank transaction history before marking the payment received.', variant: 'destructive' });
      return;
    }
    const { data, error } = await supabase.rpc('mark_manual_upi_payment_received', { p_order_id: order.id, p_bank_utr: bankUtr });
    if (error || !data) {
      toast({ title: 'Payment not marked received', description: error?.message || 'This payment may already be updated.', variant: 'destructive' });
      return;
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
      queryClient.invalidateQueries({ queryKey: ['orders'] }),
      queryClient.invalidateQueries({ queryKey: ['analytics'] }),
    ]);
    if (order.payment_proof_path) {
      const { error: removeError } = await supabase.storage.from('upi-payment-proofs').remove([order.payment_proof_path]);
      if (!removeError) {
        await supabase.from('orders').update({ payment_proof_path: null }).eq('id', order.id);
        await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      }
      else toast({ title: 'Payment confirmed; image cleanup needs retry', description: removeError.message, variant: 'destructive' });
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch('/api/notify-upi-payment', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(sessionData.session?.access_token ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}) }, body: JSON.stringify({ orderId: order.id, event: 'received' }) });
      if (!response.ok) console.error('Payment confirmation email request failed:', response.status);
    } catch (emailError) { console.error('Payment confirmation email could not be sent:', emailError); }
    toast({ title: 'Payment confirmed', description: 'The order is now marked as paid and processing.' });
  };

  const customerName = (order: any) => order.guest_name || order.user?.full_name || order.user?.email?.split('@')[0] || 'Guest customer';
  const customerEmail = (order: any) => order.guest_email || order.user?.email || '';
  const customerPhone = (order: any) => order.guest_phone || '';
  const displayOrderNumber = (order: any) => order.order_number || order.id.slice(0, 8).toUpperCase();

  const sendOrderEmail = async (order: any, event: 'payment-reminder' | 'order-confirmation' | 'tracking' | 'shipping-quote', quoteAmount?: number, courierName?: string) => {
    setEmailingOrderId(order.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch('/api/order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(sessionData.session?.access_token ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}) },
        body: JSON.stringify({ orderId: order.id, event, quoteAmount, courierName }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Email could not be sent.');
      toast({ title: event === 'payment-reminder' ? 'Payment reminder sent' : event === 'order-confirmation' ? 'Order confirmation sent' : event === 'shipping-quote' ? 'Courier quote emailed' : 'Shipping email sent', description: `Sent to ${customerEmail(order)}.` });
      if (event === 'payment-reminder' || event === 'shipping-quote') await queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      return true;
    } catch (error) {
      toast({ title: 'Email could not be sent', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
      return false;
    } finally { setEmailingOrderId(null); }
  };

  const sendTrackingEmail = async () => {
    if (!trackingOrder || !trackingNumber.trim()) return;
    if (trackingOrder.order_source === 'online' && trackingOrder.payment_method !== 'cod' && trackingOrder.payment_status !== 'paid') {
      toast({ title: 'Payment still needs verification', description: 'Verify the UPI payment before shipping this order.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('orders')
      .update({ status: 'shipped', tracking_number: trackingNumber.trim() })
      .eq('id', trackingOrder.id);
    if (error) {
      toast({ title: 'Shipping update failed', description: error.message, variant: 'destructive' });
      return;
    }

    try {
      if (!await sendOrderEmail({ ...trackingOrder, status: 'shipped', tracking_number: trackingNumber.trim() }, 'tracking')) return;
      await handleStatusUpdate(trackingOrder.id, 'shipped');
      setTrackingOrder(null);
      setTrackingNumber('');
      toast({ title: 'Order marked as shipped' });
    } catch (error) {
      toast({ title: 'Tracking email failed', description: error instanceof Error ? error.message : 'Unable to send tracking email', variant: 'destructive' });
    }
  };

  const deleteSelectedOrder = async () => {
    if (!deleteOrder) return;
    const { data: deletedOrders, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', deleteOrder.id)
      .select('id');
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else if (!deletedOrders || deletedOrders.length === 0) {
      toast({
        title: 'Delete failed',
        description: 'The order was not deleted. Confirm that your account has administrator permissions.',
        variant: 'destructive',
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(current => current?.id === deleteOrder.id ? null : current);
      toast({ title: 'Order deleted' });
    }
    setDeleteOrder(null);
  };

  const exportOrders = () => {
    const rows = (filteredOrders || []).map(order => [
      displayOrderNumber(order), order.created_at, customerName(order), customerEmail(order),
      customerPhone(order), order.order_items.map(item => `${item.product?.name || 'Item'} x${item.quantity}`).join('; '),
      order.total_amount, order.status, order.shipping_address || '',
    ]);
    const csv = [['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Items', 'Total', 'Status', 'Shipping Address'], ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders.csv';
    link.click();
    URL.revokeObjectURL(url);
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

  const filteredOrdersBySearch = orders?.filter((order) => {
    if (adminOrderView === 'orders' && filterStatus !== 'all' && order.status !== filterStatus) return false;
    const normalized = search.toLowerCase();
    if (!normalized) return true;
    return [order.id, order.order_number, customerName(order), customerEmail(order), customerPhone(order), order.shipping_address]
      .some(value => value?.toLowerCase().includes(normalized));
  });

  const isTemporaryUpiAttempt = (order: any) => order.payment_method === 'upi' && ['pending_payment', 'failed'].includes(order.payment_status);
  const paymentAttempts = filteredOrdersBySearch?.filter(order => isTemporaryUpiAttempt(order)) || [];
  const filteredOrders = adminOrderView === 'payment-attempts'
    ? paymentAttempts
    : filteredOrdersBySearch?.filter(order => !isTemporaryUpiAttempt(order));

  const ordersByStatus = useMemo(() => statuses.reduce((acc, status) => {
    acc[status] = (filteredOrders || []).filter(order => order.status === status);
    return acc;
  }, {} as Record<string, any[]>), [filteredOrders]);

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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Orders today', orders?.filter(order => order.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10)).length || 0],
          ['Revenue today', `₹${(orders || []).filter(order => order.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10)).reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}`],
          ['Pending', statusCounts?.pending || 0],
          ['Average order', `₹${orders?.length ? (orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length).toFixed(2) : '0.00'}`],
        ].map(([label, value]) => (
          <Card key={String(label)}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{value}</p></CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search order ID, customer, email, or phone..." className="pl-9" />
        </div>
        <Input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} aria-label="Start date" />
        <Input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} aria-label="End date" />
        <Button variant="outline" onClick={exportOrders}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="flex w-full gap-2 border-b border-border pb-3">
        <Button variant={adminOrderView === 'orders' ? 'default' : 'outline'} onClick={() => setAdminOrderView('orders')}>Orders</Button>
        <Button variant={adminOrderView === 'payment-attempts' ? 'default' : 'outline'} onClick={() => setAdminOrderView('payment-attempts')}>
          Payment attempts <Badge className="ml-2" variant="secondary">{orders?.filter(order => isTemporaryUpiAttempt(order)).length || 0}</Badge>
        </Button>
      </div>

      {adminOrderView === 'orders' ? <>
      <div className="grid gap-4 xl:grid-cols-5">
        {statuses.map(status => (
          <div key={status} className="rounded-lg border bg-muted/20 p-3">
            <h3 className="mb-3 font-semibold capitalize">{status} ({ordersByStatus[status]?.length || 0})</h3>
            <div className="space-y-2">
              {ordersByStatus[status]?.map(order => (
                <button key={order.id} type="button" onClick={() => setSelectedOrder(order)} className="w-full rounded-md border bg-background p-3 text-left hover:border-primary">
                  <p className="font-mono text-xs">{displayOrderNumber(order)}</p>
                  <p className="truncate text-sm font-medium">{customerName(order)}</p>
                  <p className="text-xs text-muted-foreground">₹{order.total_amount.toFixed(2)}</p>
                  <Select value={order.status} onValueChange={value => void handleStatusUpdate(order.id, value)}>
                    <SelectTrigger className="mt-2 h-8 text-xs" onClick={event => event.stopPropagation()}><SelectValue /></SelectTrigger>
                    <SelectContent>{statuses.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                  </Select>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

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
                onClick={() => {
                  toggleOrder(order.id);
                  setSelectedOrder(order);
                }}
              >
                {/* Mobile Layout */}
                <div className="block md:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <p className="font-mono text-xs">#{displayOrderNumber(order)}</p>
                    </div>
                    <Badge className={`text-xs ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    {order.payment_status === 'submitted_for_verification' && <Badge className="bg-amber-100 text-amber-900">Verify UPI</Badge>}
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
                      {order.payment_status === 'paid' && <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={emailingOrderId === order.id || !customerEmail(order)} onClick={event => { event.stopPropagation(); void sendOrderEmail(order, 'order-confirmation'); }} title="Send order confirmation"><Mail className="h-3 w-3" /></Button>}
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
                        <p className="text-xs text-muted-foreground">Order number</p>
                        <p className="font-mono text-sm">{displayOrderNumber(order)}</p>
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
                    {order.payment_status === 'submitted_for_verification' && <Badge className="bg-amber-100 text-amber-900">Verify UPI</Badge>}
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
                    {order.payment_status === 'paid' && <Button variant="outline" size="sm" disabled={emailingOrderId === order.id || !customerEmail(order)} onClick={event => { event.stopPropagation(); void sendOrderEmail(order, 'order-confirmation'); }}><Mail className="mr-2 h-4 w-4" />{emailingOrderId === order.id ? 'Sending…' : 'Email confirmation'}</Button>}
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
                    <div className="rounded-lg border border-border bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-sm md:text-base">{order.order_source === 'offline' ? 'Offline payment' : order.payment_method === 'cod' ? 'Cash on delivery' : 'UPI payment'}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Status: <span className="font-medium text-foreground">{(order.payment_status || 'pending_payment').replace(/_/g, ' ')}</span>
                          </p>
                          {order.utr_number && <p className="mt-1 text-sm">Customer UTR: <span className="font-mono font-medium">{order.utr_number}</span></p>}
                          {order.payment_proof_path && <div className="mt-2 space-y-2">
                            <Button size="sm" variant="outline" onClick={async () => { const { data, error } = await supabase.storage.from('upi-payment-proofs').createSignedUrl(order.payment_proof_path, 300); if (error) toast({ title: 'Could not open payment proof', description: error.message, variant: 'destructive' }); else setProofUrls(current => ({ ...current, [order.id]: data.signedUrl })); }}>View payment screenshot</Button>
                            {proofUrls[order.id] && <a href={proofUrls[order.id]} target="_blank" rel="noreferrer"><img src={proofUrls[order.id]} alt="Customer payment proof" className="max-h-72 rounded-md border object-contain" /></a>}
                          </div>}
                        </div>
                        {order.payment_status === 'submitted_for_verification' && (
                          <div className="flex w-full flex-col gap-2 sm:w-auto">
                          <Input aria-label="UTR received in bank" placeholder="Enter bank UTR to compare" value={bankUtrs[order.id] || ''} onChange={event => setBankUtrs(current => ({ ...current, [order.id]: event.target.value }))} />
                          <p className="text-xs text-muted-foreground">Compare against the bank transaction before confirming.</p>
                          <Button size="sm" disabled={!bankUtrs[order.id]?.trim()} onClick={() => void markPaymentReceived(order)}>
                            <Banknote className="mr-2 h-4 w-4" /> Mark Payment Received
                          </Button>
                          </div>
                        )}
                        {order.payment_status === 'cod_pending' && <div className="flex flex-col gap-2 sm:w-auto"><Badge className="w-fit bg-amber-100 text-amber-900">Cash due on delivery</Badge><Button size="sm" variant="outline" onClick={async () => { const { data, error } = await supabase.rpc('mark_cod_payment_received', { p_order_id: order.id }); if (error || !data) toast({ title: 'Could not record cash payment', description: error?.message || 'This order may already be updated.', variant: 'destructive' }); else { const { data: session } = await supabase.auth.getSession(); void fetch('/api/notify-upi-payment', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(session.session?.access_token ? { Authorization: `Bearer ${session.session.access_token}` } : {}) }, body: JSON.stringify({ orderId: order.id, event: 'received' }) }); await queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); await queryClient.invalidateQueries({ queryKey: ['orders'] }); toast({ title: 'Cash payment recorded' }); } }}><Banknote className="mr-2 h-4 w-4" /> Mark Cash Received</Button></div>}
                        {order.payment_status === 'paid' && <div className="flex flex-wrap items-center gap-2"><Badge className="bg-green-100 text-green-800">Paid</Badge>{order.payment_proof_path && <Button size="sm" variant="outline" onClick={async () => { const { error } = await supabase.storage.from('upi-payment-proofs').remove([order.payment_proof_path]); if (error) toast({ title: 'Image cleanup failed', description: error.message, variant: 'destructive' }); else { await supabase.from('orders').update({ payment_proof_path: null }).eq('id', order.id); setProofUrls(current => { const next = { ...current }; delete next[order.id]; return next; }); await queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast({ title: 'Payment proof deleted' }); } }}>Delete proof image</Button>}</div>}
                      </div>
                    </div>
                    {order.order_source === 'online' && order.payment_status !== 'pending_payment' && order.payment_status !== 'submitted_for_verification' && order.status !== 'cancelled' && <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                      <div><h4 className="font-semibold">Courier shipping quote</h4><p className="text-sm text-muted-foreground">Status: {String(order.shipping_quote_status || 'awaiting_quote').replace(/_/g, ' ')}{order.shipping_quote_amount ? ` · ₹${Number(order.shipping_quote_amount).toFixed(2)}` : ''}</p></div>
                      {['awaiting_quote', 'quoted', 'declined'].includes(order.shipping_quote_status || 'awaiting_quote') && <div className="flex flex-col gap-2 sm:flex-row">
                        <Input type="number" min="1" step="0.01" placeholder="Courier quote in ₹" value={shippingQuoteInputs[order.id] ?? (order.shipping_quote_amount ? String(order.shipping_quote_amount) : '')} onChange={event => setShippingQuoteInputs(current => ({ ...current, [order.id]: event.target.value }))} />
                        <Input placeholder="Courier partner (optional)" value={shippingCourierInputs[order.id] || ''} onChange={event => setShippingCourierInputs(current => ({ ...current, [order.id]: event.target.value }))} />
                        <Button disabled={emailingOrderId === order.id || !Number(shippingQuoteInputs[order.id] ?? order.shipping_quote_amount)} onClick={() => void sendOrderEmail(order, 'shipping-quote', Number(shippingQuoteInputs[order.id] ?? order.shipping_quote_amount), shippingCourierInputs[order.id])}><Mail className="mr-2 h-4 w-4" />{emailingOrderId === order.id ? 'Sending…' : 'Email quote'}</Button>
                      </div>}
                      {order.shipping_quote_status === 'submitted_for_verification' && <div className="flex flex-col gap-2 sm:flex-row"><p className="self-center text-sm">Customer UTR: <span className="font-mono">{order.shipping_utr}</span></p><Input placeholder="Bank UTR to compare" value={shippingBankUtrs[order.id] || ''} onChange={event => setShippingBankUtrs(current => ({ ...current, [order.id]: event.target.value }))} /><Button disabled={!shippingBankUtrs[order.id]?.trim()} onClick={async () => { const { data, error } = await supabase.rpc('admin_mark_shipping_received', { p_order_id: order.id, p_bank_utr: shippingBankUtrs[order.id].trim() }); if (error || !data) toast({ title: 'Shipping payment not confirmed', description: error?.message || 'The bank UTR did not match.', variant: 'destructive' }); else { await queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast({ title: 'Shipping payment confirmed' }); } }}><Banknote className="mr-2 h-4 w-4" />Mark shipping received</Button></div>}
                      {order.shipping_quote_status === 'paid' && <Badge className="bg-green-100 text-green-800">Courier fee received · dispatch allowed</Badge>}
                    </div>}
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
                            onClick={() => {
                              setTrackingOrder(order);
                              setTrackingNumber(order.tracking_number || '');
                            }}
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
                      <div className="flex gap-2 pt-2">
                        <Button variant="destructive" size="sm" onClick={() => setDeleteOrder(order)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                        </Button>
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
      </> : <section className="space-y-4">
        <div>
          <h2 className="font-serif text-xl">Customers continuing UPI checkout</h2>
          <p className="text-sm text-muted-foreground">These are temporary payment attempts. They become regular orders after the customer submits payment details.</p>
        </div>
        {paymentAttempts.length === 0 ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No active UPI payment attempts.</CardContent></Card> : paymentAttempts.map(order => (
          <Card key={order.id} className="shadow-soft"><CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2"><span className="font-serif font-semibold">{order.order_number || 'Unnumbered checkout'}</span><Badge variant="outline">{order.payment_status === 'pending_payment' ? 'Awaiting payment' : 'Expired or cancelled'}</Badge></div>
              <p className="text-sm">{customerName(order)} · {customerEmail(order)}</p>
              <p className="text-sm font-medium">₹{order.total_amount.toFixed(2)} <span className="font-normal text-muted-foreground">· expires {order.payment_expires_at ? new Date(order.payment_expires_at).toLocaleString() : 'soon'}</span></p>
            </div>
            <div className="flex flex-wrap gap-2">
              {order.payment_status === 'pending_payment' && <Button size="sm" variant="outline" disabled={emailingOrderId === order.id || !customerEmail(order)} onClick={() => void sendOrderEmail(order, 'payment-reminder')}>
                <Mail className="mr-2 h-4 w-4" />{emailingOrderId === order.id ? 'Sending…' : 'Email payment link'}
              </Button>}
              {order.payment_status === 'pending_payment' && <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { const { data, error } = await supabase.rpc('admin_cancel_pending_upi_order', { p_order_id: order.id }); if (error || !data) toast({ title: 'Could not cancel payment attempt', description: error?.message || 'This attempt is no longer active.', variant: 'destructive' }); else { await queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); await queryClient.invalidateQueries({ queryKey: ['analytics'] }); toast({ title: 'Payment attempt cancelled' }); } }}>
                Cancel attempt
              </Button>}
            </div>
          </CardContent></Card>
        ))}
      </section>}

      <Sheet open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Order {selectedOrder && displayOrderNumber(selectedOrder)}</SheetTitle>
            <SheetDescription>Full order details and status history</SheetDescription>
          </SheetHeader>
          {selectedOrder && (
            <div className="mt-6 space-y-6">
              <div>
                <h4 className="font-semibold">Shipping address</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{selectedOrder.shipping_address || 'Not provided'}</p>
                <p className="mt-2 text-sm">{customerName(selectedOrder)} · {customerEmail(selectedOrder)} · {customerPhone(selectedOrder)}</p>
              </div>
              <div>
                <h4 className="font-semibold">Line items</h4>
                <div className="mt-2 space-y-2">
                  {selectedOrder.order_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between border-b py-2 text-sm">
                      <span>{item.product?.name || 'Product'} × {item.quantity}</span>
                      <span>₹{item.price_at_time.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {giftDetails && <div><h4 className="font-semibold">Gift details</h4><p className="mt-2 text-sm text-muted-foreground">{giftDetails.gift_message || 'Gift order'}</p></div>}
              <div>
                <h4 className="font-semibold">Status history</h4>
                <div className="mt-2 space-y-2">{statusHistory.map(entry => <div key={`${entry.status}-${entry.created_at}`} className="flex justify-between text-sm"><span className="capitalize">{entry.status}</span><span className="text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</span></div>)}</div>
              </div>
              <Button variant="destructive" onClick={() => setDeleteOrder(selectedOrder)}><Trash2 className="mr-2 h-4 w-4" /> Delete Order</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!trackingOrder} onOpenChange={open => !open && setTrackingOrder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark as shipped</DialogTitle></DialogHeader>
          <Input value={trackingNumber} onChange={event => setTrackingNumber(event.target.value)} placeholder="Tracking number" />
          <DialogFooter><Button onClick={() => void sendTrackingEmail()} disabled={!trackingNumber.trim()}><Send className="mr-2 h-4 w-4" /> Save and email customer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteOrder} onOpenChange={open => !open && setDeleteOrder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete this order?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This permanently removes the order and its line items.</p>
          <DialogFooter><Button variant="destructive" onClick={() => void deleteSelectedOrder()}>Delete Order</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
