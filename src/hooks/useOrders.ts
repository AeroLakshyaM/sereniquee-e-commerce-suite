import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useOrders() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async (): Promise<Order[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });
}

export function useOrderItems(orderId: string) {
  return useQuery({
    queryKey: ['order_items', orderId],
    queryFn: async (): Promise<OrderItem[]> => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!orderId,
  });
}

interface CreateOrderParams {
  items: Array<{ productId: string; quantity: number }>;
  idempotencyKey: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  specialRequirements?: string | null;
  couponCode?: string | null;
  paymentMethod?: 'upi' | 'cod';
}

export function useCreateOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ items, idempotencyKey, customerName, customerEmail, customerPhone, shippingAddress, specialRequirements, couponCode, paymentMethod = 'upi' }: CreateOrderParams) => {
      if (!user && (!customerName.trim() || !customerEmail.trim())) {
        throw new Error('Enter your name and email to continue as a guest.');
      }
      const { data, error } = await supabase.rpc('create_checkout_order', {
        p_idempotency_key: idempotencyKey,
        p_items: items.map(item => ({ product_id: item.productId, quantity: item.quantity })),
        p_customer_name: customerName,
        p_customer_email: customerEmail,
        p_customer_phone: customerPhone || null,
        p_shipping_address: shippingAddress,
        p_special_requirements: specialRequirements || null,
        p_coupon_code: couponCode || null,
        p_payment_method: paymentMethod,
      });

      if (error) throw error;
      const order = Array.isArray(data) ? data[0] : data;
      if (!order) throw new Error('The order could not be confirmed. Please retry checkout.');
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
