import { Link } from 'react-router-dom';
import { Instagram, Mail, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container-luxury py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-serif text-2xl md:text-3xl mb-3">Join Our Community</h3>
            <p className="text-primary-foreground/70 mb-6">
              Subscribe for exclusive offers, new scents, and moments of serenity.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-primary-foreground/10 border border-primary-foreground/20 rounded-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground/40 transition-colors"
              />
              <button className="px-6 py-3 bg-primary-foreground text-primary font-medium rounded-sm hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-luxury py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="mb-6">
              <img 
                src="/footer_logo.png" 
                alt="Sereniquee Logo" 
                className="h-32 w-32 object-contain mb-6 opacity-90"
              />
              <h3 className="text-2xl font-serif font-semibold mb-2">sereniquee candles</h3>
              <p className="text-primary-foreground/50 text-sm italic font-serif mb-4">
                Kindness Crafted, Light Shared.
              </p>
            </div>
            <p className="text-primary-foreground/70 max-w-md leading-relaxed mb-6">
              Hand-poured luxury candles crafted with the finest natural ingredients.
              Each candle is designed to transform your space into a sanctuary of calm.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/sereniquee.candles.co?utm_source=qr&igsh=MXFnNXF1b2VnendpZQ==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://facebook.com/sereniquee" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="mailto:sereniqueecandles@gmail.com"
                className="h-10 w-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-[0.2em]">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block text-sm">
                  All Candles
                </Link>
              </li>
              <li>
                <Link to="/shop?category=signature" className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block text-sm">
                  Signature Collection
                </Link>
              </li>
              <li>
                <Link to="/shop?category=seasonal" className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block text-sm">
                  Seasonal Scents
                </Link>
              </li>
              <li>
                <Link to="/shop?category=gift" className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block text-sm">
                  Gift Sets
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-3">
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-[0.2em]">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/about#sustainability" className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block text-sm">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block text-sm">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/50 text-sm">
              © {new Date().getFullYear()} Sereniquee Candles. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-primary-foreground/50">
              <Link to="/privacy" className="hover:text-primary-foreground/70 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary-foreground/70 transition-colors">
                Terms of Service
              </Link>
              <Link to="/shipping" className="hover:text-primary-foreground/70 transition-colors">
                Shipping & Returns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
