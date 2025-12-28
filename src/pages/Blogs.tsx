import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { useBlogs } from '@/hooks/useBlogs';
import { BlogCard } from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { SeoHelmet } from '@/components/layout/SeoHelmet';

export default function Blogs() {
  const { data: blogs, isLoading } = useBlogs();
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const tags = useMemo(() => {
    if (!blogs) return [] as string[];
    const set = new Set<string>();
    blogs.forEach((blog) => {
      blog.tags?.forEach((tag) => set.add(tag));
    });
    return Array.from(set);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    if (!blogs) return [] as typeof blogs;
    if (selectedTag === 'all') return blogs;
    return blogs.filter((blog) => blog.tags?.includes(selectedTag));
  }, [blogs, selectedTag]);

  const featured = filteredBlogs?.[0];
  const others = featured ? filteredBlogs.slice(1) : filteredBlogs;

  return (
    <div className="container-luxury py-12 lg:py-20">
      <SeoHelmet
        title="The Wick Journal - Candle Stories & Slow Living - Sereniquee"
        description="Read our handwritten journal featuring candle making insights, scent rituals, aromatherapy tips, and stories from the Sereniquee atelier. Discover the art of slow living and intentional moments."
        keywords="candle blog, scent rituals, slow living, aromatherapy tips, candle making insights, home fragrance blog, wellness blog"
        url="/blogs"
      />
      <section className="relative overflow-hidden rounded-[32px] border border-border bg-gradient-to-br from-amber-50 via-white to-rose-50 px-6 py-12 md:px-12 md:py-16">
        <div className="relative z-10 max-w-3xl space-y-6">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-muted-foreground">
            <Sparkles className="h-4 w-4" /> The Wick Journal
          </p>
          <h1 className="font-serif text-3xl md:text-5xl leading-tight text-foreground">
            Stories from the atelier, scent rituals, and slow living notes.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Handwritten by Mom, the Sereniquee journal captures the inspirations, behind-the-scenes glimpses, and thoughtful rituals that make every candle a keepsake.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>New essays every month</span>
            <span aria-hidden="true">•</span>
            <span>Photo diaries & care guides</span>
            <span aria-hidden="true">•</span>
            <span>Honest reflections</span>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_65%)] opacity-40" />
          <div className="absolute bottom-8 right-8 h-40 w-40 rounded-full bg-white/70 blur-3xl" />
        </div>
      </section>

      <section className="mt-12 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Filter by theme
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag('all')}
            >
              All
            </Button>
            {tags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Loading stories...
          </div>
        ) : !filteredBlogs || filteredBlogs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No blog posts yet. Once you publish a story from the admin dashboard, it will appear here.
          </div>
        ) : (
          <div className="space-y-12">
            {featured && (
              <div className="grid gap-6 md:grid-cols-2">
                <BlogCard blog={featured} variant="featured" />
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Editor's note</p>
                  <h2 className="font-serif text-3xl leading-tight">{featured.title}</h2>
                  <p className="text-muted-foreground">
                    {featured.excerpt || featured.content.slice(0, 200)}
                  </p>
                  <Button asChild variant="outline" className="w-fit">
                    <Link to={`/blogs/${featured.slug}`}>Continue reading</Link>
                  </Button>
                </div>
              </div>
            )}

            {others && others.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {others.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
