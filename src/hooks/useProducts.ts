import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchPublicCatalog } from '@/lib/publicCatalog';
import { Product } from '@/types';

const PRODUCTS_PAGE_SIZE = 12;

interface ProductsPage {
  products: Product[];
  nextPage: number;
}

interface ProductQueryOptions {
  listing?: boolean;
  enabled?: boolean;
  scentMetadata?: boolean;
}

const ADMIN_PRODUCTS_PAGE_SIZE = 25;

export function useAdminProducts(searchQuery: string, page: number) {
  return useQuery({
    queryKey: ['products', 'admin', searchQuery, page],
    queryFn: async ({ signal }): Promise<{ products: Product[]; total: number }> => {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

      const keywords = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      if (keywords.length > 0) {
        const searchFilters = keywords
          .map(keyword => {
            const term = escapeSearchTerm(keyword);
            return `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%,sku.ilike.%${term}%`;
          })
          .join(',');
        query = query.or(searchFilters);
      }

      const from = page * ADMIN_PRODUCTS_PAGE_SIZE;
      const { data, count, error } = await query.range(from, from + ADMIN_PRODUCTS_PAGE_SIZE - 1).abortSignal(signal);
      if (error) throw error;
      return { products: (data || []) as Product[], total: count || 0 };
    },
  });
}

const PRODUCT_LISTING_FIELDS = 'id,name,slug,sku,description,price,category,stock_quantity,image_url,image_urls,featured,created_at,updated_at';

function escapeSearchTerm(term: string) {
  return term.replace(/([\\(),])/g, '\\$1');
}

export function useProducts(category?: string, searchQuery?: string, options: ProductQueryOptions = {}) {
  const listingOnly = options.listing === true;
  return useInfiniteQuery({
    queryKey: ['products', category, searchQuery, listingOnly ? 'listing' : 'full', options.scentMetadata ? 'scent-metadata' : 'standard'],
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }): Promise<ProductsPage> => {
      if (listingOnly) {
        const cached = await fetchPublicCatalog<ProductsPage>(
          {
            resource: 'products',
            page: pageParam,
            category: category && category !== 'all' ? category : undefined,
            search: searchQuery?.trim() || undefined,
            scentMetadata: options.scentMetadata ? '1' : undefined,
          },
          signal,
        );
        if (cached && Array.isArray(cached.products)) {
          return cached;
        }
      }

      let query = supabase
        .from('products')
        .select(listingOnly ? `${PRODUCT_LISTING_FIELDS}${options.scentMetadata ? ',metadata' : ''}` : '*')
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
            return `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%,sku.ilike.%${term}%`;
          })
          .join(',');
        query = query.or(searchFilters);
      }

      const from = pageParam * PRODUCTS_PAGE_SIZE;
      const to = from + PRODUCTS_PAGE_SIZE - 1;
      const { data, error } = await query.range(from, to).abortSignal(signal);

      if (error) throw error;
      return {
        products: (data || []) as unknown as Product[],
        nextPage: pageParam + 1,
      };
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.products.length === PRODUCTS_PAGE_SIZE ? allPages.length : undefined,
    staleTime: listingOnly ? 2 * 60_000 : 60_000,
    enabled: options.enabled ?? true,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async ({ signal }): Promise<Product[]> => {
      const cached = await fetchPublicCatalog<{ products: Product[] }>(
        { resource: 'featured-products' },
        signal,
      );
      if (cached && Array.isArray(cached.products)) {
        return cached.products;
      }

      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_LISTING_FIELDS)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6)
        .abortSignal(signal);

      if (error) throw error;
      return (data || []) as Product[];
    },
    staleTime: 5 * 60_000,
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
      if (data) return data as Product;

      const { data: productById, error: idError } = await supabase
        .from('products')
        .select('*')
        .eq('id', slug)
        .maybeSingle();

      if (idError) throw idError;
      return productById as Product | null;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories', 'names'],
    queryFn: async ({ signal }): Promise<string[]> => {
      const cached = await fetchPublicCatalog<{ categories: Array<{ name: string }> }>(
        { resource: 'categories' },
        signal,
      );
      if (cached && Array.isArray(cached.categories)) {
        return cached.categories.map((category) => category.name).filter(Boolean);
      }

      const { data, error } = await supabase
        .from('categories' as any)
        .select('name')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .abortSignal(signal);

      if (!error && data) {
        return (data as unknown as Array<{ name: string }>).map((category) => category.name).filter(Boolean);
      }

      const { data: fallback, error: fallbackError } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null)
        .abortSignal(signal);

      if (fallbackError) throw fallbackError;
      return [...new Set((fallback || []).map((p) => p.category).filter(Boolean))] as string[];
    },
    staleTime: 5 * 60_000,
  });
}
