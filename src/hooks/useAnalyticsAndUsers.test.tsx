import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnalytics } from './useAnalytics';
import { useUsers } from './useUsers';
import { useConversionMetrics, useRevenueMetrics } from './useAdvancedAnalytics';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: mocks.rpc,
  },
}));

describe('Server-aggregated admin RPC hooks', () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
  });

  it('useAnalytics fetches pre-aggregated summary from get_admin_analytics_summary', async () => {
    mocks.rpc.mockReturnValue({
      abortSignal: vi.fn().mockResolvedValue({
        data: {
          totalRevenue: 15000,
          totalOrders: 12,
          totalUsers: 40,
          totalProducts: 18,
          revenueByMonth: [{ month: 'Nov 2026', revenue: 15000 }],
          ordersByStatus: [{ status: 'Pending', count: 2 }],
          topProducts: [{ name: 'Vanilla Silk', sales: 8, revenue: 6400 }],
          userGrowth: [{ date: 'Nov 12', count: 40 }],
        },
        error: null,
      }),
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAnalytics(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mocks.rpc).toHaveBeenCalledWith('get_admin_analytics_summary');
    expect(result.current.data?.totalRevenue).toBe(15000);
    expect(result.current.data?.topProducts[0].name).toBe('Vanilla Silk');
    client.clear();
  });

  it('useUsers calls get_admin_users_paginated with search and pagination args', async () => {
    mocks.rpc.mockReturnValue({
      abortSignal: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'u-1',
            email: 'asha@example.com',
            full_name: 'Asha',
            phone: '9876543210',
            address: null,
            city: 'Indore',
            postal_code: '452001',
            country: 'India',
            created_at: '2026-11-01T00:00:00Z',
            last_sign_in_at: null,
            role: 'user',
            order_count: 3,
            total_spent: 2500,
            total_count: 31,
          },
        ],
        error: null,
      }),
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUsers({ search: 'asha', page: 1, pageSize: 24 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mocks.rpc).toHaveBeenCalledWith('get_admin_users_paginated', {
      p_search: 'asha',
      p_page: 1,
      p_page_size: 24,
    });
    expect(result.current.data?.total).toBe(31);
    expect(result.current.data?.users[0].total_spent).toBe(2500);
    client.clear();
  });

  it('useConversionMetrics and useRevenueMetrics call their SQL aggregation RPCs', async () => {
    mocks.rpc.mockImplementation((fnName: string) => {
      if (fnName === 'get_admin_conversion_metrics') {
        return {
          abortSignal: vi.fn().mockResolvedValue({
            data: {
              cartAbandonmentRate: 12.5,
              conversionRate: 87.5,
              avgOrderValue: 1100,
              totalSessions: 16,
              completedOrders: 14,
              abandonedCarts: 2,
            },
            error: null,
          }),
        };
      }
      return {
        abortSignal: vi.fn().mockResolvedValue({
          data: {
            totalRevenue: 50000,
            monthlyRevenue: 12000,
            lastMonthRevenue: 10000,
            growthRate: 20,
          },
          error: null,
        }),
      };
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const conv = renderHook(() => useConversionMetrics(30), { wrapper });
    const rev = renderHook(() => useRevenueMetrics(), { wrapper });

    await waitFor(() => expect(conv.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(rev.result.current.isSuccess).toBe(true));

    expect(mocks.rpc).toHaveBeenCalledWith('get_admin_conversion_metrics', { p_days: 30 });
    expect(mocks.rpc).toHaveBeenCalledWith('get_admin_revenue_metrics');
    expect(conv.result.current.data?.avgOrderValue).toBe(1100);
    expect(rev.result.current.data?.growthRate).toBe(20);
    client.clear();
  });
});
