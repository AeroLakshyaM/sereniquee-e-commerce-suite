export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-secondary py-24">
        <div className="container-luxury text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Our Story
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl max-w-3xl mx-auto">
            Crafted with Intention, Designed for Serenity
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="container-luxury py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-3xl mb-6">The Beginning</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Sereniquee was born from a simple desire: to create moments of peace
              in an increasingly busy world. What started as a personal passion for
              candle-making in a small kitchen has grown into a boutique collection
              of luxury candles, each one handcrafted with the same care and
              attention to detail.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We believe that the right scent can transform a space, evoke memories,
              and create an atmosphere of calm and comfort. That's why we source
              only the finest ingredients and take the time to perfect each blend.
            </p>
          </div>
          <div className="aspect-square bg-muted">
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-2xl text-muted-foreground/50">Sereniquee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary py-24">
        <div className="container-luxury">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Our Values
            </p>
            <h2 className="font-serif text-3xl md:text-4xl">What We Stand For</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="font-serif text-xl mb-4">Quality</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use 100% natural soy wax, cotton wicks, and premium fragrance
                oils. No synthetic additives, no shortcuts.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-serif text-xl mb-4">Sustainability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our packaging is minimal and recyclable. We believe luxury should
                never come at the expense of our planet.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-serif text-xl mb-4">Craftsmanship</h3>
              <p className="text-muted-foreground leading-relaxed">
                Each candle is hand-poured in small batches, ensuring consistent
                quality and attention to every detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container-luxury py-24">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
            The Process
          </p>
          <h2 className="font-serif text-3xl md:text-4xl">From Wax to Wonder</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Source', desc: 'We carefully select premium, natural ingredients' },
            { step: '02', title: 'Blend', desc: 'Each scent is crafted to create the perfect balance' },
            { step: '03', title: 'Pour', desc: 'Hand-poured in small batches for quality control' },
            { step: '04', title: 'Cure', desc: 'Allowed to cure for optimal scent throw' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <span className="text-4xl font-serif text-muted-foreground/30">{item.step}</span>
              <h3 className="font-serif text-lg mt-4 mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
