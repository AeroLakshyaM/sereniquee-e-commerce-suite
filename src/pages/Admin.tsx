import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  Users,
  ShoppingCart,
  Calendar,
  Package,
  Home,
  Newspaper,
  FolderTree,
  Instagram,
  MoreHorizontal,
  Search,
  Download,
  Copy,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { Product } from '@/types';
import SimpleDashboard from '@/components/admin/SimpleDashboard';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import UsersManagement from '@/components/admin/UsersManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
import CalendarView from '@/components/admin/CalendarView';
import QuickProductForm from '@/components/admin/QuickProductForm';
import OrderNotifications from '@/components/admin/OrderNotifications';
import { BlogManager } from '@/components/admin/BlogManager';
import BusinessInsights from '@/components/admin/BusinessInsights';
import CategoryManager from '@/components/admin/CategoryManager';
import SocialPostsManager from '@/components/admin/SocialPostsManager';
import CustomOrdersManager from '@/components/admin/CustomOrdersManager';
import OfflineInvoiceGenerator from '@/components/admin/OfflineInvoiceGenerator';
import { slugify } from '@/lib/utils';

// Tab definitions — a single source of truth for the admin nav
const TABS = [
  { value: 'home',          label: 'Home',          icon: Home,         className: '' },
  { value: 'insights',      label: 'AI Insights',   icon: BarChart3,    className: 'bg-gradient-to-r from-purple-600/10 to-pink-600/10' },
  { value: 'analytics',     label: 'Analytics',     icon: BarChart3,    className: '' },
  { value: 'categories',    label: 'Categories',    icon: FolderTree,   className: '' },
  { value: 'products',      label: 'Products',      icon: Package,      className: '' },
  { value: 'orders',        label: 'Orders',        icon: ShoppingCart, className: '' },
  { value: 'invoices',      label: 'Invoices',      icon: FileText,      className: '' },
  { value: 'users',         label: 'Users',         icon: Users,        className: '' },
  { value: 'calendar',      label: 'Calendar',      icon: Calendar,     className: '' },
  { value: 'blogs',         label: 'Blogs',         icon: Newspaper,    className: '' },
  { value: 'social',        label: 'Social',        icon: Instagram,    className: '' },
  { value: 'custom-orders', label: 'Custom Orders', icon: Package,      className: 'bg-gradient-to-r from-teal-600/10 to-emerald-600/10' },
] as const;

type TabValue = (typeof TABS)[number]['value'];

