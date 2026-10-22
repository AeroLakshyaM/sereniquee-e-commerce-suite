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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Banknote, CheckCircle2, ClipboardCopy } from 'lucide-react';

const UPI_ID = import.meta.env.VITE_UPI_ID as string | undefined;
const UPI_PAYEE_NAME = (import.meta.env.VITE_UPI_PAYEE_NAME as string | undefined) || 'Sereniquee Candles';
const UPI_QR_IMAGE_URL = import.meta.env.VITE_UPI_QR_IMAGE_URL as string | undefined;
type PendingUpiOrder = { id: string; orderNumber: string | null; amount: number; guestEmail: string; guestName: string };

function loadPendingUpiOrder(): PendingUpiOrder | null {
  try {
    const saved = sessionStorage.getItem('pendingUpiOrder');
    return saved ? JSON.parse(saved) as PendingUpiOrder : null;
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character);
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
  const [pendingPayment, setPendingPayment] = useState<PendingUpiOrder | null>(loadPendingUpiOrder);
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitUtr = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pendingPayment || !utrNumber.trim()) return;
    setIsSubmittingUtr(true);
    try {
      const { data: submitted, error } = await supabase.rpc('submit_upi_payment_utr', {
        p_order_id: pendingPayment.id,
        p_utr: utrNumber.trim(),
        p_guest_email: user ? null : pendingPayment.guestEmail,
      });
      if (error) throw error;
      if (!submitted) throw new Error('Payment details for this order were already submitted or can no longer be changed.');

      const email = user?.email || pendingPayment.guestEmail;
      if (email) {
        try {
          const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
              type: 'order-confirmation',
              subject: `Payment submitted for order ${pendingPayment.orderNumber || pendingPayment.id}`,
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#333"><h1 style="font-family:Georgia,serif">Payment details received</h1><p>Hi ${escapeHtml(pendingPayment.guestName)},</p><p>We received your UPI transaction reference for order <strong>${escapeHtml(pendingPayment.orderNumber || pendingPayment.id)}</strong>.</p><p>Our team will check the transaction and confirm your order after the payment is verified. Your UTR: <strong>${escapeHtml(utrNumber.trim())}</strong></p><p>Warm regards,<br/>The Sereniquee Team</p></div>`,
            }),
          });
          if (!emailResponse.ok) console.error('Payment submission email request failed:', emailResponse.status);
        } catch (emailError) {
          console.error('Payment submission email could not be sent:', emailError);
        }
      }

      clearCart();
      sessionStorage.removeItem('pendingUpiOrder');
      toast({ title: 'Payment submitted for verification', description: 'We will confirm your order after checking the UPI transaction.' });
      navigate(user ? '/profile' : '/');
    } catch (error) {
      toast({ title: 'Could not submit UTR', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmittingUtr(false);
    }
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

      const createdOrder = await createOrder.mutateAsync({
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

      const stockUpdates = await Promise.all(
        items.map(item =>
          supabase.rpc('decrement_stock', {
            product_id: item.product.id,
            qty: item.quantity,
          })
        )
      );

      const stockUpdateError = stockUpdates.find(result => result.error)?.error;
      if (stockUpdateError) throw stockUpdateError;

      if (appliedCoupon) {
        const { error: couponIncrementError } = await supabase.rpc('increment_coupon_uses', { code_id: appliedCoupon.id });
        if (couponIncrementError) throw couponIncrementError;
      }

      const paymentDetails: PendingUpiOrder = {
        id: createdOrder.id,
        orderNumber: createdOrder.order_number || null,
        amount: grandTotal,
        guestEmail: formData.email,
        guestName: formData.fullName,
      };
      sessionStorage.setItem('pendingUpiOrder', JSON.stringify(paymentDetails));
      setPendingPayment(paymentDetails);
      return;
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: 'Order failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (pendingPayment) {
    const upiIntent = UPI_ID
      ? `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${pendingPayment.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${pendingPayment.orderNumber || pendingPayment.id}`)}`
      : undefined;

    return (
      <div className="container-luxury py-12">
        <SeoHelmet title="Pay by UPI - Sereniquee" description="Pay by UPI and submit your transaction reference for manual verification." url="/checkout" />
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Banknote className="h-7 w-7" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl">Pay by UPI</h1>
            <p className="mt-2 text-muted-foreground">Order {pendingPayment.orderNumber || pendingPayment.id}</p>
          </div>

          <div className="grid gap-8 rounded-xl border border-border bg-card p-5 shadow-soft md:grid-cols-2 md:p-8">
            <div className="space-y-5 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Please pay this exact amount</p>
                <p className="mt-1 font-serif text-3xl font-semibold">₹{pendingPayment.amount.toFixed(2)}</p>
              </div>
              {UPI_QR_IMAGE_URL ? (
                <img src={UPI_QR_IMAGE_URL} alt={`UPI payment QR code for ${UPI_PAYEE_NAME}`} className="mx-auto h-80 w-64 rounded-lg border border-border bg-white p-2 object-cover object-center" />
              ) : (
                <div className="mx-auto flex aspect-square w-56 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                  <Banknote className="mb-3 h-8 w-8" />
                  UPI QR code will appear here once payment details are configured.
                </div>
              )}
              {UPI_ID && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Pay to {UPI_PAYEE_NAME}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-medium">{UPI_ID}</span>
                    <Button type="button" variant="ghost" size="icon" aria-label="Copy UPI ID" onClick={() => void navigator.clipboard?.writeText(UPI_ID)}>
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              {upiIntent && <a href={upiIntent} className="inline-flex text-sm font-medium text-primary underline underline-offset-4">Open UPI app</a>}
            </div>

            <div className="space-y-5">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Manual payment verification</AlertTitle>
                <AlertDescription>After paying, enter the UTR or transaction reference shown by your UPI app. We will verify it against the bank transaction before confirming your order.</AlertDescription>
              </Alert>
              {!UPI_QR_IMAGE_URL && !UPI_ID && (
                <Alert variant="destructive">
                  <AlertTitle>UPI details are not configured yet</AlertTitle>
                  <AlertDescription>The store owner needs to add the UPI ID and QR image before customers can pay.</AlertDescription>
                </Alert>
              )}
              <form onSubmit={submitUtr} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="utr-number">UPI UTR / transaction reference</Label>
                  <Input id="utr-number" value={utrNumber} onChange={event => setUtrNumber(event.target.value)} placeholder="Enter the reference from your UPI app" minLength={6} maxLength={64} required />
                  <p className="text-xs text-muted-foreground">Your order stays pending until we verify the payment.</p>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmittingUtr || (!UPI_ID && !UPI_QR_IMAGE_URL)}>
                  {isSubmittingUtr ? 'Submitting…' : 'Submit UTR for verification'}
                </Button>
              </form>
            </div>
          </div>
        </div>
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
        description="Complete your candle order with UPI. Submit your transaction reference for manual payment verification."
        keywords="checkout, buy candles, UPI payment, payment verification, candle purchase"
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
                disabled={createOrder.isPending || !UPI_ID || !UPI_QR_IMAGE_URL}
                className="w-full bg-primary text-primary-foreground py-6 hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                {createOrder.isPending ? 'Processing...' : !UPI_ID || !UPI_QR_IMAGE_URL ? 'UPI payment setup required' : `Continue to UPI payment · ₹${grandTotal.toFixed(2)}`}
              </Button>
              {(!UPI_ID || !UPI_QR_IMAGE_URL) && <p className="text-xs text-muted-foreground">UPI checkout will be available after the store payment ID and QR code are configured.</p>}
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
