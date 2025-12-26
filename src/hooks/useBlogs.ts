import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Blog } from '@/types';

interface UseBlogsOptions {
  includeDrafts?: boolean;
  limit?: number;
  tag?: string;
}

interface UseBlogBySlugOptions {
  includeDrafts?: boolean;
}

export function useBlogs(options: UseBlogsOptions = {}) {
  const { includeDrafts = false, limit, tag } = options;

  return useQuery({
    queryKey: ['blogs', includeDrafts ? 'all' : 'published', limit, tag],
    queryFn: async (): Promise<Blog[]> => {
      let query = supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeDrafts) {
        query = query.eq('is_published', true);
      }

      if (tag) {
        query = query.contains('tags', [tag]);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Blog[];
    },
  });
}

export function useBlogBySlug(slug: string, options: UseBlogBySlugOptions = {}) {
  const { includeDrafts = false } = options;

  return useQuery({
    queryKey: ['blogs', 'slug', slug, includeDrafts],
    queryFn: async (): Promise<Blog | null> => {
      let query = supabase.from('blogs').select('*').eq('slug', slug);

      if (!includeDrafts) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return (data as Blog) ?? null;
    },
    enabled: Boolean(slug),
  });
}

export function useBlog(id: string) {
  return useQuery({
    queryKey: ['blogs', 'id', id],
    queryFn: async (): Promise<Blog | null> => {
      const { data, error } = await supabase.from('blogs').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return (data as Blog) ?? null;
    },
    enabled: Boolean(id),
  });
}
