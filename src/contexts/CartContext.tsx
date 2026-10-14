import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, ProductVariant } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sereniquee_cart';

/** Produces a stable key that distinguishes same-product-different-variant line items. */
function cartItemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId;
}

/** Safely parse the cart from localStorage, returning [] on any failure. */
function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Basic shape validation — must be an array
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    console.warn('[CartContext] Failed to parse stored cart; resetting.');
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      console.warn('[CartContext] Failed to persist cart to localStorage.');
    }
  }, [items]);

  /**
   * Add a product (+ optional variant) to the cart.
   * If the exact product+variant combo already exists, increment quantity.
   */
  const addItem = (product: Product, quantity = 1, variant?: ProductVariant) => {
    setItems(prev => {
      const key = cartItemKey(product.id, variant?.id);
      const existing = prev.find(
        item => cartItemKey(item.product.id, item.variant?.id) === key,
      );

      if (existing) {
        return prev.map(item =>
          cartItemKey(item.product.id, item.variant?.id) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...prev, { product, quantity, variant }];
    });
    setIsCartOpen(true);
  };

  /**
   * Remove a specific product+variant line from the cart.
   * Pass variantId when the item was added with a variant.
   */
  const removeItem = (productId: string, variantId?: string) => {
    const key = cartItemKey(productId, variantId);
    setItems(prev =>
      prev.filter(item => cartItemKey(item.product.id, item.variant?.id) !== key),
    );
  };

  /**
   * Update the quantity of a specific line. Removes the line if quantity <= 0.
   */
  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    const key = cartItemKey(productId, variantId);
    setItems(prev =>
      prev.map(item =>
        cartItemKey(item.product.id, item.variant?.id) === key
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Use variant price when a variant is selected, fall back to product base price
  const totalPrice = items.reduce((sum, item) => {
    const unitPrice = item.variant?.price ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
