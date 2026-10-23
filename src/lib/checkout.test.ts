import { describe, expect, it } from 'vitest';
import { mapCartToCheckoutItems } from './checkout';
import type { CartItem } from '@/types';

const product = {
  id: 'product-1', name: 'Soy Candle', slug: 'soy-candle', sku: null,
  description: null, full_description: null, price: 400, category: 'Candles',
  stock_quantity: 10, image_url: null, image_urls: [], featured: false,
  average_rating: 0, review_count: 0, seo_title: null, seo_description: null,
  seo_keywords: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
  metadata: {},
} as CartItem['product'];

describe('mapCartToCheckoutItems', () => {
  it('sends the selected variant and quantity without trusting client prices', () => {
    const item: CartItem = {
      product,
      quantity: 2,
      variant: {
        id: 'variant-2', product_id: product.id, name: 'Large', sku: null, price: 650,
        stock_quantity: 3, size: 'Large', scent: null, color: null, wick_type: null,
        weight: null, custom_engraving: null, image_url: null, is_default: false,
        sort_order: 0, is_active: true, created_at: '', updated_at: '',
      },
    };

    expect(mapCartToCheckoutItems([item])).toEqual([
      { productId: 'product-1', variantId: 'variant-2', quantity: 2 },
    ]);
    expect(mapCartToCheckoutItems([item])[0]).not.toHaveProperty('price');
  });

  it('preserves a base product line when no variant is selected', () => {
    expect(mapCartToCheckoutItems([{ product, quantity: 1 }])).toEqual([
      { productId: 'product-1', variantId: undefined, quantity: 1 },
    ]);
  });
});
