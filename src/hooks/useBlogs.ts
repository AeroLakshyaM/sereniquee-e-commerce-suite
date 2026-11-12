import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchPublicCatalog } from '@/lib/publicCatalog';
import { Blog } from '@/types';

const BLOG_LISTING_FIELDS = 'id,title,slug,excerpt,content,cover_image_url,author_name,is_published,tags,reading_time,published_at,created_at,updated_at';

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
    queryFn: async ({ signal }): Promise<Blog[]> => {
      if (!includeDrafts) {
        const cached = await fetchPublicCatalog<{ blogs: Blog[] }>(
          { resource: 'blogs', limit, tag },
          signal,
        );
        if (cached && Array.isArray(cached.blogs)) {
          return cached.blogs;
        }
      }

      let query = supabase
        .from('blogs')
        .select(includeDrafts ? '*' : BLOG_LISTING_FIELDS)
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

      const { data, error } = await query.abortSignal(signal);
      if (error) throw error;
      return (data ?? []) as unknown as Blog[];
    },
    staleTime: includeDrafts ? 60_000 : 5 * 60_000,
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
