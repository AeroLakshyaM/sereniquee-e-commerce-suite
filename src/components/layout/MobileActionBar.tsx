import { NavLink, useLocation } from 'react-router-dom';
import { Bookmark, Heart, House, ShoppingBag, Store } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useStorefrontPath } from '@/contexts/StorefrontContext';
import { useScentPassport } from '@/contexts/ScentPassportContext';
import { useMobileFavorites } from '@/contexts/MobileFavoritesContext';

export function MobileActionBar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { products } = useScentPassport();
  const { products: savedProducts } = useMobileFavorites();
  const { pathname } = useLocation();
  const homePath = useStorefrontPath('/');
  const shopPath = useStorefrontPath('/shop');
  const passportPath = useStorefrontPath('/passport');
  const savedPath = useStorefrontPath('/saved');
  const itemClass = 'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium tracking-wide';
  const activeClass = 'text-[#173b38]';
  const inactiveClass = 'text-muted-foreground';

  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-[70] border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(35,32,25,0.07)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-[62px] max-w-lg items-stretch px-3">
        <NavLink to={homePath} aria-current={pathname === homePath ? 'page' : undefined} className={`${itemClass} ${pathname === homePath ? activeClass : inactiveClass}`}>
          <House className="h-5 w-5" strokeWidth={1.8} /><span>Home</span>
        </NavLink>
        <NavLink to={shopPath} className={({ isActive }) => `${itemClass} ${isActive ? activeClass : inactiveClass}`}>
          <Store className="h-5 w-5" strokeWidth={1.8} /><span>Collection</span>
        </NavLink>
        <NavLink to={passportPath} className={({ isActive }) => `${itemClass} ${isActive ? activeClass : inactiveClass}`}>
          <span className="relative"><Bookmark className="h-5 w-5" strokeWidth={1.8} />{products.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#173b38] px-1 text-[9px] text-white">{products.length}</span>}</span><span>Passport</span>
        </NavLink>
        <NavLink to={savedPath} className={({ isActive }) => `${itemClass} ${isActive ? activeClass : inactiveClass}`}>
          <span className="relative"><Heart className="h-5 w-5" strokeWidth={1.8} />{savedProducts.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] text-white">{savedProducts.length}</span>}</span><span>Saved</span>
        </NavLink>
        <button type="button" onClick={() => setIsCartOpen(true)} className={`${itemClass} ${inactiveClass}`} aria-label={`Open bag${totalItems ? `, ${totalItems} items` : ''}`}>
          <span className="relative"><ShoppingBag className="h-5 w-5" strokeWidth={1.8} />{totalItems > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#173b38] px-1 text-[9px] text-white">{totalItems}</span>}</span>
          <span>Your bag</span>
        </button>
      </div>
    </nav>
  );
}
