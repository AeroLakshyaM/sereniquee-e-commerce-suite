import { useMemo, useState } from 'react';
import { Check, Star, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductReview } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

type ReviewFilter = 'all' | 'pending' | 'approved' | 'rejected';
type AdminReview = ProductReview & { productName: string; reviewerName: string };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={`h-4 w-4 ${index < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
      ))}
    </span>
  );
}

export default function ReviewsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async (): Promise<AdminReview[]> => {
      const { data, error } = await supabase.from('product_reviews').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const productIds = [...new Set((data ?? []).map(review => review.product_id))];
      const { data: products, error: productsError } = productIds.length
        ? await supabase.from('products').select('id, name').in('id', productIds)
        : { data: [], error: null };
      if (productsError) throw productsError;
      const userIds = [...new Set((data ?? []).map(review => review.user_id))];
      const { data: profiles, error: profilesError } = userIds.length
        ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
        : { data: [], error: null };
      if (profilesError) throw profilesError;
      const productMap = new Map((products ?? []).map(product => [product.id, product.name]));
      const profileMap = new Map((profiles ?? []).map(profile => [profile.id, profile]));
      return (data ?? []).map(review => ({
        ...review,
        images: Array.isArray(review.images) ? review.images as string[] : [],
        productName: productMap.get(review.product_id) ?? 'Unknown product',
        reviewerName: profileMap.get(review.user_id)?.full_name || profileMap.get(review.user_id)?.email || 'Anonymous',
      })) as AdminReview[];
    },
  });

  const visibleReviews = useMemo(() => reviews.filter(review =>
    filter === 'all' ||
    (filter === 'pending' && !review.is_approved) ||
    (filter === 'approved' && review.is_approved) ||
    (filter === 'rejected' && !review.is_approved),
  ), [filter, reviews]);

  const updateApproval = async (ids: string[], approved: boolean) => {
    const { error } = await supabase.from('product_reviews').update({ is_approved: approved }).in('id', ids);
    if (error) {
      toast({ title: 'Review update failed', description: error.message, variant: 'destructive' });
      return;
    }
    setSelectedIds([]);
    await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
    queryClient.invalidateQueries({ queryKey: ['review-stats'] });
    toast({ title: approved ? 'Reviews approved' : 'Reviews rejected' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Product Reviews</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filter} onValueChange={(value: ReviewFilter) => setFilter(value)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          {selectedIds.length > 0 && (
            <Button onClick={() => void updateApproval(selectedIds, true)}>
              <Check className="mr-2 h-4 w-4" /> Approve All Selected
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <p className="text-muted-foreground">Loading reviews...</p> : visibleReviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews match this filter.</p>
        ) : visibleReviews.map(review => (
          <div key={review.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Checkbox checked={selectedIds.includes(review.id)} onCheckedChange={checked => setSelectedIds(current => checked ? [...current, review.id] : current.filter(id => id !== review.id))} aria-label={`Select review by ${review.reviewerName}`} />
                <div>
                  <p className="font-medium">{review.productName}</p>
                  <p className="text-sm text-muted-foreground">{review.reviewerName} · {review.created_at ? new Date(review.created_at).toLocaleString() : 'Unknown date'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Stars rating={review.rating} />
                {review.is_approved ? (
                  <Button size="sm" variant="outline" onClick={() => void updateApproval([review.id], false)}><X className="mr-1 h-4 w-4" /> Reject</Button>
                ) : (
                  <Button size="sm" onClick={() => void updateApproval([review.id], true)}><Check className="mr-1 h-4 w-4" /> Approve</Button>
                )}
              </div>
            </div>
            {review.comment && <p className="mt-3 whitespace-pre-wrap text-sm">{review.comment}</p>}
            {review.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {review.images.map(image => <img key={image} src={image} alt="Review attachment" className="h-20 w-20 rounded object-cover" loading="lazy" />)}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
