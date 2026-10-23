import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useScentPassport } from '@/contexts/ScentPassportContext';
import { useStorefrontBasePath, useStorefrontPath } from '@/contexts/StorefrontContext';
import { Product } from '@/types';

function scentNotes(product: Product) {
  const notes = product.metadata?.scent_notes;
  return typeof notes === 'string' ? notes : '';
}

export default function ScentPassport() {
  const { products, clearPassport, removeTried } = useScentPassport();
  const { addItem } = useCart();
  const shopPath = useStorefrontPath('/shop');
  const basePath = useStorefrontBasePath();
  const productPath = (slug: string) => `${basePath}/product/${slug}`;

  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-[#9a7843]" /> Your exhibition shortlist</p>
          <h1 className="mt-2 font-serif text-3xl font-medium text-[#173b38]">Scent Passport</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Save the candles you’ve smelled at the stall. Your list stays on this phone, so you can take your time choosing.</p>
        </div>
        {products.length > 0 && <button type="button" onClick={clearPassport} className="min-h-11 shrink-0 rounded-lg px-2 text-xs font-medium text-muted-foreground underline underline-offset-4">Clear list</button>}
      </div>

      {products.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-dashed border-[#173b38]/20 bg-[#f3eee5]/60 px-5 py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#173b38]"><Sparkles className="h-5 w-5" /></span>
          <h2 className="mt-4 font-serif text-xl text-[#173b38]">Your passport is ready</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">When you find a candle you’ve tried, tap “I smelled this” to save it here.</p>
          <Link to={shopPath} className="mt-5 inline-flex"><Button className="h-11 rounded-xl bg-[#173b38] text-white hover:bg-[#24514d]">Explore candles <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-muted-foreground" aria-live="polite">{products.length} {products.length === 1 ? 'candle' : 'candles'} saved</p>
          {products.map((product) => {
            const image = product.image_urls?.[0] || product.image_url;
            const notes = scentNotes(product);
            return (
              <article key={product.id} className="flex gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-sm">
                <Link to={productPath(product.slug)} aria-label={`View ${product.name}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {image ? <img src={image} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-muted-foreground">Candle</span>}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to={productPath(product.slug)} className="truncate font-serif text-base font-medium text-[#173b38]">{product.name}</Link>
                  {notes && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{notes}</p>}
                  <p className="mt-1 text-sm font-semibold">₹{product.price.toFixed(2)}</p>
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <button type="button" onClick={() => addItem(product, 1)} disabled={product.stock_quantity === 0} className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#173b38] px-3 text-xs font-semibold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" />{product.stock_quantity === 0 ? 'Unavailable' : 'Add to bag'}</button>
                    <button type="button" onClick={() => removeTried(product.id)} aria-label={`Remove ${product.name} from Scent Passport`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
