import { Instagram, ExternalLink, Heart } from 'lucide-react';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { Button } from '@/components/ui/button';

const INSTAGRAM_USERNAME = 'sereniquee.candles.co';
const INSTAGRAM_URL = 'https://www.instagram.com/sereniquee.candles.co';

export function InstagramFeed() {
  const { posts, isLoading } = useSocialPosts();

  // Show only Instagram posts, limit to 6
  const instagramPosts = posts?.filter(post => post.platform === 'instagram').slice(0, 6) || [];

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container-luxury">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600 dark:text-pink-400" />
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Follow Our Journey
            </p>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl mb-3 sm:mb-4 px-4">
            @{INSTAGRAM_USERNAME}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground px-4 mb-6">
            Join our community for daily inspiration, behind-the-scenes moments, and exclusive peeks at new collections.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button
              variant="outline"
              className="border-pink-500/50 hover:border-pink-500 hover:bg-pink-500 hover:text-white transition-all group"
            >
              <Instagram className="h-4 w-4 mr-2" />
              Follow on Instagram
              <ExternalLink className="h-3 w-3 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </a>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : instagramPosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {instagramPosts.map((post) => (
              <a
                key={post.id}
                href={post.post_url || INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg bg-secondary border border-border/50 hover:border-pink-500/50 transition-all duration-300"
              >
                <img
                  src={post.image_url}
                  alt={post.caption || 'Sereniquee Instagram post'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    {post.caption && (
                      <p className="text-white text-xs sm:text-sm line-clamp-2 mb-2">
                        {post.caption}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-white/80">
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                      <Instagram className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-secondary/50 rounded-xl border-2 border-dashed border-border/50">
            <Instagram className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              No posts yet. Add social media posts from the admin dashboard to showcase your Instagram feed.
            </p>
            <a href="/admin">
              <Button variant="outline">Go to Admin Dashboard</Button>
            </a>
          </div>
        )}

        {instagramPosts.length > 0 && (
          <div className="mt-8 sm:mt-12 text-center">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
              >
                <Instagram className="h-5 w-5 mr-2" />
                View More on Instagram
              </Button>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
