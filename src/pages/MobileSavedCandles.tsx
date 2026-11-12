import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobileFavorites } from '@/contexts/MobileFavoritesContext';
import { useCart } from '@/contexts/CartContext';
import { useStorefrontPath } from '@/contexts/StorefrontContext';
import { getProductRouteKey } from '@/lib/utils';
import { StorageImage } from '@/components/ui/storage-image';
import { ProductImageLightbox } from '@/components/product/ProductImageLightbox';
import { Product } from '@/types';

export default function MobileSavedCandles() {
  const { products, removeSaved } = useMobileFavorites();
  const { addItem } = useCart();
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const storefrontPath = useStorefrontPath;
  const shopPath = storefrontPath('/shop');
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
          const productPath = storefrontPath(`/product/${getProductRouteKey(product)}`);
          return <article key={product.id} className="flex gap-3.5 rounded-[22px] border border-[#eadfd1] bg-[#fdfaf5] p-3.5 shadow-[0_10px_28px_-16px_rgba(44,34,30,0.14)]">
            <button type="button" onClick={() => image && setPreviewProduct(product)} aria-label={`Enlarge image of ${product.name}`} className="h-32 w-28 shrink-0 cursor-zoom-in overflow-hidden rounded-2xl bg-[#f4ede3] sm:h-36 sm:w-32">{image ? <StorageImage src={image} widths={[280, 480]} defaultWidth={360} sizes="128px" alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-muted-foreground">Candle</span>}</button>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link to={productPath} className="truncate font-serif text-base font-semibold text-[#2c221e]">{product.name}</Link>
              {product.description && <p className="mt-0.5 line-clamp-1 text-xs text-[#7c6f63]">{product.description}</p>}
              <p className="mt-1 text-sm font-bold text-[#2c221e]">₹{product.price.toFixed(2)}</p>
              {product.stock_quantity <= 0 && <p className="mt-0.5 text-xs font-medium text-rose-700">Sold out</p>}
              <div className="mt-auto flex items-center gap-2 pt-2">
                <button type="button" onClick={() => addItem(product, 1)} disabled={product.stock_quantity <= 0} className="inline-flex min-h-9 flex-1 items-center justify-center rounded-xl bg-[#bfa07a] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#ad8c64] disabled:bg-muted disabled:text-muted-foreground">{product.stock_quantity <= 0 ? 'Unavailable' : 'Add to Cart'}</button>
                <button type="button" onClick={() => removeSaved(product.id)} aria-label={`Remove ${product.name} from saved candles`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#eadfd1] bg-white text-[#6f5e4d] hover:bg-[#efe3cf]/60"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </article>;
        })}</div>
      )}
      {previewProduct && (
        <ProductImageLightbox
          open={Boolean(previewProduct)}
          onOpenChange={(open) => {
            if (!open) setPreviewProduct(null);
          }}
          images={
            previewProduct.image_urls?.length
              ? previewProduct.image_urls
              : previewProduct.image_url
                ? [previewProduct.image_url]
                : []
          }
          title={previewProduct.name}
          price={previewProduct.price}
          productPath={storefrontPath(`/product/${getProductRouteKey(previewProduct)}`)}
          inStock={previewProduct.stock_quantity > 0}
          onAddToCart={() => addItem(previewProduct, 1)}
        />
      )}
    </section>
  );
}
