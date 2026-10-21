import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, UserCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type InstamojoResponse = { payment_id?: string; payment_request_id?: string };
type InstamojoApi = {
  open: (paymentUrl: string) => void;
  configure: (options: { handlers: {
    onSuccess: (response: InstamojoResponse) => void;
    onFailure: () => void;
    onClose: () => void;
  } }) => void;
};

declare global {
  interface Window { Instamojo?: InstamojoApi }
}

function loadInstamojoCheckout(): Promise<InstamojoApi> {
  if (window.Instamojo) return Promise.resolve(window.Instamojo);
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>('script[data-instamojo-checkout]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://js.instamojo.com/v1/checkout.js';
      script.dataset.instamojoCheckout = 'true';
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', () => window.Instamojo ? resolve(window.Instamojo) : reject(new Error('Instamojo checkout did not load.')), { once: true });
    script.addEventListener('error', () => reject(new Error('Unable to load Instamojo checkout.')), { once: true });
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'user'>('guest');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; type: 'percentage' | 'fixed'; value: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [pendingPaymentOrderId, setPendingPaymentOrderId] = useState<string | null>(() => sessionStorage.getItem('pendingInstamojoOrderId'));

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    specialRequirements: '',
  });
  const shippingAmount = formData.country.trim().toLowerCase() === 'india' ? 100 : 500;
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.min(totalPrice, totalPrice * appliedCoupon.value / 100)
      : Math.min(totalPrice, appliedCoupon.value)
    : 0;
  const discountedSubtotal = Math.max(0, totalPrice - discountAmount);
  const gstAmount = (discountedSubtotal + shippingAmount) * 0.05;
  const grandTotal = discountedSubtotal + shippingAmount + gstAmount;

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    setCouponError('');
    if (!code) return;
    setIsApplyingCoupon(true);
    try {
      const { data: coupon, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();
      if (error) throw error;
      if (coupon.expires_at && new Date(coupon.expires_at) <= new Date()) throw new Error('This coupon has expired.');
      if (coupon.max_uses !== null && (coupon.uses_count ?? 0) >= coupon.max_uses) throw new Error('This coupon has reached its usage limit.');
      if (totalPrice < (coupon.min_order_amount ?? 0)) throw new Error(`Add ₹${((coupon.min_order_amount ?? 0) - totalPrice).toFixed(2)} more to use this coupon.`);
      setAppliedCoupon({ id: coupon.id, code: coupon.code, type: coupon.type as 'percentage' | 'fixed', value: coupon.value });
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error instanceof Error ? error.message : 'Coupon is not valid.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  useEffect(() => {
    if (user) {
      setCheckoutMode('user');
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        postalCode: profile.postal_code || '',
        country: profile.country || '',
        specialRequirements: '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const orderId = query.get('order_id');
    const paymentId = query.get('payment_id');
    const paymentRequestId = query.get('payment_request_id');
    if (!orderId || !paymentId || !paymentRequestId) return;

    void fetch('/api/verify-instamojo-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, paymentId, paymentRequestId }),
    }).then(async response => {
      const result = await response.json() as { paid?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || 'Unable to verify this payment.');
      if (!result.paid) {
        toast({ title: 'Payment is still processing', description: 'We will update your order as soon as Instamojo confirms the payment.' });
        return;
      }
      clearCart();
      sessionStorage.removeItem('pendingInstamojoOrderId');
      setPendingPaymentOrderId(null);
      toast({ title: 'Payment confirmed', description: 'Thank you. Your paid order is being prepared.' });
      navigate(user ? '/profile' : '/');
    }).catch(error => {
      toast({ title: 'Payment verification pending', description: error instanceof Error ? error.message : 'Please wait while we confirm your payment.' });
    });
  }, [clearCart, navigate, toast, user]);

  const verifyPayment = async (orderId: string, paymentId: string, paymentRequestId: string) => {
    const response = await fetch('/api/verify-instamojo-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, paymentId, paymentRequestId }),
    });
    const result = await response.json() as { paid?: boolean; error?: string };
    if (!response.ok) throw new Error(result.error || 'Unable to verify this payment.');
    if (!result.paid) return false;
    clearCart();
    sessionStorage.removeItem('pendingInstamojoOrderId');
    setPendingPaymentOrderId(null);
    toast({ title: 'Payment confirmed', description: 'Thank you. Your paid order is being prepared.' });
    navigate(user ? '/profile' : '/');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }

    const shippingAddress = `${formData.fullName}\n${formData.address}\n${formData.city}, ${formData.postalCode}\n${formData.country}\n${formData.phone}`;

    try {
      const stockCheck = await Promise.all(
        items.map(item =>
          supabase
            .from('products')
            .select('stock_quantity, name')
            .eq('id', item.product.id)
            .single()
        )
      );

      for (const [index, result] of stockCheck.entries()) {
        if (result.error) throw result.error;

        const currentStock = result.data.stock_quantity ?? 0;
        if (items[index].quantity > currentStock) {
          toast({
            title: 'Insufficient stock',
            description: `Sorry, only ${currentStock} of ${result.data.name} are available. Please update your cart.`,
            variant: 'destructive',
          });
          return;
        }
      }

      if (user) {
        await updateProfile.mutateAsync({
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          country: formData.country,
        });
      }

      const createdOrder = pendingPaymentOrderId
        ? { id: pendingPaymentOrderId }
        : await createOrder.mutateAsync({
        items,
        shippingAddress,
        shippingAmount,
        gstAmount,
        discountAmount,
        discountCodeId: appliedCoupon?.id,
        specialRequirements: formData.specialRequirements || null,
        ...(checkoutMode === 'guest' && !user ? {
          guestInfo: {
            email: formData.email,
            name: formData.fullName,
            phone: formData.phone,
          }
        } : {})
      });
      setPendingPaymentOrderId(createdOrder.id);
      sessionStorage.setItem('pendingInstamojoOrderId', createdOrder.id);
      setIsStartingPayment(true);
      const { data: { session } } = await supabase.auth.getSession();
      const paymentResponse = await fetch('/api/create-instamojo-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ orderId: createdOrder.id, guestEmail: formData.email, guestPhone: formData.phone }),
      });
      const paymentResult = await paymentResponse.json() as { paymentUrl?: string; error?: string };
      if (!paymentResponse.ok || !paymentResult.paymentUrl) throw new Error(paymentResult.error || 'Could not create an Instamojo payment link.');

      const instamojo = await loadInstamojoCheckout();
      instamojo.configure({ handlers: {
        onSuccess: response => {
          if (response.payment_id && response.payment_request_id) {
            void verifyPayment(createdOrder.id, response.payment_id, response.payment_request_id).catch(error => {
              toast({ title: 'Payment verification pending', description: error instanceof Error ? error.message : 'We are waiting for Instamojo to confirm your payment.' });
            });
          }
        },
        onFailure: () => toast({ title: 'Payment not completed', description: 'Your order is saved as unpaid. You can try again from checkout.' }),
        onClose: () => toast({ title: 'Checkout closed', description: 'Your order is saved. Complete payment to confirm it.' }),
      } });
      instamojo.open(paymentResult.paymentUrl);
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: 'Unable to start payment',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsStartingPayment(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-luxury py-12 text-center">
        <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Add some candles to your cart to checkout.</p>
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container-luxury py-12">
      <SeoHelmet
        title="Checkout - Complete Your Order - Sereniquee"
        description="Complete your purchase of luxury handmade candles. Secure checkout with multiple payment options and fast shipping. Review your order details."
        keywords="checkout, buy candles, secure payment, complete order, candle purchase"
        url="/checkout"
      />
      <h1 className="font-serif text-3xl md:text-4xl text-center mb-8">Checkout</h1>

      {!user && !authLoading && (
        <div className="max-w-md mx-auto mb-8">
          <Tabs value={checkoutMode} onValueChange={(v) => setCheckoutMode(v as 'guest' | 'user')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="guest" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Guest Checkout
              </TabsTrigger>
              <TabsTrigger value="user" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Sign In
              </TabsTrigger>
            </TabsList>
            <TabsContent value="user" className="mt-6 text-center space-y-4">
              <p className="text-muted-foreground">
                Sign in to track your order and enjoy faster checkout.
              </p>
              <Link to="/auth" state={{ from: '/checkout' }}>
                <Button className="w-full">
                  Sign In or Create Account
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => setCheckoutMode('guest')}
                className="w-full"
              >
                Continue as Guest
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {(checkoutMode === 'guest' || user) && (
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl">Shipping Information</h2>
              {checkoutMode === 'guest' && !user && (
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Guest Checkout
                </span>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!!user}
                    placeholder={user ? user.email || '' : 'your.email@example.com'}
                  />
                  {checkoutMode === 'guest' && !user && (
                    <p className="text-xs text-muted-foreground">
                      Order confirmation will be sent to this email
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequirements" className="flex items-center gap-2">
                  <span>Special Requirements (Optional)</span>
                  <span className="text-xs text-muted-foreground font-normal">- Gift wrapping, custom message, etc.</span>
                </Label>
                <Textarea
                  id="specialRequirements"
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleChange}
                  placeholder="Any special instructions for your order? E.g., gift wrapping, custom message, delivery instructions, personalization requests, etc."
                  rows={4}
                  className="resize-none border-2 focus:border-primary transition-colors"
                />
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <span className="text-primary mt-0.5"></span>
                  <span>
                    Let us know if you have any special requests for this order. We'll do our best to accommodate your needs!
                  </span>
                </p>
              </div>

              <Button
                type="submit"
                disabled={createOrder.isPending || isStartingPayment}
                className="w-full bg-primary text-primary-foreground py-6 hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                {createOrder.isPending || isStartingPayment ? 'Preparing secure payment...' : `Pay ₹${grandTotal.toFixed(2)} with Instamojo`}
              </Button>
            </form>
          </div>

          <div>
            <h2 className="font-serif text-xl mb-6">Order Summary</h2>
            <div className="bg-card p-6 shadow-soft">
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-secondary flex-shrink-0 overflow-hidden">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-sm">{item.product.name}</h3>
                      <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="mb-4 space-y-2">
                  <Label htmlFor="coupon-code">Coupon code</Label>
                  <div className="flex gap-2">
                    <Input id="coupon-code" value={couponCode} onChange={event => setCouponCode(event.target.value)} placeholder="Enter coupon code" disabled={!!appliedCoupon} />
                    <Button type="button" variant="outline" onClick={() => void applyCoupon()} disabled={isApplyingCoupon || !!appliedCoupon}>
                      <Tag className="mr-2 h-4 w-4" />{isApplyingCoupon ? 'Applying...' : appliedCoupon ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                  {couponError && <p className="text-sm text-destructive">{couponError}</p>}
                  {appliedCoupon && <p className="text-sm text-green-600">Coupon {appliedCoupon.code} applied.</p>}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-₹{discountAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₹{shippingAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (5%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="font-serif text-lg">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
