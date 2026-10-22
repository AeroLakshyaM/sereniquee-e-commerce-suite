import { createClient } from '@supabase/supabase-js';
import { consumeRateLimit } from './_lib/rateLimit.js';
import { reportApiError } from './_lib/reportError.js';

interface Request { method?: string; headers?: Record<string, string | string[] | undefined>; body?: { name?: string; email?: string; phone?: string; inquiry_type?: string; description?: string; quantity_estimate?: number | null; budget_range?: string | null } }
interface Response { status: (code: number) => { json: (payload: unknown) => void } }

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() || null : null;
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const type = body.inquiry_type;
  const quantity = body.quantity_estimate ?? null;
  const budget = typeof body.budget_range === 'string' ? body.budget_range.trim() || null : null;
  if (!name || name.length > 120 || !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || (phone && phone.length > 40) || !description || description.length < 10 || description.length > 5000
    || !['custom', 'bulk', 'wholesale', 'other'].includes(type || '')
    || (quantity !== null && (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000))
    || (budget && budget.length > 160)) {
    return res.status(400).json({ error: 'Please check the inquiry details and try again.' });
  }
  try {
    if (!await consumeRateLimit(req, 'form:custom-order', 4, 3600)) return res.status(429).json({ error: 'Too many inquiries were submitted. Please try again later.' });
    const url = process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return res.status(503).json({ error: 'The inquiry form is temporarily unavailable.' });
    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { error } = await admin.from('custom_order_inquiries').insert({ name, email, phone, inquiry_type: type, description, quantity_estimate: quantity, budget_range: budget, status: 'new' });
    if (error) throw error;
    return res.status(201).json({ submitted: true });
  } catch (error) {
    const incidentId = reportApiError('custom_order_submission_failed', error);
    return res.status(500).json({ error: 'We could not save your inquiry. Please try again or contact us directly.', incidentId });
  }
}
