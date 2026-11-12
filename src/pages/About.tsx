import { Link } from 'react-router-dom';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Flame,
  Leaf,
  Heart,
  Recycle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Gift,
  Clock,
  Compass,
} from 'lucide-react';

const JOURNEY_MILESTONES = [
  {
    year: 'Early 2025',
    title: 'The Kitchen Studio',
    subtitle: 'Where our craft began',
    description:
      'Frustrated by commercial paraffin candles that smoked and caused headaches, founder Sushiksha Mishra began experimenting with 100% natural soy wax and therapeutic botanical oils in her home atelier.',
    highlight: 'Founded in 2025',
  },
  {
    year: 'Mid 2025',
    title: 'The Clean Wax Formula',
    subtitle: 'Zero compromises on wellness',
    description:
      'We perfected our clean-burning soy wax formula with lead-free braided cotton wicks. We made a strict studio pledge: zero paraffin, zero petroleum derivatives, and zero chemical additives.',
    highlight: '100% Paraffin-Free',
  },
  {
    year: 'Late 2025',
    title: 'Bespoke Hampers & Favors',
    subtitle: 'Thoughtful custom gifting',
    description:
      'We introduced custom-curated hamper boxes and handwritten calligraphy cards for weddings, Diwali, birthdays, and celebrations, helping patrons gift memorable sensory experiences.',
    highlight: 'Custom Gifting Launched',
  },
  {
    year: 'Today',
    title: '500+ Orders & Growing',
    subtitle: 'Illuminating homes across India',
    description:
      'We have now delivered over 500+ orders to candle lovers nationwide. Despite our growth, every single candle is still personally hand-poured in small batches, inspected, and packed in our studio.',
    highlight: '500+ Orders Delivered',
  },
];

const CRAFT_STEPS = [
  {
    step: '01',
    title: 'Ethical Botanical Sourcing',
    desc: 'Pure renewable soy bean wax harvested sustainably, matched with IFRA-certified fine perfume and essential oils.',
    icon: Leaf,
  },
  {
    step: '02',
    title: 'Precision Temperature Blend',
    desc: 'Oils are gently infused into melted wax at exactly 165°F to preserve the delicate top, heart, and base fragrance notes.',
    icon: Compass,
  },
  {
    step: '03',
    title: 'Small-Batch Hand Pouring',
    desc: 'Hand-poured into heavy luxury glass jars in batches of no more than 12 to ensure mirror-smooth tops and centered wicks.',
    icon: Flame,
  },
  {
    step: '04',
    title: 'The 14-Day Slow Cure',
    desc: 'Allowed to rest and cure in our temperature-regulated darkroom, allowing the scent crystals to bond for maximum hot throw.',
    icon: Clock,
  },
];

const BRAND_VALUES = [
  {
    title: 'Pure & Clean Burning',
    description:
      '100% pure botanical soy wax with zero paraffin, petroleum, or synthetic dyes. Burns cleanly for up to 50+ hours without black soot.',
    icon: Leaf,
    badge: 'Clean Air Pledge',
  },
  {
    title: 'Slow Artisanal Living',
    description:
      'We reject assembly-line automation. Each candle is crafted by hand, reflecting the mindfulness and patience we hope it brings to your home.',
    icon: Flame,
    badge: 'Handmade in India',
  },
  {
    title: 'Mindful Gifting',
    description:
      'Candles create memories. We curate rigid gold-foiled magnetic boxes and write personalized calligraphy notes to make every unboxing magical.',
    icon: Gift,
    badge: 'Bespoke Hampers',
  },
  {
    title: 'Sustainable vessels',
    description:
      'Our heavy glass jars and tins are designed to be reused forever — as vanity planters, jewelry holders, or stationery organizers.',
    icon: Recycle,
    badge: 'Zero Waste jars',
  },
];

