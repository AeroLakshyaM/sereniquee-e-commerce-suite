import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminOrdersPaginated, useAdminOrderStats } from './useAdminOrders';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mocks.from,
    rpc: mocks.rpc,
  },
}));

describe('useAdminOrdersPaginated & useAdminOrderStats', () => {
  beforeEach(() => {
    mocks.from.mockReset();
    mocks.rpc.mockReset();
  });

  it('paginates orders and scopes related profile, item, and product lookups via .in()', async () => {
    const ordersChain: any = {
      select: vi.fn(() => ordersChain),
      order: vi.fn(() => ordersChain),
      eq: vi.fn(() => ordersChain),
      in: vi.fn(() => ordersChain),
      or: vi.fn(() => ordersChain),
      gte: vi.fn(() => ordersChain),
      lt: vi.fn(() => ordersChain),
      range: vi.fn(() => ordersChain),
      abortSignal: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'ord-1',
            order_number: 'SC-1001',
            order_source: 'online',
            user_id: 'usr-1',
            guest_email: null,
            guest_name: null,
            guest_phone: null,
            tracking_number: null,
            total_amount: 1200,
            subtotal_amount: 1142.86,
            shipping_amount: 0,
            shipping_quote_amount: null,
            shipping_quote_status: 'awaiting_quote',
            shipping_utr: null,
            gst_amount: 57.14,
            status: 'pending',
            payment_status: 'paid',
            payment_method: 'upi',
            payment_expires_at: null,
            utr_number: '123456',
            payment_proof_path: null,
            shipping_address: 'Indore',
            special_requirements: null,
            created_at: '2026-11-12T00:00:00Z',
            updated_at: '2026-11-12T00:00:00Z',
          },
        ],
        count: 42,
        error: null,
      }),
    };

    const profilesChain: any = {
      select: vi.fn(() => profilesChain),
      in: vi.fn(() => profilesChain),
      abortSignal: vi.fn().mockResolvedValue({
        data: [{ id: 'usr-1', email: 'buyer@example.com', full_name: 'Asha' }],
        error: null,
      }),
    };

    const itemsChain: any = {
      select: vi.fn(() => itemsChain),
      in: vi.fn(() => itemsChain),
      abortSignal: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'item-1',
            order_id: 'ord-1',
            product_id: 'prod-1',
            variant_id: null,
            variant_name: null,
            quantity: 2,
            price_at_time: 571.43,
          },
        ],
        error: null,
      }),
    };

    const productsChain: any = {
      select: vi.fn(() => productsChain),
      in: vi.fn(() => productsChain),
      abortSignal: vi.fn().mockResolvedValue({
        data: [{ id: 'prod-1', name: 'Rose Oud', image_url: null }],
        error: null,
      }),
    };

    mocks.from.mockImplementation((table: string) => {
      if (table === 'orders') return ordersChain;
      if (table === 'profiles') return profilesChain;
      if (table === 'order_items') return itemsChain;
      if (table === 'products') return productsChain;
      throw new Error(`Unexpected table ${table}`);
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () => useAdminOrdersPaginated({ search: 'SC-1001', view: 'orders', status: 'pending', page: 1 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(ordersChain.range).toHaveBeenCalledWith(25, 49);
    expect(ordersChain.eq).toHaveBeenCalledWith('status', 'pending');
    expect(ordersChain.or).toHaveBeenCalledWith(expect.stringContaining('order_number.ilike.%SC-1001%'));
    expect(profilesChain.in).toHaveBeenCalledWith('id', ['usr-1']);
    expect(itemsChain.in).toHaveBeenCalledWith('order_id', ['ord-1']);
    expect(productsChain.in).toHaveBeenCalledWith('id', ['prod-1']);
    expect(result.current.data?.total).toBe(42);
    expect(result.current.data?.orders[0].user?.full_name).toBe('Asha');
    expect(result.current.data?.orders[0].order_items[0].product?.name).toBe('Rose Oud');
    client.clear();
  });

  it('fetches server-aggregated order stats via get_admin_order_stats RPC', async () => {
    const rpcChain = {
      abortSignal: vi.fn().mockResolvedValue({
        data: {
          ordersToday: 3,
          revenueToday: 2400,
          totalOrders: 50,
          averageOrderValue: 950,
          paymentAttemptsCount: 4,
          invoicesCount: 46,
          statusCounts: { pending: 5, processing: 10, shipped: 12, delivered: 18, cancelled: 1 },
        },
        error: null,
      }),
    };
    mocks.rpc.mockReturnValue(rpcChain);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAdminOrderStats(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mocks.rpc).toHaveBeenCalledWith('get_admin_order_stats', {
      p_tz_offset_minutes: expect.any(Number),
    });
    expect(result.current.data?.ordersToday).toBe(3);
    expect(result.current.data?.statusCounts.pending).toBe(5);
    client.clear();
  });
});
