import { Check, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { useScentPassport } from '@/contexts/ScentPassportContext';

export function ScentPassportButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { hasTried, toggleTried } = useScentPassport();
  const tried = hasTried(product.id);

  return (
    <button
      type="button"
      onClick={() => toggleTried(product)}
      aria-pressed={tried}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors ${tried ? 'border-[#173b38] bg-[#173b38] text-white' : 'border-[#173b38]/20 bg-[#f3eee5] text-[#173b38] hover:bg-[#ebe3d5]'} ${compact ? 'w-full' : ''}`}
    >
      {tried ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      {tried ? 'Smelled · Saved' : 'I smelled this'}
    </button>
  );
}