export default function Admin() {
  // ── Tab state — URL-synced so it survives refresh & is shareable ──────────
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabValue) ?? 'home';

  const setActiveTab = (tab: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const [productSearch, setProductSearch] = useState('');
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [stockPopoverProductId, setStockPopoverProductId] = useState<string | null>(null);
  const [stockDraft, setStockDraft] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedProductSearch(productSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [productSearch]);

  // ── Product list — fetched in pages so the admin table remains responsive ──
  const {
    data: productsData,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProducts(undefined, debouncedProductSearch);

  const products = useMemo(
    () => productsData?.pages.flatMap(page => page.products) ?? [],
    [productsData],
  );

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ── Product form ──────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ── Delete confirmation dialog ────────────────────────────────────────────
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
    setActiveTab('products');
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deletingProductId);

    setDeletingProductId(null);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product.',
        variant: 'destructive',
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product deleted',
        description: 'The product has been removed.',
      });
    }
  };

  const toggleProductSelection = (id: string, checked: boolean) => {
    setSelectedProductIds(current => checked ? [...current, id] : current.filter(productId => productId !== id));
  };

  const exportSelectedProducts = () => {
    const selected = products.filter(product => selectedProductIds.includes(product.id));
    const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Featured'];
    const rows = selected.map(product => [
      product.name,
      product.sku || '',
      product.category || '',
      product.price,
      product.stock_quantity,
      product.featured ? 'Yes' : 'No',
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkAction = async (action: 'featured' | 'unfeatured' | 'delete') => {
    if (selectedProductIds.length === 0) return;
    setIsBulkUpdating(true);
    const result = action === 'delete'
      ? await supabase.from('products').delete().in('id', selectedProductIds)
      : await supabase.from('products').update({ featured: action === 'featured' }).in('id', selectedProductIds);

    if (result.error) {
      toast({ title: 'Bulk action failed', description: result.error.message, variant: 'destructive' });
    } else {
      toast({ title: action === 'delete' ? 'Products deleted' : 'Products updated' });
      setSelectedProductIds([]);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
    setIsBulkUpdating(false);
  };

  const updateStock = async (productId: string) => {
    const stock = Number.parseInt(stockDraft, 10);
    if (!Number.isInteger(stock) || stock < 0) return;
    const { error } = await supabase.from('products').update({ stock_quantity: stock }).eq('id', productId);
    if (error) {
      toast({ title: 'Stock update failed', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setStockPopoverProductId(null);
    }
  };

  const duplicateProduct = async (product: Product) => {
    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...copy } = product;
    const { error } = await supabase.from('products').insert({
      ...copy,
      name: `${product.name} (Copy)`,
      slug: `${slugify(product.name)}-copy-${Date.now()}`,
    });
    if (error) {
      toast({ title: 'Duplication failed', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product duplicated' });
    }
  };

  const stockBadge = (stock: number) => stock === 0
    ? <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">Out of Stock</span>
    : stock <= 5
      ? <span className="ml-2 rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Low Stock</span>
      : null;

  return (
    <div className="container-luxury py-6 md:py-12">
      {/* Delete confirmation dialog (replaces browser confirm()) */}
      <AlertDialog
        open={!!deletingProductId}
        onOpenChange={open => !open && setDeletingProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the product and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-2">Admin Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your e-commerce platform</p>
        </div>
        <OrderNotifications />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        {/* Mobile: Dropdown-style selector */}
        <div className="lg:hidden">
          <select
            value={activeTab}
            onChange={e => setActiveTab(e.target.value)}
            className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
          >
            {TABS.map(tab => (
              <option key={tab.value} value={tab.value}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop: Keep every navigation tab on one horizontal row. */}
        <div className="hidden lg:block w-full overflow-x-auto pb-1">
          <TabsList className="inline-flex w-max min-w-full flex-nowrap gap-1">
            {TABS.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`flex shrink-0 items-center gap-2 ${tab.className}`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="home" className="space-y-6">
          <SimpleDashboard />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <BusinessInsights />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="font-serif text-xl md:text-2xl">Product Management</h2>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Product Form Modal */}
          {showForm && (
            <QuickProductForm
              onClose={resetForm}
              editingProduct={editingProduct}
            />
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Search by name, category, or SKU..."
                className="pl-9"
              />
            </div>
            {selectedProductIds.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isBulkUpdating}>
                    Bulk Actions ({selectedProductIds.length})
                    <MoreHorizontal className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => void handleBulkAction('featured')}>Mark as Featured</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => void handleBulkAction('unfeatured')}>Unmark Featured</DropdownMenuItem>
                  <DropdownMenuItem onSelect={exportSelectedProducts}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => void handleBulkAction('delete')}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Products Table */}
          <div className="bg-card shadow-soft overflow-hidden rounded-lg">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-pulse text-muted-foreground">Loading products...</div>
              </div>
            ) : products.length > 0 ? (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden divide-y divide-border">
                  {products.map(product => (
                    <div key={product.id} className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={(checked) => toggleProductSelection(product.id, checked === true)}
                          aria-label={`Select ${product.name}`}
                        />
                        <div className="w-16 h-16 bg-secondary flex-shrink-0 overflow-hidden rounded">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">{product.category || 'Uncategorized'}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-semibold text-sm">₹{product.price.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">Stock: {product.stock_quantity}</span>
                            {stockBadge(product.stock_quantity)}
                          </div>
                          {product.featured && (
                            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="flex-1">
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(`/product/${product.slug}`, '_blank')}>
                          <ExternalLink className="h-3 w-3 mr-1" /> Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingProductId(product.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-4">
                          <Checkbox
                            checked={products.length > 0 && selectedProductIds.length === products.length}
                            onCheckedChange={(checked) => setSelectedProductIds(checked ? products.map(product => product.id) : [])}
                            aria-label="Select all products"
                          />
                        </th>
                        <th className="text-left p-4 text-sm font-medium">Product</th>
                        <th className="text-left p-4 text-sm font-medium">Category</th>
                        <th className="text-left p-4 text-sm font-medium">Price</th>
                        <th className="text-left p-4 text-sm font-medium">Stock</th>
                        <th className="text-left p-4 text-sm font-medium">Featured</th>
                        <th className="text-right p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} className="border-t border-border">
                          <td className="p-4">
                            <Checkbox
                              checked={selectedProductIds.includes(product.id)}
                              onCheckedChange={(checked) => toggleProductSelection(product.id, checked === true)}
                              aria-label={`Select ${product.name}`}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-secondary flex-shrink-0 overflow-hidden">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                    No img
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-medium">{product.name}</span>
                                {product.sku && <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">{product.category || '-'}</td>
                          <td className="p-4">₹{product.price.toFixed(2)}</td>
                          <td className="p-4">
                            <Popover
                              open={stockPopoverProductId === product.id}
                              onOpenChange={(open) => {
                                setStockPopoverProductId(open ? product.id : null);
                                if (open) setStockDraft(String(product.stock_quantity));
                              }}
                            >
                              <PopoverTrigger asChild>
                                <button type="button" className="font-medium underline decoration-dotted underline-offset-4">
                                  {product.stock_quantity}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-56">
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Update stock</p>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={stockDraft}
                                    onChange={(event) => setStockDraft(event.target.value)}
                                  />
                                  <Button size="sm" className="w-full" onClick={() => void updateStock(product.id)}>
                                    Save
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                            {stockBadge(product.stock_quantity)}
                          </td>
                          <td className="p-4">
                            {product.featured && (
                              <span className="bg-accent text-accent-foreground text-xs px-2 py-1">
                                Featured
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => window.open(`/product/${product.slug}`, '_blank')} title="Preview">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => void duplicateProduct(product)} title="Duplicate">
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingProductId(product.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No products yet. Add your first product!</p>
              </div>
            )}
          </div>
          {products.length > 0 && hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading products...' : 'Load More Products'}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrdersManagement />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <OfflineInvoiceGenerator />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <CalendarView />
        </TabsContent>

        <TabsContent value="blogs" className="space-y-6">
          <BlogManager />
        </TabsContent>

        <TabsContent value="custom-orders" className="space-y-6">
          <CustomOrdersManager />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialPostsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
