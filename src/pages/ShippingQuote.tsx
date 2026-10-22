import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Clock3 } from 'lucide-react';

const UPI_ID = import.meta.env.VITE_UPI_ID as string | undefined;
const QR_IMAGE = import.meta.env.VITE_UPI_QR_IMAGE_URL as string | undefined;

export default function ShippingQuote() {
  const [params] = useSearchParams();
  const orderId = params.get('order') || '';
  const token = params.get('token') || '';
  const { toast } = useToast();
  const [quote, setQuote] = useState<{ order_number: string | null; shipping_quote_amount: number; shipping_quote_status: string; payment_method: string } | null>(null);
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  useEffect(() => {
    if (!orderId || !token) { setLoading(false); return; }
    void supabase.rpc('get_shipping_quote', { p_order_id: orderId, p_token: token }).then(({ data }) => {
      setQuote(Array.isArray(data) ? data[0] || null : data as any);
      setLoading(false);
    });
  }, [orderId, token]);
  const respond = async (approve: boolean) => {
    setWorking(true);
    const { data, error } = await supabase.rpc('respond_shipping_quote', { p_order_id: orderId, p_token: token, p_approve: approve });
    if (error || !data) toast({ title: 'Could not update quote', description: error?.message || 'This quote is no longer active.', variant: 'destructive' });
    else setQuote(current => current ? { ...current, shipping_quote_status: approve ? 'approved' : 'declined' } : current);
    setWorking(false);
  };
  const submitUtr = async (event: React.FormEvent) => {
    event.preventDefault(); setWorking(true);
    const { data, error } = await supabase.rpc('submit_shipping_quote_payment', { p_order_id: orderId, p_token: token, p_utr: utr.trim() });
    if (error || !data) toast({ title: 'Could not submit shipping payment', description: error?.message || 'This quote is no longer active.', variant: 'destructive' });
    else { setQuote(current => current ? { ...current, shipping_quote_status: 'submitted_for_verification' } : current); toast({ title: 'Shipping payment submitted', description: 'We will verify it before dispatch.' }); }
    setWorking(false);
  };
  const upiIntent = quote && UPI_ID ? `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('Sereniquee Candles')}&am=${quote.shipping_quote_amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Shipping ${quote.order_number || 'order'}`)}` : '';
  return <main className="container-luxury min-h-[70vh] max-w-3xl py-16"><h1 className="mb-3 text-center font-serif text-3xl">Shipping quote</h1>
    {loading ? <p className="text-center text-muted-foreground">Loading your quote…</p> : !quote ? <Alert variant="destructive"><AlertTitle>Quote link unavailable</AlertTitle><AlertDescription>This shipping quote link is invalid or no longer active. Please contact us for help.</AlertDescription></Alert> : <div className="space-y-6 rounded-xl border bg-card p-6 shadow-soft">
      <p className="text-center text-sm text-muted-foreground">{quote.order_number ? `Order ${quote.order_number}` : 'Your Sereniquee Candles order'}</p>
      <div className="text-center"><p className="text-sm text-muted-foreground">Courier shipping fee</p><p className="font-serif text-4xl">₹{Number(quote.shipping_quote_amount).toFixed(2)}</p></div>
      {quote.shipping_quote_status === 'quoted' && <><Alert><AlertTitle>Shipping is paid separately</AlertTitle><AlertDescription>Approve this courier quote to continue. We will dispatch after the shipping payment is received and verified.</AlertDescription></Alert><div className="flex justify-center gap-3"><Button disabled={working} onClick={() => void respond(true)}>Approve quote</Button><Button disabled={working} variant="outline" onClick={() => void respond(false)}>Decline quote</Button></div></>}
      {quote.shipping_quote_status === 'declined' && <Alert><AlertTitle>Quote declined</AlertTitle><AlertDescription>We have recorded your choice. Contact us if you would like to discuss your order.</AlertDescription></Alert>}
      {quote.shipping_quote_status === 'approved' && <><Alert><CheckCircle2 className="h-4 w-4"/><AlertTitle>Quote approved</AlertTitle><AlertDescription>Pay the exact shipping amount by UPI, then submit the UTR (Transaction ID) below.</AlertDescription></Alert>{QR_IMAGE && <img src={QR_IMAGE} alt="Sereniquee Candles UPI QR code" className="mx-auto h-auto max-h-96 max-w-xs object-contain"/>}{UPI_ID && <p className="text-center text-sm">UPI ID: <strong>{UPI_ID}</strong></p>}{upiIntent && <p className="text-center"><a className="text-primary underline" href={upiIntent}>Open UPI app</a></p>}<form onSubmit={event => void submitUtr(event)} className="space-y-3"><label htmlFor="shipping-utr" className="text-sm font-medium">Shipping payment UTR (Transaction ID)</label><Input id="shipping-utr" value={utr} onChange={event => setUtr(event.target.value)} minLength={6} maxLength={64} required placeholder="Enter transaction reference"/><Button className="w-full" disabled={working || !UPI_ID || !QR_IMAGE}>{working ? 'Submitting…' : 'Submit shipping payment'}</Button></form></>}
      {quote.shipping_quote_status === 'submitted_for_verification' && <Alert><Clock3 className="h-4 w-4"/><AlertTitle>Shipping payment under review</AlertTitle><AlertDescription>We will verify the transaction and arrange dispatch. You will receive an update by email.</AlertDescription></Alert>}
      {quote.shipping_quote_status === 'paid' && <Alert><CheckCircle2 className="h-4 w-4"/><AlertTitle>Shipping payment received</AlertTitle><AlertDescription>Your order is ready for dispatch processing.</AlertDescription></Alert>}
    </div>}
  </main>;
}
