import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  SalesAnalytics,
  ProductPerformance,
  CategoryPerformance,
  CustomerAnalytics,
  AnalyticsDashboardData,
} from '@/types';

// ============================================
// SALES TRENDS
// ============================================

export function useSalesTrends(days: number = 30) {
  return useQuery({
    queryKey: ['sales-trends', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_analytics')
        .select('*')
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: true });

      if (error) throw error;
      return data as SalesAnalytics[];
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

// ============================================
// TOP SELLING PRODUCTS
// ============================================

export function useTopProducts(limit: number = 10) {
  return useQuery({
    queryKey: ['top-products', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_performance')
        .select('*')
        .order('total_sold', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ProductPerformance[];
    },
    refetchInterval: 60000,
  });
}

// ============================================
// CATEGORY PERFORMANCE
// ============================================

export function useCategoryPerformance() {
  return useQuery({
    queryKey: ['category-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_performance')
        .select('*')
        .order('total_revenue', { ascending: false });

      if (error) throw error;
      return data as CategoryPerformance[];
    },
    refetchInterval: 60000,
  });
}

// ============================================
// CUSTOMER LIFETIME VALUE
// ============================================

export function useCustomerAnalytics() {
  return useQuery({
    queryKey: ['customer-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_analytics')
        .select('*')
        .order('lifetime_value', { ascending: false });

      if (error) throw error;
      return data as CustomerAnalytics[];
    },
    refetchInterval: 60000,
  });
}

// ============================================
// CONVERSION METRICS
// ============================================

export function useConversionMetrics(days: number = 30) {
  return useQuery({
    queryKey: ['conversion-metrics', days],
    queryFn: async () => {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Get completed orders
      const { data: completedOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, user_id, created_at')
        .gte('created_at', startDate)
        .neq('status', 'cancelled');

      if (ordersError) throw ordersError;

      // Get total sessions (unique users who created carts)
      const { data: cartSessions, error: sessionsError } = await supabase
        .from('orders')
        .select('user_id')
        .gte('created_at', startDate)
        .neq('status', 'cancelled');

      if (sessionsError) throw sessionsError;

      const totalSessions = new Set(cartSessions?.map(s => s.user_id) || []).size;
      const completedOrdersCount = completedOrders?.length || 0;
      
      // Calculate cart abandonment (orders created but not completed)
      const { data: allOrders } = await supabase
        .from('orders')
        .select('id, status')
        .gte('created_at', startDate);

      const abandonedCarts = allOrders?.filter(o => o.status === 'pending').length || 0;
      const totalCarts = allOrders?.length || 1;

      const cartAbandonmentRate = ((abandonedCarts / totalCarts) * 100).toFixed(2);
      const conversionRate = totalSessions > 0 
        ? ((completedOrdersCount / totalSessions) * 100).toFixed(2)
        : '0.00';

      // Average order value
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', startDate)
        .neq('status', 'cancelled');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const avgOrderValue = completedOrdersCount > 0 
        ? (totalRevenue / completedOrdersCount).toFixed(2)
        : '0.00';

      return {
        cartAbandonmentRate: parseFloat(cartAbandonmentRate),
        conversionRate: parseFloat(conversionRate),
        avgOrderValue: parseFloat(avgOrderValue),
        totalSessions,
        completedOrders: completedOrdersCount,
        abandonedCarts,
      };
    },
    refetchInterval: 120000, // Refetch every 2 minutes
  });
}

// ============================================
// REVENUE METRICS
// ============================================

export function useRevenueMetrics() {
  return useQuery({
    queryKey: ['revenue-metrics'],
    queryFn: async () => {
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      // This month's revenue
      const { data: thisMonthOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', firstDayThisMonth)
        .neq('status', 'cancelled');

      const monthlyRevenue = thisMonthOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Last month's revenue
      const { data: lastMonthOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', firstDayLastMonth)
        .lt('created_at', firstDayThisMonth)
        .neq('status', 'cancelled');

      const lastMonthRevenue = lastMonthOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Total revenue
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .neq('status', 'cancelled');

      const totalRevenue = allOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Growth rate
      const growthRate = lastMonthRevenue > 0
        ? (((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(2)
        : '0.00';

      return {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
        lastMonthRevenue: parseFloat(lastMonthRevenue.toFixed(2)),
        growthRate: parseFloat(growthRate),
      };
    },
    refetchInterval: 60000,
  });
}

// ============================================
// CUSTOMER METRICS
// ============================================

export function useCustomerMetrics() {
  return useQuery({
    queryKey: ['customer-metrics'],
    queryFn: async () => {
      // Total customers
      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Active customers (ordered in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo)
        .neq('status', 'cancelled');

      const activeCustomers = new Set(recentOrders?.map(o => o.user_id) || []).size;

      // Customer analytics
      const { data: customerData } = await supabase
        .from('customer_analytics')
        .select('*');

      const avgLifetimeValue = customerData && customerData.length > 0
        ? customerData.reduce((sum, c) => sum + c.lifetime_value, 0) / customerData.length
        : 0;

      // Repeat customer rate (customers with more than 1 order)
      const repeatCustomers = customerData?.filter(c => c.total_orders > 1).length || 0;
      const repeatCustomerRate = totalCustomers && totalCustomers > 0
        ? ((repeatCustomers / totalCustomers) * 100).toFixed(2)
        : '0.00';

      return {
        totalCustomers: totalCustomers || 0,
        activeCustomers,
        avgLifetimeValue: parseFloat(avgLifetimeValue.toFixed(2)),
        repeatCustomerRate: parseFloat(repeatCustomerRate),
        repeatCustomers,
      };
    },
    refetchInterval: 120000,
  });
}

// ============================================
// INVENTORY TURNOVER
// ============================================

export function useInventoryTurnover(days: number = 90) {
  return useQuery({
    queryKey: ['inventory-turnover', days],
    queryFn: async () => {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data: products } = await supabase
        .from('products')
        .select(`
          id,
          name,
          stock_quantity,
          price,
          order_items!inner (
            quantity,
            orders!inner (
              created_at,
              status
            )
          )
        `);

      const turnoverData = products?.map(product => {
        const soldItems = product.order_items?.filter((item: any) => 
          new Date(item.orders.created_at) >= new Date(startDate) &&
          item.orders.status !== 'cancelled'
        ) || [];

        const totalSold = soldItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const avgInventory = product.stock_quantity + (totalSold / 2);
        const turnoverRate = avgInventory > 0 ? (totalSold / avgInventory) : 0;

        return {
          productId: product.id,
          productName: product.name,
          currentStock: product.stock_quantity,
          soldQuantity: totalSold,
          turnoverRate: parseFloat(turnoverRate.toFixed(2)),
          daysToStockout: product.stock_quantity > 0 && totalSold > 0
            ? Math.round((product.stock_quantity / (totalSold / days)) * days)
            : null,
        };
      }) || [];

      return turnoverData.sort((a, b) => b.turnoverRate - a.turnoverRate);
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

// ============================================
// COMPLETE DASHBOARD DATA
// ============================================

export function useDashboardAnalytics(days: number = 30) {
  const salesTrends = useSalesTrends(days);
  const topProducts = useTopProducts();
  const categoryPerformance = useCategoryPerformance();
  const customerMetrics = useCustomerMetrics();
  const conversionMetrics = useConversionMetrics(days);
  const revenueMetrics = useRevenueMetrics();

  return useQuery({
    queryKey: ['dashboard-analytics', days],
    queryFn: async () => {
      // Wait for all queries to complete
      await Promise.all([
        salesTrends.refetch(),
        topProducts.refetch(),
        categoryPerformance.refetch(),
        customerMetrics.refetch(),
        conversionMetrics.refetch(),
        revenueMetrics.refetch(),
      ]);

      return {
        salesTrends: salesTrends.data || [],
        topProducts: topProducts.data || [],
        categoryPerformance: categoryPerformance.data || [],
        customerMetrics: customerMetrics.data || {
          totalCustomers: 0,
          activeCustomers: 0,
          avgLifetimeValue: 0,
          repeatCustomerRate: 0,
        },
        conversionMetrics: conversionMetrics.data || {
          cartAbandonmentRate: 0,
          conversionRate: 0,
          avgOrderValue: 0,
        },
        revenueMetrics: revenueMetrics.data || {
          totalRevenue: 0,
          monthlyRevenue: 0,
          growthRate: 0,
        },
      } as AnalyticsDashboardData;
    },
    enabled: !!(
      salesTrends.data &&
      topProducts.data &&
      categoryPerformance.data &&
      customerMetrics.data &&
      conversionMetrics.data &&
      revenueMetrics.data
    ),
  });
}
