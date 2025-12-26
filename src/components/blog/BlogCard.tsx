import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Blog } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  blog: Blog;
  variant?: 'featured' | 'default';
}

const formatDate = (value: string | null) => {
  if (!value) return 'Draft';
  return format(new Date(value), 'MMM d, yyyy');
};

export function BlogCard({ blog, variant = 'default' }: BlogCardProps) {
  const tags = blog.tags ?? [];
  const readingTime = blog.reading_time ?? Math.max(1, Math.round((blog.content?.split(/\s+/)?.length || 0) / 200));

  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className={cn(
        'group block rounded-3xl overflow-hidden border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-xl',
        variant === 'featured' ? 'md:col-span-2' : ''
      )}
    >
      <div className={cn('relative overflow-hidden', variant === 'featured' ? 'h-[420px]' : 'h-[260px]')}>
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/0 to-black/60"
          aria-hidden="true"
        />
        {blog.cover_image_url ? (
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 text-sm text-white/90">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(blog.published_at ?? blog.created_at)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {readingTime} min read
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-4">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs uppercase tracking-[0.2em]">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {blog.author_name || 'Sereniquee'}
          </p>
          <h3 className="font-serif text-2xl leading-tight text-foreground">
            {blog.title}
          </h3>
          <p className="text-muted-foreground line-clamp-3 text-sm sm:text-base">
            {blog.excerpt || blog.content.slice(0, 120)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          Read story
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
