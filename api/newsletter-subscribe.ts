import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { brandedEmail } from './_lib/brandedEmail.js';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { reportApiError } from './_lib/reportError.js';

interface Request { method?: string; headers?: Record<string, string | string[] | undefined>; body?: { email?: string } }
interface Response { status: (code: number) => { json: (payload: unknown) => void } }

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!url || !serviceKey || !resendKey) return res.status(503).json({ error: 'Newsletter signup is temporarily unavailable.' });
  try {
    if (!await consumeRateLimit(req, 'form:newsletter-ip', 8, 3600)) return res.status(429).json({ error: 'Too many signup attempts. Please try again later.' });
    if (!await consumeRateLimit(req, 'form:newsletter-email', 3, 3600, `email:${email}`)) return res.status(429).json({ error: 'Too many signup attempts for this address. Please try again later.' });
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: existing, error: lookupError } = await admin.from('newsletter_subscribers').select('id,is_active').eq('email', email).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing?.is_active) return res.status(200).json({ subscribed: true });
    if (existing) {
      const { error } = await admin.from('newsletter_subscribers').update({ is_active: true }).eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await admin.from('newsletter_subscribers').insert({ email });
      if (error && error.code !== '23505') throw error;
      if (error?.code === '23505') return res.status(200).json({ subscribed: true });
    }
    const resend = new Resend(resendKey);
    const sent = await resend.emails.send({ from: 'Sereniquee Candles <team@sereniqueecandles.com>', to: email, subject: 'A warm welcome to Sereniquee Candles',
      html: brandedEmail({ title: 'Welcome to our community', greeting: 'Dear candle lover,', preheader: 'Your welcome gift is ready.',
        content: '<p>Thank you for joining the Sereniquee Candles community. We look forward to sharing new scents, thoughtful moments, and exclusive updates.</p><div style="margin:24px 0;padding:22px;text-align:center;background:#fbf8f3;border:1px solid #eee7de;border-radius:8px"><p style="margin:0 0 8px;color:#806346;font-size:12px;letter-spacing:1.5px;text-transform:uppercase">Your welcome gift</p><p style="margin:0;font:bold 26px Georgia,serif;letter-spacing:2px">WELCOME10</p><p style="margin:8px 0 0;font-size:13px">Use it at checkout for 10% off your first order.</p></div>',
        cta: { label: 'Explore the collection', url: 'https://www.sereniqueecandles.com/shop' } }) });
    if (sent.error) throw new Error(sent.error.message);
    return res.status(200).json({ subscribed: true });
  } catch (error) {
    const incidentId = reportApiError('newsletter_subscription_failed', error);
    return res.status(500).json({ error: 'We could not complete signup right now. Please try again later.', incidentId });
  }
}
