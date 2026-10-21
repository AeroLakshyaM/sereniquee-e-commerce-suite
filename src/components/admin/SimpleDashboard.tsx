import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Warehouse,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500',
  processing: 'bg-sky-500',
  shipped: 'bg-violet-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-rose-500',
};

const QUICK_LINKS = [
  { label: 'Products', detail: 'Update your catalog', tab: 'products', icon: Package },
  { label: 'Orders', detail: 'Review purchases', tab: 'orders', icon: ShoppingCart },
  { label: 'Analytics', detail: 'Explore performance', tab: 'analytics', icon: BarChart3 },
  { label: 'Inventory', detail: 'Check stock levels', tab: 'inventory', icon: Warehouse },
  { label: 'Invoices', detail: 'Create an invoice', tab: 'invoices', icon: FileText },
  { label: 'Newsletter', detail: 'Manage subscribers', tab: 'newsletter', icon: Mail },
];

export default function SimpleDashboard() {
  const { data: analytics, isLoading: analyticsLoading, isError: analyticsError } = useAnalytics();
  const { data: orders, isLoading: ordersLoading, isError: ordersError } = useAdminOrders();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setSearchParams] = useSearchParams();

  const todayOrders = orders?.filter((order) => {
    const orderDate = new Date(order.created_at);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }) ?? [];
  const pendingOrders = orders?.filter((order) => order.status === 'pending') ?? [];
  const recentOrders = orders?.slice(0, 5) ?? [];
  const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

  const goToSection = (tab: string) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('tab', tab);
      return next;
    });
  };

  const handleQuickStatusUpdate = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Could not update order', description: error.message, variant: 'destructive' });
    } else {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ]);
      toast({ title: 'Order moved to processing' });
    }
  };

  if (analyticsLoading || ordersLoading) {
    return (
      <div className="space-y-6" aria-label="Loading dashboard" aria-busy="true">
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Today's sales", value: `₹${todayRevenue.toFixed(2)}`, note: `${todayOrders.length} orders today`, icon: TrendingUp, tone: 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/50' },
    { label: 'Needs attention', value: String(pendingOrders.length), note: 'Pending orders', icon: Clock, tone: 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/50' },
    { label: 'Products', value: String(analytics?.totalProducts ?? 0), note: 'In your catalog', icon: Package, tone: 'text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-950/50' },
    { label: 'Customers', value: String(analytics?.totalUsers ?? 0), note: 'Registered accounts', icon: Users, tone: 'text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-950/50' },
  ];

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-[#fbf6ec] via-card to-card p-6 dark:border-amber-900/50 dark:from-amber-950/30 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-700/10" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-black/20 dark:text-amber-200">
              <Sparkles className="h-3.5 w-3.5" /> Store overview
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">A clear view of what needs attention and how your store is doing today.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <time dateTime={new Date().toISOString()}>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</time>
          </div>
        </div>
      </section>

      {(analyticsError || ordersError) && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Some dashboard information could not load. Refresh the page to try again.
        </div>
      )}

      <section aria-label="Store metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="rounded-xl border-border/70 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex items-start justify-between gap-4 p-5 sm:p-6">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
                </div>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section aria-labelledby="quick-actions-title">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 id="quick-actions-title" className="font-serif text-xl">Quick actions</h3>
            <p className="mt-1 text-sm text-muted-foreground">Jump straight to a task.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.tab}
                type="button"
                onClick={() => goToSection(link.tab)}
                className="group flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground transition group-hover:bg-amber-100 group-hover:text-amber-900 dark:group-hover:bg-amber-950/50 dark:group-hover:text-amber-200">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{link.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{link.detail}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.4fr]">
        <section aria-labelledby="pending-orders-title">
          <Card className="h-full rounded-xl border-border/70 shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5 sm:p-6">
              <div>
                <h3 id="pending-orders-title" className="font-serif text-xl">Needs attention</h3>
                <p className="mt-1 text-sm text-muted-foreground">Orders waiting to be processed.</p>
              </div>
              <Badge variant={pendingOrders.length ? 'default' : 'secondary'}>{pendingOrders.length} pending</Badge>
            </div>
            <CardContent className="space-y-3 p-5 sm:p-6">
              {pendingOrders.length ? pendingOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="flex flex-col gap-3 rounded-lg border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Order #{order.id.slice(0, 8)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">₹{Number(order.total_amount).toFixed(2)} · {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" onClick={() => void handleQuickStatusUpdate(order.id)} className="shrink-0">Start processing</Button>
                </div>
              )) : (
                <div className="py-8 text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-emerald-600" />
                  <p className="mt-3 text-sm font-medium">You’re all caught up</p>
                  <p className="mt-1 text-xs text-muted-foreground">New pending orders will show here.</p>
                </div>
              )}
              {pendingOrders.length > 4 && (
                <Button variant="outline" className="w-full" onClick={() => goToSection('orders')}>
                  View all {pendingOrders.length} pending orders <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="recent-orders-title">
          <Card className="h-full rounded-xl border-border/70 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border/70 p-5 sm:p-6">
              <div>
                <h3 id="recent-orders-title" className="font-serif text-xl">Recent orders</h3>
                <p className="mt-1 text-sm text-muted-foreground">The latest activity from your customers.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => goToSection('orders')} className="shrink-0">
                All orders <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-0">
              {recentOrders.length ? (
                <div className="divide-y divide-border/70">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-muted/30 sm:px-6">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-muted-foreground'}`} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">₹{Number(order.total_amount).toFixed(2)}</p>
                        <Badge variant="outline" className="mt-1 text-[10px] capitalize">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">No orders yet. New orders will appear here.</div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
