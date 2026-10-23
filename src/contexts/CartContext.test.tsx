import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CartProvider, useCart } from './CartContext';
import type { Product, ProductVariant } from '@/types';

const product: Product = {
  id: 'product-1', name: 'Soy Candle', slug: 'soy-candle', sku: null,
  description: null, full_description: null, price: 400, category: 'Candles',
  stock_quantity: 10, image_url: null, image_urls: [], featured: false,
  average_rating: 0, review_count: 0, seo_title: null, seo_description: null,
  seo_keywords: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
  metadata: {},
};

const variant: ProductVariant = {
  id: 'variant-1', product_id: product.id, name: 'Large', sku: null, price: 650,
  stock_quantity: 4, size: 'Large', scent: null, color: null, wick_type: null,
  weight: null, custom_engraving: null, image_url: null, is_default: false,
  sort_order: 0, is_active: true, created_at: '', updated_at: '',
};

function CartProbe() {
  const cart = useCart();
  return (
    <>
      <output data-testid="total">{cart.totalPrice}</output>
      <output data-testid="quantity">{cart.totalItems}</output>
      <button onClick={() => cart.addItem(product, 1, variant)}>Add large</button>
    </>
  );
}

describe('CartProvider', () => {
  it('uses variant pricing and merges repeated additions of the same option', () => {
    render(<CartProvider><CartProbe /></CartProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Add large' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add large' }));

    expect(screen.getByTestId('total').textContent).toBe('1300');
    expect(screen.getByTestId('quantity').textContent).toBe('2');
  });

  it('drops carts older than 30 days during hydration', () => {
    localStorage.setItem('sereniquee_cart', JSON.stringify([{ product, quantity: 1 }]));
    localStorage.setItem('sereniquee_cart_updated_at', String(Date.now() - 31 * 24 * 60 * 60 * 1000));

    render(<CartProvider><CartProbe /></CartProvider>);

    expect(screen.getByTestId('total').textContent).toBe('0');
    expect(screen.getByTestId('quantity').textContent).toBe('0');
  });

  it('syncs a cart changed in another browser tab', () => {
    render(<CartProvider><CartProbe /></CartProvider>);
    const sharedCart = [{ product, quantity: 1, variant }];
    localStorage.setItem('sereniquee_cart_updated_at', String(Date.now()));
    localStorage.setItem('sereniquee_cart', JSON.stringify(sharedCart));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'sereniquee_cart', newValue: JSON.stringify(sharedCart) }));
    });

    expect(screen.getByTestId('total').textContent).toBe('650');
    expect(screen.getByTestId('quantity').textContent).toBe('1');
  });
});
