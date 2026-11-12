import { cn } from '@/lib/utils';

interface BrandLoaderProps {
  fullScreen?: boolean;
  className?: string;
  label?: string;
}

/**
 * Branded Sereniquee Candles loading screen using the circular atelier emblem,
 * a gentle candle-warmth halo, and a smooth gold/teal progress sweep.
 */
export function BrandLoader({
  fullScreen = true,
  className,
  label = 'Loading Sereniquee Candles',
}: BrandLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'flex flex-col items-center justify-center bg-background px-6 select-none',
        fullScreen ? 'min-h-screen' : 'min-h-[60vh]',
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft warm candle-light glow */}
        <div
          aria-hidden="true"
          className="brand-loader-glow absolute h-44 w-44 rounded-full bg-amber-300/25 blur-2xl dark:bg-amber-500/15"
        />

        {/* Rotating fine gold/teal halo ring */}
        <div
          aria-hidden="true"
          className="brand-loader-ring absolute h-36 w-36 rounded-full border border-[#173b38]/15 border-t-[#c99b42] border-r-[#173b38]/60 sm:h-40 sm:w-40"
        />

        {/* Brand emblem */}
        <img
          src="/footer_logo.png"
          alt="Sereniquee Candles"
          width={144}
          height={144}
          decoding="async"
          className="brand-loader-logo relative h-32 w-32 rounded-full object-contain drop-shadow-sm sm:h-36 sm:w-36"
        />
      </div>

      {/* Subtle gold & teal progress sweep bar */}
      <div
        aria-hidden="true"
        className="mt-7 h-[2px] w-40 overflow-hidden rounded-full bg-[#173b38]/10 sm:w-48"
      >
        <div className="brand-loader-bar h-full w-1/2 rounded-full bg-gradient-to-r from-[#173b38] via-[#c99b42] to-[#173b38]" />
      </div>

      <span className="sr-only">{label}</span>
    </div>
  );
}
