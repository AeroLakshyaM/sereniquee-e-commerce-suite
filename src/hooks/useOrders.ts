import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, CartItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

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
  items: CartItem[];
  shippingAddress: string;
  shippingAmount: number;
  gstAmount: number;
  specialRequirements?: string | null;
  guestInfo?: {
    email: string;
    name: string;
    phone: string;
  };
  discountAmount?: number;
  discountCodeId?: string;
  paymentMethod?: 'upi' | 'cod';
}

export function useCreateOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ items, shippingAddress, shippingAmount, gstAmount, specialRequirements, guestInfo, discountAmount = 0, discountCodeId, paymentMethod = 'upi' }: CreateOrderParams) => {
      // Guest checkout or authenticated user
      const isGuest = !user && guestInfo;
      const orderId = crypto.randomUUID();
      const customerName = guestInfo?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'customer';
      const customerCode = customerName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'CUSTOMER';
      const orderNumber = `SC-${customerCode}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
      
      const subtotalAmount = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const discountedSubtotal = Math.max(0, subtotalAmount - discountAmount);
      const totalAmount = discountedSubtotal + shippingAmount + gstAmount;
      
      // Prepare order data
      const orderData: Database['public']['Tables']['orders']['Insert'] = {
        id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount,
        subtotal_amount: discountedSubtotal,
        shipping_amount: shippingAmount,
        gst_amount: gstAmount,
        shipping_address: shippingAddress,
        special_requirements: specialRequirements,
        status: 'pending',
        payment_status: paymentMethod === 'cod' ? 'cod_pending' : 'pending_payment',
        payment_method: paymentMethod,
        discount_code_id: discountCodeId || null,
      };

      // Add user_id for authenticated users or guest info for guest checkout
      if (user) {
        orderData.user_id = user.id;
      } else if (isGuest && guestInfo) {
        orderData.user_id = null;
        orderData.guest_email = guestInfo.email;
        orderData.guest_name = guestInfo.name;
        orderData.guest_phone = guestInfo.phone;
      } else {
        throw new Error('Must be logged in or provide guest information');
      }
      
      // Create the order
      const { error: orderError } = await supabase
        .from('orders')
        .insert(orderData);
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_time: item.product.price,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      return { id: orderId, ...orderData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
