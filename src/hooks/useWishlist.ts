import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WishlistItem } from '@/types';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// FETCH USER WISHLIST
// ============================================

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          product:products!product_id (*),
          variant:product_variants!variant_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`wishlist-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlists',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, query]);

  return query;
}

// ============================================
// ADD TO WISHLIST
// ============================================

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      variantId,
      notes,
      notifyOnSale = false,
      notifyOnRestock = false,
    }: {
      productId: string;
      variantId?: string;
      notes?: string;
      notifyOnSale?: boolean;
      notifyOnRestock?: boolean;
    }) => {
      if (!user) throw new Error('User must be logged in');

      const { data, error } = await supabase
        .from('wishlists')
        .insert([{
          user_id: user.id,
          product_id: productId,
          variant_id: variantId || null,
          notes: notes || null,
          notify_on_sale: notifyOnSale,
          notify_on_restock: notifyOnRestock,
        }])
        .select()
        .single();

      if (error) {
        // Check if already in wishlist
        if (error.code === '23505') {
          throw new Error('Product is already in your wishlist');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

// ============================================
// REMOVE FROM WISHLIST
// ============================================

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('User must be logged in');

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

// ============================================
// UPDATE WISHLIST ITEM
// ============================================

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      notes?: string;
      notify_on_sale?: boolean;
      notify_on_restock?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('wishlists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

// ============================================
// CHECK IF PRODUCT IS IN WISHLIST
// ============================================

export function useIsInWishlist(productId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-in-wishlist', productId, user?.id],
    queryFn: async () => {
      if (!user || !productId) return false;

      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return false; // Not found
        throw error;
      }
      return !!data;
    },
    enabled: !!user && !!productId,
  });
}

// ============================================
// GET WISHLIST COUNT
// ============================================

export function useWishlistCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

// ============================================
// CLEAR WISHLIST
// ============================================

export function useClearWishlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User must be logged in');

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count'] });
    },
  });
}

// ============================================
// MOVE WISHLIST ITEM TO CART
// ============================================

export function useMoveWishlistToCart() {
  const queryClient = useQueryClient();
  const removeFromWishlist = useRemoveFromWishlist();

  return useMutation({
    mutationFn: async ({
      wishlistItem,
      addToCart,
    }: {
      wishlistItem: WishlistItem;
      addToCart: (product: any, quantity: number, variant?: any) => void;
    }) => {
      // Add to cart
      if (wishlistItem.product) {
        addToCart(wishlistItem.product, 1, wishlistItem.variant);
      }

      // Remove from wishlist
      await removeFromWishlist.mutateAsync(wishlistItem.product_id);

      return wishlistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
