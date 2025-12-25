import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, BarChart3, Users, ShoppingCart, Calendar, Package } from 'lucide-react';
import { Product } from '@/types';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import UsersManagement from '@/components/admin/UsersManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
import CalendarView from '@/components/admin/CalendarView';

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: products, isLoading } = useProducts();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('analytics');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    image_url: '',
    featured: false,
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      toast({
        title: 'Access denied',
        description: 'You need admin privileges to access this page.',
        variant: 'destructive',
      });
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock_quantity: '',
      image_url: '',
      featured: false,
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category || '',
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url || '',
      featured: product.featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', productId);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      category: formData.category || null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      image_url: formData.image_url || null,
      featured: formData.featured,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update product.',
          variant: 'destructive',
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast({
          title: 'Product updated',
          description: 'The product has been saved.',
        });
        resetForm();
      }
    } else {
      const { error } = await supabase.from('products').insert(productData);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create product.',
          variant: 'destructive',
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast({
          title: 'Product created',
          description: 'The new product has been added.',
        });
        resetForm();
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-luxury py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your e-commerce platform</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Products</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl">Product Management</h2>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Product Form Modal */}
          {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-elegant p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., signature, seasonal, gift"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="featured">Featured Product</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

          {/* Products Table */}
          <div className="bg-card shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse text-muted-foreground">Loading products...</div>
          </div>
        ) : products && products.length > 0 ? (
          <div className="overflow-x-auto">
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
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-border">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary flex-shrink-0 overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
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
                    <td className="p-4">${product.price.toFixed(2)}</td>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
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
      </Tabs>
    </div>
  );
}
