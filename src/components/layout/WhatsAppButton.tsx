import { useState } from 'react';

const WhatsAppIcon = () => (
  <svg
    viewBox="0 0 32 32"
    className="h-6 w-6 sm:h-7 sm:w-7"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M16.002 2.003c-7.732 0-14 6.268-14 14 0 2.468.647 4.866 1.878 6.982L2 30l7.155-1.873A13.943 13.943 0 0 0 16.002 30c7.732 0 14-6.268 14-14s-6.268-13.997-14-13.997zm8.21 19.874c-.35.993-2.024 1.908-2.809 1.941-.717.03-1.637.043-2.647-.167-.608-.127-1.388-.451-2.41-.935-4.243-2.06-6.993-6.118-7.205-6.402-.211-.283-1.72-2.285-1.72-4.361 0-2.076 1.108-3.096 1.502-3.527.395-.43.857-.538 1.143-.538.285 0 .571 0 .82.015.26.013.616-.1.966.737.35.835 1.187 2.86 1.29 3.067.103.205.171.444.03.726-.14.283-.212.444-.414.676-.214.256-.452.57-.193 1.114.26.542 1.154 1.897 2.475 3.07 1.702 1.514 3.138 1.984 3.681 2.205.542.221.859.19 1.178-.115.31-.3 1.35-1.4 1.712-1.878.36-.478.719-.4 1.207-.24.488.16 3.084 1.454 3.607 1.718.533.266.888.4 1.017.618.13.218.13 1.262-.221 2.256z"
    />
  </svg>
);

export function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const phoneNumber = '919827310636'; // India format: +91 9827310636
  const message = 'Hello! I am interested in your premium candles.';
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-28 right-6 sm:bottom-32 z-[100] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Chat on WhatsApp"
    >
      {/* Tooltip */}
      <div 
        className={`absolute right-16 top-1/2 -translate-y-1/2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
      >
        Chat with us on WhatsApp
        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-foreground" />
      </div>

      {/* WhatsApp Button */}
      <div className="relative">
        {/* Button */}
        <div className="relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95">
          <WhatsAppIcon />
        </div>

        {/* Notification Badge (optional - uncomment if you want it) */}
        {/* <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          1
        </div> */}
      </div>
    </a>
  );
}
