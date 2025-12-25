import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container-luxury py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif font-semibold mb-4">Sereniquee</h3>
            <p className="text-primary-foreground/70 max-w-md leading-relaxed">
              Hand-poured luxury candles crafted with the finest natural ingredients.
              Each candle is designed to transform your space into a sanctuary of calm.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  All Candles
                </Link>
              </li>
              <li>
                <Link to="/shop?category=signature" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Signature Collection
                </Link>
              </li>
              <li>
                <Link to="/shop?category=seasonal" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Seasonal Scents
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <a href="mailto:hello@sereniquee.com" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/profile" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  My Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <p className="text-primary-foreground/50 text-sm text-center">
            © {new Date().getFullYear()} Sereniquee Candles. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
