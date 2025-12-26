import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GiftOption, OrderGiftDetails } from '@/types';
import { useEffect } from 'react';

// ============================================
// FETCH GIFT OPTIONS
// ============================================

export function useGiftOptions() {
  const query = useQuery({
    queryKey: ['gift-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_options')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as GiftOption[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('gift-options-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gift_options',
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [query]);

  return query;
}

// ============================================
// CREATE GIFT OPTION (Admin)
// ============================================

export function useCreateGiftOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (option: Omit<GiftOption, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('gift_options')
        .insert([option])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-options'] });
    },
  });
}

// ============================================
// UPDATE GIFT OPTION (Admin)
// ============================================

export function useUpdateGiftOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GiftOption> & { id: string }) => {
      const { data, error } = await supabase
        .from('gift_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-options'] });
    },
  });
}

// ============================================
// DELETE GIFT OPTION (Admin)
// ============================================

export function useDeleteGiftOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gift_options')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-options'] });
    },
  });
}

// ============================================
// CREATE ORDER GIFT DETAILS
// ============================================

export function useCreateOrderGiftDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (giftDetails: Omit<OrderGiftDetails, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('order_gift_details')
        .insert([giftDetails])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-gift-details'] });
    },
  });
}

// ============================================
// GET ORDER GIFT DETAILS
// ============================================

export function useOrderGiftDetails(orderId: string | null) {
  return useQuery({
    queryKey: ['order-gift-details', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from('order_gift_details')
        .select(`
          *,
          gift_option:gift_wrap_option_id (*)
        `)
        .eq('order_id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No gift details found
        throw error;
      }
      return data;
    },
    enabled: !!orderId,
  });
}
