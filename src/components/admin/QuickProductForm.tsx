import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Product } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuickProductFormProps {
  onClose: () => void;
  editingProduct?: Product | null;
}

export default function QuickProductForm({ onClose, editingProduct }: QuickProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeCategories } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    description: editingProduct?.description || '',
    price: editingProduct?.price.toString() || '',
    category: editingProduct?.category || '',
    stock_quantity: editingProduct?.stock_quantity.toString() || '10',
    image_url: editingProduct?.image_url || '',
    image_urls: editingProduct?.image_urls || [],
    featured: editingProduct?.featured || false,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check total number of images
    if (formData.image_urls.length + files.length > 10) {
      toast({
        title: 'Too many images',
        description: 'You can upload a maximum of 10 images per product',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: `${file.name} is larger than 5MB`,
            variant: 'destructive',
          });
          continue;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: `${file.name} is not an image file`,
            variant: 'destructive',
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          if (uploadError.message.includes('not found')) {
            toast({
              title: 'Storage not configured',
              description: 'Using image URL instead. Contact admin to set up image storage.',
              variant: 'destructive',
            });
            break;
          }
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        const newImageUrls = [...formData.image_urls, ...uploadedUrls];
        setFormData({ 
          ...formData, 
          image_urls: newImageUrls,
          image_url: newImageUrls[0] // Set first image as primary
        });
        toast({
          title: `${uploadedUrls.length} image(s) uploaded!`,
          description: 'Your product images have been uploaded successfully',
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Some images could not be uploaded',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImageUrls = formData.image_urls.filter((_, i) => i !== index);
    setFormData({ 
      ...formData, 
      image_urls: newImageUrls,
      image_url: newImageUrls[0] || '' // Update primary image
    });
  };

  const handleAddImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      const newImageUrls = [...formData.image_urls, url.trim()];
      setFormData({ 
        ...formData, 
        image_urls: newImageUrls,
        image_url: newImageUrls[0]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      category: formData.category || null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      image_url: formData.image_urls[0] || null, // First image as primary
      image_urls: formData.image_urls,
      featured: formData.featured,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: '✅ Product Updated!',
          description: `${formData.name} has been saved successfully`,
        });
      } else {
        const { error } = await supabase.from('products').insert(productData);

        if (error) throw error;

        toast({
          title: '✅ Product Added!',
          description: `${formData.name} is now available in your store`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl">
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <p className="text-purple-100 text-sm mt-1">Fill in the details below</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label className="text-lg">📸 Product Photos (up to 10)</Label>
            
            {/* Display uploaded images */}
            {formData.image_urls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/30">
              <div className="space-y-3">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer text-primary hover:underline font-medium"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 inline mr-2" />
                        Click to upload multiple images
                      </>
                    )}
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading || formData.image_urls.length >= 10}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG up to 5MB each • Max 10 images
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">or</div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddImageUrl}
                  disabled={formData.image_urls.length >= 10}
                >
                  Add Image URL
                </Button>
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg">
              🏷️ Product Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Lavender Dreams Candle"
              required
              className="text-lg"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-lg">
              📝 Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your candle... What makes it special?"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Mention the scent, burn time, and what makes it unique!
            </p>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-lg">
                💰 Price * (₹)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="29.99"
                required
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_quantity" className="text-lg">
                📦 Stock Quantity
              </Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="text-lg"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-lg">
              🏪 Category
            </Label>
            <Select
              value={formData.category || ''}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="text-lg">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {activeCategories?.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              💡 Manage categories in the Categories tab
            </p>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div>
              <Label htmlFor="featured" className="text-lg cursor-pointer">
                ⭐ Featured Product
              </Label>
              <p className="text-sm text-muted-foreground">
                Show on homepage as bestseller
              </p>
            </div>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span>{editingProduct ? '💾 Save Changes' : '✨ Add Product'}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
