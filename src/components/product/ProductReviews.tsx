import { useState } from 'react';
import { useProductReviews, useReviewStats, useCreateReview, useVoteReview } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Star, User, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: reviews, isLoading: reviewsLoading } = useProductReviews(productId, { approved: true });
  const { data: stats, isLoading: statsLoading } = useReviewStats(productId);
  const { mutate: createReview, isPending: isSubmitting } = useCreateReview();
  const { mutate: voteReview } = useVoteReview();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    createReview(
      { product_id: productId, rating, title, comment },
      {
        onSuccess: () => {
          toast({
            title: "Review submitted",
            description: "Thank you for your feedback! Your review is now live.",
          });
          setIsWriting(false);
          setTitle('');
          setComment('');
          setRating(5);
        },
        onError: (error) => {
          toast({
            title: "Error submitting review",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleVote = (reviewId: string, voteType: 'helpful' | 'not_helpful') => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to vote.",
        variant: "default",
      });
      return;
    }
    voteReview({ reviewId, voteType });
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'fill-primary text-primary'
                  : 'fill-muted text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (reviewsLoading || statsLoading) {
    return <div className="animate-pulse h-64 bg-muted/50 rounded-lg"></div>;
  }

  const reviewList = reviews || [];
  const totalReviews = stats?.totalReviews || 0;
  const averageRating = stats?.averageRating || 0;

  return (
    <div className="space-y-12">
      {/* Stats Section */}
      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-4">
          <h3 className="font-serif text-2xl">Customer Reviews</h3>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-serif">{averageRating.toFixed(1)}</span>
            <div className="space-y-1">
              {renderStars(Math.round(averageRating))}
              <p className="text-sm text-muted-foreground">Based on {totalReviews} reviews</p>
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats?.ratingDistribution?.[star as keyof typeof stats.ratingDistribution] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 text-sm text-muted-foreground">
                    <span>{star}</span>
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-8 md:pl-12 md:border-l border-border flex flex-col justify-center">
          <h4 className="text-lg font-medium mb-2">Share your thoughts</h4>
          <p className="text-muted-foreground mb-6">
            Have you purchased this product? Let other customers know what you think.
          </p>
          {user ? (
            <Button 
              onClick={() => setIsWriting(!isWriting)} 
              variant="outline" 
              className="w-full md:w-auto self-start"
            >
              {isWriting ? 'Cancel' : 'Write a Review'}
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full md:w-auto self-start">
              <Link to="/auth">Log in to Write a Review</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Write Review Form */}
      {isWriting && user && (
        <form onSubmit={handleSubmit} className="bg-muted/30 p-6 rounded-lg space-y-6 animate-in fade-in slide-in-from-top-4">
          <h4 className="font-serif text-xl border-b border-border pb-4">Write a Review</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Overall Rating</label>
              {renderStars(rating, true)}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">Review Title (Optional)</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your review"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium mb-2">Review</label>
              <Textarea
                id="comment"
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike? What should other shoppers know?"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-8 divide-y divide-border pt-8 mt-8">
        {reviewList.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviewList.map((review) => (
            <div key={review.id} className="pt-8 first:pt-0">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {review.user?.full_name || 'Anonymous User'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(review.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                {review.is_verified_purchase && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Verified Purchase
                  </span>
                )}
              </div>
              
              <div className="mt-4">
                {review.title && <h5 className="font-medium mb-2">{review.title}</h5>}
                {review.comment && <p className="text-muted-foreground leading-relaxed text-sm">{review.comment}</p>}
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-medium">Was this helpful?</span>
                <button 
                  onClick={() => handleVote(review.id, 'helpful')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{review.helpful_count || 0}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
