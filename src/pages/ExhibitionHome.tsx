import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowRight, MessageCircle, Minus, Plus, Search, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton';
import { useStorefrontPath } from '@/contexts/StorefrontContext';
import { useToast } from '@/hooks/use-toast';
import { StoreContactSection } from '@/components/mobile-store/StoreContactSection';
import { Product } from '@/types';

const MOOD_FILTERS = [
  { label: 'Fresh', terms: ['fresh', 'citrus', 'lemon', 'bergamot', 'ocean', 'mint', 'eucalyptus', 'clean'] },
  { label: 'Floral', terms: ['floral', 'flower', 'rose', 'jasmine', 'lavender', 'peony', 'lily', 'gardenia'] },
  { label: 'Cosy', terms: ['cosy', 'cozy', 'warm', 'vanilla', 'amber', 'cinnamon', 'musk', 'comfort'] },
  { label: 'Woody', terms: ['wood', 'woody', 'sandalwood', 'cedar', 'oud', 'earthy'] },
  { label: 'Sweet', terms: ['sweet', 'vanilla', 'caramel', 'honey', 'berry', 'chocolate', 'gourmand'] },
];

function productSearchText(product: Product) {
  const notes = product.metadata?.scent_notes;
  const mood = product.metadata?.mood;
  return [product.name, product.category, product.description, typeof notes === 'string' ? notes : '', typeof mood === 'string' ? mood : ''].filter(Boolean).join(' ').toLowerCase();
}

