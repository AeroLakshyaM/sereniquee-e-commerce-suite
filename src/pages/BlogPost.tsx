import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { BlogCard } from '@/components/blog/BlogCard';
import { useBlogBySlug, useBlogs } from '@/hooks/useBlogs';

const formatDate = (value: string | null) => {
  if (!value) return 'Unpublished';
  return format(new Date(value), 'MMMM d, yyyy');
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading } = useBlogBySlug(slug ?? '');
  const { data: moreBlogs } = useBlogs();
  const [copied, setCopied] = useState(false);

  const related = useMemo(() => {
    if (!moreBlogs || !blog) return [] as typeof moreBlogs;
    return moreBlogs.filter((item) => item.id !== blog.id).slice(0, 3);
  }, [moreBlogs, blog]);

  const paragraphs = useMemo(() => {
    if (!blog?.content) return [] as string[];
    return blog.content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  }, [blog]);

  const handleShare = async () => {
    if (!blog) return;
    const shareData = {
      title: blog.title,
      text: blog.excerpt ?? 'A new story from Sereniquee Candles',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container-luxury py-20 text-center text-muted-foreground">
        Loading story...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container-luxury py-20 text-center space-y-6">
        <p className="text-muted-foreground">We couldn't find that blog post.</p>
        <Button asChild>
          <Link to="/blogs">Back to all stories</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="container-luxury py-12 lg:py-20 space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/blogs">
            <ArrowLeft className="h-4 w-4" /> Back to all stories
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
          <Share2 className="h-4 w-4" /> {copied ? 'Link copied' : 'Share'}
        </Button>
      </div>

      <header className="space-y-6">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">The Wick Journal</p>
        <h1 className="font-serif text-3xl md:text-5xl leading-tight text-foreground">{blog.title}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">{blog.excerpt}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{blog.author_name || 'Sereniquee'}</span>
          <span aria-hidden="true">•</span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {formatDate(blog.published_at ?? blog.created_at)}
          </span>
          <span aria-hidden="true">•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {blog.reading_time ?? Math.max(1, Math.round((blog.content.split(/\s+/).length || 0) / 200))} min read
          </span>
        </div>
      </header>

      {blog.cover_image_url && (
        <div className="overflow-hidden rounded-[32px] border border-border shadow-soft">
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="h-[420px] w-full object-cover"
          />
        </div>
      )}

      <section className="prose prose-lg prose-neutral max-w-none dark:prose-invert">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </section>

      {blog.gallery_image_urls && blog.gallery_image_urls.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl">Studio snaps</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {blog.gallery_image_urls.map((url, index) => (
              <img
                key={`${url}-${index}`}
                src={url}
                alt={`Gallery image ${index + 1}`}
                className="h-64 w-full rounded-3xl object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {related && related.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">More to explore</p>
              <h2 className="font-serif text-3xl">You may also enjoy</h2>
            </div>
            <Button asChild variant="link">
              <Link to="/blogs">View all</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <BlogCard key={item.id} blog={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
