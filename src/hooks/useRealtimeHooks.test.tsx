import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGiftOptions } from '@/hooks/useGiftOptions';
import { useProductReviews } from '@/hooks/useReviews';
import { useProductVariants } from '@/hooks/useVariants';
import { useWishlist } from '@/hooks/useWishlist';

const mocks = vi.hoisted(() => {
  const subscribe = vi.fn();
  const on = vi.fn();
  const channel = vi.fn();
  const removeChannel = vi.fn();
  const from = vi.fn();
  let changeHandler: (() => void) | undefined;

  return {
    subscribe,
    on,
    channel,
    removeChannel,
    from,
    getChangeHandler: () => changeHandler,
    setChangeHandler: (fn?: () => void) => {
      changeHandler = fn;
    },
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
  useOptionalAuth: () => ({ user: { id: 'user-123' } }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mocks.from,
    channel: mocks.channel,
    removeChannel: mocks.removeChannel,
  },
}));

function createWrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

function createChainQuery(data: unknown[] = []) {
  const result = Promise.resolve({ data, error: null });
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    then: result.then.bind(result),
    catch: result.catch.bind(result),
  };
  return chain;
}

describe('Realtime hook subscription stability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setChangeHandler(undefined);

    const channelInstance = {
      on: (...args: unknown[]) => {
        mocks.on(...args);
        mocks.setChangeHandler(args[2] as () => void);
        return channelInstance;
      },
      subscribe: () => {
        mocks.subscribe();
        return channelInstance;
      },
    };

    mocks.channel.mockReturnValue(channelInstance);
    mocks.from.mockImplementation(() => createChainQuery([]));
  });

  it('does not open realtime channels for slow-changing gift options or product variants', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const variantsHook = renderHook(() => useProductVariants('prod-1'), {
      wrapper: createWrapper(queryClient),
    });
    const giftsHook = renderHook(() => useGiftOptions(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(variantsHook.result.current.isSuccess).toBe(true);
      expect(giftsHook.result.current.isSuccess).toBe(true);
    });

    expect(mocks.channel).not.toHaveBeenCalled();
  });

  it('keeps a single wishlist channel across refetches and invalidates via queryClient', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result, rerender } = renderHook(() => useWishlist(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.channel).toHaveBeenCalledTimes(1);
    expect(mocks.channel).toHaveBeenCalledWith('wishlist-user-123');

    rerender();
    await act(async () => {
      mocks.getChangeHandler()?.();
    });

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['wishlist', 'user-123'] }),
    );
    expect(mocks.channel).toHaveBeenCalledTimes(1);
    expect(mocks.removeChannel).not.toHaveBeenCalled();
  });

  it('keeps a single product-reviews channel across refetches and invalidates reviews and stats', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result, rerender } = renderHook(
      () => useProductReviews('prod-1', { approved: true, sortBy: 'recent' }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.channel).toHaveBeenCalledTimes(1);
    expect(mocks.channel).toHaveBeenCalledWith('product-reviews-prod-1');

    rerender();
    await act(async () => {
      mocks.getChangeHandler()?.();
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['product-reviews', 'prod-1'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['review-stats', 'prod-1'] });
    });
    expect(mocks.channel).toHaveBeenCalledTimes(1);
    expect(mocks.removeChannel).not.toHaveBeenCalled();
  });
});
