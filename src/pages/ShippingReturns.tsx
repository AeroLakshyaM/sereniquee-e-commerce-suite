import { SeoHelmet } from '@/components/layout/SeoHelmet';

export default function ShippingReturns() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <SeoHelmet
        title="Shipping & Returns - Sereniquee Candles"
        description="Learn about Sereniquee's shipping options, delivery times, and hassle-free return policy for our handmade candles. Free shipping available on orders over a certain amount."
        keywords="shipping policy, returns policy, delivery information, free shipping, candle delivery, return process"
        url="/shipping-returns"
      />
      <div className="container-luxury max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-4">Shipping & Returns Policy</h1>
        <p className="text-muted-foreground mb-8">Last Updated: December 25, 2025</p>

        <div className="prose prose-sm md:prose-base max-w-none space-y-8">
          <section>
            <h2 className="font-serif text-2xl md:text-3xl mb-4">Shipping Policy</h2>
            
            <h3 className="font-serif text-xl mb-3">1. Processing Time</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We take pride in handcrafting each candle with care. Please allow:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Standard Orders:</strong> 2-4 business days for order processing and preparation</li>
              <li><strong>Custom/Personalized Orders:</strong> 5-7 business days for order processing</li>
              <li><strong>Bulk Orders (10+ items):</strong> 7-10 business days for order processing</li>
              <li><strong>Peak Seasons:</strong> Processing times may extend by 2-3 additional days during festivals and holidays</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <em>Note: Processing time does not include shipping time. Business days exclude weekends and public holidays.</em>
            </p>

            <h3 className="font-serif text-xl mb-3">2. Shipping Methods & Timeframes</h3>
            
            <h4 className="font-semibold mb-2">Domestic Shipping (Within India)</h4>
            <div className="space-y-4 mb-6">
              <div className="border-l-4 border-amber-500 pl-4 py-2">
                <p className="font-semibold mb-1">Standard Shipping</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                  <li>Delivery: 5-8 business days after dispatch</li>
                  <li>Carriers: India Post, Delhivery, or BlueDart</li>
                  <li>Cost: ₹80 for orders under ₹999</li>
                  <li>FREE for orders ₹999 and above</li>
                </ul>
              </div>

              <div className="border-l-4 border-amber-500 pl-4 py-2">
                <p className="font-semibold mb-1">Express Shipping</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                  <li>Delivery: 2-4 business days after dispatch</li>
                  <li>Carriers: BlueDart, Delhivery Express</li>
                  <li>Cost: ₹150 flat rate</li>
                  <li>Available for metro cities and major urban areas</li>
                </ul>
              </div>
            </div>

            <h4 className="font-semibold mb-2">International Shipping</h4>
            <div className="space-y-4 mb-6">
              <div className="border-l-4 border-amber-500 pl-4 py-2">
                <p className="font-semibold mb-1">International Standard</p>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                  <li>Delivery: 10-21 business days after dispatch</li>
                  <li>Carriers: India Post International, DHL, FedEx</li>
                  <li>Cost: Calculated at checkout based on destination and weight</li>
                  <li>Customs duties and taxes are the responsibility of the recipient</li>
                </ul>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Important:</strong> International shipping times may vary based on customs clearance and local delivery 
              services. We are not responsible for delays caused by customs or international carriers.
            </p>

            <h3 className="font-serif text-xl mb-3">3. Shipping Costs</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Shipping charges are calculated based on weight, dimensions, and destination</li>
              <li>Total shipping cost will be displayed at checkout before payment</li>
              <li>FREE shipping promotions apply only to standard domestic shipping</li>
              <li>Express and international shipping are excluded from free shipping offers</li>
              <li>Additional charges may apply for remote or hard-to-reach locations</li>
            </ul>

            <h3 className="font-serif text-xl mb-3">4. Order Tracking</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Once your order is dispatched, you will receive:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Shipping confirmation email with tracking number</li>
              <li>Direct link to track your package</li>
              <li>Carrier name and estimated delivery date</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <em>Note: Tracking information may take 24-48 hours to become active after dispatch.</em>
            </p>

            <h3 className="font-serif text-xl mb-3">5. Delivery</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Address Accuracy:</strong> Please ensure your shipping address is complete and accurate. We are not 
              responsible for delays or failed deliveries due to incorrect addresses</li>
              <li><strong>Delivery Attempts:</strong> Carriers typically make 2-3 delivery attempts. Contact the carrier directly 
              if you miss a delivery</li>
              <li><strong>Signature Requirements:</strong> Some carriers may require signatures for high-value orders</li>
              <li><strong>Safe Place Delivery:</strong> If you won't be home, you can provide special delivery instructions during 
              checkout</li>
              <li><strong>Risk of Loss:</strong> Risk of loss and title for products pass to you upon delivery to the carrier</li>
            </ul>

            <h3 className="font-serif text-xl mb-3">6. Shipping Restrictions</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We currently do not ship to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>PO Boxes (for certain carriers and locations)</li>
              <li>Military APO/FPO addresses (currently unavailable)</li>
              <li>Countries with import restrictions on candles or fragrance products</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <em>Please contact us if you're unsure whether we can ship to your location.</em>
            </p>

            <h3 className="font-serif text-xl mb-3">7. Lost or Damaged Shipments</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Lost Packages:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>If your package is lost in transit, contact us within 30 days of the order date</li>
              <li>We will work with the carrier to locate your package</li>
              <li>If not found within 15 days, we will offer a replacement or full refund</li>
            </ul>

            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Damaged Packages:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Inspect your package immediately upon delivery</li>
              <li>If damaged, take photos of the packaging and product</li>
              <li>Contact us within 48 hours with photos and order number</li>
              <li>We will arrange for replacement or refund after verification</li>
            </ul>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="font-serif text-2xl md:text-3xl mb-4">Returns & Refunds Policy</h2>

            <h3 className="font-serif text-xl mb-3">1. Return Eligibility</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We want you to be completely satisfied with your purchase. You may return products within <strong>7 days</strong> 
              of delivery if:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>The product is defective or damaged</li>
              <li>You received the wrong product</li>
              <li>The product significantly differs from its description</li>
              <li>The product arrived broken or melted</li>
            </ul>

            <h3 className="font-serif text-xl mb-3">2. Non-Returnable Items</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The following items cannot be returned or exchanged:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Used or Burned Candles:</strong> Candles that have been lit or used in any way</li>
              <li><strong>Custom/Personalized Orders:</strong> Items made to your specific requirements</li>
              <li><strong>Sale or Clearance Items:</strong> Products marked as final sale</li>
              <li><strong>Gift Cards:</strong> Non-refundable and non-exchangeable</li>
              <li><strong>Products Without Original Packaging:</strong> Items must be in original, unused condition with all packaging intact</li>
              <li><strong>Hygiene Products:</strong> Products where seals have been broken</li>
            </ul>

            <h3 className="font-serif text-xl mb-3">3. Return Conditions</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To be eligible for a return, products must:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Be in original, unused, and unburned condition</li>
              <li>Have all original packaging, labels, and tags intact</li>
              <li>Include proof of purchase (order number or receipt)</li>
              <li>Be returned within 7 days of delivery date</li>
              <li>Not show signs of use, wear, or damage caused by customer</li>
            </ul>

            <h3 className="font-serif text-xl mb-3">4. How to Initiate a Return</h3>
            <ol className="list-decimal pl-6 space-y-3 text-muted-foreground mb-4">
              <li>
                <strong>Contact Us:</strong> Email sereniqueecandles@gmail.com or call +91-9827310636 within 7 days of delivery
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>Provide: Order number, reason for return, photos (if damaged/defective)</li>
                </ul>
              </li>
              <li>
                <strong>Await Authorization:</strong> We will review your request and send a Return Authorization (RA) number within 
                1-2 business days
              </li>
              <li>
                <strong>Package Your Return:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>Securely pack the product in original packaging</li>
                  <li>Include RA number inside the package</li>
                  <li>Write RA number on the outside of the package</li>
                </ul>
              </li>
              <li>
                <strong>Ship the Return:</strong> Send to the address provided in your RA email
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>Use a trackable shipping method</li>
                  <li>Keep your shipping receipt</li>
                </ul>
              </li>
            </ol>

            <h3 className="font-serif text-xl mb-3">5. Return Shipping Costs</h3>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg mb-4">
              <p className="text-muted-foreground leading-relaxed mb-2">
                <strong>Defective or Wrong Items:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                <li>We cover return shipping costs</li>
                <li>We will provide a prepaid shipping label or reimburse shipping costs</li>
              </ul>
            </div>

            <div className="bg-secondary/50 p-4 rounded-lg mb-4">
              <p className="text-muted-foreground leading-relaxed mb-2">
                <strong>Customer Preference Returns:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                <li>Customer is responsible for return shipping costs</li>
                <li>We recommend using a trackable shipping method</li>
                <li>Shipping costs are non-refundable</li>
              </ul>
            </div>

            <h3 className="font-serif text-xl mb-3">6. Inspection and Processing</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Once we receive your return:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Inspection:</strong> We will inspect the product within 2-3 business days</li>
              <li><strong>Approval:</strong> If approved, you will be notified via email</li>
              <li><strong>Rejection:</strong> If the return doesn't meet our conditions, we will contact you and may return the 
              item to you at your expense</li>
            </ul>

            <h3 className="font-serif text-xl mb-3">7. Refunds</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Refund Processing:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Approved refunds are processed within 7-10 business days</li>
              <li>Refunds are issued to the original payment method</li>
              <li>The refunded amount includes the product cost (and original shipping if product was defective/wrong)</li>
              <li>For customer preference returns, original shipping charges are not refunded</li>
            </ul>

            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Refund Timeline:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Credit/Debit Cards:</strong> 5-10 business days after processing</li>
              <li><strong>UPI/Net Banking:</strong> 3-7 business days after processing</li>
              <li><strong>Wallets:</strong> 2-5 business days after processing</li>
            </ul>

            <p className="text-muted-foreground leading-relaxed mb-4">
              <em>Note: The time it takes for the refund to appear in your account depends on your payment provider.</em>
            </p>

            <h3 className="font-serif text-xl mb-3">8. Exchanges</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not offer direct product exchanges. If you wish to exchange a product:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Return the original product following our return process</li>
              <li>Once your refund is processed, place a new order for the desired product</li>
            </ol>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Exception:</strong> For defective or wrong items, we may offer a direct replacement if the same product 
              is in stock. Contact us to discuss this option.
            </p>

            <h3 className="font-serif text-xl mb-3">9. Damaged or Defective Products</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you receive a damaged or defective product:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Immediate Action:</strong> Take clear photos of the damage/defect and packaging</li>
              <li><strong>Contact Timeline:</strong> Report the issue within 48 hours of delivery</li>
              <li><strong>Provide Information:</strong> Order number, photos, and description of the issue</li>
              <li><strong>Resolution Options:</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
                  <li>Full refund (including original shipping costs)</li>
                  <li>Free replacement (we cover shipping both ways)</li>
                  <li>Partial refund if you wish to keep the item</li>
                </ul>
              </li>
            </ul>

            <h3 className="font-serif text-xl mb-3">10. Cancellations</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Before Shipping:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Contact us immediately if you wish to cancel</li>
              <li>Orders can be cancelled free of charge if not yet processed</li>
              <li>Full refund will be issued within 5-7 business days</li>
            </ul>

            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>After Shipping:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Orders cannot be cancelled once shipped</li>
              <li>You may refuse delivery or follow our return process once received</li>
              <li>Return shipping costs will apply for customer-initiated cancellations</li>
            </ul>

            <h3 className="font-serif text-xl mb-3">11. Partial Returns</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For orders with multiple items:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>You may return individual items from your order</li>
              <li>Refund will be calculated based on returned items only</li>
              <li>If partial return brings order total below free shipping threshold, shipping charges may be deducted from refund</li>
            </ul>

            <h3 className="font-serif text-xl mb-3">12. International Returns</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For international orders:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Same return conditions apply (7-day window, unused condition)</li>
              <li>Customer is responsible for return shipping costs (unless defective/wrong item)</li>
              <li>Original international shipping charges are non-refundable</li>
              <li>Customs duties and taxes are non-refundable</li>
              <li>Contact us before shipping to receive return authorization</li>
            </ul>

            <h3 className="font-serif text-xl mb-3">13. Store Credit</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As an alternative to refunds, we may offer store credit:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Store credit is valid for 12 months from issue date</li>
              <li>Can be used on any future purchase</li>
              <li>Non-transferable and cannot be redeemed for cash</li>
              <li>May offer additional bonus credit (10-15%) if you opt for store credit over refund</li>
            </ul>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="font-serif text-2xl md:text-3xl mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For questions about shipping or returns, please contact us:
            </p>
            <div className="bg-secondary/50 p-6 rounded-lg space-y-2">
              <p className="text-muted-foreground"><strong>Sereniquee Candles</strong></p>
              <p className="text-muted-foreground">Customer Service Department</p>
              <p className="text-muted-foreground">131 Telephone Nagar Extension, Indore 452018, India</p>
              <p className="text-muted-foreground">Email: sereniqueecandles@gmail.com</p>
              <p className="text-muted-foreground">Phone: +91-9827310636 / +91-8770222006</p>
              <p className="text-muted-foreground">Hours: Monday - Sunday, 7:00 AM - 10:00 PM IST</p>
              <p className="text-muted-foreground mt-4 text-sm">
                <em>We strive to respond to all inquiries within 24 hours during business days.</em>
              </p>
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Our Promise to You</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                At Sereniquee Candles, customer satisfaction is our top priority. Every candle is handcrafted with love and care. 
                If you experience any issues with your order, please reach out to us. We're committed to making things right and 
                ensuring you have a wonderful experience with our products.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
