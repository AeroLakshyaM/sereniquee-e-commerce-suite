import { useState } from 'react';
import { ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
}

export function VariantSelector({ variants, selectedVariant, onVariantChange }: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  // Group variants by attribute type
  const sizes = [...new Set(variants.filter(v => v.size).map(v => v.size!))];
  const scents = [...new Set(variants.filter(v => v.scent).map(v => v.scent!))];
  const colors = [...new Set(variants.filter(v => v.color).map(v => v.color!))];
  const wickTypes = [...new Set(variants.filter(v => v.wick_type).map(v => v.wick_type!))];

  const [selectedAttributes, setSelectedAttributes] = useState({
    size: selectedVariant?.size || (sizes.length > 0 ? sizes[0] : null),
    scent: selectedVariant?.scent || (scents.length > 0 ? scents[0] : null),
    color: selectedVariant?.color || (colors.length > 0 ? colors[0] : null),
    wick_type: selectedVariant?.wick_type || (wickTypes.length > 0 ? wickTypes[0] : null),
  });

  const findMatchingVariant = (attributes: typeof selectedAttributes) => {
    return variants.find(v => 
      (!v.size || v.size === attributes.size) &&
      (!v.scent || v.scent === attributes.scent) &&
      (!v.color || v.color === attributes.color) &&
      (!v.wick_type || v.wick_type === attributes.wick_type)
    );
  };

  const handleAttributeChange = (attribute: string, value: string) => {
    const newAttributes = { ...selectedAttributes, [attribute]: value };
    setSelectedAttributes(newAttributes);
    
    const matchingVariant = findMatchingVariant(newAttributes);
    if (matchingVariant) {
      onVariantChange(matchingVariant);
    }
  };

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Size</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variantWithSize = variants.find(v => v.size === size);
              const isSelected = selectedAttributes.size === size;
              const isAvailable = variantWithSize && variantWithSize.stock_quantity > 0;

              return (
                <Button
                  key={size}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={!isAvailable}
                  onClick={() => handleAttributeChange('size', size)}
                  className={cn(
                    "relative",
                    !isAvailable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {size}
                  {isSelected && <Check className="ml-1 h-4 w-4" />}
                  {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-px w-full bg-destructive rotate-45" />
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scent Selection */}
      {scents.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Scent</label>
          <div className="flex flex-wrap gap-2">
            {scents.map((scent) => {
              const isSelected = selectedAttributes.scent === scent;
              const variantWithScent = variants.find(v => v.scent === scent);
              const isAvailable = variantWithScent && variantWithScent.stock_quantity > 0;

              return (
                <Button
                  key={scent}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={!isAvailable}
                  onClick={() => handleAttributeChange('scent', scent)}
                  className="capitalize"
                >
                  {scent}
                  {isSelected && <Check className="ml-1 h-4 w-4" />}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Color</label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const isSelected = selectedAttributes.color === color;
              const variantWithColor = variants.find(v => v.color === color);
              const isAvailable = variantWithColor && variantWithColor.stock_quantity > 0;

              return (
                <button
                  key={color}
                  disabled={!isAvailable}
                  onClick={() => handleAttributeChange('color', color)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all",
                    isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border",
                    !isAvailable && "opacity-30 cursor-not-allowed"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {isSelected && (
                    <Check className="w-5 h-5 text-white mx-auto drop-shadow" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Wick Type Selection */}
      {wickTypes.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Wick Type</label>
          <div className="flex flex-wrap gap-2">
            {wickTypes.map((wickType) => {
              const isSelected = selectedAttributes.wick_type === wickType;
              return (
                <Button
                  key={wickType}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAttributeChange('wick_type', wickType)}
                  className="capitalize"
                >
                  {wickType}
                  {isSelected && <Check className="ml-1 h-4 w-4" />}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-2xl">₹{selectedVariant.price.toFixed(2)}</p>
              {selectedVariant.sku && (
                <p className="text-xs text-muted-foreground mt-1">SKU: {selectedVariant.sku}</p>
              )}
            </div>
            <div className="text-right">
              {selectedVariant.stock_quantity > 0 ? (
                <>
                  {selectedVariant.stock_quantity <= 5 && (
                    <Badge variant="destructive" className="mb-1">
                      Only {selectedVariant.stock_quantity} left
                    </Badge>
                  )}
                  {selectedVariant.stock_quantity > 5 && (
                    <Badge variant="secondary">In Stock</Badge>
                  )}
                </>
              ) : (
                <Badge variant="outline" className="text-destructive">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Variant Display Badge Component
export function VariantBadge({ variant }: { variant: ProductVariant }) {
  const attributes = [
    variant.size,
    variant.scent,
    variant.color,
    variant.wick_type,
  ].filter(Boolean);

  if (attributes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {attributes.map((attr, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {attr}
        </Badge>
      ))}
    </div>
  );
}
