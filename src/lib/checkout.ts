import type { CartItem } from '@/types';

/** Build the minimal cart payload sent to the trusted checkout RPC. */
export function mapCartToCheckoutItems(items: CartItem[]) {
  return items.map(item => ({
    productId: item.product.id,
    variantId: item.variant?.id,
    quantity: item.quantity,
  }));
}
