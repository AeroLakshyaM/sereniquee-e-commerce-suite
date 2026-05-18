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
import { UserCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'user'>('guest');

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

      await createOrder.mutateAsync({
        items,
        shippingAddress,
        specialRequirements: formData.specialRequirements || null,
        ...(checkoutMode === 'guest' && !user ? {
          guestInfo: {
            email: formData.email,
            name: formData.fullName,
            phone: formData.phone,
          }
        } : {})
      });

      // Send the email confirmation via our secure Serverless Function
      try {
        const confirmEmail = user ? user.email : formData.email;
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: confirmEmail,
            subject: 'Order Confirmation - Sereniquee Candles',
            html: `
              <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="https://www.sereniqueecandles.com/footer-logo.png" alt="Sereniquee Candles" style="max-height: 80px; margin-bottom: 15px;" />
                  <h1 style="color: #2c2c2c; margin-bottom: 5px; font-family: serif;">Sereniquee Candles</h1>
                  <p style="color: #666; font-size: 16px; margin-top: 0;">Order Confirmation</p>
                </div>
                
                <p style="color: #444; font-size: 16px;">Hi <strong>${formData.fullName}</strong>,</p>
                <p style="color: #444; font-size: 16px;">Thank you for your purchase! We've received your order and are preparing it for shipment.</p>
                
                <div style="background-color: #fcfcfc; padding: 15px 20px; border-radius: 6px; margin: 25px 0;">
                  <h3 style="color: #333; margin-top: 0; font-family: serif;">Order Summary</h3>
                  <hr style="border: none; border-top: 1px solid #ddd; margin-bottom: 15px;" />
                  <div style="margin-bottom: 15px;">
                    ${items.map(item => `
                      <div style="margin-bottom: 10px; color: #555; text-align: left;">
                        <span>• ${item.product.name} (x${item.quantity})</span>
                        <span style="float: right; color: #333; font-weight: 500;">₹${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    `).join('')}
                  </div>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
                  <div style="font-size: 18px; text-align: left;">
                    <strong style="color: #333;">Total Amount:</strong>
                    <strong style="float: right; color: #000;">₹${totalPrice.toFixed(2)}</strong>
                  </div>
                </div>
                
                <p style="color: #444; font-size: 16px;">We will notify you when your items are shipped.</p>
                <p style="color: #444; font-size: 16px; margin-top: 30px;">Warm regards,<br/><strong>The Sereniquee Team</strong></p>
              </div>
            `
          })
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      clearCart();
      toast({
        title: 'Order placed!',
        description: checkoutMode === 'guest' 
          ? `Order confirmation has been sent to ${formData.email}`
          : 'Thank you for your order. You will receive a confirmation email shortly.',
      });
      
      if (user) {
        navigate('/profile');
      } else {
        navigate('/');
      }
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
                disabled={createOrder.isPending}
                className="w-full bg-primary text-primary-foreground py-6 hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                {createOrder.isPending ? 'Processing...' : `Place Order ₹${totalPrice.toFixed(2)}`}
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
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="font-serif text-lg">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
