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
    queryFn: async ({ signal }): Promise<AnalyticsData> => {
      const { data, error } = await supabase
        .rpc('get_admin_analytics_summary')
        .abortSignal(signal);

      if (error) throw error;

      const summary = (data ?? {}) as Partial<AnalyticsData>;
      return {
        totalRevenue: Number(summary.totalRevenue ?? 0),
        totalOrders: Number(summary.totalOrders ?? 0),
        totalUsers: Number(summary.totalUsers ?? 0),
        totalProducts: Number(summary.totalProducts ?? 0),
        revenueByMonth: Array.isArray(summary.revenueByMonth) ? summary.revenueByMonth : [],
        ordersByStatus: Array.isArray(summary.ordersByStatus) ? summary.ordersByStatus : [],
        topProducts: Array.isArray(summary.topProducts) ? summary.topProducts : [],
        userGrowth: Array.isArray(summary.userGrowth) ? summary.userGrowth : [],
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};
