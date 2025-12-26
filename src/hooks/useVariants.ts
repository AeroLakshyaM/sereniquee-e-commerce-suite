import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductVariant } from '@/types';
import { useEffect } from 'react';

// ============================================
// FETCH VARIANTS
// ============================================

export function useProductVariants(productId: string) {
  const query = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ProductVariant[];
    },
    enabled: !!productId,
  });

  // Real-time subscription for variants
  useEffect(() => {
    if (!productId) return;

    const channel = supabase
      .channel(`product-variants-${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_variants',
          filter: `product_id=eq.${productId}`,
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, query]);

  return query;
}

// ============================================
// CREATE VARIANT
// ============================================

export function useCreateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('product_variants')
        .insert([variant])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', data.product_id] });
    },
  });
}

// ============================================
// UPDATE VARIANT
// ============================================

export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductVariant> & { id: string }) => {
      const { data, error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', data.product_id] });
    },
  });
}

// ============================================
// DELETE VARIANT
// ============================================

export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });
}

// ============================================
// GET VARIANT BY ID
// ============================================

export function useVariant(variantId: string | null) {
  return useQuery({
    queryKey: ['variant', variantId],
    queryFn: async () => {
      if (!variantId) return null;

      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('id', variantId)
        .single();

      if (error) throw error;
      return data as ProductVariant;
    },
    enabled: !!variantId,
  });
}

// ============================================
// GET ALL VARIANTS (Admin)
// ============================================

export function useAllVariants() {
  return useQuery({
    queryKey: ['all-variants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          products:product_id (
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
