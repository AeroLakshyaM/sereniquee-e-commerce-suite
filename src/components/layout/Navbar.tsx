import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close search on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [searchOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <nav className="px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 relative max-w-7xl mx-auto">
            {/* Mobile: Hamburger Menu (Left) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden animate-slide-down"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ animationDelay: '0.1s' }}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Desktop Navigation - Left */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link
                to="/shop"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors animate-slide-down"
                style={{ animationDelay: '0.1s' }}
              >
                Shop
              </Link>
              <Link
                to="/blogs"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors animate-slide-down"
                style={{ animationDelay: '0.15s' }}
              >
                Journal
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

            {/* Logo - Center on Desktop, Left-Center on Mobile */}
            <Link 
              to="/" 
              className="flex items-center md:absolute md:left-1/2 md:transform md:-translate-x-1/2 animate-slide-down" 
              style={{ animationDelay: '0.2s' }}
            >
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-semibold tracking-wide whitespace-nowrap">
                sereniquee candles
              </span>
            </Link>

            {/* Right side icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="animate-slide-down h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setSearchOpen(!searchOpen)}
                style={{ animationDelay: '0.25s' }}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Link to={user ? '/profile' : '/auth'} className="animate-slide-down" style={{ animationDelay: '0.3s' }}>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="relative animate-slide-down h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setIsCartOpen(true)}
                style={{ animationDelay: '0.4s' }}
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </nav>
        
        {/* Search Bar Dropdown */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for candles, scents, collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-6 text-base w-full"
                  autoFocus
                />
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to search or ESC to close
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sidebar Menu - Outside header for proper overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
          
          {/* Sidebar */}
          <div className="absolute top-0 left-0 h-full w-[280px] bg-background border-r border-border overflow-y-auto shadow-2xl animate-slide-in-right">
            <div className="flex flex-col h-full">
              {/* Header with Close button */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
                <span className="font-serif text-xl font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-9 w-9 hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-2 p-6">
                <Link
                  to="/shop"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 hover:bg-secondary rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  to="/blogs"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 hover:bg-secondary rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Journal
                </Link>
                <Link
                  to="/about"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 hover:bg-secondary rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 hover:bg-secondary rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/faq"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors py-3 px-4 hover:bg-secondary rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-base font-medium text-accent hover:text-accent/80 transition-colors py-3 px-4 hover:bg-secondary rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>

              {/* Account Button at Bottom */}
              <div className="mt-auto border-t border-border p-6">
                <Link
                  to={user ? '/profile' : '/auth'}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full justify-start h-12" variant="outline">
                    <User className="h-5 w-5 mr-3" />
                    <span className="text-base">{user ? 'My Account' : 'Sign In'}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
