import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  last_sign_in_at?: string | null;
  role: string;
  order_count: number;
  total_spent: number;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      // Fetch all users safely from auth.users via RPC
      const { data: adminUsers, error: usersError } = await supabase.rpc('get_admin_users');

      if (usersError) throw usersError;

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
        if (!order.user_id) return acc;
        if (!acc[order.user_id]) {
          acc[order.user_id] = { order_count: 0, total_spent: 0 };
        }
        acc[order.user_id].order_count++;
        acc[order.user_id].total_spent += Number(order.total_amount);
        return acc;
      }, {} as { [key: string]: { order_count: number; total_spent: number } });

      // Combine auth users with order stats and roles
      const users: User[] = (adminUsers || []).map((adminUser: any) => {
        const stats = userStats[adminUser.id] || { order_count: 0, total_spent: 0 };
        const roles = roleMap[adminUser.id] || ['user'];
        const userRole = roles.includes('admin') ? 'admin' : 'user';

        return {
          id: adminUser.id,
          email: adminUser.email || '',
          full_name: adminUser.full_name,
          phone: adminUser.phone,
          address: adminUser.address,
          city: adminUser.city,
          postal_code: adminUser.postal_code,
          country: adminUser.country,
          created_at: adminUser.created_at,
          last_sign_in_at: adminUser.last_sign_in_at,
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

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('delete_user_by_admin', {
        target_user_id: userId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
