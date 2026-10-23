import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowRight, MessageCircle, Search, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton';
import { useStorefrontPath } from '@/contexts/StorefrontContext';
import { useToast } from '@/hooks/use-toast';
import { StoreContactSection } from '@/components/mobile-store/StoreContactSection';

/** A lightweight, phone-first landing page for visitors arriving from the exhibition QR. */
export default function ExhibitionHome() {
  const { data, isLoading } = useProducts(undefined, undefined, { listing: true });
  const products = data?.pages.flatMap((page) => page.products) ?? [];
  const shopPath = useStorefrontPath('/shop');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

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

          {isLoading ? <ProductGridSkeleton count={4} /> : products.length ? <ProductGrid products={products.slice(0, 8)} /> : (
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
