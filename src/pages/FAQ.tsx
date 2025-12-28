import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { SeoHelmet } from '@/components/layout/SeoHelmet';

export default function FAQ() {
  const faqs = [
    {
      category: "Products & Ingredients",
      questions: [
        {
          q: "What are your candles made from?",
          a: "Our candles are made from 100% natural soy wax, premium cotton wicks, and phthalate-free fragrance oils blended with essential oils. We never use paraffin, synthetic additives, or harmful chemicals."
        },
        {
          q: "Are your candles eco-friendly?",
          a: "Yes! We use sustainable soy wax, natural cotton wicks, and recyclable glass vessels. Our packaging is minimal and fully recyclable. We're committed to creating luxury products that honor the earth."
        },
        {
          q: "How long do your candles burn?",
          a: "Our 8oz candles provide approximately 50-60 hours of burn time, while our 12oz candles burn for 80-90 hours. Proper care (trimming the wick, avoiding drafts) helps maximize burn time."
        },
        {
          q: "Are your candles safe for pets?",
          a: "Our candles are made with natural ingredients and phthalate-free fragrances. However, some essential oils can be sensitive for certain pets. We recommend burning candles in well-ventilated areas and monitoring your pets' reactions."
        },
        {
          q: "Do you use real essential oils?",
          a: "Yes, we blend premium fragrance oils with pure essential oils to create complex, long-lasting scents that are also therapeutic and natural."
        }
      ]
    },
    {
      category: "Ordering & Shipping",
      questions: [
        {
          q: "How long does shipping take?",
          a: "Standard shipping takes 5-7 business days within the US. Express shipping (2-3 days) is available at checkout. International shipping times vary by location (10-20 business days)."
        },
        {
          q: "Do you ship internationally?",
          a: "Yes! We currently ship to select countries including Canada, UK, Australia, and most of Europe. Shipping costs and times vary by destination."
        },
        {
          q: "What is your return policy?",
          a: "We offer a 30-day satisfaction guarantee. If you're not completely satisfied, return your unused candle for a full refund or exchange. Please contact us for return authorization before shipping items back."
        },
        {
          q: "Can I track my order?",
          a: "Absolutely! Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account on our website."
        },
        {
          q: "Do you offer gift wrapping?",
          a: "Yes! Select the gift wrapping option at checkout for elegant, sustainable packaging perfect for any occasion. We can also include a personalized gift message."
        }
      ]
    },
    {
      category: "Candle Care & Safety",
      questions: [
        {
          q: "How do I properly care for my candle?",
          a: "For best results: (1) Trim wick to ¼ inch before each burn, (2) Burn for 2-4 hours at a time to create an even melt pool, (3) Keep away from drafts and flammable objects, (4) Never leave burning candles unattended."
        },
        {
          q: "Why is my candle tunneling?",
          a: "Tunneling happens when the first burn doesn't create a full melt pool. Always burn your candle for 2-4 hours on the first use to ensure the wax melts to the edges. This sets the 'memory' for future burns."
        },
        {
          q: "How do I clean my candle vessel for reuse?",
          a: "Once your candle is finished: (1) Pour hot water into the vessel, (2) Let the remaining wax float to the top, (3) Remove hardened wax, (4) Clean with soap and water. Perfect for planters, makeup brushes, or storage!"
        },
        {
          q: "Can I leave my candle burning overnight?",
          a: "No, never leave candles burning unattended or while sleeping. Always extinguish candles before leaving a room or going to bed for safety."
        },
        {
          q: "Why should I trim the wick?",
          a: "Trimming the wick to ¼ inch before each burn prevents smoking, ensures a clean burn, extends candle life, and prevents the flame from getting too large."
        }
      ]
    },
    {
      category: "Account & Orders",
      questions: [
        {
          q: "Do I need an account to place an order?",
          a: "No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, view order history, and receive exclusive offers."
        },
        {
          q: "How do I cancel or modify my order?",
          a: "Contact us immediately at hello@sereniquee.com or through our contact form. We process orders quickly, so we can only modify orders that haven't shipped yet."
        },
        {
          q: "Can I change my shipping address after placing an order?",
          a: "If your order hasn't shipped yet, contact us right away and we'll update your shipping address. Once shipped, we cannot redirect packages."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay through our secure payment processor."
        }
      ]
    },
    {
      category: "About Sereniquee",
      questions: [
        {
          q: "Where are your candles made?",
          a: "All our candles are hand-poured in small batches in our Indore, India studio. Each candle is crafted with care and attention to detail by our founder and team of artisans."
        },
        {
          q: "Are your candles tested on animals?",
          a: "Never. We are proud to be cruelty-free and never test our products on animals. Our ingredients are ethically sourced and vegan-friendly."
        },
        {
          q: "Do you offer wholesale or bulk orders?",
          a: "Yes! We offer wholesale pricing for retailers, wedding planners, and corporate gifts. Contact us at wholesale@sereniquee.com for more information."
        },
        {
          q: "Can I visit your studio?",
          a: "We welcome studio visits by appointment only! Email us to schedule a visit where you can see our candle-making process and explore our full collection."
        },
        {
          q: "Do you offer custom candle scents?",
          a: "We offer custom candle services for special events, weddings, and corporate gifts. Minimum order quantities apply. Contact us to discuss your custom candle needs."
        }
      ]
    }
  ];

  return (
    <div>
      <SeoHelmet
        title="FAQ - Frequently Asked Questions - Sereniquee Candles"
        description="Find answers to common questions about Sereniquee's handmade soy candles, including ingredients, burn times, shipping, returns, and candle care tips."
        keywords="candle faq, soy candle questions, candle care tips, burn time, shipping information, return policy, candle ingredients"
        url="/faq"
      />
      {/* Hero */}
      <section className="bg-secondary py-24">
        <div className="container-luxury text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Help Center
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl max-w-3xl mx-auto mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our candles, shipping, care instructions, and more.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="container-luxury py-24">
        <div className="max-w-4xl mx-auto">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-16 last:mb-0">
              <h2 className="font-serif text-3xl mb-8 pb-4 border-b border-border">
                {category.category}
              </h2>
              
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, faqIndex) => (
                  <AccordionItem 
                    key={faqIndex} 
                    value={`${categoryIndex}-${faqIndex}`}
                    className="border border-border rounded-sm px-6 bg-card"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-6">
                      <span className="font-medium">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="bg-secondary py-16">
        <div className="container-luxury text-center">
          <h2 className="font-serif text-3xl mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our customer support team is here to help.
            Reach out and we'll get back to you within 24 hours.
          </p>
          <Button size="lg" asChild>
            <Link to="/contact">
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Us
            </Link>
          </Button>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="container-luxury py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl mb-8 text-center">Quick Candle Care Tips</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card border border-border rounded-sm">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="font-semibold mb-2">First Burn Matters</h3>
              <p className="text-sm text-muted-foreground">
                Burn for 2-4 hours to create a full melt pool and prevent tunneling.
              </p>
            </div>
            <div className="text-center p-6 bg-card border border-border rounded-sm">
              <div className="text-4xl mb-4">✂️</div>
              <h3 className="font-semibold mb-2">Trim Your Wick</h3>
              <p className="text-sm text-muted-foreground">
                Keep wick at ¼ inch before each burn for a clean, even flame.
              </p>
            </div>
            <div className="text-center p-6 bg-card border border-border rounded-sm">
              <div className="text-4xl mb-4">♻️</div>
              <h3 className="font-semibold mb-2">Reuse Your Vessel</h3>
              <p className="text-sm text-muted-foreground">
                Clean with hot water and reuse as a planter, storage, or decor.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
