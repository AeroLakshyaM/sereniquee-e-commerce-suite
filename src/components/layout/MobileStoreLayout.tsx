import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCart } from '@/contexts/CartContext';
import { StorefrontBasePathProvider, useStorefrontPath } from '@/contexts/StorefrontContext';
import { MobileActionBar } from './MobileActionBar';
import { MobileChatDock } from './MobileChatDock';

function MobileStoreFrame() {
  const { totalItems, setIsCartOpen } = useCart();
  const homePath = useStorefrontPath('/');

  return (
    <div className="min-h-[100svh] bg-background pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-40 border-b border-[#173b38]/10 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link to={homePath} className="font-serif text-base font-semibold tracking-[0.15em] text-[#173b38] sm:text-lg" aria-label="SERENIQUEE mobile store home">SERENIQUEE</Link>
          <button type="button" onClick={() => setIsCartOpen(true)} aria-label={`Open bag${totalItems ? `, ${totalItems} items` : ''}`} className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#173b38] hover:bg-secondary">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#173b38] px-1 text-[9px] text-white">{totalItems}</span>}
          </button>
        </div>
      </header>
      <main className="mx-auto min-h-[calc(100svh-8rem)] max-w-3xl">
        <Outlet />
      </main>
      <CartDrawer />
      <MobileActionBar />
      <MobileChatDock />
    </div>
  );
}

export default function MobileStoreLayout() {
  return <StorefrontBasePathProvider basePath="/mobile-store"><MobileStoreFrame /></StorefrontBasePathProvider>;
}
