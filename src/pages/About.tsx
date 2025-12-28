import { SeoHelmet } from '@/components/layout/SeoHelmet';

export default function About() {
  return (
    <div>
      <SeoHelmet
        title="About Us - Handcrafted Luxury Candles"
        description="Discover the story behind Sereniquee's handmade soy candles. Learn about our commitment to natural ingredients, sustainable practices, and creating moments of serenity in your home."
        keywords="about sereniquee, handmade candle story, luxury candle company, soy candle makers, artisan candles, sustainable candles, eco-friendly candles"
        url="/about"
      />
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
          <div className="aspect-square bg-muted overflow-hidden rounded-sm">
            <img 
              src="/aboutus-img.jpg" 
              alt="Sereniquee Candles" 
              className="w-full h-full object-cover"
            />
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
                  <img 
                    src="/owner-pic.jpeg" 
                    alt="Sarah Katherine - Founder" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Profile Content */}
              <div>
                <h3 className="font-serif text-2xl mb-2">Sushiksha Mishra</h3>
                <p className="text-accent text-sm mb-6 uppercase tracking-wider">
                  Founder & Lead Artisan
                </p>
                
                <p className="text-muted-foreground leading-relaxed mb-4">
                  "I founded Sereniquee with a simple philosophy: a candle is more than just wax and wick—it is 
                  an experience. My journey began with a desire to create something that not only elevates a 
                  room's aesthetic but does so consciously, using eco-friendly materials that honor our environment."
                </p>
                
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Specializing in premium soy wax blends, I personally hand-pour every batch to ensure perfection. 
                  My creative process is driven by a passion for artistic expression and decorative beauty, 
                  transforming everyday moments into aromatic memories. Quality and sustainability aren't just 
                  buzzwords to me; they are the heart of every candle I create.
                </p>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  When I am not in the studio experimenting with new fragrances, you can find me tending to my 
                  garden or exploring traditional art forms, finding inspiration in nature's palette. Sereniquee 
                  is my invitation to you to pause, breathe, and embrace the serenity of the present moment.
                </p>

                
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
