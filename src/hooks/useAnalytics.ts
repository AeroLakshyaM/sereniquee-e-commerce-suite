import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  userGrowth: Array<{ date: string; count: number }>;
}

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      // Fetch total revenue and orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status, created_at');

      if (ordersError) throw ordersError;

      // Calculate total revenue and orders
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;

      // Fetch total users
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Fetch total products
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsError) throw productsError;

      // Calculate revenue by month (last 6 months)
      const revenueByMonth = calculateRevenueByMonth(orders || []);

      // Calculate orders by status
      const ordersByStatus = calculateOrdersByStatus(orders || []);

      // Fetch top products
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity, price_at_time, products(name)');

      if (orderItemsError) throw orderItemsError;

      const topProducts = calculateTopProducts(orderItems || []);

      // Calculate user growth (last 30 days)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (profilesError) throw profilesError;

      const userGrowth = calculateUserGrowth(profiles || []);

      return {
        totalRevenue,
        totalOrders,
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
        revenueByMonth,
        ordersByStatus,
        topProducts,
        userGrowth,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

function calculateRevenueByMonth(orders: any[]) {
  const monthlyRevenue: { [key: string]: number } = {};
  const now = new Date();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyRevenue[key] = 0;
  }

  orders.forEach((order) => {
    const date = new Date(order.created_at);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (monthlyRevenue.hasOwnProperty(key)) {
      monthlyRevenue[key] += Number(order.total_amount);
    }
  });

  return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
    month,
    revenue: Math.round(revenue * 100) / 100,
  }));
}

function calculateOrdersByStatus(orders: any[]) {
  const statusCounts: { [key: string]: number } = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  orders.forEach((order) => {
    if (statusCounts.hasOwnProperty(order.status)) {
      statusCounts[order.status]++;
    }
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
  }));
}

function calculateTopProducts(orderItems: any[]) {
  const productStats: { [key: string]: { name: string; sales: number; revenue: number } } = {};

  orderItems.forEach((item) => {
    const productName = item.products?.name || 'Unknown Product';
    if (!productStats[productName]) {
      productStats[productName] = { name: productName, sales: 0, revenue: 0 };
    }
    productStats[productName].sales += item.quantity;
    productStats[productName].revenue += Number(item.price_at_time) * item.quantity;
  });

  return Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((product) => ({
      ...product,
      revenue: Math.round(product.revenue * 100) / 100,
    }));
}

function calculateUserGrowth(profiles: any[]) {
  const last30Days: { [key: string]: number } = {};
  const now = new Date();

  // Initialize last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    last30Days[key] = 0;
  }

  let cumulativeCount = 0;
  profiles.forEach((profile) => {
    const date = new Date(profile.created_at);
    const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (last30Days.hasOwnProperty(key)) {
      last30Days[key]++;
    }
  });

  // Convert to cumulative counts
  return Object.entries(last30Days).map(([date, count]) => {
    cumulativeCount += count;
    return { date, count: cumulativeCount };
  });
}
