import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminOrder {
  id: string;
  order_number: string | null;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  tracking_number: string | null;
  total_amount: number;
  subtotal_amount: number;
  shipping_amount: number;
  gst_amount: number;
  status: string;
  shipping_address: string | null;
  special_requirements: string | null;
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

export const useAdminOrders = (search = '', startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async (): Promise<AdminOrder[]> => {
      // Fetch orders
      let ordersQuery = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (search.trim()) {
        const term = search.trim().replace(/([\\(),])/g, '\\$1');
        ordersQuery = ordersQuery.or(
          `guest_name.ilike.%${term}%,guest_email.ilike.%${term}%,guest_phone.ilike.%${term}%,shipping_address.ilike.%${term}%,order_number.ilike.%${term}%`,
        );
      }
      if (startDate) ordersQuery = ordersQuery.gte('created_at', `${startDate}T00:00:00`);
      if (endDate) {
        const exclusiveEndDate = new Date(`${endDate}T00:00:00`);
        exclusiveEndDate.setDate(exclusiveEndDate.getDate() + 1);
        ordersQuery = ordersQuery.lt('created_at', exclusiveEndDate.toISOString());
      }

      const { data: orders, error: ordersError } = await ordersQuery;

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
        order_number: order.order_number,
        user_id: order.user_id,
        guest_email: order.guest_email,
        guest_name: order.guest_name,
        guest_phone: order.guest_phone,
        tracking_number: order.tracking_number,
        total_amount: Number(order.total_amount),
        subtotal_amount: Number(order.subtotal_amount ?? 0),
        shipping_amount: Number(order.shipping_amount ?? 0),
        gst_amount: Number(order.gst_amount ?? 0),
        status: order.status,
        shipping_address: order.shipping_address,
        special_requirements: order.special_requirements,
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
