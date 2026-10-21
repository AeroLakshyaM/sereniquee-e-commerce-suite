import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X, Image as ImageIcon, Loader2, Eye, EyeOff, GripVertical, Save } from 'lucide-react';
import { Product } from '@/types';
import type { ProductVariant } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useProductVariants } from '@/hooks/useVariants';
import { ProductDescription } from '@/components/product/ProductDescription';
import { SeoFields } from '@/components/admin/SeoFields';
import { slugify } from '@/lib/utils';
import type { Json } from '@/integrations/supabase/types';
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
  wick_type: string;
  weight: string;
  custom_engraving: string;
};

type ProductFormData = {
  name: string;
  slug: string;
  description: string;
  full_description: string;
  price: string;
  category: string;
  stock_quantity: string;
  image_url: string;
  image_urls: string[];
  featured: boolean;
  sku: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  wax_type: string;
  burn_time_hours: string;
  net_weight: string;
  wick_type: string;
  scent_notes: string;
  care_instructions: string;
};

type ProductDraft = {
  formData: ProductFormData;
  variants: VariantDraft[];
  deletedVariantIds: string[];
};

function readProductDraft(key: string): ProductDraft | null {
  try {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(key);
    if (!stored) return null;
    const draft = JSON.parse(stored) as Partial<ProductDraft>;
    if (!draft.formData || typeof draft.formData.name !== 'string' || !Array.isArray(draft.formData.image_urls)) return null;
    return {
      formData: draft.formData as ProductFormData,
      variants: Array.isArray(draft.variants) ? draft.variants : [],
      deletedVariantIds: Array.isArray(draft.deletedVariantIds) ? draft.deletedVariantIds : [],
    };
  } catch {
    return null;
  }
}

