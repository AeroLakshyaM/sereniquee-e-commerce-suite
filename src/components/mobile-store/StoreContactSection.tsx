import { FormEvent, useState } from 'react';
import { CheckCircle2, Instagram, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const INSTAGRAM_URL = 'https://www.instagram.com/sereniquee.candles.co';
const WHATSAPP_URL = 'https://wa.me/919827310636?text=Hello%21%20I%20am%20interested%20in%20your%20candles.';

export function StoreContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch('/api/store-contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'), email: data.get('email'), phone: data.get('phone'),
          interest_type: data.get('interest_type'), message: data.get('message'),
          marketing_consent: data.get('marketing_consent') === 'on', website: data.get('website'),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      form.reset();
      setSubmitted(true);
    } catch (error) {
      toast({ title: 'Could not save your details', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="stay-in-touch" className="bg-white px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_0.85fr] md:items-center">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#758078]">Keep the good scent close</p>
          <h2 className="mt-2 font-serif text-3xl font-medium text-[#173b38]">Stay in touch</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Leave your details and our team can follow up about a candle, gifting idea, or question. We only send product updates if you opt in.</p>
          {submitted ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900" role="status">
              <p className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-5 w-5" /> You’re on our contact list.</p>
              <p className="mt-1 text-sm">Thank you. Our team will be in touch soon.</p>
              <Button variant="link" className="mt-1 h-auto p-0 text-emerald-900" onClick={() => setSubmitted(false)}>Add another person</Button>
            </div>
          ) : (
            <form onSubmit={submitContact} className="mt-6 space-y-3">
              <Input name="name" required maxLength={120} autoComplete="name" placeholder="Your name" aria-label="Your name" className="h-12 rounded-xl" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={40} placeholder="Phone number" aria-label="Phone number" className="h-12 rounded-xl" />
                <Input name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} placeholder="Email address" aria-label="Email address" className="h-12 rounded-xl" />
              </div>
              <p className="-mt-1 text-xs text-muted-foreground">Please add a phone number or email so we can reply.</p>
              <select name="interest_type" aria-label="What can we help with?" className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="stay_in_touch">I’d like to stay in touch</option>
                <option value="product_question">I have a product question</option>
                <option value="gift_idea">I’m looking for a gift</option>
                <option value="other">Something else</option>
              </select>
              <textarea name="message" maxLength={1000} rows={3} placeholder="Anything you’d like us to know? (optional)" aria-label="Optional message" className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <label className="flex cursor-pointer items-start gap-3 py-1 text-sm leading-5 text-[#334844]">
                <input type="checkbox" name="marketing_consent" className="mt-1 h-4 w-4 accent-[#173b38]" />
                <span>Send me occasional candle news and product updates. Optional.</span>
              </label>
              <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
              <p className="text-xs leading-5 text-muted-foreground">We’ll use your details to respond to this request. Updates are sent only if you check the box. See our <a href="/mobile-store/privacy-policy" className="underline">privacy notice</a>.</p>
              <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-xl bg-[#173b38] text-white hover:bg-[#24514d] sm:w-auto sm:px-7">
                {isSubmitting ? 'Sending…' : 'Send my details'} <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </div>

        <aside className="rounded-3xl bg-[#f3eee5] p-5 sm:p-7">
          <h3 className="font-serif text-xl text-[#173b38]">Find us again</h3>
          <p className="mt-2 text-sm leading-6 text-[#173b38]/70">Follow our latest candles or message us directly after the exhibition.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-[#173b38]"><Instagram className="h-4 w-4" /> Instagram</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-[#173b38]"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          </div>
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#173b38]/10 bg-white/75 p-3">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(INSTAGRAM_URL)}`} alt="QR code to open SERENIQUEE Candles on Instagram" width="112" height="112" loading="lazy" decoding="async" className="h-28 w-28 rounded-lg bg-white" />
            <div><p className="text-sm font-semibold text-[#173b38]">Scan to find us</p><p className="mt-1 text-xs leading-5 text-[#173b38]/65">Opens our Instagram profile.</p><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-medium underline">Or tap here</a></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
