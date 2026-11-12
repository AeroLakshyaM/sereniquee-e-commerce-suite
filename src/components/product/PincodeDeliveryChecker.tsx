import { useState, useEffect } from 'react';
import { MapPin, Truck, CheckCircle2, ShieldCheck, Banknote, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  estimatePincodeDelivery,
  getSavedPincode,
  savePincode,
  PincodeDeliveryEstimate,
} from '@/lib/pincodeEstimator';

export function PincodeDeliveryChecker() {
  const [pincode, setPincode] = useState('');
  const [estimate, setEstimate] = useState<PincodeDeliveryEstimate | null>(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Initialize from saved pincode
  useEffect(() => {
    const saved = getSavedPincode();
    if (saved && saved.length === 6) {
      setPincode(saved);
      const est = estimatePincodeDelivery(saved);
      if (est) {
        setEstimate(est);
      }
    }
  }, []);

  const handleCheck = (pinToCheck?: string) => {
    const targetPin = (pinToCheck || pincode).trim();
    if (targetPin.length !== 6 || !/^\d{6}$/.test(targetPin)) {
      setError('Please enter a valid 6-digit Indian PIN code');
      setEstimate(null);
      return;
    }

    const est = estimatePincodeDelivery(targetPin);
    if (!est) {
      setError('Invalid PIN code. Please verify and try again.');
      setEstimate(null);
      return;
    }

    setError('');
    setEstimate(est);
    savePincode(targetPin);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (error) setError('');

    // Auto-check on 6th digit entered
    if (val.length === 6) {
      handleCheck(val);
    }
  };

  return (
    <div className="rounded-2xl border border-[#eadfd1] bg-[#fbf9f6] p-4 text-xs transition-all duration-300">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Truck className="h-4 w-4 text-[#8c6239]" />
          <span>Delivery & Dispatch Estimate</span>
        </div>
        {estimate && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-[11px] font-semibold text-[#8c6239] hover:underline cursor-pointer"
          >
            Change PIN
          </button>
        )}
      </div>

      {(!estimate || isEditing) ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                inputMode="numeric"
                value={pincode}
                onChange={handleInputChange}
                placeholder="Enter 6-digit delivery PIN code"
                className="pl-8.5 h-9 text-xs rounded-full bg-white border-[#eadfd1]"
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => handleCheck()}
              disabled={pincode.length !== 6}
              className="rounded-full h-9 px-4 text-xs bg-[#1c2e28] text-white hover:bg-[#253d35]"
            >
              Check
            </Button>
          </div>
          {error && <p className="text-[11px] text-destructive">{error}</p>}
          <p className="text-[11px] text-muted-foreground">
            Dispatches within 24 hours from our Delhi NCR atelier.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 pt-1 animate-fade-in">
          {/* Main Delivery Date Line */}
          <div className="flex items-start gap-2 bg-white/80 p-3 rounded-xl border border-[#eadfd1]/70">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-foreground text-xs sm:text-sm">
                Expected Delivery by <span className="text-emerald-700 font-bold">{estimate.deliveryDateString}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Shipping to <strong className="text-foreground">{estimate.region}</strong> ({estimate.pincode}) in {estimate.minDays}–{estimate.maxDays} business days via {estimate.courierPartner}.
              </p>
            </div>
          </div>

          {/* Logistics Highlights */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-0.5">
            <div className="flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>COD & Prepaid Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#8c6239] shrink-0" />
              <span>Free Breakage Insurance</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
