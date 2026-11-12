import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ADMIN_ORDERS_PAGE_SIZE = 25;

export interface AdminOrder {
  id: string;
  order_number: string | null;
  order_source: 'online' | 'offline';
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  tracking_number: string | null;
  total_amount: number;
  subtotal_amount: number;
  shipping_amount: number;
  shipping_quote_amount: number | null;
  shipping_quote_status: string;
  shipping_utr: string | null;
  gst_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_expires_at: string | null;
  utr_number: string | null;
  payment_proof_path: string | null;
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
    product_id: string | null;
    variant_id: string | null;
    variant_name: string | null;
    quantity: number;
    price_at_time: number;
    product: {
      name: string;
      image_url: string | null;
    } | null;
  }>;
}

export interface AdminOrderStats {
  ordersToday: number;
  revenueToday: number;
  totalOrders: number;
  averageOrderValue: number;
  paymentAttemptsCount: number;
  invoicesCount: number;
  statusCounts: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export type AdminOrderView = 'orders' | 'payment-attempts' | 'invoices';

export interface AdminOrdersQueryParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  view?: AdminOrderView;
  page?: number;
  pageSize?: number;
}

export interface AdminOrdersPageResult {
  orders: AdminOrder[];
  total: number;
}

function buildFilteredOrdersQuery(
  params: Pick<AdminOrdersQueryParams, 'search' | 'startDate' | 'endDate' | 'status' | 'view'>,
  withExactCount: boolean,
) {
  let ordersQuery = supabase
    .from('orders')
    .select('*', withExactCount ? { count: 'exact' } : undefined)
    .order('created_at', { ascending: false });

  if (params.view === 'payment-attempts') {
    ordersQuery = ordersQuery
      .eq('payment_method', 'upi')
      .in('payment_status', ['pending_payment', 'failed']);
  } else if (params.view === 'orders' || params.view === 'invoices') {
    ordersQuery = ordersQuery.or(
      'payment_method.neq.upi,payment_status.not.in.(pending_payment,failed)',
    );
  }

  if (params.view === 'orders' && params.status && params.status !== 'all') {
    ordersQuery = ordersQuery.eq('status', params.status);
  }

  const trimmedSearch = params.search?.trim() || '';
  if (trimmedSearch) {
    const term = trimmedSearch.replace(/([\\(),])/g, '\\$1');
    ordersQuery = ordersQuery.or(
      `guest_name.ilike.%${term}%,guest_email.ilike.%${term}%,guest_phone.ilike.%${term}%,shipping_address.ilike.%${term}%,order_number.ilike.%${term}%`,
    );
  }

  if (params.startDate) {
    ordersQuery = ordersQuery.gte('created_at', `${params.startDate}T00:00:00`);
  }
  if (params.endDate) {
    const exclusiveEndDate = new Date(`${params.endDate}T00:00:00`);
    exclusiveEndDate.setDate(exclusiveEndDate.getDate() + 1);
    ordersQuery = ordersQuery.lt('created_at', exclusiveEndDate.toISOString());
  }

  return ordersQuery;
}