export default function About() {
  return (
    <div className="overflow-x-hidden">
      <SeoHelmet
        title="Our Story & Artisanal Craft | Sereniquee Luxury Candles"
        description="Discover how Sereniquee transforms pure botanical soy wax into hand-poured luxury candles. Meet founder Sushiksha Mishra and learn about our slow living philosophy."
        keywords="about sereniquee, handmade candles story, soy wax candles india, sushiksha mishra founder, artisan candles india, slow living candles"
        url="/about"
      />

      {/* ─── 1. Hero Editorial Statement ──────────────────────────────── */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50/40 via-background to-secondary/30 dark:from-stone-950/40 dark:via-background dark:to-stone-950/20 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] opacity-10 [background-size:24px_24px]" />
        
        {/* Warm ambient aura */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-200/25 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-luxury relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300/70 text-amber-900 dark:text-amber-200 text-xs uppercase tracking-widest mb-6 animate-fade-in shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
            <span>The Sereniquee Manifesto</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] mb-6 text-foreground">
            Crafted with Intention,
            <span className="italic block mt-1 text-amber-800 dark:text-amber-400"> Poured for Serenity.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-sans font-light mb-10">
            In an accelerating world, we craft a sanctuary of stillness. Hand-poured in small batches using pure botanical soy wax and artisanal fragrances to transform your space into an oasis of warmth.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-foreground/80">
            <span className="flex items-center gap-1.5 bg-background border border-border/80 px-4 py-2 rounded-full shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" /> 100% Pure Soy Wax
            </span>
            <span className="flex items-center gap-1.5 bg-background border border-border/80 px-4 py-2 rounded-full shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" /> Lead-Free Cotton Wicks
            </span>
            <span className="flex items-center gap-1.5 bg-background border border-border/80 px-4 py-2 rounded-full shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" /> Zero Paraffin or Toxins
            </span>
          </div>
        </div>
      </section>

      {/* ─── 2. The Beginning: Origin Story ───────────────────────────── */}
      <section className="container-luxury py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold">
              <Flame className="h-3.5 w-3.5" />
              <span>Where It All Began</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium leading-tight text-foreground">
              A rebellion against <br className="hidden sm:inline" />
              synthetic, rushed living.
            </h2>

            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Sereniquee was never conceived as a corporate brand. It began as an intimate ritual at home: finding solace at the end of exhausting days by lighting a candle, brewing tea, and letting the fragrant flicker slow down the heartbeat of the evening.
            </p>

            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Yet too often, store-bought candles were made with petroleum paraffin, emitted dark soot onto walls, and caused headaches from synthetic stabilizers. We set out to build what didn&apos;t exist: an uncompromisingly clean, earth-honoring, museum-grade soy candle that smells divine and burns cleanly to the very last drop.
            </p>

            <div className="pt-2 border-l-2 border-amber-600 pl-4 text-foreground/90 italic font-serif text-base sm:text-lg">
              &ldquo;We don&apos;t just sell fragrance. We offer an invitation to pause, breathe, and honor the present moment.&rdquo;
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden bg-muted border border-border shadow-xl relative group">
              <picture className="contents">
                <source srcSet="/aboutus-img.webp" type="image/webp" />
                <img
                  src="/aboutus-img.jpg"
                  alt="Sereniquee Hand-Poured Artisan Candles"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="font-serif text-lg font-medium">The Studio Workspace</p>
                  <p className="text-xs text-white/80">Every vessel individually wicked, hand-poured, and inspected</p>
                </div>
              </div>
            </div>
            {/* Subtle decorative floating badge */}
            <div className="absolute -bottom-5 -left-5 bg-background border border-border/80 rounded-xl p-4 shadow-xl hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs uppercase tracking-wider text-foreground">Small-Batch Poured</p>
                <p className="text-[11px] text-muted-foreground">Max 12 candles per pour</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Real Studio Milestones Strip ───────────────────────────── */}
      <section className="border-y border-border/80 bg-[#fbf9f6] dark:bg-card/50 py-10 sm:py-12">
        <div className="container-luxury max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="space-y-1">
              <p className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">2025</p>
              <p className="text-xs uppercase tracking-wider text-[#8c6239] font-semibold">Founded</p>
              <p className="text-[11px] text-muted-foreground">Hand-poured from day one</p>
            </div>
            <div className="space-y-1 border-l border-border/60">
              <p className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#8c6239]">500+</p>
              <p className="text-xs uppercase tracking-wider text-[#8c6239] font-semibold">Orders Delivered</p>
              <p className="text-[11px] text-muted-foreground">To candle lovers across India</p>
            </div>
            <div className="space-y-1 border-l border-border/60">
              <p className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">100%</p>
              <p className="text-xs uppercase tracking-wider text-[#8c6239] font-semibold">Pure Soy Wax</p>
              <p className="text-[11px] text-muted-foreground">Zero paraffin or toxins</p>
            </div>
            <div className="space-y-1 border-l border-border/60">
              <p className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">Max 12</p>
              <p className="text-xs uppercase tracking-wider text-[#8c6239] font-semibold">Small Batch Pour</p>
              <p className="text-[11px] text-muted-foreground">For impeccable quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. The Journey Timeline ──────────────────────────────────── */}
      <section className="bg-gradient-to-b from-secondary/40 via-background to-secondary/20 py-20 md:py-28 border-y border-border/60">
        <div className="container-luxury max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold mb-3">
              Our Journey
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground">
              Milestones of Light & Fragrance
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3">
              From our first small-batch experiments to curating custom hampers for special occasions across India.
            </p>
          </div>

          <div className="relative">
            {/* Center Timeline Spine on Desktop */}
            <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-amber-600/20 via-amber-600/60 to-amber-600/20 -translate-x-1/2" />

            <div className="space-y-8 md:space-y-12">
              {JOURNEY_MILESTONES.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={item.year}
                    className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-12 ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Content Card */}
                    <div className="w-full md:w-1/2">
                      <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-soft hover:border-amber-500/50 transition-all duration-300 space-y-2 group">
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-2xl md:text-3xl font-bold text-amber-700 dark:text-amber-400">
                            {item.year}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-semibold bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 px-2.5 py-1 rounded-full border border-amber-300/60">
                            {item.highlight}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-medium text-foreground pt-1">
                          {item.title}
                        </h3>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                          {item.subtitle}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Timeline Dot Marker */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-amber-600 items-center justify-center shadow-md">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
                    </div>

                    {/* Empty Half to Balance Layout */}
                    <div className="hidden md:block w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Meet the Creator / Founder ────────────────────────────── */}
      <section className="container-luxury py-20 md:py-28">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold mb-3">
            The Artisan
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground">
            The Heart Behind Sereniquee
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            A quiet conversation with our founder, Sushiksha Mishra.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-card via-background to-secondary/30 border border-border/80 rounded-3xl p-6 sm:p-10 md:p-12 shadow-elegant">
            <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-center">
              {/* Founder Image */}
              <div className="mx-auto md:mx-0 w-full max-w-[280px]">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted border border-border/80 shadow-md relative group">
                  <picture className="contents">
                    <source srcSet="/owner-pic.webp" type="image/webp" />
                    <img
                      src="/owner-pic.jpeg"
                      alt="Sushiksha Mishra - Founder & Lead Artisan"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent flex items-end p-4">
                    <span className="text-white text-xs font-serif italic">Lead Artisan & Scent Formulator</span>
                  </div>
                </div>
              </div>

              {/* Founder Bio */}
              <div className="space-y-4 text-left">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                    Sushiksha Mishra
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-medium mt-1">
                    Founder & Lead Artisan
                  </p>
                </div>

                <div className="space-y-3.5 text-muted-foreground text-sm sm:text-base leading-relaxed">
                  <p>
                    &ldquo;I created Sereniquee with a clear, unbending standard: a candle must be far more than molten wax and cotton string. It is a portal to stillness. It alters the texture of the air, softens sharp edges, and calls you back home to yourself.&rdquo;
                  </p>
                  <p>
                    &ldquo;Every morning in our studio, we measure botanical soy flakes, check temperatures with precision, and pour each vessel by hand. We will never rush curing or introduce synthetic shortcuts to scale faster. If it isn&apos;t pure enough to burn beside my own family, it will never enter your home.&rdquo;
                  </p>
                </div>

                {/* Founder Atelier Commitments */}
                <div className="pt-3 border-t border-border/60 grid grid-cols-2 gap-3 text-xs text-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0" />
                    <span>Every batch personally tested</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0" />
                    <span>Zero petroleum paraffin</span>
                  </div>
                </div>

                {/* Signature touch */}
                <div className="pt-2">
                  <p className="font-serif italic text-lg sm:text-xl text-amber-900 dark:text-amber-300">
                    Sushiksha Mishra
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. The 4-Step Artisanal Process ─────────────────────────── */}
      <section className="bg-secondary/40 py-20 md:py-28 border-t border-border/60">
        <div className="container-luxury max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold mb-3">
              The Process
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground">
              From Wax to Wonder
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3">
              Meticulous craftsmanship at every stage of the flame.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CRAFT_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="bg-card border border-border/80 rounded-2xl p-6 sm:p-7 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 space-y-4 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-serif text-3xl font-light text-muted-foreground/30">
                        {step.step}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-medium text-foreground mb-2">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="h-1 w-8 bg-amber-600/30 rounded-full group-hover:w-full group-hover:bg-amber-600 transition-all duration-300" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 6. Brand Values & Integrity ──────────────────────────────── */}
      <section className="container-luxury py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-800 dark:text-amber-400 font-semibold mb-3">
            Our Commitments
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground">
            What We Stand For
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Honoring both the earth and your home with uncompromising standards.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BRAND_VALUES.map((val) => {
            const Icon = val.icon;
            return (
              <div
                key={val.title}
                className="bg-card border border-border/80 rounded-2xl p-6 sm:p-7 space-y-3 hover:border-amber-400/60 hover:shadow-soft transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-800 dark:text-amber-400">
                  {val.badge}
                </span>
                <h3 className="font-serif text-lg font-medium text-foreground">
                  {val.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 7. Invitation CTA Banner ─────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-[#2c221e] via-[#241a17] to-[#1c1411] text-[#fbf8f3] border-t border-amber-900/40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="container-luxury relative z-10 text-center max-w-3xl mx-auto px-4 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Experience The Serenity</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-tight text-[#fbf8f3]">
            Ready to transform your space into <br className="hidden sm:inline" />
            <span className="italic text-amber-300">a sanctuary of calm?</span>
          </h2>

          <p className="text-[#fbf8f3]/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Browse our hand-poured candle collections, or build a bespoke gift hamper complete with brass wick trimmers and custom handwritten notes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-amber-500 text-stone-950 hover:bg-amber-400 font-medium px-8 py-6 rounded-xl shadow-lg shadow-amber-950/40 group">
                Shop The Collection
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/gift-box" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-amber-300/40 text-[#fbf8f3] hover:bg-amber-400/10 px-8 py-6 rounded-xl">
                <Gift className="mr-2 h-4 w-4 text-amber-300" />
                Build A Gift Box
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
