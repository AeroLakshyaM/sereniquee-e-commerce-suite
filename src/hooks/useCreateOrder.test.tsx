import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCreateOrder } from './useOrders';

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: mocks.rpc } }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

describe('useCreateOrder', () => {
  it('sends product and variant identifiers to the atomic server checkout', async () => {
    mocks.rpc.mockResolvedValue({
      data: [{
        id: 'order-1', order_number: 'SC-20261023-1234567890', total_amount: 1365,
        subtotal_amount: 1300, shipping_amount: 0, gst_amount: 65,
        payment_status: 'pending_payment', payment_expires_at: null,
      }],
      error: null,
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCreateOrder(), { wrapper });

    await result.current.mutateAsync({
      items: [{ productId: 'product-1', variantId: 'variant-1', quantity: 2 }],
      idempotencyKey: '7c2801bf-1c71-4d3e-bc6f-cda1b5b1180b',
      customerName: 'Shopper', customerEmail: 'shopper@example.com', customerPhone: '',
      shippingAddress: '1 Candle Lane, Indore', paymentMethod: 'upi',
    });

    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith('create_checkout_order', expect.objectContaining({
      p_items: [{ product_id: 'product-1', variant_id: 'variant-1', quantity: 2 }],
      p_idempotency_key: '7c2801bf-1c71-4d3e-bc6f-cda1b5b1180b',
    })));
    expect(mocks.rpc.mock.calls[0][1]).not.toHaveProperty('p_total_amount');
    client.clear();
  });
});
