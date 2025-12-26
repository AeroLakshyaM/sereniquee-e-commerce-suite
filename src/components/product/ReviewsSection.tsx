import { useState } from 'react';
import { ProductReview } from '@/types';
import { useProductReviews, useReviewStats, useCreateReview, useVoteReview, useUserVote, useCanReviewProduct } from '@/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Star, ThumbsUp, ThumbsDown, Check, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Star Rating Input Component
export function StarRating({ rating, onRatingChange, size = 'md', readonly = false }: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={cn(
            "transition-colors",
            !readonly && "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              (hoverRating || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// Review Stats Component
export function ReviewStats({ productId }: { productId: string }) {
  const { data: stats, isLoading } = useReviewStats(productId);

  if (isLoading || !stats) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
          <StarRating rating={stats.averageRating} readonly size="sm" />
          <div className="text-sm text-muted-foreground mt-1">
            {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
            const percentage = stats.totalReviews > 0
              ? (count / stats.totalReviews) * 100
              : 0;

            return (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="w-8">{rating}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Review Form Component
export function ReviewForm({ productId, onSuccess }: { productId: string; onSuccess?: () => void }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();
  const createReview = useCreateReview();
  const { data: canReview } = useCanReviewProduct(productId);

  if (!canReview?.canReview) {
    if (canReview?.hasReviewed) {
      return (
        <Card className="p-6 text-center">
          <Check className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <p className="text-muted-foreground">You've already reviewed this product</p>
        </Card>
      );
    }
    if (!canReview?.hasPurchased) {
      return (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">You need to purchase this product before reviewing</p>
        </Card>
      );
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    try {
      setUploading(true);
      
      // Upload images if any
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `review-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      await createReview.mutateAsync({
        product_id: productId,
        rating,
        title,
        comment,
        images: imageUrls,
      });

      toast({ title: "Review submitted successfully! It will appear after approval." });
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setImages([]);
      onSuccess?.();
    } catch (error: any) {
      toast({ title: "Failed to submit review", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rating *</label>
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience"
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Review *</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            required
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Photos (optional)</label>
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative w-20 h-20 group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-20 h-20 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImages([...images, e.target.files[0]]);
                    }
                  }}
                />
              </label>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Maximum 5 photos</p>
        </div>

        <Button type="submit" disabled={uploading || createReview.isPending}>
          {uploading || createReview.isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Card>
  );
}

// Single Review Card Component
export function ReviewCard({ review }: { review: ProductReview }) {
  const { toast } = useToast();
  const voteReview = useVoteReview();
  const { data: userVote } = useUserVote(review.id);

  const handleVote = async (voteType: 'helpful' | 'not_helpful') => {
    try {
      await voteReview.mutateAsync({ reviewId: review.id, voteType });
      toast({ title: "Thank you for your feedback!" });
    } catch (error: any) {
      toast({ title: "Failed to vote", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={review.rating} readonly size="sm" />
            {review.is_verified_purchase && (
              <Badge variant="secondary" className="text-xs">
                <Check className="h-3 w-3 mr-1" />
                Verified Purchase
              </Badge>
            )}
          </div>

          {review.title && (
            <h4 className="font-semibold mb-2">{review.title}</h4>
          )}

          <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-3">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {review.user?.full_name || 'Anonymous'} •{' '}
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-muted-foreground">Helpful?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('helpful')}
                className={cn(userVote === 'helpful' && "text-primary")}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {review.helpful_count}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('not_helpful')}
                className={cn(userVote === 'not_helpful' && "text-destructive")}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                {review.not_helpful_count}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Review List Component
export function ReviewList({ productId }: { productId: string }) {
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const { data: reviews, isLoading } = useProductReviews(productId, { approved: true, sortBy });

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1 border rounded text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

// Complete Reviews Section Component
export function ProductReviews({ productId }: { productId: string }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-8">
      <ReviewStats productId={productId} />
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif">Reviews</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {showForm && (
        <ReviewForm productId={productId} onSuccess={() => setShowForm(false)} />
      )}

      <ReviewList productId={productId} />
    </div>
  );
}
