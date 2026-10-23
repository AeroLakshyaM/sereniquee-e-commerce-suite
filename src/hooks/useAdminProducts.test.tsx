import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAdminProducts } from './useProducts';

const mocks = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: mocks.from } }));

describe('useAdminProducts', () => {
  it('requests only the selected page and applies the search on the server', async () => {
    const query: any = {
      select: vi.fn(() => query),
      order: vi.fn(() => query),
      or: vi.fn(() => query),
      range: vi.fn(() => query),
      abortSignal: vi.fn().mockResolvedValue({ data: [], count: 61, error: null }),
    };
    mocks.from.mockReturnValue(query);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useAdminProducts('lavender', 2), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mocks.from).toHaveBeenCalledWith('products');
    expect(query.range).toHaveBeenCalledWith(50, 74);
    expect(query.or).toHaveBeenCalledWith(expect.stringContaining('name.ilike.%lavender%'));
    expect(result.current.data?.total).toBe(61);
    client.clear();
  });
});
