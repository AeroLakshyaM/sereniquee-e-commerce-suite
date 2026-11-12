import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useOrders } from '@/hooks/useOrders';
import { useWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import {
  LogOut,
  Package,
  Eye,
  User,
  MapPin,
  Heart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Flame,
  ArrowRight,
  Save,
  Compass,
} from 'lucide-react';
import OrderDetailModal from '@/components/order/OrderDetailModal';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { BrandLoader } from '@/components/layout/BrandLoader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: wishlistItems } = useWishlist();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: '/profile' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        postalCode: profile.postal_code || '',
        country: profile.country || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        country: formData.country,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your details and shipping address have been saved.',
      });
    } catch {
      toast({
        title: 'Update Failed',
        description: 'Unable to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed Out',
      description: 'You have been safely signed out. See you soon!',
    });
    navigate('/');
  };

  if (authLoading || profileLoading) {
    return (
      <>
        <SeoHelmet
          title="My Profile - Account Settings - Sereniquee"
          description="Manage your Sereniquee account, update your profile information, view order history, and track your candle deliveries."
          keywords="my account, profile settings, order history, account management"
          url="/profile"
        />
        <BrandLoader fullScreen={false} />
      </>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60">
            <CheckCircle2 className="h-3 w-3" />
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60">
            <Truck className="h-3 w-3" />
            In Transit
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/60">
            <Flame className="h-3 w-3" />
            Hand-Crafting
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60">
            <Clock className="h-3 w-3" />
            Payment Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200/60">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  const userInitial = formData.fullName
    ? formData.fullName.charAt(0).toUpperCase()
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : 'S';

  const orderCount = orders?.length ?? 0;
  const wishlistCount = wishlistItems?.length ?? 0;

  return (
    <div className="container-luxury py-8 md:py-14 animate-fade-in space-y-10">
      <SeoHelmet
        title="My Account | Sereniquee Luxury Candles"
        description="Manage your orders, track candle deliveries, edit your delivery address, and browse your favorite scents."
        url="/profile"
      />

      {/* ─── Hero Member Header Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-background to-secondary/40 border border-border/80 p-6 md:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar and Identity */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 text-white flex items-center justify-center font-serif text-2xl md:text-3xl font-bold shadow-md shadow-amber-950/20 ring-4 ring-amber-100 dark:ring-amber-950/50">
                {userInitial}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white text-[10px]" title="Active Account">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                  {formData.fullName || 'Sereniquee Patron'}
                </h1>
                <span className="text-[10px] tracking-wider uppercase font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  VIP Member
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Verified Customer Account
              </p>
            </div>
          </div>

          {/* Quick Stats & Sign Out */}
          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6">
            <div className="text-center px-2">
              <p className="font-serif text-2xl font-bold text-foreground">{orderCount}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Orders</p>
            </div>
            <div className="h-8 w-px bg-border/60" />
            <Link to="/wishlist" className="text-center px-2 hover:opacity-80 transition-opacity">
              <p className="font-serif text-2xl font-bold text-foreground">{wishlistCount}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1 justify-center">
                <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                Saved
              </p>
            </Link>
            <div className="h-8 w-px bg-border/60" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive hover:border-destructive/60 transition-colors rounded-xl"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Account Tabs Section ───────────────────────────────────────── */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-secondary/60 p-1 rounded-xl h-auto flex flex-wrap gap-1 max-w-xl border border-border/60">
          <TabsTrigger
            value="orders"
            className="rounded-lg py-2.5 px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            <span>Orders & Tracking ({orderCount})</span>
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="rounded-lg py-2.5 px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            <span>Shipping & Details</span>
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="rounded-lg py-2.5 px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all flex items-center gap-2"
          >
            <Compass className="h-4 w-4" />
            <span>Fragrance Lounge</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Orders & History ──────────────────────────────────── */}
        <TabsContent value="orders" className="space-y-4 focus-visible:outline-none">
          <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-2xs">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/60">
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground">Order Journey & History</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track dispatch status, courier tracking numbers, and view digital tax invoices.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/shop')}
                className="hidden sm:inline-flex rounded-xl"
              >
                Browse Candles
              </Button>
            </div>

            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => {
                  const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={order.id}
                      className="group border border-border/80 rounded-xl p-5 hover:border-amber-500/60 hover:bg-secondary/20 transition-all duration-200 cursor-pointer shadow-2xs"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Order identifier & date */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                            <Package className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-foreground">
                                Order #{order.order_number || order.id.slice(0, 8)}
                              </p>
                              <span className="text-xs text-muted-foreground font-mono">
                                • {dateStr}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Payment: {order.payment_method?.toUpperCase() || 'UPI'} • {order.payment_status?.replace(/_/g, ' ') || 'Pending'}
                            </p>
                            {order.tracking_number && (
                              <p className="text-xs text-amber-800 dark:text-amber-400 font-mono mt-0.5">
                                Tracking: {order.tracking_number}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status, total & Action */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                          <div className="text-left sm:text-right">
                            <p className="font-serif text-lg font-bold text-foreground">
                              ₹{order.total_amount.toLocaleString('en-IN')}
                            </p>
                            <div className="mt-1">
                              {getStatusBadge(order.status)}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderId(order.id);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            <span>Details</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-secondary/30 rounded-xl border border-dashed border-border">
                <Flame className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3 animate-pulse" />
                <h3 className="font-serif text-lg font-medium text-foreground mb-1">
                  No orders placed yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                  Hand-poured fragrances are ready to illuminate your space. Explore our signature collection or design a gift hamper.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={() => navigate('/shop')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  >
                    Start Shopping
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/gift-box')}
                    className="border-amber-300 text-amber-900 hover:bg-amber-50 rounded-xl"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-700" />
                    Build Gift Box
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Tab 2: Profile & Shipping Details ────────────────────────── */}
        <TabsContent value="profile" className="space-y-6 focus-visible:outline-none">
          <form onSubmit={handleSave} className="grid lg:grid-cols-2 gap-8">
            {/* Personal Details */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-2xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
                <User className="h-5 w-5 text-amber-700" />
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">Personal Information</h3>
                  <p className="text-xs text-muted-foreground">Used for order invoices and delivery receipts.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Account Email (Permanent)
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted/70 text-muted-foreground border-border/60 rounded-xl cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="e.g. Lakshya Mishra"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="rounded-xl border-border/80 focus-visible:ring-amber-700/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Phone Number (For Courier Updates)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="rounded-xl border-border/80 focus-visible:ring-amber-700/30 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Default Shipping Address */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-2xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
                <MapPin className="h-5 w-5 text-amber-700" />
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground">Default Shipping Address</h3>
                  <p className="text-xs text-muted-foreground">Pre-filled on checkout for 1-click ordering.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Street Address & Apartment
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="House/Flat No., Road, Landmark"
                    value={formData.address}
                    onChange={handleChange}
                    className="rounded-xl border-border/80 focus-visible:ring-amber-700/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs uppercase tracking-wider text-muted-foreground">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="e.g. New Delhi"
                      value={formData.city}
                      onChange={handleChange}
                      className="rounded-xl border-border/80 focus-visible:ring-amber-700/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="postalCode" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Pincode
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      placeholder="110001"
                      maxLength={6}
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="rounded-xl border-border/80 focus-visible:ring-amber-700/30 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Country
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country || 'India'}
                    onChange={handleChange}
                    className="rounded-xl border-border/80 focus-visible:ring-amber-700/30"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-5 rounded-xl font-medium shadow-sm transition-all"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfile.isPending ? 'Saving Address...' : 'Save Profile & Address'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </TabsContent>

        {/* ─── Tab 3: Fragrance Lounge & Wishlist ────────────────────────── */}
        <TabsContent value="favorites" className="space-y-6 focus-visible:outline-none">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Wishlist Card */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                <Heart className="h-6 w-6 fill-red-500" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground">Saved Wishlist</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You have {wishlistCount} {wishlistCount === 1 ? 'candle' : 'candles'} curated in your personal fragrance wishlist.
              </p>
              <Link to="/wishlist">
                <Button className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                  View Full Wishlist
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>

            {/* Scent Passport Card */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground">Scent Passport</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Explore aroma family recommendations, woody and floral scent profiles tailored to your olfactory palate.
              </p>
              <Link to="/mobile-store/passport">
                <Button variant="outline" className="mt-2 border-amber-300 text-amber-900 hover:bg-amber-50 rounded-xl">
                  Open Scent Passport
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Order Detail Modal (when clicked) ─────────────────────────── */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}
