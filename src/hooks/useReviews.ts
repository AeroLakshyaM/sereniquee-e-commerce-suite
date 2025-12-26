import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductReview, ReviewVote, ReviewStats } from '@/types';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// FETCH REVIEWS FOR PRODUCT
// ============================================

export function useProductReviews(productId: string, filters?: {
  approved?: boolean;
  sortBy?: 'recent' | 'rating' | 'helpful';
}) {
  const query = useQuery({
    queryKey: ['product-reviews', productId, filters],
    queryFn: async () => {
      let query = supabase
        .from('product_reviews')
        .select(`
          *,
          user:profiles!user_id (
            full_name,
            email
          )
        `)
        .eq('product_id', productId);

      // Apply filters
      if (filters?.approved !== undefined) {
        query = query.eq('is_approved', filters.approved);
      }

      // Apply sorting
      if (filters?.sortBy === 'rating') {
        query = query.order('rating', { ascending: false });
      } else if (filters?.sortBy === 'helpful') {
        query = query.order('helpful_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ProductReview[];
    },
    enabled: !!productId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!productId) return;

    const channel = supabase
      .channel(`product-reviews-${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_reviews',
          filter: `product_id=eq.${productId}`,
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, query]);

  return query;
}

// ============================================
// GET REVIEW STATS
// ============================================

export function useReviewStats(productId: string) {
  return useQuery({
    queryKey: ['review-stats', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('is_approved', true);

      if (error) throw error;

      const reviews = data || [];
      const totalReviews = reviews.length;
      
      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        } as ReviewStats;
      }

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let sum = 0;

      reviews.forEach((review) => {
        distribution[review.rating as keyof typeof distribution]++;
        sum += review.rating;
      });

      return {
        averageRating: Number((sum / totalReviews).toFixed(1)),
        totalReviews,
        ratingDistribution: distribution,
      } as ReviewStats;
    },
    enabled: !!productId,
  });
}

// ============================================
// CREATE REVIEW
// ============================================

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (review: {
      product_id: string;
      rating: number;
      title: string;
      comment: string;
      images?: string[];
      order_id?: string;
    }) => {
      if (!user) throw new Error('User must be logged in to review');

      const { data, error } = await supabase
        .from('product_reviews')
        .insert([{
          ...review,
          user_id: user.id,
          images: review.images || [],
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ============================================
// UPDATE REVIEW
// ============================================

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductReview> & { id: string }) => {
      const { data, error } = await supabase
        .from('product_reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', data.product_id] });
    },
  });
}

// ============================================
// DELETE REVIEW
// ============================================

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
    },
  });
}

// ============================================
// VOTE ON REVIEW
// ============================================

export function useVoteReview() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ reviewId, voteType }: { reviewId: string; voteType: 'helpful' | 'not_helpful' }) => {
      if (!user) throw new Error('User must be logged in to vote');

      // Upsert vote
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('review_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('review_votes')
          .insert([{
            review_id: reviewId,
            user_id: user.id,
            vote_type: voteType,
          }]);

        if (error) throw error;
      }

      // Update review counts
      const { data: votes } = await supabase
        .from('review_votes')
        .select('vote_type')
        .eq('review_id', reviewId);

      const helpfulCount = votes?.filter(v => v.vote_type === 'helpful').length || 0;
      const notHelpfulCount = votes?.filter(v => v.vote_type === 'not_helpful').length || 0;

      await supabase
        .from('product_reviews')
        .update({
          helpful_count: helpfulCount,
          not_helpful_count: notHelpfulCount,
        })
        .eq('id', reviewId);

      return { reviewId, voteType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
    },
  });
}

// ============================================
// CHECK IF USER VOTED
// ============================================

export function useUserVote(reviewId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-vote', reviewId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('review_votes')
        .select('vote_type')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No vote found
        throw error;
      }
      return data?.vote_type || null;
    },
    enabled: !!user && !!reviewId,
  });
}

// ============================================
// GET ALL REVIEWS (Admin)
// ============================================

export function useAllReviews() {
  return useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          product:products!product_id (name, slug),
          user:profiles!user_id (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// ============================================
// CHECK IF USER CAN REVIEW PRODUCT
// ============================================

export function useCanReviewProduct(productId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['can-review', productId, user?.id],
    queryFn: async () => {
      if (!user) return { canReview: false, hasPurchased: false, hasReviewed: false };

      // Check if user has purchased the product
      const { data: orders } = await supabase
        .from('order_items')
        .select(`
          order_id,
          orders!inner (
            user_id,
            status
          )
        `)
        .eq('product_id', productId)
        .eq('orders.user_id', user.id)
        .eq('orders.status', 'delivered');

      const hasPurchased = (orders?.length || 0) > 0;

      // Check if user has already reviewed
      const { data: existingReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      const hasReviewed = !!existingReview;

      return {
        canReview: hasPurchased && !hasReviewed,
        hasPurchased,
        hasReviewed,
      };
    },
    enabled: !!user && !!productId,
  });
}
