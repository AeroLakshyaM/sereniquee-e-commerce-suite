import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getOptimizedStorageImageUrl, getStorageImageSrcSet } from './imageUrl';
import { StorageImage } from '@/components/ui/storage-image';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { renderHook } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mocks.from,
  },
}));

describe('imageUrl & StorageImage', () => {
  it('rewrites Supabase public storage URLs to WebP render URLs and leaves local assets untouched', () => {
    const source = 'https://example.supabase.co/storage/v1/object/public/product-images/candle.jpg';
    const transformed = getOptimizedStorageImageUrl(source, 480);

    expect(transformed).toBe(
      'https://example.supabase.co/storage/v1/render/image/public/product-images/candle.jpg?width=480&quality=76&format=webp',
    );
    expect(getStorageImageSrcSet(source, [320, 640])).toContain('640w');
    expect(getOptimizedStorageImageUrl('/landing-candles.jpg', 480)).toBeNull();
    expect(getStorageImageSrcSet('/landing-candles.jpg')).toBeUndefined();
  });

  it('falls back to original URL when transformed image errors', () => {
    const original = 'https://example.supabase.co/storage/v1/object/public/product-images/candle.jpg';
    render(<StorageImage src={original} alt="Rose Candle" defaultWidth={480} />);

    const img = screen.getByAltText('Rose Candle') as HTMLImageElement;
    expect(img.src).toContain('/storage/v1/render/image/public/');

    fireEvent.error(img);
    expect(img.src).toBe(original);
    expect(img.getAttribute('srcset')).toBeNull();
  });
});

describe('Storefront slim queries', () => {
  beforeEach(() => {
    mocks.from.mockReset();
  });

  it('useFeaturedProducts selects only listing fields instead of *', async () => {
    const chain: any = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      abortSignal: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mocks.from.mockReturnValue(chain);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useFeaturedProducts(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(chain.select).toHaveBeenCalledWith(expect.not.stringContaining('*'));
    expect(chain.select).toHaveBeenCalledWith(expect.not.stringContaining('full_description'));
    client.clear();
  });

  it('useCategories({ activeOnly: true }) queries only active categories once', async () => {
    const chain: any = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() => chain),
      abortSignal: vi.fn().mockResolvedValue({ data: [{ id: '1', name: 'Jar Candles', is_active: true }], error: null }),
    };
    mocks.from.mockReturnValue(chain);

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCategories({ activeOnly: true }), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mocks.from).toHaveBeenCalledTimes(1);
    expect(chain.eq).toHaveBeenCalledWith('is_active', true);
    expect(result.current.activeCategories).toHaveLength(1);
    client.clear();
  });
});
