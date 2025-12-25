import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
  role: string;
  order_count: number;
  total_spent: number;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Create role map
      const roleMap = (userRoles || []).reduce((acc, ur) => {
        if (!acc[ur.user_id]) {
          acc[ur.user_id] = [];
        }
        acc[ur.user_id].push(ur.role);
        return acc;
      }, {} as { [key: string]: string[] });

      // Fetch order statistics for each user
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total_amount');

      if (ordersError) throw ordersError;

      // Calculate order stats per user
      const userStats = (orders || []).reduce((acc, order) => {
        if (!acc[order.user_id]) {
          acc[order.user_id] = { order_count: 0, total_spent: 0 };
        }
        acc[order.user_id].order_count++;
        acc[order.user_id].total_spent += Number(order.total_amount);
        return acc;
      }, {} as { [key: string]: { order_count: number; total_spent: number } });

      // Combine profiles with order stats and roles
      const users: User[] = (profiles || []).map((profile) => {
        const stats = userStats[profile.id] || { order_count: 0, total_spent: 0 };
        const roles = roleMap[profile.id] || ['user'];
        const userRole = roles.includes('admin') ? 'admin' : 'user';

        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          postal_code: profile.postal_code,
          country: profile.country,
          created_at: profile.created_at,
          role: userRole,
          order_count: stats.order_count,
          total_spent: Math.round(stats.total_spent * 100) / 100,
        };
      });

      return users;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};