function QuickOrderPick({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const image = product.image_urls?.[0] || product.image_url;
  const inStock = product.stock_quantity > 0;
  const safeQuantity = Math.min(quantity, Math.max(1, product.stock_quantity));
  const message = `Hello! I would like to order ${safeQuantity} x ${product.name} (₹${(product.price * safeQuantity).toFixed(2)}). Please confirm availability, delivery and the final amount.`;
  const whatsappUrl = `https://wa.me/919827310636?text=${encodeURIComponent(message)}`;

  return (
    <article className="w-[72vw] max-w-[250px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#173b38]/10 bg-white shadow-sm sm:w-56">
      <div className="relative aspect-[4/3] bg-[#f3eee5]">
        {image ? <img src={image} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">SERENIQUEE candle</div>}
        {!inStock && <span className="absolute left-3 top-3 rounded-full bg-[#173b38] px-3 py-1 text-xs font-semibold text-white">Sold out</span>}
      </div>
      <div className="p-3.5">
        <h3 className="truncate font-serif text-base font-medium text-[#173b38]">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold">₹{product.price.toFixed(2)}</p>
        {inStock ? <>
          <div className="mt-3 flex h-10 items-center justify-between rounded-lg border border-[#173b38]/15 px-2" aria-label={`Quantity for ${product.name}`}>
            <span className="text-xs text-muted-foreground">Qty</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} aria-label="Decrease quantity" className="flex h-8 w-8 items-center justify-center rounded-md text-[#173b38] disabled:opacity-35"><Minus className="h-4 w-4" /></button>
              <span className="min-w-4 text-center text-sm font-medium" aria-live="polite">{safeQuantity}</span>
              <button type="button" onClick={() => setQuantity((current) => Math.min(Math.min(product.stock_quantity, 10), current + 1))} disabled={quantity >= Math.min(product.stock_quantity, 10)} aria-label="Increase quantity" className="flex h-8 w-8 items-center justify-center rounded-md text-[#173b38] disabled:opacity-35"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173b38] px-3 text-center text-xs font-semibold text-white transition-colors hover:bg-[#24514d]"><MessageCircle className="h-4 w-4" />Quick order on WhatsApp</a>
        </> : <p className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-[#f3eee5] text-xs font-medium text-[#173b38]/65">Currently unavailable</p>}
      </div>
    </article>
  );
}

/** A lightweight, phone-first landing page for visitors arriving from the exhibition QR. */
export default function ExhibitionHome() {
  const { data, isLoading } = useProducts(undefined, undefined, { listing: true, scentMetadata: true });
  const products = data?.pages.flatMap((page) => page.products) ?? [];
  const shopPath = useStorefrontPath('/shop');
  const [search, setSearch] = useState('');
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const popularProducts = products.filter((product) => product.featured).slice(0, 4);
  const quickPicks = popularProducts.length ? popularProducts : products.slice(0, 4);
  const visibleProducts = useMemo(() => {
    if (!activeMood) return products;
    const filter = MOOD_FILTERS.find((item) => item.label === activeMood);
    return filter ? products.filter((product) => {
      const text = productSearchText(product);
      return filter.terms.some((term) => text.includes(term));
    }) : products;
  }, [activeMood, products]);
  const availableMoods = MOOD_FILTERS.filter((filter) => products.some((product) => {
    const text = productSearchText(product);
    return filter.terms.some((term) => text.includes(term));
  }));

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (query) navigate(`${shopPath}?search=${encodeURIComponent(query)}`);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/mobile-store/`;
    try {
      if (navigator.share) await navigator.share({ title: 'SERENIQUEE Candles', text: 'Explore the SERENIQUEE candle collection.', url });
      else {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Store link copied', description: 'Share it with someone who loves a cosy space.' });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') toast({ title: 'Could not share the link', description: 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="overflow-x-clip">
      <SeoHelmet
        title="SERENIQUEE Candles | Explore Our Collection"
        description="Explore handcrafted candles by SERENIQUEE. Browse the collection and send us an order request."
        url="/mobile-store/"
      />

      <section className="relative isolate flex min-h-[calc(88svh-4rem)] items-end overflow-hidden bg-[#173b38] text-white md:min-h-[620px] md:items-center">
        <img
          src="/landing-candles.jpg"
          alt="A warm display of SERENIQUEE candles"
          width={768}
          height={1280}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#102a28]/95 via-[#102a28]/55 to-[#102a28]/10 md:bg-gradient-to-r md:from-[#102a28]/90 md:via-[#102a28]/55 md:to-transparent" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-24 sm:px-8 sm:pb-16 md:px-10 md:py-24">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur-sm sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" /> Handcrafted with care
            </div>
            <h1 className="font-serif text-[2.65rem] font-medium leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
              Find your little<br /><span className="italic text-[#f0d9a8]">moment of calm.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
              Explore the SERENIQUEE collection. Find a candle that feels like you, then send us an order request in a few simple steps.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#collection" className="w-full sm:w-auto">
                <Button className="h-12 w-full bg-[#f0d9a8] px-6 text-sm font-semibold text-[#173b38] hover:bg-[#f5e5c4] sm:w-auto">
                  Explore the collection <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="https://wa.me/919827310636?text=Hello%21%20I%20am%20interested%20in%20your%20candles." target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                <Button variant="outline" className="h-12 w-full border-white/50 bg-white/10 px-6 text-white hover:bg-white/20 hover:text-white sm:w-auto">
                  <MessageCircle className="mr-2 h-4 w-4" /> Ask us on WhatsApp
                </Button>
              </a>
            </div>
            <p className="mt-5 text-xs text-white/70">Order requests are confirmed personally by our team.</p>
          </div>
        </div>
      </section>

      <section id="collection" className="scroll-mt-20 bg-background px-4 py-10 sm:px-8 sm:py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Made to make a moment</p>
              <h2 className="font-serif text-3xl font-medium sm:text-4xl">Explore our candles</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Take a look around and discover the pieces available in our collection.</p>
            </div>
            <Link to={shopPath} className="hidden shrink-0 sm:block">
              <Button variant="outline" className="h-11">View all <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>

          <form onSubmit={handleSearch} role="search" className="mb-7 flex gap-2 sm:mb-9">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candles or scents" aria-label="Search candles or scents" className="h-12 rounded-xl bg-card pl-10 text-base" />
            </div>
            <Button type="submit" className="h-12 rounded-xl bg-[#173b38] px-5 text-white hover:bg-[#24514d]">Search</Button>
          </form>

          {quickPicks.length > 0 && (
            <div className="mb-9 rounded-2xl bg-[#f3eee5]/75 p-4 sm:p-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6d7168]">Fast ordering</p><h3 className="mt-1 font-serif text-xl font-medium text-[#173b38]">{popularProducts.length ? 'Popular picks' : 'Quick picks'}</h3></div>
                <p className="max-w-[135px] text-right text-[11px] leading-4 text-[#173b38]/65">Choose a quantity, then send your request on WhatsApp.</p>
              </div>
              <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">{quickPicks.map((product) => <QuickOrderPick key={product.id} product={product} />)}</div>
            </div>
          )}

          {availableMoods.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-xs font-medium text-[#173b38]/75">Browse by scent mood</p>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" aria-label="Filter candles by scent mood">
                <button type="button" onClick={() => setActiveMood(null)} aria-pressed={!activeMood} className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${!activeMood ? 'border-[#173b38] bg-[#173b38] text-white' : 'border-[#173b38]/20 bg-white text-[#173b38]'}`}>All</button>
                {availableMoods.map((mood) => <button key={mood.label} type="button" onClick={() => setActiveMood(mood.label)} aria-pressed={activeMood === mood.label} className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${activeMood === mood.label ? 'border-[#173b38] bg-[#173b38] text-white' : 'border-[#173b38]/20 bg-white text-[#173b38]'}`}>{mood.label}</button>)}
              </div>
            </div>
          )}

          {isLoading ? <ProductGridSkeleton count={4} /> : visibleProducts.length ? <ProductGrid products={visibleProducts.slice(0, 8)} /> : activeMood ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center"><p className="text-sm text-muted-foreground">No candles in this mood in the current collection view.</p><Button type="button" variant="link" onClick={() => setActiveMood(null)}>Show all candles</Button></div>
          ) : products.length ? <ProductGrid products={products.slice(0, 8)} /> : (
            <div className="rounded-2xl border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">Our collection is being refreshed. Please ask us at the stall.</div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to={shopPath}><Button variant="outline" className="h-12 w-full">View the full collection <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f3eee5] px-5 py-10 text-center sm:px-8 sm:py-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6d7168]">A little something made by hand</p>
        <h2 className="mx-auto mt-3 max-w-lg font-serif text-2xl font-medium leading-snug text-[#173b38] sm:text-3xl">Choose your favourite. We’ll help with the rest.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Add a candle to your bag to send us an order request, or chat with us if you have a question.</p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={shopPath}><Button className="h-12 w-full bg-[#173b38] px-6 text-white hover:bg-[#24514d] sm:w-auto">Browse all candles <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          <Button type="button" variant="outline" onClick={() => void handleShare()} className="h-12 w-full border-[#173b38]/20 bg-white/50 text-[#173b38] hover:bg-white sm:w-auto"><Share2 className="mr-2 h-4 w-4" />Share this collection</Button>
        </div>
      </section>
      <StoreContactSection />
    </div>
  );
}
