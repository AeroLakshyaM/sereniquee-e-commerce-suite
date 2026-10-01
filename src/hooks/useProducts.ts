import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

const PRODUCTS_PAGE_SIZE = 12;

interface ProductsPage {
  products: Product[];
  nextPage: number;
}

function escapeSearchTerm(term: string) {
  return term.replace(/([\\(),])/g, '\\$1');
}

export function useProducts(category?: string, searchQuery?: string) {
  return useInfiniteQuery({
    queryKey: ['products', category, searchQuery],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ProductsPage> => {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const keywords = searchQuery?.toLowerCase().trim().split(/\s+/).filter(Boolean) || [];
      if (keywords.length > 0) {
        const searchFilters = keywords
          .map((keyword) => {
            const term = escapeSearchTerm(keyword);
            return `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`;
          })
          .join(',');
        query = query.or(searchFilters);
      }

      const from = pageParam * PRODUCTS_PAGE_SIZE;
      const to = from + PRODUCTS_PAGE_SIZE - 1;
      const { data, error } = await query.range(from, to);

      if (error) throw error;
      return {
        products: (data || []) as Product[],
        nextPage: pageParam + 1,
      };
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.products.length === PRODUCTS_PAGE_SIZE ? allPages.length : undefined,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);
      
      if (error) throw error;
      
      const categories = [...new Set(data.map(p => p.category).filter(Boolean))] as string[];
      return categories;
    },
  });
}
