import { Instagram, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  media_type: string;
  timestamp: string;
}

// Get Instagram access token from environment variable
const INSTAGRAM_ACCESS_TOKEN = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = import.meta.env.VITE_INSTAGRAM_USER_ID;
const INSTAGRAM_USERNAME = 'sereniquee.candles.co';

export function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstagramPosts() {
      // If no access token, use placeholder images
      if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_USER_ID) {
        console.log('Instagram API not configured. Using placeholder images.');
        setPosts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch posts from Instagram Basic Display API
        const response = await fetch(
          `https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?fields=id,media_url,permalink,caption,media_type,timestamp&access_token=${INSTAGRAM_ACCESS_TOKEN}&limit=6`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch Instagram posts');
        }

        const data = await response.json();
        
        // Filter to only show images and carousels (not videos)
        const imagePosts = data.data?.filter(
          (post: InstagramPost) => post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM'
        ).slice(0, 6) || [];

        setPosts(imagePosts);
      } catch (err) {
        console.error('Error fetching Instagram posts:', err);
        setError('Unable to load Instagram posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchInstagramPosts();
  }, []);

  // Placeholder images (fallback when API is not configured)
  const placeholderPosts: InstagramPost[] = [
    {
      id: '1',
      media_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&q=80',
      permalink: `https://www.instagram.com/${INSTAGRAM_USERNAME}`,
      caption: 'Beautiful handcrafted candles',
      media_type: 'IMAGE',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      media_url: 'https://images.unsplash.com/photo-1602874801006-e25666c7b12f?w=400&q=80',
      permalink: `https://www.instagram.com/${INSTAGRAM_USERNAME}`,
      caption: 'Luxury scents for your home',
      media_type: 'IMAGE',
      timestamp: new Date().toISOString(),
    },
    {
      id: '3',
      media_url: 'https://images.unsplash.com/photo-1564053489984-317bbd824340?w=400&q=80',
      permalink: `https://www.instagram.com/${INSTAGRAM_USERNAME}`,
      caption: 'Natural soy wax candles',
      media_type: 'IMAGE',
      timestamp: new Date().toISOString(),
    },
    {
      id: '4',
      media_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&q=80',
      permalink: `https://www.instagram.com/${INSTAGRAM_USERNAME}`,
      caption: 'Aromatherapy and relaxation',
      media_type: 'IMAGE',
      timestamp: new Date().toISOString(),
    },
    {
      id: '5',
      media_url: 'https://images.unsplash.com/photo-1615887142268-4e2be2dbdcc6?w=400&q=80',
      permalink: `https://www.instagram.com/${INSTAGRAM_USERNAME}`,
      caption: 'Hand-poured with love',
      media_type: 'IMAGE',
      timestamp: new Date().toISOString(),
    },
    {
      id: '6',
      media_url: 'https://images.unsplash.com/photo-1615887142268-4e2be2dbdcc6?w=400&q=80',
      permalink: `https://www.instagram.com/${INSTAGRAM_USERNAME}`,
      caption: 'Sereniquee candle collection',
      media_type: 'IMAGE',
      timestamp: new Date().toISOString(),
    },
  ];

  const displayPosts = posts.length > 0 ? posts : placeholderPosts;
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container-luxury space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-background/80 backdrop-blur">
            <Instagram className="h-4 w-4 text-pink-600" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Follow Our Journey</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl">@sereniquee.candles.co</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Behind-the-scenes moments, candle care tips, and cozy vibes. Join our community of candle lovers.
          </p>
        </div>

        {/* Instagram Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            <span className="ml-3 text-muted-foreground">Loading Instagram posts...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">Using placeholder images instead.</p>
          </div>
        ) : null}

        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            {displayPosts.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
                title={post.caption?.slice(0, 100) || 'View on Instagram'}
              >
                <img
                  src={post.media_url}
                  alt={post.caption?.slice(0, 100) || 'Instagram post'}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <Instagram className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* API Configuration Notice */}
        {!loading && posts.length === 0 && !error && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <a
            href={`https://www.instagram.com/${INSTAGRAM_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-medium transition-all hover:scale-105 active:scale-95"
          >
            <Instagram className="h-5 w-5" />
            Follow Us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
