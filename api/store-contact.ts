import { createClient } from '@supabase/supabase-js';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { reportApiError } from './_lib/reportError.js';

interface Request {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: { name?: string; email?: string; phone?: string; interest_type?: string; message?: string; marketing_consent?: boolean; website?: string };
}
interface Response { status: (code: number) => { json: (payload: unknown) => void } }

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = req.body || {};
  // Quietly accept bot honeypot submissions without saving them.
  if (typeof body.website === 'string' && body.website.trim()) return res.status(201).json({ submitted: true });

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() || null : null;
  const phone = typeof body.phone === 'string' ? body.phone.trim() || null : null;
  const message = typeof body.message === 'string' ? body.message.trim() || null : null;
  const interestType = body.interest_type || 'stay_in_touch';
  const marketingConsent = body.marketing_consent === true;
  if (!name || name.length > 120 || (!email && !phone) || (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
    || (phone && (phone.length > 40 || !/[0-9]{6}/.test(phone))) || (message && message.length > 1000)
    || !['stay_in_touch', 'product_question', 'gift_idea', 'other'].includes(interestType)) {
    return res.status(400).json({ error: 'Add your name and a valid phone number or email, then try again.' });
  }

  try {
    if (!await consumeRateLimit(req, 'form:store-contact', 5, 3600)) return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
    const url = process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return res.status(503).json({ error: 'The contact form is temporarily unavailable.' });
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error } = await admin.from('store_contacts').insert({
      name, email, phone, interest_type: interestType, message, marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsent ? new Date().toISOString() : null, source: 'mobile_store', status: 'new',
    });
    if (error) throw error;
    return res.status(201).json({ submitted: true });
  } catch (error) {
    const incidentId = reportApiError('store_contact_submission_failed', error);
    return res.status(500).json({ error: 'We could not save your details. Please try again or contact us directly.', incidentId });
  }
}
