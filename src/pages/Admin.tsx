import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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

// Tab definitions — a single source of truth for the admin nav
const TABS = [
  { value: 'home',          label: 'Home',          icon: Home,         className: '' },
  { value: 'insights',      label: 'AI Insights',   icon: BarChart3,    className: 'bg-gradient-to-r from-purple-600/10 to-pink-600/10' },
  { value: 'analytics',     label: 'Analytics',     icon: BarChart3,    className: '' },
  { value: 'categories',    label: 'Categories',    icon: FolderTree,   className: '' },
  { value: 'products',      label: 'Products',      icon: Package,      className: '' },
  { value: 'orders',        label: 'Orders',        icon: ShoppingCart, className: '' },
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

  // ── Product list — first page only; admin fetches more on demand ──────────
  // We no longer eagerly fetch ALL pages; the table shows the first page (12)
  // and an "Edit" search is available instead.
  const {
    data: productsData,
    isLoading,
  } = useProducts();

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

        {/* Desktop: Tab List */}
        <TabsList className="hidden lg:inline-flex lg:flex-wrap w-full lg:w-auto gap-1">
          {TABS.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`flex items-center gap-2 ${tab.className}`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

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
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">{product.category || '-'}</td>
                          <td className="p-4">₹{product.price.toFixed(2)}</td>
                          <td className="p-4">{product.stock_quantity}</td>
                          <td className="p-4">
                            {product.featured && (
                              <span className="bg-accent text-accent-foreground text-xs px-2 py-1">
                                Featured
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
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
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrdersManagement />
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
