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
            <p className="text-muted-foreground leading-relaxed mb-6">
              We believe that the right scent can transform a space, evoke memories,
              and create an atmosphere of calm and comfort. That's why we source
              only the finest ingredients and take the time to perfect each blend.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every Sereniquee candle tells a story—from the carefully selected fragrance 
              notes that evoke different moods and seasons, to the minimalist design that 
              complements any interior. Our candles aren't just products; they're experiences 
              crafted to elevate your everyday moments into something extraordinary.
            </p>
          </div>
          <div className="aspect-square bg-muted">
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-2xl text-muted-foreground/50">Sereniquee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Creator */}
      <section className="container-luxury py-24 border-t border-border">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Meet the Creator
          </p>
          <h2 className="font-serif text-3xl md:text-4xl">The Heart Behind Sereniquee</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border p-8 md:p-12">
            <div className="grid md:grid-cols-[300px_1fr] gap-8 md:gap-12 items-start">
              {/* Profile Image */}
              <div className="mx-auto md:mx-0">
                <div className="aspect-square w-full max-w-[300px] bg-muted rounded-sm overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-4xl text-muted-foreground/30">SK</span>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div>
                <h3 className="font-serif text-2xl mb-2">Sarah Katherine</h3>
                <p className="text-accent text-sm mb-6 uppercase tracking-wider">
                  Founder & Artisan
                </p>
                
                <p className="text-muted-foreground leading-relaxed mb-4">
                  "I've always been captivated by the power of scent—how a single fragrance 
                  can transport you to a cherished memory or create an entirely new atmosphere. 
                  After years in corporate life, I decided to follow my passion and create 
                  something meaningful."
                </p>
                
                <p className="text-muted-foreground leading-relaxed mb-4">
                  With a background in aromatherapy and a love for minimalist design, I founded 
                  Sereniquee in 2020. Each candle is a reflection of my belief that luxury should 
                  be accessible, sustainable, and intentional. I personally oversee every batch, 
                  ensuring that each candle meets the standards I set for my own home.
                </p>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  When I'm not in the studio perfecting new scent blends, you'll find me 
                  exploring nature trails, practicing meditation, or curating playlists for 
                  the perfect candlelit evening. Sereniquee is more than a business—it's my 
                  way of sharing moments of peace and beauty with you.
                </p>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                  <span className="px-4 py-2 bg-secondary text-sm rounded-sm">Certified Aromatherapist</span>
                  <span className="px-4 py-2 bg-secondary text-sm rounded-sm">Sustainability Advocate</span>
                  <span className="px-4 py-2 bg-secondary text-sm rounded-sm">Small Batch Artisan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="container-luxury py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-8">Our Philosophy</h2>
          <p className="text-muted-foreground leading-relaxed text-lg mb-6">
            At Sereniquee, we believe in the art of slow living. In a world that constantly 
            demands more, faster, louder—we offer the opposite. Our candles are an invitation 
            to pause, breathe, and reconnect with yourself.
          </p>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Each product is thoughtfully created to honor both the earth and your well-being. 
            From the ethically sourced ingredients to the recyclable packaging, every decision 
            reflects our commitment to mindful luxury that you can feel good about.
          </p>
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
                We use 100% natural soy wax, premium cotton wicks, and phthalate-free 
                fragrance oils blended with essential oils. No synthetic additives, 
                no paraffin, no shortcuts—just pure, clean burning candles.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-serif text-xl mb-4">Sustainability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our vessels are reusable, our packaging is recyclable, and our 
                ingredients are ethically sourced. We believe luxury should honor 
                the earth, not harm it.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-serif text-xl mb-4">Craftsmanship</h3>
              <p className="text-muted-foreground leading-relaxed">
                Each candle is hand-poured in small batches with meticulous attention 
                to detail. From wick placement to cure time, every step is carefully 
                monitored to ensure perfection.
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
