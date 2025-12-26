import { useState } from 'react';
import { GiftOption, GiftFormData } from '@/types';
import { useGiftOptions } from '@/hooks/useGiftOptions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Gift, Package, Mail, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GiftOptionsSelectorProps {
  value: GiftFormData;
  onChange: (data: GiftFormData) => void;
}

export function GiftOptionsSelector({ value, onChange }: GiftOptionsSelectorProps) {
  const { data: giftOptions, isLoading } = useGiftOptions();

  const handleToggleGift = (isGift: boolean) => {
    onChange({
      ...value,
      isGift,
      ...(isGift ? {} : {
        giftWrapOption: null,
        giftMessage: '',
        recipientName: '',
        recipientEmail: '',
        recipientPhone: '',
        hidePrices: false,
        cardDesign: '',
      }),
    });
  };

  const handleGiftOptionSelect = (option: GiftOption) => {
    onChange({
      ...value,
      giftWrapOption: option,
    });
  };

  const totalGiftCost = value.giftWrapOption ? value.giftWrapOption.price : 0;

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading gift options...</div>;
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Gift Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-gift"
          checked={value.isGift}
          onCheckedChange={handleToggleGift}
        />
        <Label htmlFor="is-gift" className="flex items-center gap-2 cursor-pointer">
          <Gift className="h-5 w-5" />
          <span className="font-medium">This is a gift</span>
        </Label>
      </div>

      {value.isGift && (
        <>
          {/* Gift Wrapping Options */}
          <div className="space-y-3">
            <h4 className="font-medium">Gift Wrapping</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {giftOptions
                ?.filter(opt => opt.category === 'wrap' || opt.category === 'box')
                .map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleGiftOptionSelect(option)}
                    className={cn(
                      "p-4 border-2 rounded-lg text-left transition-all hover:border-primary/50",
                      value.giftWrapOption?.id === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {option.category === 'box' ? (
                            <Package className="h-4 w-4" />
                          ) : (
                            <Gift className="h-4 w-4" />
                          )}
                          <span className="font-medium">{option.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                        <p className="text-sm font-semibold mt-2">
                          +₹{option.price.toFixed(2)}
                        </p>
                      </div>
                      {value.giftWrapOption?.id === option.id && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Greeting Card Options */}
          <div className="space-y-3">
            <h4 className="font-medium">Greeting Card</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['birthday', 'anniversary', 'thank-you', 'congratulations'].map((design) => (
                <button
                  key={design}
                  type="button"
                  onClick={() => onChange({ ...value, cardDesign: design })}
                  className={cn(
                    "p-3 border-2 rounded text-sm capitalize transition-all",
                    value.cardDesign === design
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Mail className="h-4 w-4 mx-auto mb-1" />
                  {design.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Gift Message */}
          <div className="space-y-2">
            <Label htmlFor="gift-message">Gift Message (Optional)</Label>
            <Textarea
              id="gift-message"
              placeholder="Write a personal message to include with your gift..."
              value={value.giftMessage}
              onChange={(e) => onChange({ ...value, giftMessage: e.target.value })}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {value.giftMessage.length}/500 characters
            </p>
          </div>

          {/* Recipient Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Recipient Details (Optional)</h4>
            <p className="text-sm text-muted-foreground">
              Send directly to the recipient or leave blank to receive it yourself
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient-name">Recipient Name</Label>
                <Input
                  id="recipient-name"
                  placeholder="Full name"
                  value={value.recipientName}
                  onChange={(e) => onChange({ ...value, recipientName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-email">Recipient Email</Label>
                <Input
                  id="recipient-email"
                  type="email"
                  placeholder="email@example.com"
                  value={value.recipientEmail}
                  onChange={(e) => onChange({ ...value, recipientEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="recipient-phone">Recipient Phone</Label>
                <Input
                  id="recipient-phone"
                  type="tel"
                  placeholder="+91 12345 67890"
                  value={value.recipientPhone}
                  onChange={(e) => onChange({ ...value, recipientPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Hide Prices Option */}
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="hide-prices"
              checked={value.hidePrices}
              onCheckedChange={(checked) => onChange({ ...value, hidePrices: checked as boolean })}
            />
            <Label htmlFor="hide-prices" className="cursor-pointer text-sm">
              Hide prices on invoice and packing slip
            </Label>
          </div>

          {/* Gift Summary */}
          {totalGiftCost > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Gift Options Total:</span>
                <Badge variant="secondary" className="text-lg">
                  +₹{totalGiftCost.toFixed(2)}
                </Badge>
              </div>
            </div>
          )}

          {/* Gift Preview */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Gift Preview
            </h5>
            <div className="text-sm space-y-1 text-muted-foreground">
              {value.giftWrapOption && (
                <p>✓ {value.giftWrapOption.name}</p>
              )}
              {value.cardDesign && (
                <p>✓ {value.cardDesign.replace('-', ' ')} card</p>
              )}
              {value.giftMessage && (
                <p>✓ Personal message included</p>
              )}
              {value.recipientName && (
                <p>✓ Shipping to: {value.recipientName}</p>
              )}
              {value.hidePrices && (
                <p>✓ Prices hidden</p>
              )}
              {!value.giftWrapOption && !value.cardDesign && !value.giftMessage && (
                <p className="italic">Select gift options above</p>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

// Simple gift badge for order summary
export function GiftBadge({ hasGift }: { hasGift: boolean }) {
  if (!hasGift) return null;

  return (
    <Badge variant="secondary" className="gap-1">
      <Gift className="h-3 w-3" />
      Gift Order
    </Badge>
  );
}