export default function QuickProductForm({ onClose, editingProduct }: QuickProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeCategories } = useCategories();
  const draftKey = `sereniquee-product-draft:${editingProduct?.id ?? 'new'}`;
  const [restoredDraft] = useState(() => readProductDraft(draftKey));
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(() => Boolean(
    restoredDraft?.formData?.slug && restoredDraft.formData.slug !== slugify(restoredDraft.formData.name),
  ));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { data: existingVariants } = useProductVariants(editingProduct?.id || '');
  const [variants, setVariants] = useState<VariantDraft[]>(() => restoredDraft?.variants ?? []);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>(() => restoredDraft?.deletedVariantIds ?? []);
  const [formData, setFormData] = useState<ProductFormData>(() => restoredDraft?.formData ?? {
    name: editingProduct?.name || '',
    slug: editingProduct?.slug || '',
    description: editingProduct?.description || '',
    full_description: editingProduct?.full_description || '',
    price: editingProduct?.price.toString() || '',
    category: editingProduct?.category || '',
    stock_quantity: editingProduct?.stock_quantity.toString() || '10',
    image_url: editingProduct?.image_url || '',
    image_urls: editingProduct?.image_urls?.length ? editingProduct.image_urls : editingProduct?.image_url ? [editingProduct.image_url] : [],
    featured: editingProduct?.featured || false,
    sku: editingProduct?.sku || '',
    seo_title: editingProduct?.seo_title || '',
    seo_description: editingProduct?.seo_description || '',
    seo_keywords: editingProduct?.seo_keywords || '',
    wax_type: typeof editingProduct?.metadata?.wax_type === 'string' ? editingProduct.metadata.wax_type : '',
    burn_time_hours: typeof editingProduct?.metadata?.burn_time_hours === 'number' ? String(editingProduct.metadata.burn_time_hours) : '',
    net_weight: typeof editingProduct?.metadata?.net_weight === 'string' ? editingProduct.metadata.net_weight : '',
    wick_type: typeof editingProduct?.metadata?.wick_type === 'string' ? editingProduct.metadata.wick_type : '',
    scent_notes: typeof editingProduct?.metadata?.scent_notes === 'string' ? editingProduct.metadata.scent_notes : '',
    care_instructions: typeof editingProduct?.metadata?.care_instructions === 'string' ? editingProduct.metadata.care_instructions : '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(draftKey, JSON.stringify({ formData, variants, deletedVariantIds } satisfies ProductDraft));
    } catch {
      // Storage can be unavailable or full; the in-memory draft still remains intact while this form is open.
    }
  }, [draftKey, formData, variants, deletedVariantIds]);

  useEffect(() => {
    if (restoredDraft || !existingVariants) return;
    setVariants(existingVariants.map((variant: ProductVariant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku || '',
      size: variant.size || '',
      scent: variant.scent || '',
      color: variant.color || '',
      price: String(variant.price),
      stock_quantity: String(variant.stock_quantity),
      wick_type: variant.wick_type || '',
      weight: variant.weight || '',
      custom_engraving: variant.custom_engraving || '',
    })));
  }, [existingVariants, restoredDraft]);

  const addVariant = () => {
    setVariants(current => [...current, {
      name: '',
      sku: '',
      size: '',
      scent: '',
      color: '',
      price: formData.price || '0',
      stock_quantity: '0',
      wick_type: '',
      weight: '',
      custom_engraving: '',
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

  const handleSetPrimaryImage = (index: number) => {
    const imageUrls = [...formData.image_urls];
    const [primaryImage] = imageUrls.splice(index, 1);
    setFormData({ ...formData, image_urls: [primaryImage, ...imageUrls], image_url: primaryImage });
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
    const price = Number(formData.price);
    const stockQuantity = Number(formData.stock_quantity);
    const slug = slugify(formData.slug || formData.name);
    if (!Number.isFinite(price) || price < 0) {
      toast({ title: 'Check the product price', description: 'Enter a valid price of zero or more.', variant: 'destructive' });
      return;
    }
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      toast({ title: 'Check the stock quantity', description: 'Enter a whole number of zero or more.', variant: 'destructive' });
      return;
    }
    if (!slug) {
      toast({ title: 'Add a product name or URL slug', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    const productData = {
      name: formData.name,
      slug,
      description: formData.description || null,
      full_description: formData.full_description || null,
      price,
      category: formData.category || null,
      stock_quantity: stockQuantity,
      image_url: formData.image_urls[0] || null, // First image as primary
      image_urls: formData.image_urls,
      featured: formData.featured,
      sku: formData.sku.trim() || null,
      seo_title: formData.seo_title.trim() || null,
      seo_description: formData.seo_description.trim() || null,
      seo_keywords: formData.seo_keywords.trim() || null,
      metadata: {
        ...(editingProduct?.metadata ?? {}),
        wax_type: formData.wax_type.trim() || null,
        burn_time_hours: formData.burn_time_hours ? Number(formData.burn_time_hours) : null,
        net_weight: formData.net_weight.trim() || null,
        wick_type: formData.wick_type.trim() || null,
        scent_notes: formData.scent_notes.trim() || null,
        care_instructions: formData.care_instructions.trim() || null,
      } as Json,
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
            wick_type: variant.wick_type.trim() || null,
            weight: variant.weight.trim() || null,
            custom_engraving: variant.custom_engraving.trim() || null,
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
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // The product has already been saved; inaccessible storage should not block closing the editor.
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-2 backdrop-blur-sm sm:p-4">
      <div className="max-h-[96vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl sm:max-h-[92vh]">
        {/* Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/95 p-4 backdrop-blur-md sm:p-6">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">Product workspace</p>
            <h2 className="font-serif text-2xl sm:text-3xl">
              {editingProduct ? 'Edit product' : 'Create a product'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Build a complete product listing. Your draft saves on this device as you work.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close product editor" className="shrink-0">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
          {restoredDraft && (
            <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              <Save className="mt-0.5 h-4 w-4 shrink-0" />
              <p><span className="font-semibold">Draft restored.</span> Your unsaved product details are back. Saving the product publishes the changes; closing this editor keeps the draft.</p>
            </div>
          )}

          {/* Image Upload Section */}
          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-4 sm:p-5" aria-labelledby="product-images-heading">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 id="product-images-heading" className="font-serif text-xl">Product images</h3>
                <p className="mt-1 text-sm text-muted-foreground">Add up to 10 clear photos. The first image is the main listing image.</p>
              </div>
              <span className="text-xs text-muted-foreground">{formData.image_urls.length}/10 images</span>
            </div>
            
            {/* Display uploaded images */}
            {formData.image_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {formData.image_urls.map((url, index) => (
                  <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/65 p-2 text-white">
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(index)}
                        disabled={index === 0}
                        className="inline-flex min-h-8 items-center gap-1 rounded px-2 text-xs font-medium hover:bg-white/15 disabled:cursor-default disabled:bg-white/20"
                        aria-label={index === 0 ? 'Primary product image' : `Set image ${index + 1} as primary`}
                      >
                        {index === 0 ? <ImageIcon className="h-3.5 w-3.5" /> : <GripVertical className="h-3.5 w-3.5" />}
                        {index === 0 ? 'Primary' : 'Make primary'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 text-center sm:p-7">
              <div className="space-y-3">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <Label htmlFor="image-upload" className="cursor-pointer font-medium text-primary hover:underline">
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
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-4 sm:p-5" aria-labelledby="product-basics-heading">
            <div>
              <h3 id="product-basics-heading" className="font-serif text-xl">Product basics</h3>
              <p className="mt-1 text-sm text-muted-foreground">Give customers a clear name, URL, and short summary.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: !editingProduct && !slugManuallyEdited ? slugify(e.target.value) : formData.slug })}
                  placeholder="e.g., Lavender Dreams Candle"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-slug">Product URL slug</Label>
                <Input
                  id="product-slug"
                  value={formData.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setFormData({ ...formData, slug: slugify(e.target.value) });
                  }}
                  placeholder="lavender-dreams-candle"
                  aria-describedby="product-slug-help"
                  className="h-11"
                />
                <p id="product-slug-help" className="text-xs text-muted-foreground">Used in the product link. Keep it short, readable, and unique.</p>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-4 sm:p-5" aria-labelledby="product-copy-heading">
            <div>
              <h3 id="product-copy-heading" className="font-serif text-xl">Product story</h3>
              <p className="mt-1 text-sm text-muted-foreground">Use the short summary on cards and the full description on the product page.</p>
            </div>
            <div className="space-y-2">
            <Label htmlFor="description">Short description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description for product cards..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">A concise summary customers can scan quickly.</p>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="full_description">Full product description</Label>
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
          </section>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price * (₹)</Label>
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
              <Label htmlFor="stock_quantity">Stock quantity</Label>
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
            <Label htmlFor="category">Category</Label>
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
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g., LAV-200"
            />
          </div>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-4 sm:p-5" aria-labelledby="candle-details-heading">
            <div>
              <h3 id="candle-details-heading" className="font-serif text-xl">Candle details</h3>
              <p className="mt-1 text-sm text-muted-foreground">Structured details can help shoppers compare products and choose the right candle.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="wax-type">Wax type</Label>
                <Input id="wax-type" value={formData.wax_type} onChange={(e) => setFormData({ ...formData, wax_type: e.target.value })} placeholder="e.g., Soy and coconut blend" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burn-time">Estimated burn time (hours)</Label>
                <Input id="burn-time" type="number" min="0" step="1" value={formData.burn_time_hours} onChange={(e) => setFormData({ ...formData, burn_time_hours: e.target.value })} placeholder="e.g., 40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="net-weight">Net weight</Label>
                <Input id="net-weight" value={formData.net_weight} onChange={(e) => setFormData({ ...formData, net_weight: e.target.value })} placeholder="e.g., 200 g" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wick-type">Wick type</Label>
                <Input id="wick-type" value={formData.wick_type} onChange={(e) => setFormData({ ...formData, wick_type: e.target.value })} placeholder="e.g., Cotton wick" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="scent-notes">Scent notes</Label>
                <Input id="scent-notes" value={formData.scent_notes} onChange={(e) => setFormData({ ...formData, scent_notes: e.target.value })} placeholder="e.g., Bergamot, lavender, sandalwood" />
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="care-instructions">Candle care instructions</Label>
                <Textarea id="care-instructions" value={formData.care_instructions} onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })} placeholder="Trim wick before lighting. Keep away from drafts..." rows={3} />
              </div>
            </div>
          </section>

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
                      {['Name', 'SKU', 'Size', 'Scent', 'Color', 'Price', 'Stock', 'Wick', 'Weight', 'Personalization', ''].map((heading) => (
                        <th key={heading} className="p-2 text-left font-medium whitespace-nowrap">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr key={variant.id || `new-${index}`} className="border-t">
                        {([
                          ['name', 'Variant name', 'text'],
                          ['sku', 'SKU', 'text'],
                          ['size', 'Size', 'text'],
                          ['scent', 'Scent', 'text'],
                          ['color', 'Color', 'text'],
                          ['price', '0.00', 'number'],
                          ['stock_quantity', '0', 'number'],
                          ['wick_type', 'Wick type', 'text'],
                          ['weight', 'Weight', 'text'],
                          ['custom_engraving', 'Personalization', 'text'],
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
          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/20">
            <div>
              <Label htmlFor="featured" className="cursor-pointer font-semibold">Feature on homepage</Label>
              <p className="mt-1 text-sm text-muted-foreground">Highlight this item in the featured collection.</p>
            </div>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          <SeoFields
            value={{
              seoTitle: formData.seo_title,
              seoDescription: formData.seo_description,
              seoKeywords: formData.seo_keywords,
            }}
            onChange={(value) => setFormData({
              ...formData,
              seo_title: value.seoTitle,
              seo_description: value.seoDescription,
              seo_keywords: value.seoKeywords,
            })}
            defaultTitle={formData.name ? `${formData.name} | Sereniquee Candles` : undefined}
            defaultDescription={formData.description || undefined}
          />

          {/* Action Buttons */}
          <div className="sticky bottom-0 z-20 -mx-4 flex gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 flex-1 font-semibold"
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
