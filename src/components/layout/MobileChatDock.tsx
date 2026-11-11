import { useState } from 'react';
import { useLocation } from 'react-router-dom';

// ─── WhatsApp SVG icon ────────────────────────────────────────────────────────
const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true" fill="currentColor">
    <path d="M16.002 2.003c-7.732 0-14 6.268-14 14 0 2.468.647 4.866 1.878 6.982L2 30l7.155-1.873A13.943 13.943 0 0 0 16.002 30c7.732 0 14-6.268 14-14s-6.268-13.997-14-13.997zm8.21 19.874c-.35.993-2.024 1.908-2.809 1.941-.717.03-1.637.043-2.647-.167-.608-.127-1.388-.451-2.41-.935-4.243-2.06-6.993-6.118-7.205-6.402-.211-.283-1.72-2.285-1.72-4.361 0-2.076 1.108-3.096 1.502-3.527.395-.43.857-.538 1.143-.538.285 0 .571 0 .82.015.26.013.616-.1.966.737.35.835 1.187 2.86 1.29 3.067.103.205.171.444.03.726-.14.283-.212.444-.414.676-.214.256-.452.57-.193 1.114.26.542 1.154 1.897 2.475 3.07 1.702 1.514 3.138 1.984 3.681 2.205.542.221.859.19 1.178-.115.31-.3 1.35-1.4 1.712-1.878.36-.478.719-.4 1.207-.24.488.16 3.084 1.454 3.607 1.718.533.266.888.4 1.017.618.13.218.13 1.262-.221 2.256z" />
  </svg>
);

const WHATSAPP_NUMBER = '919827310636';

/** Mobile store context-aware message. */
function useMobileMessage(): string {
  const { pathname } = useLocation();

  if (pathname.includes('/product/')) {
    const slug = pathname.split('/product/')[1]?.replace(/-/g, ' ') ?? '';
    const name = slug
      .split(' ')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return `Hi! I'm interested in *${name}* from Sereniquee. Can you help?`;
  }

  if (pathname.includes('/checkout')) {
    return 'Hi! I have a question about my Sereniquee order.';
  }

  return "Hi! I found your store and I'm interested in your candles!";
}

/**
 * Replaces the old MobileChatDock (n8n drag-and-drop widget) with a clean
 * WhatsApp contact button for the mobile storefront.
 */
export function MobileChatDock() {
  const [isVisible, setIsVisible] = useState(true);
  const message = useMobileMessage();
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[5.5rem] right-4 z-[200] flex flex-col items-end gap-2">
      {/* Dismiss button — small × tap target */}
      <button
        onClick={() => setIsVisible(false)}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white text-[10px] leading-none"
        aria-label="Close WhatsApp button"
      >
        ×
      </button>

      {/* WhatsApp link */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg active:scale-95 transition-transform"
      >
        <WhatsAppIcon />
        <span className="text-sm font-semibold">Chat</span>

        {/* Pulsing online ring */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-100" />
        </span>
      </a>
    </div>
  );
}
