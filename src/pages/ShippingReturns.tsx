import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { Link } from 'react-router-dom';

export default function ShippingReturns() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <SeoHelmet title="Shipping & Returns | Sereniquee Candles" description="How Sereniquee Candles quotes courier shipping, dispatches orders, and handles product concerns." url="/shipping-returns" />
      <main className="container-luxury max-w-4xl">
        <h1 className="mb-4 font-serif text-4xl md:text-5xl">Shipping & Returns</h1>
        <p className="mb-10 text-sm text-muted-foreground">Shipping is quoted after your order because courier charges vary by destination, parcel weight, and courier partner.</p>
        <div className="prose prose-sm md:prose-base max-w-none space-y-8">
          <section>
            <h2>How shipping works</h2>
            <ol>
              <li>Place your order and pay for the products. Shipping is not included in the initial payment.</li>
              <li>We check courier availability and calculate the shipping fee for your delivery address and parcel.</li>
              <li>We email you the courier quote. Review and approve it using the link in that email.</li>
              <li>Pay the quoted shipping fee separately by UPI and submit the transaction reference. We verify it before dispatch.</li>
            </ol>
            <p>If you do not approve the quote, contact us to discuss the order. We will not dispatch an order while its shipping quote is awaiting approval or payment. For cash-on-delivery orders, product payment remains due at delivery; the separately quoted shipping fee must still be approved and paid before dispatch.</p>
          </section>
          <section>
            <h2>Delivery estimates</h2>
            <p>Delivery timing depends on distance and the courier partner. As a general estimate, same-city deliveries within Indore may arrive in under one day, deliveries within Madhya Pradesh often take 2–3 days, and interstate deliveries often take 4–5 days. These are estimates, not guarantees; courier pickup, route, weather, holidays, and service delays can affect arrival.</p>
            <p>We share tracking details after dispatch when the courier provides them. Please provide a complete address and reachable phone number to help avoid delivery delays.</p>
          </section>
          <section>
            <h2>15-day candle satisfaction</h2>
            <p>We want you to be happy with your candle. If you have a concern within 15 days of delivery, contact us with your order number and a description of the issue. We will review it with you and explain the available resolution. This satisfaction period does not promise an automatic refund or exchange; eligibility depends on the circumstances and product condition. Please contact us before sending any item back.</p>
          </section>
          <section>
            <h2>Damaged, incorrect, or missing items</h2>
            <p>Please contact us as soon as possible after delivery and include your order number and clear photos of the item and packaging. We will review the issue and respond with next steps.</p>
          </section>
          <section>
            <h2>Contact</h2>
            <p>For a shipping quote, delivery question, or product concern, use our <Link to="/contact">contact form</Link> or email <a href="mailto:sereniqueecandles@gmail.com">sereniqueecandles@gmail.com</a>. You can also call +91 98273 10636 or +91 87702 22006.</p>
            <p>Sereniquee Candles<br />131, Telephone Nagar Extension, Indore, Madhya Pradesh 452018, India</p>
          </section>
        </div>
      </main>
    </div>
  );
}
