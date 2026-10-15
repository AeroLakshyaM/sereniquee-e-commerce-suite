import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

type Coupon = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

const emptyForm = { code: '', type: 'percentage' as Coupon['type'], value: '', minOrder: '', maxUses: '', expiresAt: '' };

export default function CouponsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['discount-codes'],
    queryFn: async (): Promise<Coupon[]> => {
      const { data, error } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Coupon[];
    },
  });

  const createCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(form.value);
    if (!form.code.trim() || !Number.isFinite(value) || value <= 0 || (form.type === 'percentage' && value > 100)) {
      toast({ title: 'Enter valid coupon details', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('discount_codes').insert({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value,
      min_order_amount: Number(form.minOrder) || 0,
      max_uses: form.maxUses ? Number(form.maxUses) : null,
      expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    });
    if (error) toast({ title: 'Coupon could not be created', description: error.message, variant: 'destructive' });
    else {
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast({ title: 'Coupon created' });
    }
  };

  const toggleCoupon = async (coupon: Coupon, is_active: boolean) => {
    const { error } = await supabase.from('discount_codes').update({ is_active }).eq('id', coupon.id);
    if (error) toast({ title: 'Coupon update failed', description: error.message, variant: 'destructive' });
    else queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
      <Card><CardHeader><CardTitle>Create coupon</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={createCoupon}>
        <div className="space-y-2"><Label htmlFor="coupon-code">Code</Label><Input id="coupon-code" value={form.code} onChange={event => setForm({ ...form, code: event.target.value })} placeholder="WELCOME10" /></div>
        <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="coupon-type">Type</Label><select id="coupon-type" className="h-10 w-full rounded-md border bg-background px-3" value={form.type} onChange={event => setForm({ ...form, type: event.target.value as Coupon['type'] })}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed (₹)</option></select></div><div className="space-y-2"><Label htmlFor="coupon-value">Value</Label><Input id="coupon-value" type="number" min={0} step="0.01" value={form.value} onChange={event => setForm({ ...form, value: event.target.value })} /></div></div>
        <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="coupon-min">Minimum order</Label><Input id="coupon-min" type="number" min={0} value={form.minOrder} onChange={event => setForm({ ...form, minOrder: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="coupon-max">Maximum uses</Label><Input id="coupon-max" type="number" min={1} value={form.maxUses} onChange={event => setForm({ ...form, maxUses: event.target.value })} /></div></div>
        <div className="space-y-2"><Label htmlFor="coupon-expiry">Expiry</Label><Input id="coupon-expiry" type="datetime-local" value={form.expiresAt} onChange={event => setForm({ ...form, expiresAt: event.target.value })} /></div>
        <Button type="submit" className="w-full">Create coupon</Button>
      </form></CardContent></Card>
      <Card><CardHeader><CardTitle>Coupons</CardTitle></CardHeader><CardContent className="space-y-3">{isLoading ? <p>Loading coupons...</p> : coupons.length === 0 ? <p className="text-muted-foreground">No coupons created yet.</p> : coupons.map(coupon => { const progress = coupon.max_uses ? Math.min(100, coupon.uses_count / coupon.max_uses * 100) : 0; return <div key={coupon.id} className="rounded-lg border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{coupon.code}</p><p className="text-sm text-muted-foreground">{coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`} · Min ₹{coupon.min_order_amount}</p></div><Switch checked={coupon.is_active} onCheckedChange={checked => void toggleCoupon(coupon, checked)} /></div><div className="mt-3"><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Uses</span><span>{coupon.uses_count}{coupon.max_uses === null ? '' : ` / ${coupon.max_uses}`}</span></div>{coupon.max_uses !== null && <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div>}</div>{coupon.expires_at && <p className="mt-2 text-xs text-muted-foreground">Expires {new Date(coupon.expires_at).toLocaleString()}</p>}</div>; })}</CardContent></Card>
    </div>
  );
}