async function hydrateAdminOrders(orders: any[], signal?: AbortSignal): Promise<AdminOrder[]> {
  if (!orders.length) return [];

  const orderIds = orders.map((order) => order.id);
  const userIds = [...new Set(orders.map((order) => order.user_id).filter(Boolean))] as string[];

  const profilesPromise = userIds.length > 0
    ? (() => {
        const q = supabase.from('profiles').select('id, email, full_name').in('id', userIds);
        return signal ? q.abortSignal(signal) : q;
      })()
    : Promise.resolve({ data: [], error: null });

  const itemsQuery = supabase.from('order_items').select('*').in('order_id', orderIds);
  const itemsPromise = signal ? itemsQuery.abortSignal(signal) : itemsQuery;

  const [profilesResult, itemsResult] = await Promise.all([profilesPromise, itemsPromise]);

  if (profilesResult.error) throw profilesResult.error;
  if (itemsResult.error) throw itemsResult.error;

  const profileMap = (profilesResult.data || []).reduce((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {} as Record<string, { id: string; email: string | null; full_name: string | null }>);

  const orderItems = itemsResult.data || [];
  const productIds = [...new Set(orderItems.map((item) => item.product_id).filter(Boolean))] as string[];

  const productsResult = productIds.length > 0
    ? await (() => {
        const q = supabase.from('products').select('id, name, image_url').in('id', productIds);
        return signal ? q.abortSignal(signal) : q;
      })()
    : { data: [], error: null };

  if (productsResult.error) throw productsResult.error;

  const productMap = (productsResult.data || []).reduce((acc, product) => {
    acc[product.id] = product;
    return acc;
  }, {} as Record<string, { id: string; name: string; image_url: string | null }>);

  const itemsByOrder = orderItems.reduce((acc, item) => {
    if (!acc[item.order_id]) {
      acc[item.order_id] = [];
    }
    acc[item.order_id].push(item);
    return acc;
  }, {} as Record<string, typeof orderItems>);

  return orders.map((order) => ({
    id: order.id,
    order_number: order.order_number,
    order_source: order.order_source as 'online' | 'offline',
    user_id: order.user_id,
    guest_email: order.guest_email,
    guest_name: order.guest_name,
    guest_phone: order.guest_phone,
    tracking_number: order.tracking_number,
    total_amount: Number(order.total_amount),
    subtotal_amount: Number(order.subtotal_amount ?? 0),
    shipping_amount: Number(order.shipping_amount ?? 0),
    shipping_quote_amount: order.shipping_quote_amount == null ? null : Number(order.shipping_quote_amount),
    shipping_quote_status: order.shipping_quote_status || 'awaiting_quote',
    shipping_utr: order.shipping_utr || null,
    gst_amount: Number(order.gst_amount ?? 0),
    status: order.status,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
    payment_expires_at: order.payment_expires_at,
    utr_number: order.utr_number,
    payment_proof_path: order.payment_proof_path,
    shipping_address: order.shipping_address,
    special_requirements: order.special_requirements,
    created_at: order.created_at,
    updated_at: order.updated_at,
    user: order.user_id && profileMap[order.user_id]
      ? {
          email: profileMap[order.user_id].email || '',
          full_name: profileMap[order.user_id].full_name,
        }
      : null,
    order_items: (itemsByOrder[order.id] || []).map((item) => ({
      id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      variant_name: item.variant_name || null,
      quantity: item.quantity,
      price_at_time: Number(item.price_at_time),
      product: item.product_id && productMap[item.product_id]
        ? {
            name: productMap[item.product_id].name,
            image_url: productMap[item.product_id].image_url,
          }
        : null,
    })),
  }));
}

export const useAdminOrderStats = () => {
  return useQuery({
    queryKey: ['admin-orders', 'stats'],
    queryFn: async ({ signal }): Promise<AdminOrderStats> => {
      const { data, error } = await supabase
        .rpc('get_admin_order_stats', {
          p_tz_offset_minutes: new Date().getTimezoneOffset(),
        })
        .abortSignal(signal);

      if (error) throw error;

      const stats = (data ?? {}) as Partial<AdminOrderStats>;
      return {
        ordersToday: Number(stats.ordersToday ?? 0),
        revenueToday: Number(stats.revenueToday ?? 0),
        totalOrders: Number(stats.totalOrders ?? 0),
        averageOrderValue: Number(stats.averageOrderValue ?? 0),
        paymentAttemptsCount: Number(stats.paymentAttemptsCount ?? 0),
        invoicesCount: Number(stats.invoicesCount ?? 0),
        statusCounts: {
          pending: Number(stats.statusCounts?.pending ?? 0),
          processing: Number(stats.statusCounts?.processing ?? 0),
          shipped: Number(stats.statusCounts?.shipped ?? 0),
          delivered: Number(stats.statusCounts?.delivered ?? 0),
          cancelled: Number(stats.statusCounts?.cancelled ?? 0),
        },
      };
    },
    staleTime: 30_000,
  });
};

export const useAdminOrdersPaginated = ({
  search = '',
  startDate,
  endDate,
  status = 'all',
  view = 'orders',
  page = 0,
  pageSize = ADMIN_ORDERS_PAGE_SIZE,
}: AdminOrdersQueryParams = {}) => {
  return useQuery({
    queryKey: ['admin-orders', 'paginated', { search, startDate, endDate, status, view, page, pageSize }],
    queryFn: async ({ signal }): Promise<AdminOrdersPageResult> => {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data: orders, count, error } = await buildFilteredOrdersQuery(
        { search, startDate, endDate, status, view },
        true,
      )
        .range(from, to)
        .abortSignal(signal);

      if (error) throw error;

      const hydrated = await hydrateAdminOrders(orders || [], signal);
      return { orders: hydrated, total: count || 0 };
    },
  });
};

export const useAdminOrders = (
  search = '',
  startDate?: string,
  endDate?: string,
  options: { limit?: number; status?: string; view?: AdminOrderView } = {},
) => {
  const limit = options.limit ?? 100;
  const status = options.status ?? 'all';
  const view = options.view;

  return useQuery({
    queryKey: ['admin-orders', 'list', { search, startDate, endDate, limit, status, view }],
    queryFn: async ({ signal }): Promise<AdminOrder[]> => {
      const { data: orders, error } = await buildFilteredOrdersQuery(
        { search, startDate, endDate, status, view },
        false,
      )
        .limit(limit)
        .abortSignal(signal);

      if (error) throw error;
      return hydrateAdminOrders(orders || [], signal);
    },
  });
};
