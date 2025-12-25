import { Link } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container-luxury">
        <div className="flex items-center justify-between h-16 lg:h-20 relative">
          {/* Desktop Navigation - Left */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/shop"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors animate-slide-down"
              style={{ animationDelay: '0.1s' }}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors animate-slide-down"
              style={{ animationDelay: '0.2s' }}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors animate-slide-down"
              style={{ animationDelay: '0.3s' }}
            >
              Contact
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium text-accent hover:text-accent/80 transition-colors animate-slide-down"
                style={{ animationDelay: '0.4s' }}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Logo - Center */}
          <Link to="/" className="flex items-center absolute left-[45%] transform -translate-x-1/2 animate-slide-down" style={{ animationDelay: '0.2s' }}>
            <span className="text-xl lg:text-2xl font-serif font-semibold tracking-wide">
              sereniquee candles
            </span>
          </Link>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            <Link to={user ? '/profile' : '/auth'} className="animate-slide-down" style={{ animationDelay: '0.3s' }}>
              <Button variant="ghost" size="icon" className="relative">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="relative animate-slide-down"
              onClick={() => setIsCartOpen(true)}
              style={{ animationDelay: '0.4s' }}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden animate-slide-down"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ animationDelay: '0.5s' }}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                to="/shop"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
