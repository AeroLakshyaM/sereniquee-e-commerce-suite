import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2, Sparkles, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBlogs } from '@/hooks/useBlogs';
import { Blog } from '@/types';
import { slugify } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateBlogContent } from '@/lib/geminiAI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const BLOG_BUCKET = 'blog-images';

interface BlogFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  galleryImageUrls: string[];
  authorName: string;
  tagsInput: string;
  isPublished: boolean;
}

const initialFormState: BlogFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  galleryImageUrls: [''],
  authorName: '',
  tagsInput: '',
  isPublished: true,
};

const wordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
const calculateReadingTime = (value: string) => {
  const minutes = Math.max(1, Math.round(wordCount(value) / 200));
  return minutes;
};

async function uploadImage(file: File, folder: 'covers' | 'gallery' = 'covers') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from(BLOG_BUCKET)
    .upload(filePath, file, {
      upsert: false,
      cacheControl: '3600',
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(BLOG_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export function BlogManager() {
  const { data: blogs, isLoading } = useBlogs({ includeDrafts: true });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState<BlogFormState>(initialFormState);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isSlugDirty, setIsSlugDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  
  // AI Generation states
  const [aiTopic, setAiTopic] = useState('');
  const [aiNotes, setAiNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTitleChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      title: value,
      slug: isSlugDirty ? prev.slug : slugify(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setIsSlugDirty(true);
    setFormState((prev) => ({
      ...prev,
      slug: slugify(value),
    }));
  };

  const handleGalleryChange = (index: number, value: string) => {
    setFormState((prev) => {
      const next = [...prev.galleryImageUrls];
      next[index] = value;
      return { ...prev, galleryImageUrls: next };
    });
  };

  const addGallerySlot = () => {
    setFormState((prev) => ({
      ...prev,
      galleryImageUrls: [...prev.galleryImageUrls, ''],
    }));
  };

  const removeGallerySlot = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      galleryImageUrls: prev.galleryImageUrls.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormState(initialFormState);
    setEditingBlog(null);
    setIsSlugDirty(false);
    setUploadingField(null);
  };

  const startEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setIsSlugDirty(true);
    setFormState({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt ?? '',
      content: blog.content,
      coverImageUrl: blog.cover_image_url ?? '',
      galleryImageUrls: blog.gallery_image_urls && blog.gallery_image_urls.length > 0 ? blog.gallery_image_urls : [''],
      authorName: blog.author_name ?? '',
      tagsInput: blog.tags ? blog.tags.join(', ') : '',
      isPublished: Boolean(blog.is_published),
    });
  };

  const preparedPayload = () => {
    const trimmedGallery = formState.galleryImageUrls
      .map((url) => url.trim())
      .filter(Boolean);
    const trimmedTags = formState.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!formState.title.trim()) {
      throw new Error('Please add a title for the blog post.');
    }

    if (!formState.content.trim()) {
      throw new Error('Content cannot be empty.');
    }

    return {
      title: formState.title.trim(),
      slug: formState.slug.trim() || slugify(formState.title),
      excerpt: formState.excerpt.trim() || null,
      content: formState.content.trim(),
      cover_image_url: formState.coverImageUrl.trim() || null,
      gallery_image_urls: trimmedGallery.length ? trimmedGallery : null,
      author_name: formState.authorName.trim() || null,
      is_published: formState.isPublished,
      tags: trimmedTags.length ? trimmedTags : null,
      reading_time: calculateReadingTime(formState.content),
      published_at: formState.isPublished
        ? editingBlog?.published_at ?? new Date().toISOString()
        : null,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = preparedPayload();

      if (editingBlog) {
        const { error } = await supabase
          .from('blogs')
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBlog.id);

        if (error) throw error;
        toast({ title: 'Blog updated', description: 'Your changes have been saved.' });
      } else {
        const { error } = await supabase
          .from('blogs')
          .insert([{ ...payload }]);

        if (error) throw error;
        toast({ title: 'Blog published', description: 'Your story is now live.' });
      }

      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Unable to save blog',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (blog: Blog) => {
    if (!confirm(`Delete “${blog.title}”? This cannot be undone.`)) return;

    const { error } = await supabase.from('blogs').delete().eq('id', blog.id);

    if (error) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Blog removed', description: 'The post has been deleted.' });
    queryClient.invalidateQueries({ queryKey: ['blogs'] });

    if (editingBlog?.id === blog.id) {
      resetForm();
    }
  };

  const handleCoverUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadingField('cover');

    try {
      const url = await uploadImage(file, 'covers');
      setFormState((prev) => ({ ...prev, coverImageUrl: url }));
      toast({ title: 'Cover uploaded', description: 'Your image is ready.' });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Please try another image.',
        variant: 'destructive',
      });
    } finally {
      setUploadingField(null);
    }
  };

  const handleGalleryUpload = async (index: number, file: File | undefined) => {
    if (!file) return;
    setUploadingField(`gallery-${index}`);

    try {
      const url = await uploadImage(file, 'gallery');
      handleGalleryChange(index, url);
      toast({ title: 'Image uploaded', description: 'Gallery image saved.' });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Please try another image.',
        variant: 'destructive',
      });
    } finally {
      setUploadingField(null);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      toast({
        title: 'Topic required',
        description: 'Please enter a topic or idea for your blog post.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const generated = await generateBlogContent({
        topic: aiTopic,
        additionalNotes: aiNotes,
      });

      setFormState((prev) => ({
        ...prev,
        title: generated.title,
        slug: slugify(generated.title),
        content: generated.content,
        excerpt: generated.excerpt,
        tagsInput: generated.tags.join(', '),
      }));

      setIsSlugDirty(false);

      toast({
        title: '✨ Content generated!',
        description: 'Your blog post is ready. Review and edit as needed, then add images and publish.',
      });

      // Clear AI fields after successful generation
      setAiTopic('');
      setAiNotes('');
    } catch (error: any) {
      toast({
        title: 'Generation failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Content Generator */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Blog Generator ✨</CardTitle>
          </div>
          <CardDescription>
            Simply tell us what you want to write about, and AI will create a complete, SEO-optimized blog post for you. You can then add your images and publish!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-topic">What do you want to write about? *</Label>
              <Input
                id="ai-topic"
                placeholder="E.g. How to care for scented candles, Benefits of lavender candles, My candle making journey"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                💡 Tip: Be specific! Instead of "candles", try "5 ways to make your home smell amazing with candles"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-notes">Additional notes (optional)</Label>
              <Textarea
                id="ai-notes"
                placeholder="Any specific points you want to include? Personal stories? Special tips?"
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                rows={3}
                disabled={isGenerating}
              />
            </div>

            <Button
              onClick={handleAIGenerate}
              disabled={isGenerating || !aiTopic.trim()}
              className="w-full md:w-auto"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating magical content...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Blog Post with AI
                </>
              )}
            </Button>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
              <p className="font-semibold text-amber-900 dark:text-amber-100 mb-2">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-amber-800 dark:text-amber-200">
                <li>Enter your topic or idea above</li>
                <li>Click "Generate" and wait 10-15 seconds</li>
                <li>AI will fill the form below with title, content, excerpt, and SEO tags</li>
                <li>Review and edit the content as you like</li>
                <li>Upload your cover image and gallery images</li>
                <li>Click "Publish Blog" to make it live!</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editingBlog ? 'Edit Blog Post' : 'Write a New Blog Post'}</CardTitle>
          <CardDescription>
            Share candle care tips, scent stories, behind-the-scenes notes, and more. Upload a cover image or paste links straight from Supabase Storage or any CDN.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="E.g. How We Hand-Pour Every Candle"
                  value={formState.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="how-we-hand-pour-every-candle"
                  value={formState.slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Sereniquee Mama"
                  value={formState.authorName}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, authorName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="care tips, fragrances"
                  value={formState.tagsInput}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, tagsInput: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Short Summary</Label>
              <Textarea
                id="excerpt"
                placeholder="A two sentence teaser that appears on the blog card."
                value={formState.excerpt}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, excerpt: event.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Story Content</Label>
              <Textarea
                id="content"
                placeholder="Write out the full story. Use paragraphs separated by blank lines."
                value={formState.content}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, content: event.target.value }))
                }
                rows={10}
              />
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{wordCount(formState.content)} words</span>
                <span aria-hidden="true">•</span>
                <span>≈ {calculateReadingTime(formState.content)} min read</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Cover Image</Label>
                <Input
                  placeholder="https://..."
                  value={formState.coverImageUrl}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, coverImageUrl: event.target.value }))
                  }
                />
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleCoverUpload(event.target.files?.[0])}
                  />
                  {uploadingField === 'cover' && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {formState.coverImageUrl && (
                  <img
                    src={formState.coverImageUrl}
                    alt="Cover preview"
                    className="rounded-md border object-cover h-40 w-full"
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Gallery Images</Label>
                  <Button variant="ghost" type="button" size="sm" onClick={addGallerySlot}>
                    <Plus className="h-4 w-4 mr-2" /> Add image
                  </Button>
                </div>
                <div className="space-y-3">
                  {formState.galleryImageUrls.map((url, index) => (
                    <div key={index} className="space-y-2 border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Image {index + 1}</span>
                        {formState.galleryImageUrls.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGallerySlot(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="https://..."
                        value={url}
                        onChange={(event) => handleGalleryChange(index, event.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleGalleryUpload(index, event.target.files?.[0])}
                        />
                        {uploadingField === `gallery-${index}` && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                      {url && (
                        <img src={url} alt={`Gallery ${index + 1}`} className="rounded-md border object-cover h-32 w-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border rounded-md p-4">
              <div>
                <p className="font-medium">Publish immediately</p>
                <p className="text-sm text-muted-foreground">
                  Turn this off to keep the post in drafts until you are ready.
                </p>
              </div>
              <Switch
                checked={formState.isPublished}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({ ...prev, isPublished: checked }))
                }
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingBlog ? 'Save Changes' : 'Publish Blog'}
              </Button>
              {editingBlog && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel editing
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
          <CardDescription>
            Manage drafts and published stories. Tap “Edit” to update, or “Delete” to remove a post entirely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading blog posts...</div>
          ) : !blogs || blogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No stories yet. Start by writing your first post above.</div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="border rounded-md p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{blog.title}</h3>
                      <Badge variant={blog.is_published ? 'default' : 'secondary'}>
                        {blog.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {blog.excerpt || 'No summary yet.'}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Slug: {blog.slug}</span>
                      {blog.tags && blog.tags.length > 0 && (
                        <span>Tags: {blog.tags.join(', ')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => startEdit(blog)}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(blog)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How image uploads work</CardTitle>
          <CardDescription>
            Images are stored inside the “{BLOG_BUCKET}” Supabase Storage bucket. Make sure the bucket is public or has a policy that allows authenticated uploads and public reads.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            1. Choose an image from your computer and we will upload it to Supabase Storage automatically.
          </p>
          <p>
            2. If you already have a hosted image, simply paste its URL into the field and skip the upload step.
          </p>
          <p>
            3. Cover images look best at 1600×900px. Gallery images can be any aspect ratio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
