import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminOrder {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
  user: {
    email: string;
    full_name: string | null;
  } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    price_at_time: number;
    product: {
      name: string;
      image_url: string | null;
    } | null;
  }>;
}

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async (): Promise<AdminOrder[]> => {
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (profilesError) throw profilesError;

      // Create profile map
      const profileMap = (profiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as { [key: string]: any });

      // Fetch order items with products
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*');

      if (itemsError) throw itemsError;

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, image_url');

      if (productsError) throw productsError;

      // Create product map
      const productMap = (products || []).reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {} as { [key: string]: any });

      // Group order items by order_id
      const itemsByOrder = (orderItems || []).reduce((acc, item) => {
        if (!acc[item.order_id]) {
          acc[item.order_id] = [];
        }
        acc[item.order_id].push(item);
        return acc;
      }, {} as { [key: string]: any[] });

      // Combine all data
      return (orders || []).map((order) => ({
        id: order.id,
        user_id: order.user_id,
        total_amount: Number(order.total_amount),
        status: order.status,
        shipping_address: order.shipping_address,
        created_at: order.created_at,
        updated_at: order.updated_at,
        user: profileMap[order.user_id] ? {
          email: profileMap[order.user_id].email || '',
          full_name: profileMap[order.user_id].full_name,
        } : null,
        order_items: (itemsByOrder[order.id] || []).map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price_at_time: Number(item.price_at_time),
          product: productMap[item.product_id] ? {
            name: productMap[item.product_id].name,
            image_url: productMap[item.product_id].image_url,
          } : null,
        })),
      }));
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};
