import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ADMIN_USERS_PAGE_SIZE = 24;

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

export interface UseUsersOptions {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface UsersPageResult {
  users: User[];
  total: number;
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const search = options.search ?? '';
  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? ADMIN_USERS_PAGE_SIZE;

  return useQuery({
    queryKey: ['users', { search, page, pageSize }],
    queryFn: async ({ signal }): Promise<UsersPageResult> => {
      const { data, error } = await supabase
        .rpc('get_admin_users_paginated', {
          p_search: search,
          p_page: page,
          p_page_size: pageSize,
        })
        .abortSignal(signal);

      if (error) throw error;

      const rows = data || [];
      const total = rows.length > 0 ? Number(rows[0].total_count ?? rows.length) : 0;

      const users: User[] = rows.map((row) => ({
        id: row.id,
        email: row.email || '',
        full_name: row.full_name,
        phone: row.phone,
        address: row.address,
        city: row.city,
        postal_code: row.postal_code,
        country: row.country,
        created_at: row.created_at || '',
        last_sign_in_at: row.last_sign_in_at,
        role: row.role || 'user',
        order_count: Number(row.order_count ?? 0),
        total_spent: Number(row.total_spent ?? 0),
      }));

      return { users, total };
    },
    staleTime: 60_000,
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
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
