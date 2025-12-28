import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SocialPost } from '@/types';
import { useToast } from './use-toast';

export function useSocialPosts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all social posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['social-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts' as any)
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as unknown as SocialPost[];
    },
  });

  // Fetch all posts (including inactive) for admin
  const { data: allPosts, isLoading: isLoadingAll } = useQuery({
    queryKey: ['social-posts', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts' as any)
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as unknown as SocialPost[];
    },
  });

  // Create post
  const createPost = useMutation({
    mutationFn: async (postData: Partial<SocialPost>) => {
      const { data, error } = await supabase
        .from('social_posts' as any)
        .insert(postData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast({
        title: 'Success',
        description: 'Social post created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create social post',
        variant: 'destructive',
      });
    },
  });

  // Update post
  const updatePost = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialPost> & { id: string }) => {
      const { data, error } = await supabase
        .from('social_posts' as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast({
        title: 'Success',
        description: 'Social post updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update social post',
        variant: 'destructive',
      });
    },
  });

  // Delete post
  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_posts' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast({
        title: 'Success',
        description: 'Social post deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete social post',
        variant: 'destructive',
      });
    },
  });

  return {
    posts,
    allPosts,
    isLoading,
    isLoadingAll,
    createPost,
    updatePost,
    deletePost,
  };
}
