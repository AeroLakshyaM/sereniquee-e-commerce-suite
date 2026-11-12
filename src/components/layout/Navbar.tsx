import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/useProducts';
import { getProductRouteKey, cn } from '@/lib/utils';
import { StorageImage } from '@/components/ui/storage-image';

const QUICK_SEARCH_TAGS = ['Bespoke Box', 'Vanilla', 'Amber', 'Lavender', 'Soy Candle', 'Gift Set'];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll detection for dynamic glassmorphism and subtle compacting
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounce search query so we don't query Supabase on every keystroke
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Only run search query when search bar is open and query is long enough
  const { data: searchData, isFetching: isSearching } = useProducts(
    undefined,
    debouncedQuery || undefined,
    { listing: true, enabled: searchOpen && debouncedQuery.length >= 3 },
  );

  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];
    return (searchData?.pages.flatMap(p => p.products) ?? []).slice(0, 6);
  }, [searchData, debouncedQuery]);

  // Close mobile menu on resize to desktop
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

  // Primary navigation links
  const navLinks = [
    { label: 'Shop', href: '/shop' },
    {
      label: 'Bespoke Boxes',
      href: '/gift-box',
      badge: 'Custom',
      badgeIcon: Sparkles,
    },
    { label: 'Our Story', href: '/about' },
    { label: 'Journal', href: '/blogs' },
    { label: 'Contact', href: '/contact' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b',
          isScrolled
            ? 'bg-background/90 backdrop-blur-md shadow-xs border-border/70 py-0'
            : 'bg-background/95 backdrop-blur-sm border-border/50 py-0.5'
        )}
      >
        <nav className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div
            className={cn(
              'flex items-center justify-between transition-all duration-300 ease-in-out w-full gap-4 md:gap-8',
              isScrolled ? 'h-16 md:h-16' : 'h-16 md:h-20'
            )}
          >
            {/* ─── 1. Brand Identity & Mobile Hamburger ─────────────────── */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mobile Hamburger Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden -ml-1.5 h-10 w-10 text-foreground/80 hover:text-foreground hover:bg-secondary/70 rounded-full transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Brand Logo & Heritage Mark */}
              <Link
                to="/"
                className="group flex flex-col items-start justify-center transition-transform duration-300 hover:scale-[1.01]"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-[0.14em] uppercase text-foreground leading-none transition-colors group-hover:text-amber-800 dark:group-hover:text-amber-400">
                    sereniquee
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600/80 mb-0.5 group-hover:scale-125 transition-transform" />
                </div>
                <span className="text-[8.5px] uppercase tracking-[0.32em] text-muted-foreground font-sans mt-0.5 font-medium transition-colors group-hover:text-foreground/70">
                  Luxury Candles
                </span>
              </Link>
            </div>

            {/* ─── 2. Desktop Navigation Links (Centered, Spacious) ─────── */}
            <div className="hidden md:flex items-center justify-center gap-6 lg:gap-8 xl:gap-10 flex-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'group relative inline-flex items-center gap-1.5 py-1 text-sm font-medium tracking-wide transition-all duration-200',
                      active
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] tracking-wider uppercase bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/70 font-semibold px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5 shadow-2xs group-hover:bg-amber-200/90 dark:group-hover:bg-amber-900/80 transition-colors">
                        {link.badgeIcon && <link.badgeIcon className="h-2.5 w-2.5 text-amber-700 dark:text-amber-400" />}
                        {link.badge}
                      </span>
                    )}
                    {/* Expanding animated underline */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -bottom-1 left-0 h-[2px] bg-amber-700/80 dark:bg-amber-400/80 rounded-full transition-all duration-300 ease-out',
                        active ? 'w-full' : 'w-0 group-hover:w-full'
                      )}
                    />
                  </Link>
                );
              })}

              {/* Discreet Admin Link when Authenticated as Admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    'group relative inline-flex items-center gap-1 py-1 text-sm font-medium tracking-wide text-amber-700 dark:text-amber-400 hover:text-amber-900 transition-colors',
                    isLinkActive('/admin') ? 'font-semibold' : ''
                  )}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Admin</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -bottom-1 left-0 h-[2px] bg-amber-600 rounded-full transition-all duration-300 ease-out',
                      isLinkActive('/admin') ? 'w-full' : 'w-0 group-hover:w-full'
                    )}
                  />
                </Link>
              )}
            </div>

            {/* ─── 3. Right Action Utility Suite ────────────────────────── */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Search Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary/70',
                  searchOpen && 'bg-secondary text-foreground ring-1 ring-border'
                )}
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search store"
                title="Search collection (Esc to close)"
              >
                <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </Button>

              {/* User Account / Profile */}
              <Link to={user ? '/profile' : '/auth'}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  aria-label={user ? 'My Profile' : 'Sign In'}
                  title={user ? 'My Profile' : 'Sign In'}
                >
                  <User className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  {user && (
                    <span
                      className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background"
                      title="Signed in"
                    />
                  )}
                </Button>
              </Link>

              {/* Cart Drawer Trigger with Animated Badge */}
              <Button
                variant="ghost"
                size="icon"
                className="group relative h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                onClick={() => setIsCartOpen(true)}
                aria-label="View shopping bag"
                title="Shopping Bag"
              >
                <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px] transition-transform duration-300 group-hover:scale-110" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-700 text-white text-[10px] font-semibold flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </nav>

        {/* ─── Search Bar Slide-Down Overlay ────────────────────────────── */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                    setDebouncedQuery('');
                    setSearchOpen(false);
                  }
                }}
                className="relative"
              >
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search candles, fragrances, wax melts, gift hampers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-10 py-6 text-sm sm:text-base w-full bg-secondary/40 border-border/80 focus-visible:ring-amber-700/40 rounded-xl"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedQuery('');
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>

              {/* Quick Suggestion Chips */}
              {!searchQuery && (
                <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                  <span className="font-medium">Trending:</span>
                  {QUICK_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag);
                        setDebouncedQuery(tag);
                      }}
                      className="px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors text-[11px]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Searching spinner */}
              {isSearching && debouncedQuery && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                  Searching handcrafted collection...
                </div>
              )}

              {/* Search Results Dropdown */}
              {debouncedQuery && !isSearching && searchResults.length > 0 && (
                <div className="mt-4 bg-background border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in-50 duration-200">
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          navigate(`/product/${getProductRouteKey(product)}`);
                          setSearchQuery('');
                          setDebouncedQuery('');
                          setSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-4 p-3.5 hover:bg-secondary/60 transition-colors text-left group"
                      >
                        <div className="shrink-0 w-14 h-14 bg-muted rounded-lg overflow-hidden border border-border/50">
                          {product.image_url ? (
                            <StorageImage
                              src={product.image_url}
                              widths={[128, 256]}
                              defaultWidth={160}
                              sizes="56px"
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2.5 mt-1">
                            <span className="text-sm font-semibold text-foreground">₹{product.price}</span>
                            {product.stock_quantity !== undefined && (
                              <span
                                className={`text-[11px] ${
                                  product.stock_quantity === 0
                                    ? 'text-destructive font-medium'
                                    : product.stock_quantity <= 5
                                      ? 'text-amber-600 font-medium'
                                      : 'text-emerald-600'
                                }`}
                              >
                                {product.stock_quantity === 0
                                  ? 'Out of stock'
                                  : product.stock_quantity <= 5
                                    ? `Only ${product.stock_quantity} left`
                                    : 'In stock'}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchQuery('');
                      setDebouncedQuery('');
                      setSearchOpen(false);
                    }}
                    className="w-full p-3 text-xs sm:text-sm text-center text-amber-800 dark:text-amber-300 hover:bg-secondary transition-colors font-medium border-t border-border"
                  >
                    View all results for &ldquo;{searchQuery}&rdquo; →
                  </button>
                </div>
              )}

              {/* No results message */}
              {debouncedQuery && !isSearching && searchResults.length === 0 && (
                <div className="mt-4 p-5 bg-secondary/30 border border-border/70 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground">
                    No candles or scents matched &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try searching for <span className="text-foreground font-medium">Vanilla</span>, <span className="text-foreground font-medium">Gift Box</span>, or browse the entire catalog.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 px-1">
                <span>Press Enter to search</span>
                <span>Press Esc to close</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── Mobile Navigation Drawer (Enhanced Aesthetic) ──────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Backdrop with smooth blur */}
          <div
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="absolute top-0 left-0 h-full w-[300px] max-w-[85vw] bg-background border-r border-border overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            {/* Header with Close */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-[0.14em] uppercase">sereniquee</span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Artisan Luxury</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-secondary"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-1.5 p-5">
              <Link
                to="/"
                className={cn(
                  'text-sm font-medium transition-colors py-2.5 px-3.5 rounded-lg flex items-center justify-between',
                  location.pathname === '/'
                    ? 'bg-secondary font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Home</span>
              </Link>
              <Link
                to="/shop"
                className={cn(
                  'text-sm font-medium transition-colors py-2.5 px-3.5 rounded-lg flex items-center justify-between',
                  location.pathname === '/shop'
                    ? 'bg-secondary font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Shop Collection</span>
              </Link>
              <Link
                to="/gift-box"
                className="text-sm font-medium text-amber-900 bg-amber-50/90 border border-amber-200/80 hover:bg-amber-100 transition-colors py-2.5 px-3.5 rounded-lg flex items-center justify-between shadow-2xs"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-700" />
                  <span>Build Gift Box</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full">
                  Custom
                </span>
              </Link>
              <Link
                to="/blogs"
                className={cn(
                  'text-sm font-medium transition-colors py-2.5 px-3.5 rounded-lg flex items-center justify-between',
                  location.pathname.startsWith('/blogs')
                    ? 'bg-secondary font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Journal</span>
              </Link>
              <Link
                to="/about"
                className={cn(
                  'text-sm font-medium transition-colors py-2.5 px-3.5 rounded-lg flex items-center justify-between',
                  location.pathname === '/about'
                    ? 'bg-secondary font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Our Story</span>
              </Link>
              <Link
                to="/contact"
                className={cn(
                  'text-sm font-medium transition-colors py-2.5 px-3.5 rounded-lg flex items-center justify-between',
                  location.pathname === '/contact'
                    ? 'bg-secondary font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Contact</span>
              </Link>
              <Link
                to="/faq"
                className={cn(
                  'text-sm font-medium transition-colors py-2.5 px-3.5 rounded-lg flex items-center justify-between',
                  location.pathname === '/faq'
                    ? 'bg-secondary font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>FAQ</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    'text-sm font-medium text-amber-800 bg-amber-50/50 hover:bg-amber-100/60 transition-colors py-2.5 px-3.5 rounded-lg flex items-center gap-2',
                    location.pathname.startsWith('/admin') ? 'font-semibold' : ''
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </div>

            {/* Bottom Account & Info Cluster */}
            <div className="mt-auto border-t border-border p-5 space-y-3">
              <Link
                to={user ? '/profile' : '/auth'}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full justify-start h-11" variant="outline">
                  <User className="h-4 w-4 mr-2.5" />
                  <span className="text-sm">{user ? 'My Account' : 'Sign In'}</span>
                  {user && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </Button>
              </Link>
              <p className="text-[11px] text-muted-foreground text-center">
                100% Hand-poured soy candles • Pan-India shipping
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
