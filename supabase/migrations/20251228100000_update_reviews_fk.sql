-- Fix foreign key so PostgREST can join profiles directly
ALTER TABLE public.product_reviews
  DROP CONSTRAINT IF EXISTS product_reviews_user_id_fkey,
  ADD CONSTRAINT product_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.review_votes
  DROP CONSTRAINT IF EXISTS review_votes_user_id_fkey,
  ADD CONSTRAINT review_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
