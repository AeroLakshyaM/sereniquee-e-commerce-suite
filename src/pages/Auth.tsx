import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the redirect path from location state
  const from = (location.state as { from?: string })?.from || '/';

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully signed in.',
          });
          navigate(from, { replace: true });
        }
      } else {
        const { error } = await signUp(email, password, fullName, phone);
        if (error) {
          toast({
            title: 'Sign up failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to sereniquee candles, please enjoy your shopping.',
          });
          setIsLogin(true);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center py-6 px-4 bg-secondary">
        <div className="w-full max-w-5xl">
        {/* Main Auth Container */}
        <div className="grid md:grid-cols-2 bg-background shadow-2xl rounded-sm overflow-hidden border border-border">
          
          {/* Left Side - Brand Section */}
          <div className="relative bg-primary text-primary-foreground p-8 lg:p-10 flex flex-col justify-between min-h-[400px] md:min-h-[600px] order-2 md:order-1">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full -translate-y-24 translate-x-24"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground/5 rounded-full translate-y-16 -translate-x-16"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Logo */}
              <Link to="/" className="inline-block mb-6">
                <img 
                  src="/footer_logo.png" 
                  alt="Sereniquee Logo" 
                  className="h-16 lg:h-20 w-16 lg:w-20 object-contain opacity-90 mb-3"
                />
                <h1 className="font-serif text-2xl lg:text-3xl mb-1">sereniquee candles</h1>
                <p className="text-primary-foreground/70 font-serif italic text-xs lg:text-sm">
                  Kindness Crafted, Light Shared.
                </p>
              </Link>

              {/* Description */}
              <div className="mt-8 lg:mt-10 space-y-4 lg:space-y-5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm lg:text-base mb-1">Hand-Poured Luxury</h3>
                    <p className="text-xs lg:text-sm text-primary-foreground/70 leading-relaxed">
                      Each candle is crafted with 100% natural soy wax and premium fragrances.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm lg:text-base mb-1">Sustainable & Eco-Friendly</h3>
                    <p className="text-xs lg:text-sm text-primary-foreground/70 leading-relaxed">
                      Committed to creating beauty that honors the earth.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="relative z-10 space-y-2 lg:space-y-3 mt-8 lg:mt-10 pt-6 lg:pt-8 border-t border-primary-foreground/20">
              <h3 className="font-semibold text-xs lg:text-sm uppercase tracking-wider mb-3">Get In Touch</h3>
              <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-primary-foreground/80">
                <Mail className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                <a href="mailto:sereniqueecandles@gmail.com" className="hover:text-primary-foreground transition-colors truncate">
                  sereniqueecandles@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-primary-foreground/80">
                <Phone className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                <div className="flex flex-col">
                  <span>+91 - 9827310636</span>
                  <span>+91 - 8770222006</span>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-primary-foreground/80">
                <MapPin className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                <span>131, Telephone Nagar Extension, Indore 452018</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="p-6 lg:p-10 flex flex-col justify-center order-1 md:order-2">
            <div className="max-w-md mx-auto w-full">
              {/* Header */}
              <div className="mb-6 lg:mb-8">
                <h2 className="font-serif text-2xl lg:text-3xl mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isLogin 
                    ? 'Sign in to access your account and orders' 
                    : 'Join our community for exclusive offers'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required={!isLogin}
                        className="h-10 lg:h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 - 9827310636"
                        className="h-10 lg:h-11"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="h-10 lg:h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="h-10 lg:h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 lg:h-11 text-sm lg:text-base font-medium"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                      Please wait...
                    </span>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6 lg:my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-muted-foreground">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </span>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full h-10 lg:h-11 border border-border rounded-sm font-medium hover:bg-secondary transition-colors text-sm lg:text-base"
              >
                {isLogin ? 'Create New Account' : 'Sign In Instead'}
              </button>

              {/* Back to Shop */}
              <div className="mt-6 lg:mt-8 text-center">
                <Link 
                  to="/shop" 
                  className="text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                >
                  ← Continue shopping as guest
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
