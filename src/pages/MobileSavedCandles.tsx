import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobileFavorites } from '@/contexts/MobileFavoritesContext';
import { useCart } from '@/contexts/CartContext';
import { useStorefrontPath } from '@/contexts/StorefrontContext';

export default function MobileSavedCandles() {
  const { products, removeSaved } = useMobileFavorites();
  const { addItem } = useCart();
  const shopPath = useStorefrontPath('/shop');
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10">
      <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"><Heart className="h-3.5 w-3.5 text-rose-600" /> Your shortlist</p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#173b38]">Saved for later</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Your saved candles stay on this phone. No account needed.</p>
      {!products.length ? (
        <div className="mt-7 rounded-2xl border border-dashed border-[#173b38]/20 bg-[#f3eee5]/60 px-5 py-10 text-center">
          <Heart className="mx-auto h-8 w-8 text-[#173b38]/60" />
          <h2 className="mt-4 font-serif text-xl text-[#173b38]">Keep a few favourites handy</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Tap the heart on any candle to save it here while you explore.</p>
          <Link to={shopPath} className="mt-5 inline-flex"><Button className="h-11 rounded-xl bg-[#173b38] text-white hover:bg-[#24514d]">Browse candles</Button></Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">{products.map((product) => {
          const image = product.image_urls?.[0] || product.image_url;
          const productPath = `/mobile-store/product/${product.slug}`;
          return <article key={product.id} className="flex gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-sm">
            <Link to={productPath} aria-label={`View ${product.name}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">{image ? <img src={image} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-muted-foreground">Candle</span>}</Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link to={productPath} className="truncate font-serif text-base font-medium text-[#173b38]">{product.name}</Link>
              <p className="mt-1 text-sm font-semibold">₹{product.price.toFixed(2)}</p>
              {product.stock_quantity <= 0 && <p className="mt-1 text-xs font-medium text-rose-700">Sold out</p>}
              <div className="mt-auto flex items-center gap-2 pt-2">
                <button type="button" onClick={() => addItem(product, 1)} disabled={product.stock_quantity <= 0} className="inline-flex min-h-9 flex-1 items-center justify-center rounded-lg bg-[#173b38] px-3 text-xs font-semibold text-white disabled:bg-muted disabled:text-muted-foreground">{product.stock_quantity <= 0 ? 'Unavailable' : 'Add to bag'}</button>
                <button type="button" onClick={() => removeSaved(product.id)} aria-label={`Remove ${product.name} from saved candles`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </article>;
        })}</div>
      )}
    </section>
  );
}
