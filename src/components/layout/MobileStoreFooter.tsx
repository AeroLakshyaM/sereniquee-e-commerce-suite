import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';
import { useStorefrontPath } from '@/contexts/StorefrontContext';

const INSTAGRAM_URL = 'https://www.instagram.com/sereniquee.candles.co';
const WHATSAPP_URL = 'https://wa.me/919827310636?text=Hello%21%20I%20am%20interested%20in%20your%20candles.';

export function MobileStoreFooter() {
  const homePath = useStorefrontPath('/');
  const shopPath = useStorefrontPath('/shop');
  const faqPath = useStorefrontPath('/faq');
  const shippingPath = useStorefrontPath('/shipping-returns');
  const privacyPath = useStorefrontPath('/privacy-policy');

  return (
    <footer className="border-t border-[#173b38]/10 bg-[#f3eee5] px-5 pb-7 pt-8 text-[#173b38] sm:px-8 sm:pt-10">
      <div className="mx-auto max-w-3xl">
        <Link to={homePath} className="inline-flex items-center gap-3" aria-label="sereniquee_candles mobile store home">
          <img src="/footer-logo.png" alt="Sereniquee Candles logo" width="52" height="52" loading="lazy" decoding="async" className="h-[52px] w-[52px] rounded-full object-contain" />
          <span>
            <span className="block font-serif text-base font-extrabold tracking-wide">sereniquee_candles</span>
            <span className="mt-0.5 block text-[11px] tracking-wide text-[#173b38]/60">Kindness Crafted, Light Shared.</span>
          </span>
        </Link>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#173b38]/70">Handcrafted candles for thoughtful moments and cosy spaces.</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#173b38]/15 bg-white/60 px-3 text-sm font-medium transition-colors hover:bg-white">
            <Instagram className="h-4 w-4" /> Follow on Instagram
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#173b38]/15 bg-white/60 px-3 text-sm font-medium transition-colors hover:bg-white">
            <MessageCircle className="h-4 w-4" /> Ask us on WhatsApp
          </a>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#173b38]/70">
          <Link to={shopPath} className="min-h-8 py-2">Browse collection</Link>
          <a href={`${homePath}#stay-in-touch`} className="min-h-8 py-2">Stay in touch</a>
          <Link to={faqPath} className="min-h-8 py-2">FAQs</Link>
          <Link to={shippingPath} className="min-h-8 py-2">Shipping & returns</Link>
          <Link to={privacyPath} className="min-h-8 py-2">Privacy</Link>
        </div>

        <p className="mt-5 border-t border-[#173b38]/10 pt-4 text-[11px] text-[#173b38]/55">© {new Date().getFullYear()} SERENIQUEE Candles</p>
      </div>
    </footer>
  );
}
