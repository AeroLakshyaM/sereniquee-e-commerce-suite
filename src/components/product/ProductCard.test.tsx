import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { FeaturedShowcaseCarousel } from './FeaturedShowcaseCarousel';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';

const addItemMock = vi.fn();

vi.mock('@/contexts/CartContext', () => ({
  useCart: () => ({ addItem: addItemMock }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn(),
  },
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    name: 'Amber Vanilla Reserve',
    slug: 'amber-vanilla-reserve',
    sku: 'SER-001',
    description: 'Warm Madagascar vanilla blended with toasted amber resin.',
    full_description: null,
    price: 799,
    category: 'jar-candles',
    stock_quantity: 12,
    image_url: 'https://example.com/candle.jpg',
    image_urls: ['https://example.com/candle.jpg', 'https://example.com/candle-2.jpg'],
    featured: true,
    average_rating: 4.8,
    review_count: 120,
    seo_title: null,
    seo_description: null,
    seo_keywords: null,
    metadata: null,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z',
    ...overrides,
  };
}

function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProductCard & FeaturedShowcaseCarousel', () => {
  it('renders badge, image dots, description, rating, price, and cart CTA', () => {
    addItemMock.mockReset();
    const product = makeProduct();

    renderWithProviders(<ProductCard product={product} featured spotlight />);

    expect(screen.getByText('BEST SELLER')).toBeTruthy();
    expect(screen.getByText('Amber Vanilla Reserve')).toBeTruthy();
    expect(screen.getByText('4.8')).toBeTruthy();
    expect(screen.getByText('(120)')).toBeTruthy();
    expect(screen.getByText('₹799')).toBeTruthy();

    const addToCartBtn = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartBtn);
    expect(addItemMock).toHaveBeenCalledWith(product, 1);
  });

  it('cycles spotlighted product in FeaturedShowcaseCarousel via navigation controls', () => {
    const products = [
      makeProduct({ id: '1', name: 'Candle One', slug: 'candle-one' }),
      makeProduct({ id: '2', name: 'Candle Two', slug: 'candle-two', featured: false }),
      makeProduct({ id: '3', name: 'Candle Three', slug: 'candle-three', featured: false }),
    ];

    renderWithProviders(<FeaturedShowcaseCarousel products={products} />);

    const nextButton = screen.getByRole('button', { name: /next featured candle/i });
    expect(nextButton).toBeTruthy();
    fireEvent.click(nextButton);

    expect(screen.getByRole('button', { name: 'Show Candle Two' }).getAttribute('aria-current')).toBe(
      'true',
    );
  });

  it('enlarges the product image in a lightbox preview when clicked', () => {
    const product = makeProduct();
    renderWithProviders(<ProductCard product={product} />);

    const imageTrigger = screen.getByRole('button', {
      name: /enlarge image of amber vanilla reserve/i,
    });
    fireEvent.click(imageTrigger);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('1 / 2')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /close image preview/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
