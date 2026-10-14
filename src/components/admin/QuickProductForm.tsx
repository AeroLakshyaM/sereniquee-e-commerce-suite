import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X, Image as ImageIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { Product } from '@/types';
import type { ProductVariant } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useProductVariants } from '@/hooks/useVariants';
import { ProductDescription } from '@/components/product/ProductDescription';
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

type VariantDraft = {
  id?: string;
  name: string;
  sku: string;
  size: string;
  scent: string;
  color: string;
  price: string;
  stock_quantity: string;
};

export default function QuickProductForm({ onClose, editingProduct }: QuickProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeCategories } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { data: existingVariants } = useProductVariants(editingProduct?.id || '');
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    description: editingProduct?.description || '',
    full_description: editingProduct?.full_description || '',
    price: editingProduct?.price.toString() || '',
    category: editingProduct?.category || '',
    stock_quantity: editingProduct?.stock_quantity.toString() || '10',
    image_url: editingProduct?.image_url || '',
    image_urls: editingProduct?.image_urls || [],
    featured: editingProduct?.featured || false,
    sku: editingProduct?.sku || '',
  });

  useEffect(() => {
    setVariants(existingVariants?.map((variant: ProductVariant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku || '',
      size: variant.size || '',
      scent: variant.scent || '',
      color: variant.color || '',
      price: String(variant.price),
      stock_quantity: String(variant.stock_quantity),
    })) || []);
  }, [existingVariants]);

  const addVariant = () => {
    setVariants(current => [...current, {
      name: '',
      sku: '',
      size: '',
      scent: '',
      color: '',
      price: formData.price || '0',
      stock_quantity: '0',
    }]);
  };

  const updateVariant = (index: number, field: keyof VariantDraft, value: string) => {
    setVariants(current => current.map((variant, variantIndex) => (
      variantIndex === index ? { ...variant, [field]: value } : variant
    )));
  };

  const removeVariant = (index: number) => {
    const variant = variants[index];
    if (variant.id) setDeletedVariantIds(current => [...current, variant.id as string]);
    setVariants(current => current.filter((_, variantIndex) => variantIndex !== index));
  };

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
    } catch (error: unknown) {
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
      full_description: formData.full_description || null,
      price: parseFloat(formData.price),
      category: formData.category || null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      image_url: formData.image_urls[0] || null, // First image as primary
      image_urls: formData.image_urls,
      featured: formData.featured,
      sku: formData.sku.trim() || null,
    };

    try {
      let productId = editingProduct?.id;
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
        const { data, error } = await supabase.from('products').insert(productData).select('id').single();

        if (error) throw error;
        productId = data.id;

        toast({
          title: '✅ Product Added!',
          description: `${formData.name} is now available in your store`,
        });
      }

      if (productId) {
        if (deletedVariantIds.length > 0) {
          const { error } = await supabase
            .from('product_variants')
            .delete()
            .in('id', deletedVariantIds);
          if (error) throw error;
        }

        for (const [index, variant] of variants.entries()) {
          const variantData = {
            product_id: productId,
            name: variant.name.trim() || `${formData.name} Variant`,
            sku: variant.sku.trim() || null,
            size: variant.size.trim() || null,
            scent: variant.scent.trim() || null,
            color: variant.color.trim() || null,
            price: parseFloat(variant.price) || 0,
            stock_quantity: parseInt(variant.stock_quantity, 10) || 0,
            sort_order: index,
            is_active: true,
          };

          const result = variant.id
            ? await supabase.from('product_variants').update(variantData).eq('id', variant.id)
            : await supabase.from('product_variants').insert(variantData);
          if (result.error) throw result.error;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
      onClose();
    } catch (error: unknown) {
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
              📝 Short Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description for product cards..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Short summary that appears on product cards (keep it concise)
            </p>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="full_description" className="text-lg">
                📄 Full Product Description
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>
            </div>
            
            {showPreview ? (
              <div className="border border-border rounded-lg p-6 bg-muted/30 min-h-[400px]">
                <div className="text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
                  👁️ Preview - How customers will see it:
                </div>
                {formData.full_description ? (
                  <ProductDescription description={formData.full_description} />
                ) : (
                  <p className="text-muted-foreground italic">
                    No description yet. Add content to see preview.
                  </p>
                )}
              </div>
            ) : (
              <>
                <Textarea
                  id="full_description"
                  value={formData.full_description}
                  onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                  placeholder="**Elevate your sanctuary with the subtle art of fragrance.**

Meticulously hand-poured in small batches, this candle represents the intersection of sustainable luxury and artisanal craftsmanship. We use only 100% natural soy wax blended with premium fragrance oils to ensure a non-toxic, soot-free burn that is safe for your home and family.

**Technical Specifications**

* Net Weight: 200g / 7 oz
* Dimensions: 8.5 cm (Height) x 7 cm (Diameter)
* Burn Time: Approximately 40-45 hours
* Wax Type: 100% Natural Eco-Friendly Soy Wax
* Wick Type: Lead-free, braided cotton for a clean burn
* Vessel Material: High-grade heat-resistant glass
* Fragrance Load: High-concentration for optimal scent throw

**Scent Profile**

* Top Notes: Bergamot, Fresh Lemon
* Heart Notes: Lavender, Jasmine
* Base Notes: Sandalwood, Vanilla Bean

**Candle Care**

* Trim the wick to 1/4 inch before every light to prevent smoking.
* Allow the wax pool to reach the edges of the jar during the first burn to prevent tunneling.
* Never leave a burning candle unattended."
                  rows={15}
                  className="resize-y font-mono text-sm"
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>💡 Detailed description with technical specs, scent profile, care instructions, etc.</p>
                  <p>Formatting tips: Use ** for bold text, * for bullet points, blank lines for paragraphs</p>
                </div>
              </>
            )}
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

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku" className="text-lg">🔖 SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g., LAV-200"
            />
          </div>

          {/* Variants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-lg">🎨 Variants</Label>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                Add Variant
              </Button>
            </div>
            {variants.length > 0 && (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {['Name', 'Size', 'Scent', 'Color', 'Price', 'Stock', ''].map((heading) => (
                        <th key={heading} className="p-2 text-left font-medium whitespace-nowrap">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr key={variant.id || `new-${index}`} className="border-t">
                        {([
                          ['name', 'Variant name', 'text'],
                          ['size', 'Size', 'text'],
                          ['scent', 'Scent', 'text'],
                          ['color', 'Color', 'text'],
                          ['price', '0.00', 'number'],
                          ['stock_quantity', '0', 'number'],
                        ] as const).map(([field, placeholder, type]) => (
                          <td key={field} className="p-2">
                            <Input
                              type={type}
                              min={type === 'number' ? '0' : undefined}
                              step={field === 'price' ? '0.01' : undefined}
                              value={variant[field]}
                              onChange={(e) => updateVariant(index, field, e.target.value)}
                              placeholder={placeholder}
                              className="min-w-24 h-9"
                            />
                          </td>
                        ))}
                        <td className="p-2">
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
