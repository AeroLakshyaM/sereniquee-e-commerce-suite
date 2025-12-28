import { useState } from 'react';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Instagram, Facebook, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function SocialPostsManager() {
  const { allPosts, isLoadingAll, createPost, updatePost, deletePost } = useSocialPosts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [formData, setFormData] = useState({
    platform: 'instagram',
    image_url: '',
    post_url: '',
    caption: '',
    display_order: 0,
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPost) {
      await updatePost.mutateAsync({ id: editingPost.id, ...formData });
    } else {
      await createPost.mutateAsync(formData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      platform: post.platform,
      image_url: post.image_url,
      post_url: post.post_url || '',
      caption: post.caption || '',
      display_order: post.display_order,
      is_active: post.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePost.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      platform: 'instagram',
      image_url: '',
      post_url: '',
      caption: '',
      display_order: 0,
      is_active: true,
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Social Media Posts</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your social media feed without API tokens. Simply add post images and links manually.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? 'Edit' : 'Add'} Social Post</DialogTitle>
                <DialogDescription>
                  Add social media posts to display on your website. Upload an image and add a link to your actual post.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">
                        <div className="flex items-center gap-2">
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </div>
                      </SelectItem>
                      <SelectItem value="facebook">
                        <div className="flex items-center gap-2">
                          <Facebook className="h-4 w-4" />
                          Facebook
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL *</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload your image to a service like Imgur or use your Supabase storage URL
                  </p>
                  {formData.image_url && (
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Invalid+URL';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="post_url">Post URL (Optional)</Label>
                  <Input
                    id="post_url"
                    type="url"
                    value={formData.post_url}
                    onChange={(e) => setFormData({ ...formData, post_url: e.target.value })}
                    placeholder="https://www.instagram.com/p/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to the actual post on social media
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caption">Caption (Optional)</Label>
                  <Textarea
                    id="caption"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="Add a caption for this post..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={createPost.isPending || updatePost.isPending}>
                    {createPost.isPending || updatePost.isPending ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {isLoadingAll ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : allPosts && allPosts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allPosts.map((post) => (
                <div key={post.id} className="group relative">
                  <div className="aspect-square rounded-lg overflow-hidden border border-border/50 bg-secondary">
                    <img
                      src={post.image_url}
                      alt={post.caption || 'Social post'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2 p-2">
                    <div className="flex items-center gap-1 text-white text-xs mb-2">
                      {getPlatformIcon(post.platform)}
                      {!post.is_active && <span className="text-red-400">(Inactive)</span>}
                    </div>
                    
                    <div className="flex gap-2">
                      {post.post_url && (
                        <a
                          href={post.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4 text-black" />
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="p-2 h-auto"
                        onClick={() => handleEdit(post)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="p-2 h-auto"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {post.caption && (
                      <p className="text-white text-xs text-center line-clamp-2 px-2 mt-2">
                        {post.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No social posts yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• <strong>No API needed!</strong> Just add your post images and links manually.</p>
          <p>• <strong>How to get images:</strong> Save images from your Instagram posts or take screenshots.</p>
          <p>• <strong>Image hosting:</strong> Upload to Imgur, Cloudinary, or your Supabase storage.</p>
          <p>• <strong>Post URLs:</strong> Copy the link from your actual Instagram/Facebook posts.</p>
          <p>• <strong>Display order:</strong> Lower numbers (0, 1, 2) appear first in the feed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
