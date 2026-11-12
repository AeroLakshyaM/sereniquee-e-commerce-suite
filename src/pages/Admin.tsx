import { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { runBulkProductAction } from '@/lib/adminProducts';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  MessageSquare,
  Warehouse,
  TicketPercent,
  Mail,
  ContactRound,
  Sparkles,
  LayoutGrid,
  Layers,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { Product } from '@/types';
import { slugify, cn } from '@/lib/utils';
import type { Json } from '@/integrations/supabase/types';

const SimpleDashboard = lazy(() => import('@/components/admin/SimpleDashboard'));
const AnalyticsDashboard = lazy(() => import('@/components/admin/AnalyticsDashboard'));
const UsersManagement = lazy(() => import('@/components/admin/UsersManagement'));
const OrdersManagement = lazy(() => import('@/components/admin/OrdersManagement'));
const CalendarView = lazy(() => import('@/components/admin/CalendarView'));
const QuickProductForm = lazy(() => import('@/components/admin/QuickProductForm'));
const OrderNotifications = lazy(() => import('@/components/admin/OrderNotifications'));
const BlogManager = lazy(() => import('@/components/admin/BlogManager').then(module => ({ default: module.BlogManager })));
const BusinessInsights = lazy(() => import('@/components/admin/BusinessInsights'));
const CategoryManager = lazy(() => import('@/components/admin/CategoryManager'));
const SocialPostsManager = lazy(() => import('@/components/admin/SocialPostsManager'));
const CustomOrdersManager = lazy(() => import('@/components/admin/CustomOrdersManager'));
const OfflineInvoiceGenerator = lazy(() => import('@/components/admin/OfflineInvoiceGenerator'));
const ReviewsManagement = lazy(() => import('@/components/admin/ReviewsManagement'));
const InventoryManager = lazy(() => import('@/components/admin/InventoryManager'));
const CouponsManager = lazy(() => import('@/components/admin/CouponsManager'));
const NewsletterManager = lazy(() => import('@/components/admin/NewsletterManager'));
const StoreContactsManager = lazy(() => import('@/components/admin/StoreContactsManager'));

export type BoardCategory = 'all' | 'overview' | 'catalog' | 'sales' | 'growth';

export const BOARD_CATEGORIES = [
  { id: 'all' as BoardCategory, label: 'All Boards', count: 17, icon: Layers },
  { id: 'overview' as BoardCategory, label: 'Overview & AI', count: 3, icon: Sparkles },
  { id: 'catalog' as BoardCategory, label: 'Catalog & Stock', count: 3, icon: Package },
  { id: 'sales' as BoardCategory, label: 'Sales & Orders', count: 4, icon: ShoppingCart },
  { id: 'growth' as BoardCategory, label: 'Customers & Growth', count: 7, icon: Users },
] as const;

export const TABS = [
  {
    value: 'home',
    label: 'Home Overview',
    icon: Home,
    category: 'overview' as const,
    description: 'Store health snapshot, urgent alerts, and rapid operational shortcuts.',
  },
  {
    value: 'insights',
    label: 'AI Insights',
    icon: Sparkles,
    category: 'overview' as const,
    badge: 'AI Smart',
    description: 'Intelligent business recommendations generated from your sales and catalog trends.',
  },
  {
    value: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    category: 'overview' as const,
    description: 'Sales, conversion rates, customer retention, and traffic metrics.',
  },
  {
    value: 'products',
    label: 'Products',
    icon: Package,
    category: 'catalog' as const,
    description: 'Manage candle listings, pricing, fragrance notes, imagery, and stock.',
  },
  {
    value: 'categories',
    label: 'Categories',
    icon: FolderTree,
    category: 'catalog' as const,
    description: 'Curate product collections and seasonal navigation for shoppers.',
  },
  {
    value: 'inventory',
    label: 'Inventory',
    icon: Warehouse,
    category: 'catalog' as const,
    description: 'Monitor stock levels, set low-stock thresholds, and plan candle batches.',
  },
  {
    value: 'orders',
    label: 'Live Orders',
    icon: ShoppingCart,
    category: 'sales' as const,
    description: 'Review purchases, fulfill dispatches, update courier tracking, and print labels.',
  },
  {
    value: 'invoices',
    label: 'Invoices',
    icon: FileText,
    category: 'sales' as const,
    description: 'Generate GST-compliant invoices for offline sales, gifting, and popups.',
  },
  {
    value: 'custom-orders',
    label: 'Custom Orders',
    icon: Package,
    category: 'sales' as const,
    badge: 'Bespoke',
    description: 'Manage custom scent blends, wedding favors, and corporate inquiries.',
  },
  {
    value: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    category: 'sales' as const,
    description: 'Track dispatch schedules, pop-up exhibitions, curing cycles, and deadlines.',
  },
  {
    value: 'users',
    label: 'Customers',
    icon: Users,
    category: 'growth' as const,
    description: 'View registered shopper profiles, order history, and account activities.',
  },
  {
    value: 'reviews',
    label: 'Reviews',
    icon: MessageSquare,
    category: 'growth' as const,
    description: 'Moderate customer ratings, approve reviews, and review fragrance feedback.',
  },
  {
    value: 'coupons',
    label: 'Coupons & Offers',
    icon: TicketPercent,
    category: 'growth' as const,
    description: 'Create discount codes, festive promotions, and track redemption rates.',
  },
  {
    value: 'blogs',
    label: 'Stories & Blog',
    icon: Newspaper,
    category: 'growth' as const,
    description: 'Publish candle care journals, scent guides, and boost organic Google traffic.',
  },
  {
    value: 'social',
    label: 'Social & Feeds',
    icon: Instagram,
    category: 'growth' as const,
    description: 'Curate your Instagram feed, UGC, and shoppable aesthetic content.',
  },
  {
    value: 'newsletter',
    label: 'Newsletter',
    icon: Mail,
    category: 'growth' as const,
    description: 'Manage subscriber lists and prepare seasonal email campaigns.',
  },
  {
    value: 'store-contacts',
    label: 'Store Contacts',
    icon: ContactRound,
    category: 'growth' as const,
    badge: 'Popups',
    description: 'Exhibition and popup contacts, follow-up queues, and consent-aware exports.',
  },
] as const;

type TabValue = (typeof TABS)[number]['value'];

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab: TabValue = TABS.some(tab => tab.value === requestedTab)
    ? (requestedTab as TabValue)
    : 'home';
  const activeSection = TABS.find(tab => tab.value === activeTab) ?? TABS[0];
  const ActiveSectionIcon = activeSection.icon;

  const setActiveTab = (tab: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // Category filter state & search
  const [selectedCategory, setSelectedCategory] = useState<BoardCategory>('all');
  const [boardSearchQuery, setBoardSearchQuery] = useState('');
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  // Filter boards based on category and search query
  const filteredBoards = useMemo(() => {
    return TABS.filter(tab => {
      const matchesCategory = selectedCategory === 'all' || tab.category === selectedCategory;
      const matchesSearch =
        !boardSearchQuery ||
        tab.label.toLowerCase().includes(boardSearchQuery.toLowerCase()) ||
        tab.description.toLowerCase().includes(boardSearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, boardSearchQuery]);

  // Product management state
  const [productSearch, setProductSearch] = useState('');
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('');
  const [productPage, setProductPage] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [stockPopoverProductId, setStockPopoverProductId] = useState<string | null>(null);
  const [stockDraft, setStockDraft] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedProductSearch(productSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [productSearch]);

  useEffect(() => setProductPage(0), [debouncedProductSearch]);

  const { data: productsData, isLoading } = useAdminProducts(debouncedProductSearch, productPage);
  const products = productsData?.products ?? [];
  const productCount = productsData?.total ?? 0;
  const productPageCount = Math.max(1, Math.ceil(productCount / 25));

  useEffect(() => {
    if (productsData && productPage >= productPageCount) {
      setProductPage(Math.max(0, productPageCount - 1));
    }
  }, [productPage, productPageCount, productsData]);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

    const { error } = await supabase.from('products').delete().eq('id', deletingProductId);
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
    setSelectedProductIds(current => (checked ? [...current, id] : current.filter(productId => productId !== id)));
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
    const result = await runBulkProductAction(action, selectedProductIds);

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
      toast({ title: 'Stock updated' });
    }
  };

  const duplicateProduct = async (product: Product) => {
    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...copy } = product;
    const { error } = await supabase.from('products').insert({
      ...copy,
      name: `${product.name} (Copy)`,
      slug: `${slugify(product.name)}-copy-${Date.now()}`,
      metadata: product.metadata as Json,
    });
    if (error) {
      toast({ title: 'Duplication failed', description: error.message, variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product duplicated' });
    }
  };

  const stockBadge = (stock: number) =>
    stock === 0 ? (
      <span className="ml-2 inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
        Out of Stock
      </span>
    ) : stock <= 5 ? (
      <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
        Low ({stock})
      </span>
    ) : (
      <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
        In Stock
      </span>
    );

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 animate-fade-in">
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingProductId}
        onOpenChange={open => !open && setDeletingProductId(null)}
      >
        <AlertDialogContent className="rounded-3xl border-[#eadfd1] bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This will permanently remove the candle listing, its metadata, and images from the active storefront. This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Matrix / All Boards Grid Modal */}
      <Dialog open={isMatrixOpen} onOpenChange={setIsMatrixOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border-[#eadfd1] bg-[#fdfaf5]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="font-serif text-2xl md:text-3xl">Atelier Command Center</DialogTitle>
                <DialogDescription className="text-xs md:text-sm text-muted-foreground mt-1">
                  Quickly navigate to all 17 boards and operational zones of Sereniquee.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = tab.value === activeTab;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.value);
                    setIsMatrixOpen(false);
                  }}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all duration-200 hover:shadow-md flex flex-col justify-between group',
                    isActive
                      ? 'border-[#2c221e] bg-white ring-2 ring-[#2c221e]/15 shadow-sm'
                      : 'border-[#eadfd1] bg-white/70 hover:bg-white hover:border-[#8c6239]/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        'h-9 w-9 rounded-xl flex items-center justify-center transition-colors',
                        isActive
                          ? 'bg-[#2c221e] text-white'
                          : 'bg-[#fbf9f6] text-[#8c6239] group-hover:bg-[#2c221e] group-hover:text-white'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {'badge' in tab && tab.badge && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-semibold text-foreground group-hover:text-primary">
                      {tab.label}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-snug">
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================
          TOP ATELIER HEADER & COMMAND BAR
          ============================================================ */}
      <div className="rounded-3xl border border-[#eadfd1] bg-gradient-to-r from-card via-[#fdfaf5] to-card p-5 sm:p-7 shadow-[0_4px_24px_rgba(44,34,30,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Brand & Workspace Status */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold tracking-wide uppercase">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Store Live
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
              <p className="text-xs uppercase tracking-[0.22em] text-[#8c6239] font-medium hidden sm:inline">
                Sereniquee Atelier Suite
              </p>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground tracking-tight">
              Admin Command Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Oversee artisan production, live orders, custom commissions, and business growth from a unified cockpit.
            </p>
          </div>

          {/* Quick Actions & Notifications */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
                setActiveTab('products');
              }}
              className="rounded-full bg-[#2c221e] text-white hover:bg-[#3d302a] shadow-sm text-xs sm:text-sm h-10 px-5 font-medium"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Product
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab('invoices')}
              className="rounded-full border-[#eadfd1] text-xs sm:text-sm h-10 px-4 bg-white/80 hover:bg-white"
            >
              <FileText className="h-4 w-4 mr-1.5 text-[#8c6239]" />
              New Invoice
            </Button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[#eadfd1] bg-white/80 hover:bg-white text-xs sm:text-sm h-10 px-4 text-foreground transition-colors"
            >
              <span>Live Store</span>
              <ArrowUpRight className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
            </a>

            <Suspense fallback={<div className="h-10 w-10 animate-pulse rounded-full bg-muted" />}>
              <OrderNotifications />
            </Suspense>
          </div>
        </div>
      </div>

      {/* ============================================================
          BOARD NAVIGATION & CATEGORY TAG FILTER SYSTEM
          ============================================================ */}
      <div className="space-y-4">
        {/* Category Filter Pills & Search Jump */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Domain Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {BOARD_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0',
                    isSelected
                      ? 'bg-[#2c221e] text-white shadow-sm ring-2 ring-[#2c221e]/20'
                      : 'bg-[#fbf9f6] text-muted-foreground hover:text-foreground hover:bg-[#f0e8de] border border-[#eadfd1]/70'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full',
                      isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search & Grid Matrix Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={boardSearchQuery}
                onChange={e => setBoardSearchQuery(e.target.value)}
                placeholder="Jump to any board..."
                className="pl-8.5 pr-8 h-9 text-xs rounded-full bg-card border-[#eadfd1]"
              />
              {boardSearchQuery && (
                <button
                  type="button"
                  onClick={() => setBoardSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMatrixOpen(true)}
              className="rounded-full border-[#eadfd1] h-9 text-xs gap-1.5 bg-card hover:bg-[#fbf9f6] shrink-0"
              title="View all 17 boards in an open grid"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-[#8c6239]" />
              <span className="hidden sm:inline">Browse Matrix</span>
            </Button>
          </div>
        </div>

        {/* Board Pill Selector */}
        <div className="p-2 rounded-2xl border border-[#eadfd1] bg-[#fbf9f6] shadow-sm overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 min-w-max">
            {filteredBoards.map(tab => {
              const Icon = tab.icon;
              const isActive = tab.value === activeTab;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0',
                    isActive
                      ? 'bg-white text-foreground shadow-sm border border-[#eadfd1] ring-1 ring-[#2c221e]/10 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-[#8c6239]' : 'text-muted-foreground')} />
                  <span>{tab.label}</span>
                  {'badge' in tab && tab.badge && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contextual Active Board Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 rounded-2xl border border-[#eadfd1] bg-card/90 shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2c221e] text-white shadow-sm">
              <ActiveSectionIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-foreground truncate">
                  {activeSection.label}
                </h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#fbf9f6] text-[#8c6239] border border-[#eadfd1] capitalize">
                  {activeSection.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-xl">
                {activeSection.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span className="hidden sm:inline">Active Workspace:</span>
            <code className="px-2 py-1 rounded-md bg-[#fbf9f6] border border-[#eadfd1] text-foreground font-mono text-[11px]">
              tab={activeTab}
            </code>
          </div>
        </div>
      </div>

      {/* ============================================================
          TABS CONTENT (Loaded with clean suspense and transitions)
          ============================================================ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Suspense
          fallback={
            <div className="rounded-3xl border border-[#eadfd1] bg-card p-12 text-center text-sm text-muted-foreground animate-pulse">
              <Sparkles className="h-6 w-6 text-primary mx-auto mb-2 opacity-50" />
              Loading {activeSection.label} workspace…
            </div>
          }
        >
          {/* 1. Home Dashboard */}
          <TabsContent value="home" className="space-y-6 focus-visible:outline-none">
            <SimpleDashboard />
          </TabsContent>

          {/* 2. AI Insights */}
          <TabsContent value="insights" className="space-y-6 focus-visible:outline-none">
            <BusinessInsights />
          </TabsContent>

          {/* 3. Analytics */}
          <TabsContent value="analytics" className="space-y-6 focus-visible:outline-none">
            <AnalyticsDashboard />
          </TabsContent>

          {/* 4. Categories */}
          <TabsContent value="categories" className="space-y-6 focus-visible:outline-none">
            <CategoryManager />
          </TabsContent>

          {/* 5. Products Management */}
          <TabsContent value="products" forceMount className="space-y-6 data-[state=inactive]:hidden focus-visible:outline-none">
            {/* Product Form Modal */}
            {showForm && (
              <QuickProductForm onClose={resetForm} editingProduct={editingProduct} />
            )}

            {/* Product Control Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={event => setProductSearch(event.target.value)}
                  placeholder="Search products by title, category, or SKU..."
                  className="pl-10 rounded-full border-[#eadfd1] bg-card text-xs sm:text-sm h-11"
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => setProductSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Bulk Actions Dropdown */}
              {selectedProductIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isBulkUpdating} className="rounded-full border-[#eadfd1]">
                      Bulk Actions ({selectedProductIds.length})
                      <MoreHorizontal className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-[#eadfd1]">
                    <DropdownMenuItem onSelect={() => void handleBulkAction('featured')}>
                      Mark as Featured
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void handleBulkAction('unfeatured')}>
                      Unmark Featured
                    </DropdownMenuItem>
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

            {/* Products Table Card */}
            <div className="rounded-3xl border border-[#eadfd1] bg-card overflow-hidden shadow-sm">
              {isLoading ? (
                <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">
                  Loading catalog inventory…
                </div>
              ) : products.length > 0 ? (
                <>
                  {/* Mobile High-Density Cards */}
                  <div className="block md:hidden divide-y divide-[#eadfd1]">
                    {products.map(product => (
                      <div key={product.id} className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedProductIds.includes(product.id)}
                            onCheckedChange={checked => toggleProductSelection(product.id, checked === true)}
                            aria-label={`Select ${product.name}`}
                            className="mt-1"
                          />
                          <div className="w-16 h-16 bg-[#fbf9f6] border border-[#eadfd1] flex-shrink-0 overflow-hidden rounded-2xl">
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
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif text-base font-medium truncate">{product.name}</h3>
                            <p className="text-xs text-muted-foreground capitalize">
                              {product.category || 'Uncategorized'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-semibold text-sm">₹{product.price.toFixed(2)}</span>
                              {stockBadge(product.stock_quantity)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                            className="flex-1 rounded-full text-xs h-8 border-[#eadfd1]"
                          >
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/product/${product.slug}`, '_blank')}
                            className="rounded-full text-xs h-8 border-[#eadfd1]"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingProductId(product.id)}
                            className="text-destructive hover:bg-rose-50 rounded-full text-xs h-8 px-3"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Luxury Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#fbf9f6] border-b border-[#eadfd1] text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        <tr>
                          <th className="p-4 w-12 text-center">
                            <Checkbox
                              checked={
                                products.length > 0 &&
                                products.every(product => selectedProductIds.includes(product.id))
                              }
                              onCheckedChange={checked =>
                                setSelectedProductIds(current =>
                                  checked
                                    ? [...new Set([...current, ...products.map(p => p.id)])]
                                    : current.filter(id => !products.some(p => p.id === id))
                                )
                              }
                              aria-label="Select all products"
                            />
                          </th>
                          <th className="p-4">Product</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4">Featured</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eadfd1]/70">
                        {products.map(product => (
                          <tr key={product.id} className="hover:bg-[#fbf9f6]/60 transition-colors">
                            <td className="p-4 text-center">
                              <Checkbox
                                checked={selectedProductIds.includes(product.id)}
                                onCheckedChange={checked => toggleProductSelection(product.id, checked === true)}
                                aria-label={`Select ${product.name}`}
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#fbf9f6] border border-[#eadfd1] flex-shrink-0 overflow-hidden rounded-xl">
                                  {product.image_url ? (
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      loading="lazy"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">
                                      No img
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-serif text-base font-semibold text-foreground truncate max-w-[220px]">
                                    {product.name}
                                  </p>
                                  {product.sku && (
                                    <span className="text-[11px] font-mono text-muted-foreground">
                                      SKU: {product.sku}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground capitalize">
                              {product.category?.replace(/[-_]/g, ' ') || '—'}
                            </td>
                            <td className="p-4 font-medium">₹{product.price.toFixed(2)}</td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <Popover
                                  open={stockPopoverProductId === product.id}
                                  onOpenChange={open => {
                                    setStockPopoverProductId(open ? product.id : null);
                                    if (open) setStockDraft(String(product.stock_quantity));
                                  }}
                                >
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted/60 hover:bg-muted transition-colors underline decoration-dotted"
                                      title="Click to edit stock level"
                                    >
                                      {product.stock_quantity}
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-56 rounded-2xl border-[#eadfd1]">
                                    <div className="space-y-3">
                                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Update Inventory
                                      </p>
                                      <Input
                                        type="number"
                                        min="0"
                                        value={stockDraft}
                                        onChange={event => setStockDraft(event.target.value)}
                                        className="rounded-xl text-sm"
                                      />
                                      <Button
                                        size="sm"
                                        className="w-full rounded-full bg-[#2c221e] text-white"
                                        onClick={() => void updateStock(product.id)}
                                      >
                                        Save Stock
                                      </Button>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                {stockBadge(product.stock_quantity)}
                              </div>
                            </td>
                            <td className="p-4">
                              {product.featured ? (
                                <span className="inline-flex items-center rounded-full bg-[#2c221e] text-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                                  Featured
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => window.open(`/product/${product.slug}`, '_blank')}
                                  title="View on storefront"
                                  className="h-8 w-8 rounded-full hover:bg-secondary"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => void duplicateProduct(product)}
                                  title="Duplicate candle"
                                  className="h-8 w-8 rounded-full hover:bg-secondary"
                                >
                                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(product)}
                                  title="Edit candle"
                                  className="h-8 w-8 rounded-full hover:bg-secondary"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingProductId(product.id)}
                                  title="Delete candle"
                                  className="h-8 w-8 rounded-full text-destructive hover:bg-rose-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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
                <div className="p-12 text-center text-muted-foreground space-y-3">
                  <Package className="h-10 w-10 mx-auto opacity-30 text-primary" />
                  <p className="font-serif text-lg">No candles match your search.</p>
                  <Button
                    onClick={() => {
                      setProductSearch('');
                      setShowForm(true);
                    }}
                    className="rounded-full bg-[#2c221e] text-white"
                  >
                    Add a New Candle
                  </Button>
                </div>
              )}
            </div>

            {/* Paginator */}
            {productCount > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
                <p>
                  Showing {productPage * 25 + 1}–{Math.min((productPage + 1) * 25, productCount)} of {productCount} products
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProductPage(page => Math.max(0, page - 1))}
                    disabled={productPage === 0 || isLoading}
                    className="rounded-full text-xs h-8 border-[#eadfd1]"
                  >
                    Previous
                  </Button>
                  <span className="font-medium text-foreground px-2">
                    Page {productPage + 1} of {productPageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProductPage(page => Math.min(productPageCount - 1, page + 1))}
                    disabled={productPage + 1 >= productPageCount || isLoading}
                    className="rounded-full text-xs h-8 border-[#eadfd1]"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* 6. Live Orders */}
          <TabsContent value="orders" className="space-y-6 focus-visible:outline-none">
            <OrdersManagement />
          </TabsContent>

          {/* 7. Offline Invoices */}
          <TabsContent value="invoices" className="space-y-6 focus-visible:outline-none">
            <OfflineInvoiceGenerator />
          </TabsContent>

          {/* 8. Customers */}
          <TabsContent value="users" className="space-y-6 focus-visible:outline-none">
            <UsersManagement />
          </TabsContent>

          {/* 9. Calendar */}
          <TabsContent value="calendar" className="space-y-6 focus-visible:outline-none">
            <CalendarView />
          </TabsContent>

          {/* 10. Blog Stories */}
          <TabsContent value="blogs" className="space-y-6 focus-visible:outline-none">
            <BlogManager />
          </TabsContent>

          {/* 11. Custom Orders */}
          <TabsContent value="custom-orders" className="space-y-6 focus-visible:outline-none">
            <CustomOrdersManager />
          </TabsContent>

          {/* 12. Social Feeds */}
          <TabsContent value="social" className="space-y-6 focus-visible:outline-none">
            <SocialPostsManager />
          </TabsContent>

          {/* 13. Customer Reviews */}
          <TabsContent value="reviews" className="space-y-6 focus-visible:outline-none">
            <ReviewsManagement />
          </TabsContent>

          {/* 14. Stock Inventory */}
          <TabsContent value="inventory" className="space-y-6 focus-visible:outline-none">
            <InventoryManager />
          </TabsContent>

          {/* 15. Coupons */}
          <TabsContent value="coupons" className="space-y-6 focus-visible:outline-none">
            <CouponsManager />
          </TabsContent>

          {/* 16. Newsletter */}
          <TabsContent value="newsletter" className="space-y-6 focus-visible:outline-none">
            <NewsletterManager />
          </TabsContent>

          {/* 17. Store Contacts */}
          <TabsContent value="store-contacts" className="space-y-6 focus-visible:outline-none">
            <StoreContactsManager />
          </TabsContent>
        </Suspense>
      </Tabs>
    </div>
  );
}
